"use client";

import { useAddCustomOrderMutation } from "@/redux/features/order/orderSlice";
import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  Map,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import MapComponent, {
  SelectedLocation as MapSelectedLocation,
} from "../CustomerDashboard/Location";
import { useGetProductDetailsforCustomerQuery } from "@/redux/features/home/homeSlice";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SelectedLocation {
  lat: number;
  lng: number;
  address: string;
  displayName: string;
  name?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface DeliveryInfo {
  name: string;
  address: string;
  country: string;
  state: string;
  zipcode: string;
  email: string;
  phone: string;
  location: { type: "Point"; coordinates: [number, number] };
}

interface Measurements {
  chest: string;
  shoulderWidth: string;
  armLength: string;
  inseam: string;
  neck: string;
  length: string;
  waist: string;
  hips: string;
  inseamTrouser: string;
  outseam: string;
  thigh: string;
  knee: string;
  ankle: string;
  waistShorts: string;
  hipsShorts: string;
  inseamShorts: string;
  outseamShorts: string;
  thighShorts: string;
  additionalNotes: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

// ─── Inline Map Picker Component ─────────────────────────────────────────────
function LocationMapPicker({
  onLocationSelect,
  initialLat = 23.8103,
  initialLng = 90.4125,
}: {
  onLocationSelect: (loc: SelectedLocation) => void;
  initialLat?: number;
  initialLng?: number;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<SelectedLocation | null>(
    null,
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildAddress = (addr: NominatimResult["address"]) =>
    [addr.road, addr.suburb, addr.city, addr.state, addr.country]
      .filter(Boolean)
      .join(", ");

  const reverseGeocode = useCallback(
    async (lat: number, lng: number, marker?: any) => {
      setIsGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
          { headers: { "Accept-Language": "en" } },
        );
        const data: NominatimResult = await res.json();
        const address = buildAddress(data.address);
        const loc: SelectedLocation = {
          lat,
          lng,
          address,
          displayName: data.display_name,
        };
        setPickedLocation(loc);
        if (marker) {
          marker
            .bindPopup(
              `<div style="font-size:12px;max-width:200px;line-height:1.5;color:#111">${data.display_name}</div>`,
            )
            .openPopup();
        }
        console.log("📍 Location picked:", {
          lat,
          lng,
          address,
          displayName: data.display_name,
        });
      } catch (e) {
        console.error("Reverse geocode error:", e);
      } finally {
        setIsGeocoding(false);
      }
    },
    [],
  );

  // Init Leaflet
  useEffect(() => {
    if (leafletMapRef.current || !mapContainerRef.current) return;
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const customIcon = L.divIcon({
        className: "",
        html: `<div style="width:30px;height:30px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 14px rgba(124,58,237,0.7)"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -32],
      });

      const map = L.map(mapContainerRef.current!, {
        center: [initialLat, initialLng],
        zoom: 13,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap contributors © CARTO",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initialLat, initialLng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        reverseGeocode(lat, lng, marker);
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng, marker);
      });

      markerRef.current = marker;
      leafletMapRef.current = map;
      reverseGeocode(initialLat, initialLng, marker);
    });

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowDropdown(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&addressdetails=1&accept-language=en`,
          { headers: { "Accept-Language": "en" } },
        );
        setSearchResults(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectResult = async (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchQuery(result.display_name);
    setShowDropdown(false);
    setSearchResults([]);
    if (leafletMapRef.current && markerRef.current) {
      leafletMapRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
    }
    await reverseGeocode(lat, lng, markerRef.current);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude: lat, longitude: lng } = coords;
      if (leafletMapRef.current && markerRef.current) {
        leafletMapRef.current.setView([lat, lng], 16);
        markerRef.current.setLatLng([lat, lng]);
      }
      await reverseGeocode(lat, lng, markerRef.current);
    });
  };

  const handleConfirm = () => {
    if (!pickedLocation) return;
    onLocationSelect(pickedLocation);
    console.log("✅ Confirmed delivery location:", pickedLocation);
  };

  return (
    <div className="rounded-xl overflow-visible border border-purple-600/30 bg-[#0f0d1e]">
      {/* Map header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#13102a] border-b border-white/5">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">
            Pick Location on Map
          </span>
        </div>
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 bg-purple-600/10 hover:bg-purple-600/20 px-3 py-1 rounded-full border border-purple-600/20 transition-colors"
        >
          <MapPin className="w-3 h-3" />
          Use my location
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2 relative" style={{ zIndex: 1000 }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search city, street, landmark..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-9 pr-9 py-2.5 bg-[#1a1730] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {isSearching ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 animate-spin" />
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
            </button>
          ) : null}
        </div>

        {/* Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div
            className="absolute left-3 right-3 mt-1 bg-[#1e1a35] border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
            style={{ zIndex: 9999 }}
          >
            {searchResults.map((r) => (
              <button
                key={r.place_id}
                type="button"
                onClick={() => handleSelectResult(r)}
                className="w-full text-left px-3 py-2.5 hover:bg-purple-600/20 transition-colors border-b border-white/5 last:border-0 flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-200 truncate">
                  {r.display_name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leaflet Map */}
      <div className="relative" style={{ height: 280 }}>
        <div ref={mapContainerRef} className="w-full h-full" />
        {isGeocoding && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
            <div className="bg-[#1e1a35] px-4 py-2 rounded-full flex items-center gap-2 text-sm text-white shadow-xl">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              Fetching address...
            </div>
          </div>
        )}
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-300 bg-black/60 px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none">
          Click map or drag pin to select
        </p>
      </div>

      {/* Address preview + Confirm button */}
      <div className="px-3 py-3 bg-[#13102a] border-t border-white/5 space-y-2">
        {pickedLocation ? (
          <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg px-3 py-2">
            <p className="text-[10px] text-purple-400 uppercase tracking-wider mb-0.5">
              Picked Address
            </p>
            <p className="text-sm text-white leading-snug">
              {pickedLocation.address || pickedLocation.displayName}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              lat: {pickedLocation.lat.toFixed(5)}, lng:{" "}
              {pickedLocation.lng.toFixed(5)}
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-1">
            No location selected yet
          </p>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!pickedLocation}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: pickedLocation
              ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
              : "#2a2438",
          }}
        >
          <CheckCircle2 className="w-4 h-4" />
          Confirm This Location
        </button>
      </div>
    </div>
  );
}

// ─── Shared input style ───────────────────────────────────────────────────────
const inputClass =
  "w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomDesignRequest() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMeasurementType, setSelectedMeasurementType] = useState("");

  const [confirmedLocation, setConfirmedLocation] =
    useState<SelectedLocation | null>(null);
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") || undefined;


    const { data: productData } = useGetProductDetailsforCustomerQuery(productId || '', {
      skip: !productId
    });

    console.log(productData)

  const [measurements, setMeasurements] = useState<Measurements>({
    chest: "",
    shoulderWidth: "",
    armLength: "",
    inseam: "",
    neck: "",
    length: "",
    waist: "",
    hips: "",
    inseamTrouser: "",
    outseam: "",
    thigh: "",
    knee: "",
    ankle: "",
    waistShorts: "",
    hipsShorts: "",
    inseamShorts: "",
    outseamShorts: "",
    thighShorts: "",
    additionalNotes: "",
  });

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    name: "",
    address: "",
    country: "",
    state: "",
    zipcode: "",
    email: "",
    phone: "",
    location: { type: "Point", coordinates: [0, 0] },
  });

  const [customOrderRequest, { isLoading }] = useAddCustomOrderMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleMeasurementChange = (field: string, value: string) =>
    setMeasurements((prev) => ({ ...prev, [field]: value }));

  const handleDeliveryChange = (field: keyof DeliveryInfo, value: string) =>
    setDeliveryInfo((prev) => ({ ...prev, [field]: value }));

  // Called when user clicks "Confirm This Location" on the map
  const handleLocationConfirmed = (loc: SelectedLocation) => {
    setConfirmedLocation(loc);
    setDeliveryInfo((prev) => ({
      ...prev,
      address: loc.address || prev.address,
      location: { type: "Point", coordinates: [loc.lng, loc.lat] }, // GeoJSON: [lng, lat]
    }));
    console.log("📦 Delivery location confirmed:", {
      address: loc.address,
      displayName: loc.displayName,
      lat: loc.lat,
      lng: loc.lng,
      coordinates: [loc.lng, loc.lat],
    });
  };

  const buildMeasurementsPayload = () => {
    const toNum = (v: string) => (v !== "" ? parseFloat(v) : undefined);
    if (selectedMeasurementType === "top")
      return {
        ...(toNum(measurements.chest) !== undefined && {
          chest: toNum(measurements.chest),
        }),
        ...(toNum(measurements.shoulderWidth) !== undefined && {
          shoulderWidth: toNum(measurements.shoulderWidth),
        }),
        ...(toNum(measurements.armLength) !== undefined && {
          armLength: toNum(measurements.armLength),
        }),
        ...(toNum(measurements.inseam) !== undefined && {
          inseam: toNum(measurements.inseam),
        }),
        ...(toNum(measurements.neck) !== undefined && {
          neck: toNum(measurements.neck),
        }),
        ...(toNum(measurements.length) !== undefined && {
          length: toNum(measurements.length),
        }),
        ...(measurements.additionalNotes && {
          additionalNote: measurements.additionalNotes,
        }),
      };
    if (selectedMeasurementType === "trouser")
      return {
        ...(toNum(measurements.waist) !== undefined && {
          waist: toNum(measurements.waist),
        }),
        ...(toNum(measurements.hips) !== undefined && {
          hips: toNum(measurements.hips),
        }),
        ...(toNum(measurements.inseamTrouser) !== undefined && {
          inseam: toNum(measurements.inseamTrouser),
        }),
        ...(toNum(measurements.outseam) !== undefined && {
          outseam: toNum(measurements.outseam),
        }),
        ...(toNum(measurements.thigh) !== undefined && {
          thigh: toNum(measurements.thigh),
        }),
        ...(toNum(measurements.knee) !== undefined && {
          knee: toNum(measurements.knee),
        }),
        ...(toNum(measurements.ankle) !== undefined && {
          ankle: toNum(measurements.ankle),
        }),
        ...(measurements.additionalNotes && {
          additionalNote: measurements.additionalNotes,
        }),
      };
    if (selectedMeasurementType === "shorts")
      return {
        ...(toNum(measurements.waistShorts) !== undefined && {
          waist: toNum(measurements.waistShorts),
        }),
        ...(toNum(measurements.hipsShorts) !== undefined && {
          hips: toNum(measurements.hipsShorts),
        }),
        ...(toNum(measurements.inseamShorts) !== undefined && {
          inseam: toNum(measurements.inseamShorts),
        }),
        ...(toNum(measurements.outseamShorts) !== undefined && {
          outseam: toNum(measurements.outseamShorts),
        }),
        ...(toNum(measurements.thighShorts) !== undefined && {
          thigh: toNum(measurements.thighShorts),
        }),
        ...(measurements.additionalNotes && {
          additionalNote: measurements.additionalNotes,
        }),
      };
    return {};
  };

  const [location, setLocation] = useState<MapSelectedLocation | null>(null);
  console.log(location);

  const handleSubmit = async () => {
    if (!selectedMeasurementType) {
      alert("Please select a measurement type.");
      return;
    }
    if (!location) {
      alert("Please select a delivery location from the map.");
      return;
    }
    try {
      setIsUploading(true);
      const data = {
        measurementType: selectedMeasurementType,
        productId,
        weight: { unit: "kg", amount: 1 },
        measurements: buildMeasurementsPayload(),
        deliveryInfo: {
          name: deliveryInfo.name,
          address: location.name, // Use location.name from MapComponent
          country: deliveryInfo.country,
          state: deliveryInfo.state,
          zipcode: parseInt(deliveryInfo.zipcode) || 0,
          email: deliveryInfo.email,
          phone: parseInt(deliveryInfo.phone) || 0,
          location: deliveryInfo.location,
        },
        ...(notes && { notes }),
      };
      console.log("Submitting custom order with data:", data);

      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      if (selectedFile) formData.append("files", selectedFile);
      const res = await customOrderRequest(formData).unwrap();
      if (res.success === true) {
        toast.success("Custom order request submitted successfully!");
        router.push("/custom-orders");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLocationSave = (selectedLocation: MapSelectedLocation) => {
    console.log("Saved location:", selectedLocation);
    setLocation(selectedLocation);

    // Extract coordinates from the nested structure
    const lat = selectedLocation.coordinates?.latitude ?? 0;
    const lng = selectedLocation.coordinates?.longitude ?? 0;
    const address = selectedLocation.name;

    // Update delivery info address and location coordinates
    setDeliveryInfo((prev) => ({
      ...prev,
      address: address, // Set address from location name
      location: {
        type: "Point",
        coordinates: [lng, lat], // GeoJSON: [longitude, latitude]
      },
      ...(selectedLocation.country
        ? { country: selectedLocation.country }
        : {}),
      ...(selectedLocation.state ? { state: selectedLocation.state } : {}),
      ...(selectedLocation.zipCode ? { zipcode: selectedLocation.zipCode } : {}),
    }));
  };

  return (
    <div className="md:min-h-[600px] mt-12 md:mt-24 bg-gradient-to-r from-black via-[#140c2e] to-black p-6">
      {/* Header */}
      <div className="container mx-auto mt-4 mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-purple-600/40 flex items-center justify-center cursor-pointer">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
        </button>
        <h1 className="text-2xl font-semibold text-gray-300 font-cormorant">
          Custom Design Request
        </h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* ── Upload ── */}
        <div>
          <div
            className="w-full h-32 border-2 border-dashed border-purple-400 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-purple-900/20 transition-colors"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin w-8 h-8 text-purple-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <p className="text-sm text-gray-300">Uploading...</p>
              </div>
            ) : selectedFile ? (
              <div className="text-center">
                <svg
                  className="w-8 h-8 text-green-400 mb-2 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414l3.293 3.293a1 1 0 011.414 0l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-white">{selectedFile.name}</p>
              </div>
            ) : (
              <div className="text-center">
                <svg
                  className="w-8 h-8 text-purple-400 mb-2 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                </svg>
                <p className="text-sm text-gray-300">Upload Design File</p>
              </div>
            )}
          </div>
          <input
            id="fileInput"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.gif,.pdf,.zip,.ai,.psd"
          />
        </div>

        {/* ── Notes ── */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Notes to Vendor
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific requirements or preferences..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={4}
          />
        </div>

        {/* ── Measurement Type ── */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Select Measurement Type
          </label>
          <div className="relative">
            <select
              value={selectedMeasurementType}
              onChange={(e) => setSelectedMeasurementType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="">Choose measurement type...</option>
              <option value="top">Top Measurements</option>
              <option value="trouser">Trouser Measurements</option>
              <option value="shorts">Shorts Measurements</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* ── Top Measurements ── */}
        {selectedMeasurementType === "top" && (
          <div className="bg-[#2a2438] border-2 border-blue-500 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-1">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-xl font-semibold text-white">
                Top Measurements
              </h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Provide measurements in inches. Fill in only what you know.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Chest (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 38"
                    value={measurements.chest}
                    onChange={(e) =>
                      handleMeasurementChange("chest", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Shoulder Width (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 18"
                    value={measurements.shoulderWidth}
                    onChange={(e) =>
                      handleMeasurementChange("shoulderWidth", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Arm Length (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 24"
                    value={measurements.armLength}
                    onChange={(e) =>
                      handleMeasurementChange("armLength", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Inseam (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 32"
                    value={measurements.inseam}
                    onChange={(e) =>
                      handleMeasurementChange("inseam", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Neck (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 15"
                    value={measurements.neck}
                    onChange={(e) =>
                      handleMeasurementChange("neck", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Length (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 28"
                    value={measurements.length}
                    onChange={(e) =>
                      handleMeasurementChange("length", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  placeholder="Any specific requirements..."
                  value={measurements.additionalNotes}
                  onChange={(e) =>
                    handleMeasurementChange("additionalNotes", e.target.value)
                  }
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Trouser Measurements ── */}
        {selectedMeasurementType === "trouser" && (
          <div className="bg-[#2a2438] border-2 border-blue-500 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-xl font-semibold text-white">
                Trouser Measurements
              </h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Waist (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 32"
                    value={measurements.waist}
                    onChange={(e) =>
                      handleMeasurementChange("waist", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Hips (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 38"
                    value={measurements.hips}
                    onChange={(e) =>
                      handleMeasurementChange("hips", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Inseam (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 30"
                    value={measurements.inseamTrouser}
                    onChange={(e) =>
                      handleMeasurementChange("inseamTrouser", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Outseam (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 42"
                    value={measurements.outseam}
                    onChange={(e) =>
                      handleMeasurementChange("outseam", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Thigh (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 22"
                    value={measurements.thigh}
                    onChange={(e) =>
                      handleMeasurementChange("thigh", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Knee (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 16"
                    value={measurements.knee}
                    onChange={(e) =>
                      handleMeasurementChange("knee", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Ankle (Inches)
                </label>
                <input
                  type="text"
                  placeholder="eg. 8"
                  value={measurements.ankle}
                  onChange={(e) =>
                    handleMeasurementChange("ankle", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  placeholder="Any specific requirements..."
                  value={measurements.additionalNotes}
                  onChange={(e) =>
                    handleMeasurementChange("additionalNotes", e.target.value)
                  }
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Shorts Measurements ── */}
        {selectedMeasurementType === "shorts" && (
          <div className="bg-[#2a2438] border-2 border-blue-500 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-xl font-semibold text-white">
                Shorts Measurements
              </h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Waist (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 32"
                    value={measurements.waistShorts}
                    onChange={(e) =>
                      handleMeasurementChange("waistShorts", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Hips (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 38"
                    value={measurements.hipsShorts}
                    onChange={(e) =>
                      handleMeasurementChange("hipsShorts", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Inseam (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 10"
                    value={measurements.inseamShorts}
                    onChange={(e) =>
                      handleMeasurementChange("inseamShorts", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Outseam (Inches)
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 18"
                    value={measurements.outseamShorts}
                    onChange={(e) =>
                      handleMeasurementChange("outseamShorts", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Thigh (Inches)
                </label>
                <input
                  type="text"
                  placeholder="eg. 22"
                  value={measurements.thighShorts}
                  onChange={(e) =>
                    handleMeasurementChange("thighShorts", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  placeholder="Any specific requirements..."
                  value={measurements.additionalNotes}
                  onChange={(e) =>
                    handleMeasurementChange("additionalNotes", e.target.value)
                  }
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Delivery Information ── */}
        <div className="bg-[#1e1a2e] border border-purple-700/40 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">
            Delivery Information
          </h2>
          <div className="space-y-4">
            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={deliveryInfo.name}
                  onChange={(e) => handleDeliveryChange("name", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={deliveryInfo.email}
                  onChange={(e) =>
                    handleDeliveryChange("email", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Address
              </label>
              <input
                type="text"
                placeholder="Auto-filled from map location"
                value={deliveryInfo.address}
                onChange={(e) =>
                  handleDeliveryChange("address", e.target.value)
                }
                className={inputClass}
                readOnly
              />
            </div>

            {/* ── MAP COMPONENT ── */}
            <div>
              <label className="block text-sm text-gray-300 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                Delivery Location
              </label>
              <MapComponent onLocationSave={handleLocationSave} />
            </div>

            {/* Confirmed location chip */}
            {location && (
              <div className="flex items-start gap-2 bg-green-600/10 border border-green-600/20 rounded-lg px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-green-400 font-medium mb-0.5">
                    Location Saved ✓
                  </p>
                  <p className="text-sm text-white">{location.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Coordinates: [
                    {location?.coordinates?.longitude?.toFixed(5) || "0.00000"},{" "}
                    {location?.coordinates?.latitude?.toFixed(5) || "0.00000"}]
                  </p>
                </div>
              </div>
            )}

            {/* Country + State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="United States"
                  value={deliveryInfo.country}
                  onChange={(e) =>
                    handleDeliveryChange("country", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  State
                </label>
                <input
                  type="text"
                  placeholder="New York"
                  value={deliveryInfo.state}
                  onChange={(e) =>
                    handleDeliveryChange("state", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* Zip + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Zip Code
                </label>
                <input
                  type="text"
                  placeholder="10001"
                  value={deliveryInfo.zipcode}
                  onChange={(e) =>
                    handleDeliveryChange("zipcode", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="2125551234"
                  value={deliveryInfo.phone}
                  onChange={(e) =>
                    handleDeliveryChange("phone", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || isUploading}
          className="w-full py-3 px-4 rounded-lg text-white font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || isUploading ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </div>
  );
}
