create table api_usage (
  day date primary key,
  one_call_count int not null default 0
);

-- No row-level security here on purpose, same reasoning as
-- city_weather_cache: this only tracks how many OpenWeatherMap "One Call"
-- requests the app has made today, not anything tied to a specific user.
