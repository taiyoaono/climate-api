export function formatKwh(value) {
  if (value == null) return '—';
  if (value >= 1000) return `${(value / 1000).toFixed(2)} MWh`;
  return `${value.toFixed(1)} kWh`;
}

export function formatCurrency(value) {
  if (value == null) return '—';
  return `¥${Math.round(value).toLocaleString()}`;
}

export function formatPercent(value) {
  if (value == null) return '—';
  return `${(value * 100).toFixed(1)}%`;
}

export function formatNumber(value, decimals = 1) {
  if (value == null) return '—';
  return value.toFixed(decimals);
}

export function formatPercentRaw(value) {
  if (value == null) return '—';
  return `${value.toFixed(1)}%`;
}
