const API_KEY = process.env.OPENWEATHER_API_KEY;

export type GeocodeMatch = {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
};

export async function searchCities(query: string): Promise<GeocodeMatch[]> {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    query,
  )}&limit=5&appid=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding failed (${res.status})`);
  }
  const data = await res.json();

  return data.map((d: {
    name: string;
    state?: string;
    country: string;
    lat: number;
    lon: number;
  }) => ({
    name: d.name,
    state: d.state,
    country: d.country,
    lat: d.lat,
    lon: d.lon,
  }));
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<{ name: string; country: string } | null> {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.length) return null;
  return { name: data[0].name, country: data[0].country };
}

export type WeatherSnapshot = {
  tempC: number;
  feelsLikeC: number;
  windSpeedMs: number;
  windGustMs: number | null;
  uvIndex: number;
  humidity: number;
  visibilityM: number;
  pressureHpa: number;
  airQualityIndex: number;
  dailyAvgTempC: number;
};

export async function fetchWeatherSnapshot(
  lat: number,
  lon: number,
): Promise<WeatherSnapshot> {
  const currentUrl = `https://api.openweathermap.org/data/4.0/onecall/current?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  const today = new Date().toISOString().slice(0, 10);
  const dailyUrl = `https://api.openweathermap.org/data/4.0/onecall/timeline/1day?lat=${lat}&lon=${lon}&units=metric&date=${today}&appid=${API_KEY}`;

  const [currentRes, airRes, dailyRes] = await Promise.all([
    fetch(currentUrl),
    fetch(airUrl),
    fetch(dailyUrl),
  ]);

  if (!currentRes.ok) {
    const body = await currentRes.text();
    throw new Error(`Current weather request failed (${currentRes.status}): ${body}`);
  }
  if (!airRes.ok) {
    const body = await airRes.text();
    throw new Error(`Air pollution request failed (${airRes.status}): ${body}`);
  }

  const currentJson = await currentRes.json();
  const airJson = await airRes.json();
  const current = currentJson.data[0];

  let dailyAvgTempC = current.temp;
  if (dailyRes.ok) {
    const dailyJson = await dailyRes.json();
    const day = dailyJson.data?.[0]?.temp;
    if (day) {
      const parts = [day.morn, day.day, day.eve, day.night].filter(
        (n: number | undefined) => typeof n === "number",
      );
      if (parts.length) {
        dailyAvgTempC = parts.reduce((a: number, b: number) => a + b, 0) / parts.length;
      } else if (typeof day.min === "number" && typeof day.max === "number") {
        dailyAvgTempC = (day.min + day.max) / 2;
      }
    }
  }

  return {
    tempC: current.temp,
    feelsLikeC: current.feels_like,
    windSpeedMs: current.wind_speed,
    windGustMs: typeof current.wind_gust === "number" ? current.wind_gust : null,
    uvIndex: current.uvi,
    humidity: current.humidity,
    visibilityM: current.visibility,
    pressureHpa: current.pressure,
    airQualityIndex: airJson.list?.[0]?.main?.aqi ?? 0,
    dailyAvgTempC,
  };
}
