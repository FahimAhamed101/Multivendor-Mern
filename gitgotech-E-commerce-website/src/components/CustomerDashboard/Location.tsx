

// export default MapComponent;


"use client";

import { ChevronDown, ChevronUp, MapPin, Navigation2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Notification ─────────────────────────────────────────────────────────────

const showNotification = (type: string, text: string) => {
  if (typeof document === "undefined") return;
  const notification = document.createElement("div");
  notification.style.cssText = `
    position:fixed;top:20px;right:20px;padding:12px 16px;border-radius:8px;
    color:white;font-weight:500;z-index:10000;max-width:300px;word-wrap:break-word;
    box-shadow:0 4px 20px rgba(0,0,0,0.3);font-family:sans-serif;font-size:14px;
  `;
  const colors: Record<string, string> = {
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
  };
  notification.style.backgroundColor = colors[type] ?? colors.success;
  notification.textContent = text;
  document.body.appendChild(notification);
  setTimeout(() => notification.parentNode?.removeChild(notification), 3000);
};

// ─── Haversine ────────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Parse Nominatim address ────────────────────────────────────────────────────

type NominatimAddressDetail = Record<string, string>;

function pickStateFromAddress(
  addr: NominatimAddressDetail | undefined
): string | undefined {
  if (!addr) return undefined;
  const v =
    addr.state ??
    addr.province ??
    addr.region ??
    addr.county ??
    addr.state_district ??
    "";
  const t = v.trim();
  return t || undefined;
}

function nominatimAddressExtras(
  addr: NominatimAddressDetail | undefined
): { country?: string; state?: string; zipCode?: string } {
  const countryRaw = addr?.country?.trim();
  const state = pickStateFromAddress(addr);
  const zip =
    addr?.postcode?.trim() ?? addr?.postal_code?.trim() ?? undefined;
  return {
    ...(countryRaw ? { country: countryRaw } : {}),
    ...(state ? { state } : {}),
    ...(zip ? { zipCode: zip } : {}),
  };
}

interface GeocodeAddressResult {
  displayName: string;
  country?: string;
  state?: string;
  zipCode?: string;
}

// ─── Reverse geocode (safe) ───────────────────────────────────────────────────

async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodeAddressResult> {
  const fallbackName = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&accept-language=en&addressdetails=1`,
      {
        headers: { "Accept-Language": "en", "User-Agent": "DeliveryApp/1.0" },
        signal: controller.signal,
      }
    );
    clearTimeout(timer);
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    const displayName =
      typeof data?.display_name === "string" ? data.display_name : fallbackName;
    const extras = nominatimAddressExtras(
      data?.address as NominatimAddressDetail | undefined
    );
    return {
      displayName,
      ...(extras.country ? { country: extras.country } : {}),
      ...(extras.state ? { state: extras.state } : {}),
      ...(extras.zipCode ? { zipCode: extras.zipCode } : {}),
    };
  } catch {
    return { displayName: fallbackName };
  }
}

// ─── Forward geocode (safe) ───────────────────────────────────────────────────

async function forwardGeocode(
  query: string
): Promise<GeocodeAddressResult & { lat: number; lng: number } | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=en&addressdetails=1`,
      {
        headers: { "Accept-Language": "en", "User-Agent": "DeliveryApp/1.0" },
        signal: controller.signal,
      }
    );
    clearTimeout(timer);
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    if (!data?.[0]) return null;
    const hit = data[0];
    const extras = nominatimAddressExtras(
      hit.address as NominatimAddressDetail | undefined
    );
    return {
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      displayName: hit.display_name,
      ...(extras.country ? { country: extras.country } : {}),
      ...(extras.state ? { state: extras.state } : {}),
      ...(extras.zipCode ? { zipCode: extras.zipCode } : {}),
    };
  } catch {
    return null;
  }
}

// ─── Load Leaflet once ────────────────────────────────────────────────────────

let leafletLoadPromise: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (leafletLoadPromise) return leafletLoadPromise;
  leafletLoadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") { reject(new Error("no window")); return; }
    if ((window as any).L) { resolve(); return; }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => {
      try {
        const L = (window as any).L;
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    script.onerror = () => reject(new Error("Failed to load Leaflet script"));
    document.head.appendChild(script);
  });
  return leafletLoadPromise;
}

// ─── Custom marker icons ──────────────────────────────────────────────────────

