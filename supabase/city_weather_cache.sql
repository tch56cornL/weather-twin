create table city_weather_cache (
  city_key text primary key,
  lat double precision not null,
  lon double precision not null,
  temp_c double precision not null,
  feels_like_c double precision not null,
  wind_speed_ms double precision not null,
  wind_gust_ms double precision,
  uv_index double precision not null,
  humidity int not null,
  visibility_m int not null,
  pressure_hpa int not null,
  air_quality_index int not null,
  fetched_at timestamptz not null default now()
);

-- No row-level security here on purpose: this table only holds shared,
-- non-sensitive reference weather data for the fixed city list (not
-- anything tied to a specific user), so it's fine for it to be readable
-- and refreshable by the app without per-user restrictions.
