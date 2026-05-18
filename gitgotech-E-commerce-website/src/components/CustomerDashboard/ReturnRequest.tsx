"use client";
import BackButton from "@/customComponent/BackButton";
import { IMAGE_BASE_URL } from "@/lib/imageBaseUrl";
import {
  useAddReturnOrderMutation,
  useGetMainOrderDetailsQuery,
} from "@/redux/features/order/orderSlice";
import { useSearchParams,useRouter } from "next/navigation";
import { useState } from "react";
import MapComponent from "./Location";
import toast from "react-hot-toast";
 

interface SelectedLocation {
  name?: string;
  address?: string;
  displayName?: string;
  country?: string;
  state?: string;
  zipCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export default function ReturnRequestForm() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const router = useRouter();
  const [returnOrderSubmitted] = useAddReturnOrderMutation();

  // Fetch main order details
  const { data: mainOrderDetails, isLoading } = useGetMainOrderDetailsQuery(
    orderId,
    {
      skip: !orderId || orderId === "undefined",
    },
  );

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("United States");
  const [state, setState] = useState("Washington DC");
  const [zipCode, setZipCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [productUnused, setProductUnused] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  // Extract order data
  const orderData = mainOrderDetails?.data;
  console.log(orderData);
  const product = orderData?.product;
  const price = orderData?.price;

  // console.log("===== RETURN REQUEST PAGE DATA =====");
  // console.log("Order ID:", orderId);
  // console.log("Main Order Details:", mainOrderDetails);
  // console.log("Product:", product);
  // console.log("Price:", price);
  // console.log("====================================");

  // Handle location save from MapComponent
  const handleLocationSave = (selectedLocation: SelectedLocation) => {
    console.log("Saved location:", selectedLocation);
    setSelectedLocation(selectedLocation);

    // Extract coordinates from the nested structure
    const lat = selectedLocation.coordinates?.latitude;
    const lng = selectedLocation.coordinates?.longitude;
    const address =
      selectedLocation.name ||
      selectedLocation.address ||
      selectedLocation.displayName;

    // Update location field
    setLocation(address || "");
    if (selectedLocation.country)
      setCountry(selectedLocation.country);
    if (selectedLocation.state)
      setState(selectedLocation.state);
    if (selectedLocation.zipCode)
      setZipCode(selectedLocation.zipCode);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-8 flex items-center justify-center">
        <div className="text-purple-400 text-xl">Loading order details...</div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === files.length) {
              setUploadedImages([...uploadedImages, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Prepare form data matching the expected structure
    const formData = {
      clientReason: reason,
      isUsed: !productUnused,
      price: {
        unit: price?.unit || "usd",
        tip: price?.tip || 0,
        deliveryCharge: price?.deliveryCharge || 0,
      },
      pickUpInfo: {
        name: fullName,
        address: location,
        country: country,
        state: state,
        zipcode: zipCode,
        email: email,
        phone: phone,
        location: selectedLocation?.coordinates
          ? {
              type: "Point" as const,
              coordinates: [
                selectedLocation.coordinates.longitude,
                selectedLocation.coordinates.latitude,
              ],
            }
          : {
              type: "Point" as const,
              coordinates: [-74.006, 40.7128], // Default coordinates (New York)
            },
      },
    };

    // Console log the form data
    console.log("===== RETURN REQUEST FORM DATA ===== orderId:", orderId);
    console.log("return request data:", JSON.stringify(formData, null, 2));
    console.log("====================================");

    try {
      // Send return request
      const result = await returnOrderSubmitted({
        orderId: orderId,
        data: formData,
      }).unwrap();
      console.log("Return request submitted successfully:", result);
      if (result?.success) {  
        toast.success("Return request submitted successfully!");
        router.push("/customer-dashboard"); // Redirect to returns page after successful submission
      } 
    } catch (error: any) {
      console.error("Failed to submit return request:", error);
     
    }
  };

  return (
    <div className=" bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-4 md:p-8">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mt-16 md:mt-20">
        <BackButton title="Return Request" className="text-3xl" />
      </div>
      {/* Header */}
      <div className=" mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-cormorant font-bold mb-2">
          Return
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          One step away from your dream purchase.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Images */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Upload Images</h3>
            <div className="flex flex-wrap gap-4">
              {uploadedImages.map((img, index) => (
                <div
                  key={index}
                  className="relative w-32 h-32 rounded-xl overflow-hidden bg-gray-800"
                >
                  <img
                    src={img}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <label className="w-32 h-32 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <svg
                  className="w-8 h-8 text-purple-500 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-purple-400 text-sm">Upload</span>
              </label>
            </div>
          </div>

          {/* Reason Textarea */}
          <div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Write your reason"
              className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 min-h-[150px] resize-none"
            />
          </div>

          {/* Delivery Address */}
          <div className="border border-gray-700 p-2 rounded-2xl ">
            <div className="bg-gradient-to-r from-[#2ACCED] to-[#B630F4] py-2">
              <h3 className="py-3 p-6 text-[24px]">Delivery Address</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dianne"
                  className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Set Location - Map Component */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Set Location on Map
                </label>
                <MapComponent onLocationSave={handleLocationSave} />
              </div>

              {/* Country, State, Zip Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Country / Region
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    States
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option>Washington DC</option>
                    <option>California</option>
                    <option>New York</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="20033"
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dianne.russell@gmail.com"
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(603) 555-0123"
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Product is unused checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="unused"
                checked={productUnused}
                onChange={(e) => setProductUnused(e.target.checked)}
                className="w-5 h-5 rounded bg-black/50 border border-gray-700 checked:bg-purple-600 checked:border-purple-600 cursor-pointer"
              />
              <label htmlFor="unused" className="text-sm cursor-pointer">
                ☑ Product is unused
              </label>
            </div>
          </div>
          {/* Full Name */}
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-900/50 to-purple-900/10 border border-gray-800 rounded-2xl p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>

            {/* Product Info */}
            {product && (
              <div className="mb-6 pb-6 border-b border-gray-700">
                <div className="flex items-start gap-4">
                  <img
                    src={
                      product.product_images?.[0]
                        ? `${IMAGE_BASE_URL}/${product.product_images[0]}`
                        : "/images/jacket.png"
                    }
                    alt={product.product_name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-semibold text-white">
                      {product.product_name}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Product ID: {product._id}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">
                  ₵{price?.amount?.toFixed(2) || "0.00"}
                </span>
              </div>
              {price?.tip && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tip</span>
                  <span className="text-white">₵{price.tip.toFixed(2)}</span>
                </div>
              )}
              {price?.deliveryCharge && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery Charge</span>
                  <span className="text-white">
                    ₵{price.deliveryCharge.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="h-px bg-gray-700"></div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-purple-400">
                  $
                  {(
                    (price?.amount || 0) +
                    (price?.tip || 0) +
                    (price?.deliveryCharge || 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-full text-white font-semibold transition-colors"
              >
                Send Request
              </button>
              <button className="w-full py-3 bg-transparent border border-purple-500 hover:bg-purple-500/10 rounded-full text-purple-400 font-semibold transition-colors">
                Tip Your driver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