function makeUserIcon(L: any) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center">
      <div style="width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        background:linear-gradient(135deg,#a855f7,#6366f1);border:3px solid #fff;
        box-shadow:0 4px 16px rgba(168,85,247,0.7);display:flex;align-items:center;justify-content:center">
        <svg style="transform:rotate(45deg)" width="16" height="16" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="10" r="3"/>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        </svg>
      </div>
      <div style="background:rgba(168,85,247,0.95);color:white;font-size:10px;font-weight:700;
        padding:2px 8px;border-radius:10px;margin-top:3px;white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.4)">Your Location</div>
    </div>`,
    iconSize: [40, 62],
    iconAnchor: [20, 54],
    popupAnchor: [0, -54],
  });
}

function makeShowroomIcon(L: any, name: string) {
  const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center">
      <div style="width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        background:linear-gradient(135deg,#f59e0b,#ef4444);border:3px solid #fff;
        box-shadow:0 4px 16px rgba(245,158,11,0.7);display:flex;align-items:center;justify-content:center">
        <svg style="transform:rotate(45deg)" width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22" stroke="white" fill="none" stroke-width="2"/>
        </svg>
      </div>
      <div style="background:rgba(245,158,11,0.95);color:white;font-size:10px;font-weight:700;
        padding:2px 8px;border-radius:10px;margin-top:3px;white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.4);max-width:130px;overflow:hidden;text-overflow:ellipsis">
        ${safeName}
      </div>
    </div>`,
    iconSize: [40, 62],
    iconAnchor: [20, 54],
    popupAnchor: [0, -54],
  });
}

// ─── LeafletMap inner component ───────────────────────────────────────────────

interface LeafletMapProps {
  onMapClick: (ll: { lat: number; lng: number }) => void;
  center: { lat: number; lng: number };
  userMarker: { lat: number; lng: number } | null;
  showroomMarker: { lat: number; lng: number } | null;
  showroomName: string;
  distanceKm: number | null;
  deliveryCharge: number | null;
}

