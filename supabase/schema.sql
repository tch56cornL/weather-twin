create table saved_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  city_name text not null,
  country text,
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
  daily_avg_temp_c double precision not null,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table saved_locations enable row level security;

create policy "Users can view their own saved locations"
  on saved_locations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved locations"
  on saved_locations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved locations"
  on saved_locations for delete
  using (auth.uid() = user_id);
