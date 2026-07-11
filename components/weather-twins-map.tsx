"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function emojiIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size: 28px; line-height: 1; transform: translate(-2px, -6px);">${emoji}</div>`,
    className: "", // clear Leaflet's default icon styling/box
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

const originIcon = emojiIcon("🏠");
const twinIcon = emojiIcon("🌍");

type TwinPoint = {
  name: string;
  country: string;
  lat: number;
  lon: number;
  percent: number;
};

export function WeatherTwinsMap({
  originName,
  originLat,
  originLon,
  twins,
}: {
  originName: string;
  originLat: number;
  originLon: number;
  twins: TwinPoint[];
}) {
  const points = [[originLat, originLon], ...twins.map((t) => [t.lat, t.lon])] as [
    number,
    number,
  ][];
  const bounds = L.latLngBounds(points);

  return (
    <div className="h-80 w-full overflow-hidden rounded-2xl">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [30, 30] }}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[originLat, originLon]} icon={originIcon}>
          <Popup>{originName} (your saved location)</Popup>
        </Marker>
        {twins.map((t) => (
          <Marker key={`${t.name}-${t.country}`} position={[t.lat, t.lon]} icon={twinIcon}>
            <Popup>
              {t.name}, {t.country}
              <br />
              {t.percent}% match
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