function LeafletMap({
  onMapClick,
  center,
  userMarker,
  showroomMarker,
  showroomName,
  distanceKm,
  deliveryCharge,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const showroomMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const midBadgeRef = useRef<any>(null);
  const onMapClickRef = useRef(onMapClick);
  const [isLoaded, setIsLoaded] = useState(false);

  // Keep click handler ref fresh without re-running map init
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

  // ── Init map once ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        await loadLeaflet();
        if (cancelled || !mapRef.current || mapInstanceRef.current) return;

        const L = (window as any).L;
        const map = L.map(mapRef.current, {
          center: [center.lat, center.lng],
          zoom: 12,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 19,
        }).addTo(map);

        // Use ref so we always call the latest handler without re-init
        map.on("click", (e: any) => onMapClickRef.current(e.latlng));

        mapInstanceRef.current = map;
        if (!cancelled) setIsLoaded(true);
      } catch (err) {
        console.error("Map init error:", err);
        if (!cancelled) showNotification("error", "Failed to load map. Please refresh.");
      }
    };

    init();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch { /* ignore */ }
        mapInstanceRef.current = null;
      }
    };
  }, []); // intentionally empty — init once

  // ── Fly to new center ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;
    try {
      mapInstanceRef.current.flyTo([center.lat, center.lng], 13, {
        animate: true,
        duration: 1.2,
      });
    } catch { /* map may be mid-destroy */ }
  }, [center.lat, center.lng, isLoaded]);

  // ── Showroom marker ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !showroomMarker) return;
    const L = (window as any).L;
    try {
      if (showroomMarkerRef.current) {
        mapInstanceRef.current.removeLayer(showroomMarkerRef.current);
      }
      showroomMarkerRef.current = L.marker(
        [showroomMarker.lat, showroomMarker.lng],
        { icon: makeShowroomIcon(L, showroomName), zIndexOffset: 100 }
      )
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<b style="color:#f59e0b">${showroomName}</b><br/><small>📦 Store Location</small>`
        );
    } catch (err) {
      console.error("Showroom marker error:", err);
    }
  }, [showroomMarker?.lat, showroomMarker?.lng, showroomName, isLoaded]);

  // ── User marker + route line + distance badge ───────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;
    const L = (window as any).L;

    try {
      // Clear previous user layer
      if (userMarkerRef.current) {
        mapInstanceRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (routeLineRef.current) {
        mapInstanceRef.current.removeLayer(routeLineRef.current);
        routeLineRef.current = null;
      }
      if (midBadgeRef.current) {
        mapInstanceRef.current.removeLayer(midBadgeRef.current);
        midBadgeRef.current = null;
      }

      if (!userMarker) return;

      // User pin
      userMarkerRef.current = L.marker(
        [userMarker.lat, userMarker.lng],
        { icon: makeUserIcon(L), zIndexOffset: 200 }
      )
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b style="color:#a855f7">📍 Your Delivery Location</b>`);

      // Route + badge when showroom is known
      if (showroomMarker && distanceKm !== null && deliveryCharge !== null) {
        const latlngs: [number, number][] = [
          [userMarker.lat, userMarker.lng],
          [showroomMarker.lat, showroomMarker.lng],
        ];

        routeLineRef.current = L.polyline(latlngs, {
          color: "#a855f7",
          weight: 3,
          opacity: 0.85,
          dashArray: "10, 8",
        }).addTo(mapInstanceRef.current);

        const midLat = (userMarker.lat + showroomMarker.lat) / 2;
        const midLng = (userMarker.lng + showroomMarker.lng) / 2;

        midBadgeRef.current = L.marker([midLat, midLng], {
          icon: L.divIcon({
            className: "",
            html: `<div style="
              background:linear-gradient(135deg,#7c3aed,#4338ca);color:white;
              font-size:11px;font-weight:700;padding:5px 11px;border-radius:20px;
              box-shadow:0 3px 14px rgba(124,58,237,0.65);white-space:nowrap;
              border:2px solid rgba(255,255,255,0.25);display:flex;align-items:center;gap:5px">
              <span>🛣</span>
              <span>${distanceKm.toFixed(1)} km</span>
              <span style="opacity:0.6">·</span>
              <span style="color:#fbbf24">₵${deliveryCharge.toFixed(2)}</span>
            </div>`,
            iconSize: [150, 32],
            iconAnchor: [75, 16],
          }),
          interactive: false,
          zIndexOffset: 300,
        }).addTo(mapInstanceRef.current);

        mapInstanceRef.current.fitBounds(L.latLngBounds(latlngs), {
          padding: [70, 70],
        });
      }
    } catch (err) {
      console.error("User marker/route error:", err);
    }
  }, [
    userMarker?.lat,
    userMarker?.lng,
    showroomMarker?.lat,
    showroomMarker?.lng,
    distanceKm,
    deliveryCharge,
    isLoaded,
  ]);

  return (
    <div className="w-full relative">
      <div ref={mapRef} style={{ width: "100%", height: "380px" }} />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading map…</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Exported types ───────────────────────────────────────────────────────────

export interface SelectedLocation {
  name: string;
  coordinates: { latitude: number; longitude: number };
  /** From Nominatim when available */
  country?: string;
  state?: string;
  zipCode?: string;
}

interface MapComponentProps {
  onLocationSave: (location: SelectedLocation) => void;
  /** GeoJSON order: [longitude, latitude] */
  showroomCoordinates?: [number, number] | null;
  showroomName?: string;
  /** Weight-based delivery (USD) added to distance fee on map preview */
  weightDeliveryUsd?: number;
}

// ─── Main MapComponent ────────────────────────────────────────────────────────

export default function MapComponent({
  onLocationSave,
  showroomCoordinates,
  showroomName = "Showroom",
  weightDeliveryUsd = 0,
}: MapComponentProps) {
  // GeoJSON [lng, lat] → Leaflet { lat, lng }
  const showroomLatLng = showroomCoordinates
    ? { lat: showroomCoordinates[1], lng: showroomCoordinates[0] }
    : null;

  const defaultCenter = showroomLatLng ?? { lat: 23.8103, lng: 90.4125 };

  const [center, setCenter] = useState(defaultCenter);
  const [userLatLng, setUserLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [formattedAddress, setFormattedAddress] = useState("");
  const [structuredAddress, setStructuredAddress] = useState<{
    country?: string;
    state?: string;
    zipCode?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const distanceKm =
    userLatLng && showroomLatLng
      ? haversineKm(
          userLatLng.lat,
          userLatLng.lng,
          showroomLatLng.lat,
          showroomLatLng.lng
        )
      : null;

  const deliveryCharge =
    distanceKm !== null
      ? parseFloat(
          (
            Math.max(5, parseFloat((distanceKm * 2).toFixed(2))) +
            (weightDeliveryUsd ?? 0)
          ).toFixed(2),
        )
      : null;

  // ── Map click ───────────────────────────────────────────────────────────────
  const handleMapClick = useCallback(
    async ({ lat, lng }: { lat: number; lng: number }) => {
      if (!isMountedRef.current) return;
      setLoading(true);
      setIsSaved(false);
      const addr = await reverseGeocode(lat, lng);
      if (!isMountedRef.current) return;
      setFormattedAddress(addr.displayName);
      setStructuredAddress({
        ...(addr.country ? { country: addr.country } : {}),
        ...(addr.state ? { state: addr.state } : {}),
        ...(addr.zipCode ? { zipCode: addr.zipCode } : {}),
      });
      setUserLatLng({ lat, lng });
      setCenter({ lat, lng });
      setLoading(false);
    },
    []
  );

  // ── Search ──────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchInput.trim() || !isMountedRef.current) return;
    setLoading(true);
    setIsSaved(false);
    const result = await forwardGeocode(searchInput.trim());
    if (!isMountedRef.current) return;
    if (result) {
      setUserLatLng({ lat: result.lat, lng: result.lng });
      setCenter({ lat: result.lat, lng: result.lng });
      setFormattedAddress(result.displayName);
      setStructuredAddress({
        ...(result.country ? { country: result.country } : {}),
        ...(result.state ? { state: result.state } : {}),
        ...(result.zipCode ? { zipCode: result.zipCode } : {}),
      });
      showNotification(
        "success",
        `Found: ${result.displayName.split(",")[0]}`
      );
    } else {
      showNotification("warning", "Location not found. Try a different search.");
    }
    setLoading(false);
  };

  // ── GPS ─────────────────────────────────────────────────────────────────────
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showNotification("error", "Geolocation not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        if (!isMountedRef.current) return;
        await handleMapClick({ lat: coords.latitude, lng: coords.longitude });
        if (isMountedRef.current) showNotification("success", "Using your current location!");
      },
      (err) => {
        console.warn("Geolocation error:", err);
        if (isMountedRef.current) {
          showNotification("error", "Could not get location. Please allow location access.");
          setLoading(false);
        }
      },
      { timeout: 8000 }
    );
  };

  // ── Confirm ─────────────────────────────────────────────────────────────────
  const handleConfirmLocation = () => {
    if (!userLatLng || !formattedAddress) {
      showNotification("warning", "Please click on the map to pin your location first.");
      return;
    }
    onLocationSave({
      name: formattedAddress,
      coordinates: { latitude: userLatLng.lat, longitude: userLatLng.lng },
      ...(structuredAddress.country ? { country: structuredAddress.country } : {}),
      ...(structuredAddress.state ? { state: structuredAddress.state } : {}),
      ...(structuredAddress.zipCode ? { zipCode: structuredAddress.zipCode } : {}),
    });
    setIsSaved(true);
    showNotification("success", "Delivery location confirmed!");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full rounded-xl overflow-hidden border border-purple-500/30">
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setIsMapExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-medium hover:from-purple-800 hover:to-indigo-800 transition-all"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          <span>
            {isSaved
              ? "✓ Delivery Location Saved — Click to Change"
              : "Select Delivery Location on Map"}
          </span>
        </div>
        {isMapExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {isMapExpanded && (
        <div className="bg-gray-50">
          {/* Search bar */}
          <div className="p-3 flex gap-2 bg-white border-b border-gray-200 shadow-sm">
            <input
              type="text"
              placeholder="Search for your address…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={loading}
              title="Use my current GPS location"
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center"
            >
              <Navigation2 className="w-4 h-4" />
            </button>
          </div>

          {/* Map area */}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-[10001]">
                <div className="bg-white p-5 rounded-xl shadow-xl text-center border border-purple-200">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
                  <p className="mt-2 text-sm text-gray-600">Locating…</p>
                </div>
              </div>
            )}

            <LeafletMap
              onMapClick={handleMapClick}
              center={center}
              userMarker={userLatLng}
              showroomMarker={showroomLatLng}
              showroomName={showroomName}
              distanceKm={distanceKm}
              deliveryCharge={deliveryCharge}
            />

            {/* Legend overlay */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-2 text-xs space-y-1.5 pointer-events-none shadow-md">
              <div className="flex items-center gap-2">
                <span>🏠</span>
                <span className="text-amber-600 font-semibold">{showroomName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span className="text-purple-700">Your delivery location</span>
              </div>
              {distanceKm !== null && (
                <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                  <span>🛣</span>
                  <span className="text-purple-700 font-bold">
                    {distanceKm.toFixed(1)} km →₵ ${deliveryCharge?.toFixed(2)} delivery
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom info + confirm */}
          {userLatLng && (
            <div className="p-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center shadow-sm">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">Selected delivery address:</p>
                <p className="text-sm text-gray-800 line-clamp-2">{formattedAddress}</p>
                {distanceKm !== null && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full border border-purple-200">
                      📏 {distanceKm.toFixed(2)} km from store
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
                      🚚 ₵{deliveryCharge?.toFixed(2)} delivery
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full border border-gray-200">
                      ₵2/km · min ₵5 + weight ₵2/kg
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleConfirmLocation}
                className={`flex-shrink-0 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  isSaved
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
                }`}
              >
                {isSaved ? "✓ Location Saved" : "Confirm Location"}
              </button>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 py-2 bg-gray-50">
            Click anywhere on the map · or search · or use GPS
          </p>
        </div>
      )}
    </div>
  );
}