import asyncio
import math
from collections import defaultdict
from fastapi import FastAPI, Query, HTTPException
import httpx
from typing import Optional

app = FastAPI(title="Climate Analyze API")

# ── Solar simulation constants ──
MJ_TO_KWH = 0.2778          # 1 MJ = 0.2778 kWh
PERFORMANCE_RATIO = 0.80     # PR（インバータ・配線・汚れ等の損失）
TEMP_COEFF = -0.004          # 結晶シリコン温度係数 (%/℃)
NOCT_DELTA = 25.0            # セル温度 ≈ 気温 + 25℃
STC_TEMP = 25.0              # 標準試験条件温度 (℃)
LAPSE_RATE = 0.6             # 気温減率: -0.6℃/100m

# ── 月ごとの日数 (2024年 / 閏年) ──
DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

async def fetch_daily_climate_data(lat: float, lon: float):
    """日別の生データ（日付・気温・日射量の配列）を返す"""
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "daily": ["temperature_2m_mean", "shortwave_radiation_sum"],
        "timezone": "auto"
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Open-Meteo API error")
        data = response.json()

    daily = data.get("daily", {})
    dates = daily.get("time", [])
    temps = daily.get("temperature_2m_mean", [])
    rads = daily.get("shortwave_radiation_sum", [])
    return dates, temps, rads


async def fetch_climate_data(lat: float, lon: float):
    """既存 /analyze 用ラッパー — 年間平均を返す"""
    dates, temps, rads = await fetch_daily_climate_data(lat, lon)

    valid_temps = [t for t in temps if t is not None]
    valid_rads = [r for r in rads if r is not None]

    avg_temp = sum(valid_temps) / len(valid_temps) if valid_temps else 0
    avg_rad = sum(valid_rads) / len(valid_rads) if valid_rads else 0

    return {"avg_temperature_c": round(avg_temp, 2), "avg_radiation_mj_m2": round(avg_rad, 2)}

async def fetch_elevation(lat: float, lon: float):
    url = "https://api.open-elevation.com/api/v1/lookup"
    params = {"locations": f"{lat},{lon}"}
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, params=params)
            data = response.json()
            return data["results"][0]["elevation"]
        except:
            return 0  # 取得失敗時は0mとする


# ── Solar calculation helpers ──

def tilt_correction_factor(lat: float, tilt: float, month: int) -> float:
    """Liu & Jordan 簡易モデルによる傾斜補正係数"""
    # 月中央の日 (1-indexed month → 近似的な day-of-year)
    month_mid_days = [17, 47, 75, 105, 135, 162, 198, 228, 258, 288, 318, 344]
    n = month_mid_days[month - 1]
    # 太陽赤緯 (Cooper's equation)
    declination = 23.45 * math.sin(math.radians(360 * (284 + n) / 365))
    lat_rad = math.radians(lat)
    dec_rad = math.radians(declination)
    tilt_rad = math.radians(tilt)
    # 水平面に対する傾斜面の日射比 Rb (beam radiation ratio)
    cos_zenith = (math.sin(lat_rad) * math.sin(dec_rad)
                  + math.cos(lat_rad) * math.cos(dec_rad))
    cos_incidence = (math.sin(lat_rad - tilt_rad) * math.sin(dec_rad)
                     + math.cos(lat_rad - tilt_rad) * math.cos(dec_rad))
    if cos_zenith <= 0.01:
        return 1.0  # 太陽がほぼ出ない → 補正不要
    rb = max(cos_incidence / cos_zenith, 0.0)
    # 散乱光 + 地面反射を含めた簡易補正
    # R = Rb * 0.75 + (1 + cos(tilt))/2 * 0.20 + (1 - cos(tilt))/2 * 0.05
    diffuse = (1 + math.cos(tilt_rad)) / 2 * 0.20
    ground = (1 - math.cos(tilt_rad)) / 2 * 0.05
    return rb * 0.75 + diffuse + ground


def calc_daily_energy(radiation_mj: float, temp_c: float,
                      capacity_kw: float, tilt_factor: float) -> float:
    """日次発電量 (kWh) を計算"""
    psh = radiation_mj * MJ_TO_KWH * tilt_factor
    cell_temp = temp_c + NOCT_DELTA
    temp_factor = 1 + TEMP_COEFF * (cell_temp - STC_TEMP)
    return capacity_kw * psh * PERFORMANCE_RATIO * temp_factor


