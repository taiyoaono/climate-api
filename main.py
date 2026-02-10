from datetime import date, timedelta
from typing import Optional

import httpx
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse

app = FastAPI(title="Climate Analyze API")


async def fetch_climate_data(lat: float, lon: float) -> dict:
    """Open-Meteo APIから過去1年の日次平均気温・日射量を取得し、年間平均を算出する。"""
    today = date.today()
    start = today - timedelta(days=365)

    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start.isoformat(),
        "end_date": today.isoformat(),
        "daily": "temperature_2m_mean,shortwave_radiation_sum",
        "timezone": "auto",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    daily = data["daily"]
    temps = [v for v in daily["temperature_2m_mean"] if v is not None]
    rads = [v for v in daily["shortwave_radiation_sum"] if v is not None]

    return {
        "avg_temperature_c": round(sum(temps) / len(temps), 2) if temps else None,
        "avg_radiation_mj_m2": round(sum(rads) / len(rads), 2) if rads else None,
    }


async def fetch_elevation(lat: float, lon: float) -> float:
    """Open-Elevation APIから標高を取得する。"""
    url = "https://api.open-elevation.com/api/v1/lookup"
    params = {"locations": f"{lat},{lon}"}

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    return data["results"][0]["elevation"]


def correct_temperature(temp_c: Optional[float], elevation_m: float) -> Optional[float]:
    """標高100mにつき0.6度下げる簡易気温補正。"""
    if temp_c is None:
        return None
    return round(temp_c - (elevation_m / 100) * 0.6, 2)


@app.get("/analyze")
async def analyze(
    lat: float = Query(..., ge=-90, le=90, description="緯度"),
    lon: float = Query(..., ge=-180, le=180, description="経度"),
):
    import asyncio

    climate_task = fetch_climate_data(lat, lon)
    elevation_task = fetch_elevation(lat, lon)
    climate, elevation = await asyncio.gather(climate_task, elevation_task)

    corrected_temp = correct_temperature(climate["avg_temperature_c"], elevation)

    return JSONResponse(
        content={
            "location": {"latitude": lat, "longitude": lon},
            "elevation_m": elevation,
            "raw": {
                "avg_temperature_c": climate["avg_temperature_c"],
                "avg_radiation_mj_m2": climate["avg_radiation_mj_m2"],
            },
            "corrected": {
                "avg_temperature_c": corrected_temp,
                "correction_applied_c": round(-elevation / 100 * 0.6, 2)
                if elevation
                else 0,
                "method": "-0.6°C per 100m elevation",
            },
        }
    )


@app.get("/")
async def root():
    return {"message": "Climate Analyze API", "usage": "GET /analyze?lat=35.68&lon=139.69"}
