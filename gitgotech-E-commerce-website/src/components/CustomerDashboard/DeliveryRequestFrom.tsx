"use client";
import BackButton from "@/customComponent/BackButton";
import { useCreateDeliveryRequestMutation } from "@/redux/features/deliveryRequest/deliveryRequest";
import {
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Package,
  Upload,
} from "lucide-react";
import React, { useState } from "react";
import MapComponent, {
  SelectedLocation as MapSelectedLocation,
} from "../CustomerDashboard/Location";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LocationDetails {
  name: string;
  phone: string;
  location: string;
  email: string;
  coordinates: [number, number];
  country: string;
  state: string;
  zipCode: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const DeliveryRequestFrom = () => {
  const [formData, setFormData] = useState({
    productImage: null as File | null,
    productImagePreview: null as string | null,
    category: "",
    numberOfItems: "1",
    totalWeight: "",
    weightUnit: "kg",
    tip: "0",
    deliveryFee: "0",
    currency: "usd",
  });

  const [pickupLocation, setPickupLocation] = useState<LocationDetails>({
    name: "",
    phone: "",
    location: "",
    email: "",
    coordinates: [0, 0],
    country: "",
    state: "",
    zipCode: "",
  });

  const [deliveryAddress, setDeliveryAddress] = useState<LocationDetails>({
    name: "",
    phone: "",
    location: "",
    email: "",
    coordinates: [0, 0],
    country: "",
    state: "",
    zipCode: "",
  });

  const [pickupMapLocation, setPickupMapLocation] =
    useState<MapSelectedLocation | null>(null);
  const [deliveryMapLocation, setDeliveryMapLocation] =
    useState<MapSelectedLocation | null>(null);

  const [deliveryRequest, { isLoading }] = useCreateDeliveryRequestMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    section: "pickup" | "delivery" | "product",
  ): void => {
    const { name, value } = e.target;
    if (section === "product") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (section === "pickup") {
      setPickupLocation((prev) => ({ ...prev, [name]: value }));
    } else {
      setDeliveryAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        productImage: file,
        productImagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleLocationSave = (
    selectedLocation: MapSelectedLocation,
    section: "pickup" | "delivery",
  ): void => {
    console.log(`📍 ${section} location saved:`, selectedLocation);

    const lat = selectedLocation.coordinates?.latitude || 0;
    const lng = selectedLocation.coordinates?.longitude || 0;
    const address = selectedLocation.name || "";

    if (section === "pickup") {
      setPickupMapLocation(selectedLocation);
      setPickupLocation((prev) => ({
        ...prev,
        location: address,
        coordinates: [lng, lat] as [number, number],
        ...(selectedLocation.country ? { country: selectedLocation.country } : {}),
        ...(selectedLocation.state ? { state: selectedLocation.state } : {}),
        ...(selectedLocation.zipCode ? { zipCode: selectedLocation.zipCode } : {}),
      }));
    } else {
      setDeliveryMapLocation(selectedLocation);
      setDeliveryAddress((prev) => ({
        ...prev,
        location: address,
        coordinates: [lng, lat] as [number, number],
        ...(selectedLocation.country ? { country: selectedLocation.country } : {}),
        ...(selectedLocation.state ? { state: selectedLocation.state } : {}),
        ...(selectedLocation.zipCode ? { zipCode: selectedLocation.zipCode } : {}),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // ── Validation ──
    const errors: string[] = [];
    if (!formData.category.trim()) errors.push("Category is required");
    if (parseInt(formData.numberOfItems) < 1)
      errors.push("Number of items must be at least 1");

    const weightVal = parseFloat(formData.totalWeight);
    if (isNaN(weightVal) || weightVal <= 0) {
      errors.push("Weight value must be greater than 0");
    }

    const validUnits = ["kg", "mg", "gm", "pound", "ounce"];
    if (!validUnits.includes(formData.weightUnit)) {
      errors.push("Invalid weight unit selected");
    }

    if (!pickupMapLocation)
      errors.push("Please select a pickup location from the map");
    if (!deliveryMapLocation)
      errors.push("Please select a delivery location from the map");
    if (
      !pickupLocation.name ||
      !pickupLocation.phone ||
      !pickupLocation.email
    ) {
      errors.push("Pickup contact information is incomplete");
    }
    if (
      !deliveryAddress.name ||
      !deliveryAddress.phone ||
      !deliveryAddress.email
    ) {
      errors.push("Delivery contact information is incomplete");
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    // ── Build Payload ──
    const requestBody = {
      category: formData.category,
      numberOfItems: parseInt(formData.numberOfItems),
      weight: {
        unit: formData.weightUnit,
        value: weightVal,
      },
      pickupLocation: {
        name: pickupLocation.name,
        phone: pickupLocation.phone,
        location: pickupLocation.location,
        email: pickupLocation.email,
        coordinates: pickupLocation.coordinates,
        country: pickupLocation.country,
        state: pickupLocation.state,
        zipCode: pickupLocation.zipCode,
      },
      deliveryAddress: {
        name: deliveryAddress.name,
        phone: deliveryAddress.phone,
        location: deliveryAddress.location,
        email: deliveryAddress.email,
        coordinates: deliveryAddress.coordinates,
        country: deliveryAddress.country,
        state: deliveryAddress.state,
        zipCode: deliveryAddress.zipCode,
      },
      price: {
        tip: parseFloat(formData.tip) || 0,
        deliveryFee: parseFloat(formData.deliveryFee) || 0,
        currency: formData.currency.toLowerCase(),
      },
    };

    console.log(
      "📦 Delivery Request Payload:",
      JSON.stringify(requestBody, null, 2),
    );

    // ── Submit ──
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("data", JSON.stringify(requestBody));
      if (formData.productImage) {
        formDataToSend.append("images", formData.productImage);
      }

      const response = await deliveryRequest(formDataToSend).unwrap();
      console.log("✅ Success Response:", response);

      alert("Delivery request submitted successfully!");

      // Reset Form
      setFormData({
        productImage: null,
        productImagePreview: null,
        category: "",
        numberOfItems: "1",
        totalWeight: "",
        weightUnit: "kg",
        tip: "0",
        deliveryFee: "0",
        currency: "usd",
      });
      setPickupLocation({
        name: "",
        phone: "",
        location: "",
        email: "",
        coordinates: [0, 0],
        country: "",
        state: "",
        zipCode: "",
      });
      setDeliveryAddress({
        name: "",
        phone: "",
        location: "",
        email: "",
        coordinates: [0, 0],
        country: "",
        state: "",
        zipCode: "",
      });
      setPickupMapLocation(null);
      setDeliveryMapLocation(null);
    } catch (error: any) {
      console.error("❌ Submission Error:", error);
      const backendMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to submit request. Please try again.";
      alert(backendMessage);
    }
  };

  const weightUnits = [
    { value: "kg", label: "Kilogram (kg)" },
    { value: "mg", label: "Milligram (mg)" },
    { value: "gm", label: "Gram (gm)" },
    { value: "pound", label: "Pound (pound)" },
    { value: "ounce", label: "Ounce (ounce)" },
  ];

  const inputClass =
    "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ACCED] transition-colors";

  return (
    <div className="min-h-screen mt-24 container mx-auto bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            <BackButton title="New Request" />
          </h1>
          <p className="text-gray-400 mt-1">
            Request a delivery to send products to your friends.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information */}
            <div className="rounded-lg p-4 border border-purple-500">
              <div className="bg-gradient-to-r from-[#2ACCED] px-4 mb-2 to-[#B630F4] py-2">
                <h2 className="text-xl font-semibold py-2">
                  Product Information
                </h2>
              </div>
              <div className="space-y-4">
                {/* Image Upload */}
                <div className="flex items-center space-x-4">
                  <div className="relative w-24 h-24 bg-gray-800 rounded-md overflow-hidden">
                    {formData.productImagePreview ? (
                      <img
                        src={formData.productImagePreview}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {formData.productImage && (
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-600 rounded-full p-1"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            productImage: null,
                            productImagePreview: null,
                          }))
                        }
                      >
                        <svg
                          width="12"
                          height="12"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 0L0 8l8 8 8-8z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange(e, "product")}
                    className={inputClass}
                    placeholder="e.g., cake, clothes, electronics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Number of Items
                  </label>
                  <input
                    type="number"
                    name="numberOfItems"
                    value={formData.numberOfItems}
                    onChange={(e) => handleInputChange(e, "product")}
                    className={inputClass}
                    min="1"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Total Weight
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      name="totalWeight"
                      value={formData.totalWeight}
                      onChange={(e) => handleInputChange(e, "product")}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2ACCED] text-white"
                      placeholder="2.5"
                      step="0.1"
                      min="0.1"
                    />
                    <select
                      name="weightUnit"
                      value={formData.weightUnit}
                      onChange={(e) => handleInputChange(e, "product")}
                      className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2ACCED] text-white"
                    >
                      {weightUnits.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Location */}
            <div className="rounded-lg p-4 border border-purple-500">
              <div className="bg-gradient-to-r from-[#2ACCED] px-4 mb-2 to-[#B630F4] py-2">
                <h2 className="text-xl font-semibold py-2">Pickup Location</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={pickupLocation.name}
                      onChange={(e) => handleInputChange(e, "pickup")}
                      className={inputClass}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={pickupLocation.phone}
                      onChange={(e) => handleInputChange(e, "pickup")}
                      className={inputClass}
                      placeholder="1234567890"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={pickupLocation.email}
                        onChange={(e) => handleInputChange(e, "pickup")}
                        className={inputClass}
                        placeholder="john@example.com"
                      />
                      <Mail className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Location (Auto-filled)
                    </label>
                    <input
                      type="text"
                      value={pickupLocation.location}
                      readOnly
                      className={`${inputClass} bg-gray-700 cursor-not-allowed`}
                      placeholder="Select from map"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={pickupLocation.country}
                      onChange={(e) => handleInputChange(e, "pickup")}
                      className={inputClass}
                      placeholder="US"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={pickupLocation.state}
                      onChange={(e) => handleInputChange(e, "pickup")}
                      className={inputClass}
                      placeholder="CA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={pickupLocation.zipCode}
                      onChange={(e) => handleInputChange(e, "pickup")}
                      className={inputClass}
                      placeholder="94103"
                    />
                  </div>
                </div>

                {/* Map Component - Same as Checkout */}
                <div>
                  <label className="block text-sm mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Pickup Location *
                  </label>
                  <MapComponent
                    onLocationSave={(loc) => handleLocationSave(loc, "pickup")}
                  />
                  {pickupMapLocation && (
                    <div className="mt-3 p-3 bg-[#2ACCED]/10 border border-[#2ACCED]/30 rounded-lg">
                      <p className="text-xs text-gray-300">
                        <span className="font-medium">Selected Location:</span>{" "}
                        {pickupMapLocation.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Coordinates: [
                        {pickupMapLocation.coordinates.longitude.toFixed(6)},{" "}
                        {pickupMapLocation.coordinates.latitude.toFixed(6)}]
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-lg p-4 border border-purple-500">
              <div className="bg-gradient-to-r from-[#2ACCED] px-4 mb-2 to-[#B630F4] py-2">
                <h2 className="text-xl font-semibold py-2">Delivery Address</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={deliveryAddress.name}
                      onChange={(e) => handleInputChange(e, "delivery")}
                      className={inputClass}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={deliveryAddress.phone}
                      onChange={(e) => handleInputChange(e, "delivery")}
                      className={inputClass}
                      placeholder="0987654321"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={deliveryAddress.email}
                        onChange={(e) => handleInputChange(e, "delivery")}
                        className={inputClass}
                        placeholder="jane@example.com"
                      />
                      <Mail className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Location (Auto-filled)
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.location}
                      readOnly
                      className={`${inputClass} bg-gray-700 cursor-not-allowed`}
                      placeholder="Select from map"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={deliveryAddress.country}
                      onChange={(e) => handleInputChange(e, "delivery")}
                      className={inputClass}
                      placeholder="US"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={deliveryAddress.state}
                      onChange={(e) => handleInputChange(e, "delivery")}
                      className={inputClass}
                      placeholder="CA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={deliveryAddress.zipCode}
                      onChange={(e) => handleInputChange(e, "delivery")}
                      className={inputClass}
                      placeholder="94105"
                    />
                  </div>
                </div>

                {/* Map Component - Same as Checkout */}
                <div>
                  <label className="block text-sm mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Delivery Location *
                  </label>
                  <MapComponent
                    onLocationSave={(loc) =>
                      handleLocationSave(loc, "delivery")
                    }
                  />
                  {deliveryMapLocation && (
                    <div className="mt-3 p-3 bg-[#2ACCED]/10 border border-[#2ACCED]/30 rounded-lg">
                      <p className="text-xs text-gray-300">
                        <span className="font-medium">Selected Location:</span>{" "}
                        {deliveryMapLocation.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Coordinates: [
                        {deliveryMapLocation.coordinates.longitude.toFixed(6)},{" "}
                        {deliveryMapLocation.coordinates.latitude.toFixed(6)}]
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-900/20 to-gray-900/50 border border-gray-800 rounded-2xl p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Product Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Category</span>
                  <span className="text-sm text-white">
                    {formData.category || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Items</span>
                  <span className="text-sm text-white">
                    {formData.numberOfItems}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Weight</span>
                  <span className="text-sm text-white">
                    {formData.totalWeight || "0"} {formData.weightUnit}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-700 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Delivery Fee</span>
                  <span className="text-sm text-white">
                    ${parseFloat(formData.deliveryFee || "0").toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Tip</span>
                  <span className="text-sm text-white">
                    ${parseFloat(formData.tip || "0").toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-3 flex items-center justify-between">
                  <span className="text-lg font-semibold text-white">
                    Total
                  </span>
                  <span className="text-lg font-semibold text-[#2ACCED]">
                    $
                    {(
                      parseFloat(formData.deliveryFee || "0") +
                      parseFloat(formData.tip || "0")
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isLoading
                    ? "#2a2438"
                    : "linear-gradient(135deg, #2ACCED, #B630F4)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DeliveryRequestFrom;