def aggregate_monthly(dates: list, temps: list, rads: list,
                      capacity_kw: float, lat: float, tilt: float) -> list:
    """日別データを月別に集計し、発電量を計算"""
    buckets = defaultdict(lambda: {"temps": [], "rads": [], "kwh": 0.0, "days": 0})

    for i, date_str in enumerate(dates):
        t = temps[i]
        r = rads[i]
        if t is None or r is None:
            continue
        month = int(date_str.split("-")[1])
        tf = tilt_correction_factor(lat, tilt, month)
        energy = calc_daily_energy(r, t, capacity_kw, tf)
        b = buckets[month]
        b["temps"].append(t)
        b["rads"].append(r)
        b["kwh"] += energy
        b["days"] += 1

    result = []
    for m in range(1, 13):
        b = buckets[m]
        days = b["days"] or DAYS_IN_MONTH[m - 1]
        avg_temp = sum(b["temps"]) / len(b["temps"]) if b["temps"] else 0
        avg_rad = sum(b["rads"]) / len(b["rads"]) if b["rads"] else 0
        result.append({
            "month": m,
            "total_kwh": round(b["kwh"], 1),
            "avg_daily_kwh": round(b["kwh"] / days, 2) if days else 0,
            "days": days,
            "avg_temp_c": round(avg_temp, 1),
            "avg_radiation_kwh_m2": round(avg_rad * MJ_TO_KWH, 2),
        })
    return result

@app.get("/")
async def root():
    return {
        "message": "Climate API is Live",
        "endpoints": {
            "/analyze": "GET /analyze?lat=35.68&lon=139.69",
            "/simulate": "GET /simulate?lat=35.68&lon=139.69&panel_capacity_kw=5&electricity_rate=30",
        },
    }

@app.get("/analyze")
async def analyze(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    # 並行実行
    climate_task = asyncio.create_task(fetch_climate_data(lat, lon))
    elevation_task = asyncio.create_task(fetch_elevation(lat, lon))

    climate = await climate_task
    elevation = await elevation_task

    # 補正ロジック: 標高100mにつき -0.6度
    correction = (elevation / 100) * 0.6
    corrected_temp = climate["avg_temperature_c"] - correction

    return {
        "location": {"lat": lat, "lon": lon},
        "elevation_m": elevation,
        "raw_data": climate,
        "corrected_data": {
            "avg_temperature_c": round(corrected_temp, 2),
            "correction_applied_c": round(-correction, 2),
            "logic": "-0.6C per 100m elevation"
        }
    }


@app.get("/simulate")
async def simulate(
    lat: float = Query(..., description="Latitude (-90 to 90)"),
    lon: float = Query(..., description="Longitude (-180 to 180)"),
    panel_capacity_kw: float = Query(5.0, description="System capacity (kW)"),
    tilt: Optional[float] = Query(None, description="Panel tilt angle (degrees)"),
    azimuth: Optional[float] = Query(None, description="Panel azimuth angle (degrees)"),
    electricity_rate: Optional[float] = Query(None, description="Electricity rate (JPY/kWh)"),
):
    # ── Input validation ──
    if not (-90 <= lat <= 90):
        raise HTTPException(status_code=422, detail="lat must be between -90 and 90")
    if not (-180 <= lon <= 180):
        raise HTTPException(status_code=422, detail="lon must be between -180 and 180")
    if panel_capacity_kw <= 0:
        raise HTTPException(status_code=422, detail="panel_capacity_kw must be positive")
    if tilt is not None and not (0 <= tilt <= 90):
        raise HTTPException(status_code=422, detail="tilt must be between 0 and 90")
    if azimuth is not None and not (0 <= azimuth <= 360):
        raise HTTPException(status_code=422, detail="azimuth must be between 0 and 360")

    # デフォルト: tilt = |lat|, azimuth = 180(北半球) / 0(南半球)
    if tilt is None:
        tilt = abs(lat)
    if azimuth is None:
        azimuth = 180.0 if lat >= 0 else 0.0

    # ── 気候データ + 標高を並列取得 ──
    climate_task = asyncio.create_task(fetch_daily_climate_data(lat, lon))
    elevation_task = asyncio.create_task(fetch_elevation(lat, lon))

    dates, temps, rads = await climate_task
    elevation = await elevation_task

    # ── 標高による気温補正 ──
    correction = (elevation / 100) * LAPSE_RATE
    corrected_temps = [
        (t - correction if t is not None else None) for t in temps
    ]

    # ── 月別集計 ──
    monthly = aggregate_monthly(dates, corrected_temps, rads,
                                panel_capacity_kw, lat, tilt)

    # ── 年間合計 ──
    annual_kwh = sum(m["total_kwh"] for m in monthly)
    total_days = sum(m["days"] for m in monthly)
    avg_daily = annual_kwh / total_days if total_days else 0
    capacity_factor = annual_kwh / (panel_capacity_kw * 8760) if panel_capacity_kw else 0

    annual = {
        "total_kwh": round(annual_kwh, 1),
        "avg_daily_kwh": round(avg_daily, 2),
        "capacity_factor": round(capacity_factor, 4),
    }
    if electricity_rate is not None:
        annual["estimated_savings"] = round(annual_kwh * electricity_rate, 1)

    return {
        "location": {"lat": lat, "lon": lon},
        "elevation_m": elevation,
        "system": {
            "capacity_kw": panel_capacity_kw,
            "tilt_deg": round(tilt, 1),
            "azimuth_deg": round(azimuth, 1),
            "performance_ratio": PERFORMANCE_RATIO,
        },
        "annual": annual,
        "monthly": monthly,
    }
