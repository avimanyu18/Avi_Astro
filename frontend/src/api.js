// Online API Service Layer with Configurable Backend URL & OpenStreetMap Geocoding

const configuredBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
const defaultBaseUrl = import.meta.env.DEV ? 'http://localhost:8000' : configuredBaseUrl;
let customBaseUrl = defaultBaseUrl || localStorage.getItem('ASTRO_API_URL') || '';

export function getApiBaseUrl() {
  return customBaseUrl;
}

export function setApiBaseUrl(url) {
  let cleaned = url.trim();
  if (cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
  customBaseUrl = cleaned;
  localStorage.setItem('ASTRO_API_URL', cleaned);
}

export async function pingServer(targetUrl = customBaseUrl) {
  try {
    let cleaned = targetUrl.trim();
    if (cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
    const start = Date.now();
    const res = await fetch(`${cleaned}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, latencyMs: Date.now() - start, data };
    }
  } catch (e) {
    console.warn("Ping failed for:", targetUrl, e);
  }
  return { ok: false };
}

export async function searchCityLocation(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    // Try primary backend geocoding endpoint first
    const res = await fetch(`${customBaseUrl}/api/geocoding/search?q=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) return data.results;
    }
  } catch (e) {
    console.warn("Primary backend geocoding failed, trying direct OpenStreetMap fallback:", e);
  }

  // Fallback direct OpenStreetMap Nominatim query
  try {
    const osmRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });
    if (osmRes.ok) {
      const items = await osmRes.json();
      return items.map((item) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        tz_offset: Math.round(parseFloat(item.lon) / 15.0 * 2) / 2.0
      }));
    }
  } catch (err) {
    console.warn("Direct OpenStreetMap geocoding fallback error:", err);
  }
  return [];
}

export async function fetchHoroscopeData(birthData) {
  try {
    const res = await fetch(`${customBaseUrl}/api/horoscope/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(birthData)
    });
    if (!res.ok) {
      throw new Error(`Server status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn("Online API call failed:", error);
    return null;
  }
}

export async function sendChatQuestion(question, chartData, computedFacts) {
  try {
    const res = await fetch(`${customBaseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, chart: chartData, computed_facts: computedFacts })
    });
    if (res.ok) {
      const data = await res.json();
      return data.reply;
    }
  } catch (error) {
    console.warn("Online Chat API error:", error);
  }
  return null;
}
