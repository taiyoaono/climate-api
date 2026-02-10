import asyncio
from fastapi import FastAPI, Query
import httpx
from typing import Optional

app = FastAPI(title="Climate Analyze API")

async def fetch_climate_data(lat: float, lon: float):
    # Open-Meteo API (過去1年のデータ)
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "daily": ["temperature_2m_mean", "shortwave_radiation_sum"],
        "timezone": "auto"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()

    daily = data.get("daily", {})
    temps = daily.get("temperature_2m_mean", [])
    rads = daily.get("shortwave_radiation_sum", [])

    # 平均計算（None除外）
    valid_temps = [t for t in temps if t is not None]
    valid_rads = [r for r in rads if r is not None]

    avg_temp = sum(valid_temps) / len(valid_temps) if valid_temps else 0
    avg_rad = sum(valid_rads) / len(valid_rads) if valid_rads else 0

    return {"avg_temperature_c": round(avg_temp, 2), "avg_radiation_mj_m2": round(avg_rad, 2)}

async def fetch_elevation(lat: float, lon: float):
    # Open-Elevation API
    url = "https://api.open-elevation.com/api/v1/lookup"
    params = {"locations": f"{lat},{lon}"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            data = response.json()
            return data["results"][0]["elevation"]
        except:
            return 0  # 取得失敗時は0mとする

@app.get("/")
async def root():
    return {"message": "Climate API is Live", "usage": "GET /analyze?lat=35.68&lon=139.69"}

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
