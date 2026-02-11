const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function simulate({ lat, lon, panel_capacity_kw, tilt, azimuth, electricity_rate }) {
  const params = new URLSearchParams({ lat, lon, panel_capacity_kw });
  if (tilt !== null && tilt !== undefined && tilt !== '') params.set('tilt', tilt);
  if (azimuth !== null && azimuth !== undefined && azimuth !== '') params.set('azimuth', azimuth);
  if (electricity_rate !== null && electricity_rate !== undefined && electricity_rate !== '') {
    params.set('electricity_rate', electricity_rate);
  }

  const res = await fetch(`${BASE_URL}/simulate?${params}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error: ${res.status}`);
  }
  return res.json();
}
