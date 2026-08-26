"use client";

import "leaflet/dist/leaflet.css";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";

export type MapArticle = {
  id: number;
  title: string;
  url: string;
  date: string;
  source: string;
  category: string;
  relevance: number;
  provider?: string;
};

export type MapLocation = {
  name: string;
  type: string;
  lat: number;
  lon: number;
  keywords: string[];
};

export type MappedIncident = {
  article: MapArticle;
  location: MapLocation;
};

type MapClientProps = {
  incidents: MappedIncident[];
  selectedLocation?: string;
  height?: number;
  zoom?: number;
  scrollWheelZoom?: boolean;
  compact?: boolean;
};

function markerColor(
  category: string
) {
  if (category === "Security") {
    return "#8a2b25";
  }

  if (category === "Maritime") {
    return "#31566b";
  }

  if (
    category === "Humanitarian"
  ) {
    return "#8a6b24";
  }

  if (category === "Politics") {
    return "#665071";
  }

  if (category === "Economy") {
    return "#476246";
  }

  return "#a86604";
}

export default function MapClient({
  incidents,
  selectedLocation = "All",
  height = 620,
  zoom = 6,
  scrollWheelZoom = true,
  compact = false,
}: MapClientProps) {
  const visible =
    selectedLocation === "All"
      ? incidents
      : incidents.filter(
          (incident) =>
            incident.location.name ===
            selectedLocation
        );

  return (
    <MapContainer
      center={[15.3, 46.4]}
      zoom={zoom}
      minZoom={5}
      maxZoom={11}
      scrollWheelZoom={
        scrollWheelZoom
      }
      style={{
        width: "100%",
        height: `${height}px`,
        borderRadius: "12px",
        zIndex: 1,
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {visible.map(
        (incident, index) => {
          const color =
            markerColor(
              incident.article.category
            );

          const baseRadius =
            incident.article.relevance >=
            10
              ? 10
              : incident.article
                    .relevance >= 6
              ? 8
              : 6;

          const radius =
            compact
              ? Math.max(
                  5,
                  baseRadius - 2
                )
              : baseRadius;

          const offsetIndex =
            index % 7;

          const latOffset =
            (offsetIndex - 3) *
            0.015;

          const lonOffset =
            ((offsetIndex * 2) % 7 -
              3) *
            0.015;

          return (
            <CircleMarker
              key={`${incident.article.id}-${incident.location.name}`}
              center={[
                incident.location.lat +
                  latOffset,
                incident.location.lon +
                  lonOffset,
              ]}
              radius={radius}
              pathOptions={{
                color: "#fff8ed",
                weight: 2,
                fillColor: color,
                fillOpacity: 0.95,
              }}
            >
              <Tooltip>
                {
                  incident.location
                    .name
                }
                {" · "}
                {
                  incident.article
                    .category
                }
              </Tooltip>

              <Popup>
                <div
                  style={{
                    minWidth:
                      compact
                        ? "180px"
                        : "220px",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "10px",
                      fontWeight:
                        700,
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.5px",
                      marginBottom:
                        "6px",
                    }}
                  >
                    {
                      incident.location
                        .name
                    }
                    {" · "}
                    {
                      incident.article
                        .category
                    }
                  </div>

                  <div
                    style={{
                      fontWeight:
                        700,
                      lineHeight:
                        1.35,
                      marginBottom:
                        "7px",
                    }}
                  >
                    {
                      incident.article
                        .title
                    }
                  </div>

                  <div
                    style={{
                      fontSize:
                        "11px",
                      marginBottom:
                        "9px",
                    }}
                  >
                    {
                      incident.article
                        .source
                    }
                  </div>

                  <a
                    href={
                      incident.article
                        .url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open report
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          );
        }
      )}
    </MapContainer>
  );
}
