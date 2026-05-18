"use client";

import {
  useAddEventMemberMutation,
  useGetEventByIdQuery,
} from "@/redux/features/event/eventSlice";
import jsPDF from "jspdf";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

interface EventData {
  eventName: string;
  date: string;
  time: string;
  location: string;
  hostName: string;
  title: string;
  description: string;
}

interface MemberDetails {
  name: string;
  email: string;
}

interface PassedEvent {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  address: string;
  purchaseOption: string;
  hostName?: string;
  eventName?: string;
}

interface CardCategory {
  id: string;
  name: string;
  image: string;
}

// Card categories with images
const CARD_CATEGORIES: CardCategory[] = [
  { id: "celebration", name: "Celebration", image: "/images/celebration.png" },
  { id: "relationship", name: "Relationship", image: "/images/relationship.png" },
  { id: "corporate", name: "Corporate", image: "/images/corporat.png" },
  { id: "religious", name: "Religious", image: "/images/religiouss.png" },
  { id: "social", name: "Social", image: "/images/social.png" },
];



// ─── Generate image with text overlay (IMPROVED TEXT CLARITY) ────────────────
async function generateCardWithOverlay(
  cardImage: string,
  eventData: EventData,
  memberName: string,
): Promise<{ imageFile: File; pdfFile: File }> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Optimize canvas size - limit to reasonable dimensions
      const maxWidth = 1200;
      const maxHeight = 1600;
      let width = img.width;
      let height = img.height;

      // Scale down if too large
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw the background image
      ctx.drawImage(img, 0, 0, width, height);

      // Add semi-transparent overlay for better text visibility
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(0, 0, width, height);

      // Add text overlay
      const W = canvas.width;
      const H = canvas.height;

      // Helper function to draw text with strong outline and shadow
      const drawTextWithOutline = (
        text: string,
        x: number, 
        y: number,
        fontSize: number,
        fillColor: string,
        outlineColor: string = "#000000",
        outlineWidth: number = 4
      ) => {
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Strong shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // Draw outline
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;
        ctx.lineJoin = "round";
        ctx.strokeText(text, x, y);
        
        // Draw fill
        ctx.fillStyle = fillColor;
        ctx.fillText(text, x, y);
        
        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      };

      // Helper function for wrapped text with outline
      const drawWrappedTextWithOutline = (
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        fontSize: number,
        lineHeight: number,
        fillColor: string
      ) => {
        ctx.font = `italic ${fontSize}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        const words = text.split(" ");
        let line = "";
        let currentY = y;

        words.forEach((word, index) => {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);

          if (metrics.width > maxWidth && index > 0) {
            // Draw the line with outline
            ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 3;
            ctx.strokeText(line, x, currentY);
            
            ctx.fillStyle = fillColor;
            ctx.fillText(line, x, currentY);
            
            line = word + " ";
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        });
        
        // Draw last line
        if (line) {
          ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
          ctx.shadowBlur = 12;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 3;
          ctx.strokeText(line, x, currentY);
          
          ctx.fillStyle = fillColor;
          ctx.fillText(line, x, currentY);
        }
        
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      };

      let currentY = H * 0.25;

      // Member name - Large and clear
      if (memberName.trim()) {
        drawTextWithOutline(
          `Dear ${memberName},`,
          W / 2,
          currentY,
          Math.floor(W * 0.055),
          "#FFFFFF",
          "#000000",
          5
        );
        currentY += H * 0.08;
      }

      // Event name - Bold and prominent
      drawTextWithOutline(
        eventData.eventName || eventData.title,
        W / 2,
        currentY,
        Math.floor(W * 0.07),
        "#FFD700",
        "#000000",
        6
      );
      currentY += H * 0.1;

      // Description - Readable with good contrast
      if (eventData.description) {
        const maxWidth = W * 0.85;
        drawWrappedTextWithOutline(
          eventData.description,
          W / 2,
          currentY,
          maxWidth,
          Math.floor(W * 0.035),
          W * 0.045,
          "#FFFFFF"
        );
        currentY += H * 0.18;
      } else {
        currentY += H * 0.05;
      }

      // Date - EXTRA CLEAR with bright color and strong outline
      drawTextWithOutline(
        eventData.date,
        W / 2,
        currentY,
        Math.floor(W * 0.045),
        "#FFD700", // Bright gold
        "#000000",
        6 // Thicker outline
      );
      currentY += H * 0.07;

      // Time - EXTRA CLEAR with bright color and strong outline
      drawTextWithOutline(
        eventData.time,
        W / 2,
        currentY,
        Math.floor(W * 0.042),
        "#FFFFFF", // Pure white
        "#000000",
        6 // Thicker outline
      );
      currentY += H * 0.08;

      // Location - EXTRA CLEAR with bright color and strong outline
      drawTextWithOutline(
        eventData.location,
        W / 2,
        currentY,
        Math.floor(W * 0.04),
        "#FFFFFF", // Pure white
        "#000000",
        6 // Thicker outline
      );

      // Generate image file with compression
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to generate image"));
          return;
        }

        const imageFile = new File([blob], `invitation-${Date.now()}.png`, {
          type: "image/png",
        });

        // Generate PDF with optimized size
        const imgData = canvas.toDataURL("image/jpeg", 0.9);
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? "landscape" : "portrait",
          unit: "mm",
          format: "a4",
        });

        // Calculate dimensions to fit A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgRatio = canvas.width / canvas.height;
        const pdfRatio = pdfWidth / pdfHeight;

        let finalWidth = pdfWidth;
        let finalHeight = pdfHeight;

        if (imgRatio > pdfRatio) {
          finalHeight = pdfWidth / imgRatio;
        } else {
          finalWidth = pdfHeight * imgRatio;
        }

        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;

        pdf.addImage(imgData, "JPEG", x, y, finalWidth, finalHeight);
        const pdfBlob = pdf.output("blob");
        const pdfFile = new File([pdfBlob], `invitation-${Date.now()}.pdf`, {
          type: "application/pdf",
        });

        resolve({ imageFile, pdfFile });
      }, "image/png"); // Use PNG for better text quality
    };

    img.onerror = () => {
      reject(new Error("Failed to load card image"));
    };

    img.src = cardImage;
  });
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function InvitationCard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("id") || "";

  const [passedEvent, setPassedEvent] = useState<PassedEvent | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardCategory | null>(null);
  const [memberDetails, setMemberDetails] = useState<MemberDetails>({
    name: "",
    email: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedEvent");
    if (stored) {
      try {
        setPassedEvent(JSON.parse(stored));
        sessionStorage.removeItem("selectedEvent");
      } catch {}
    }
  }, []);

  const { data: eventDetails, isLoading: eventLoading } =
    useGetEventByIdQuery(eventId, {
      skip: !eventId || !!passedEvent,
    });

  const [addEventMember, { isLoading: isSending }] =
    useAddEventMemberMutation();

  const sourceEvent = passedEvent || eventDetails?.data;

  const eventData: EventData = sourceEvent
    ? {
        eventName: sourceEvent.title || sourceEvent.eventName || "",
        date: sourceEvent.eventDate
          ? new Date(sourceEvent.eventDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "",
        time: sourceEvent.eventDate
          ? new Date(sourceEvent.eventDate).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        location: sourceEvent.address || "",
        hostName: sourceEvent.hostName || "",
        title: sourceEvent.title || "",
        description: sourceEvent.description || "",
      }
    : {
        eventName: "Event Name",
        date: "Date TBD",
        time: "00:00 AM",
        location: "Location",
        hostName: "Host",
        title: "Title",
        description: "",
      };

  const handleMemberChange = (field: keyof MemberDetails, value: string) =>
    setMemberDetails((prev) => ({ ...prev, [field]: value }));

  const handleSendInvitation = async () => {
    // Validation
    if (!memberDetails.name.trim()) {
      toast.error("Please enter member name");
      return;
    }
    if (!memberDetails.email.trim()) {
      toast.error("Please enter member email");
      return;
    }
    if (!selectedCard) {
      toast.error("Please select an invitation card");
      return;
    }
    if (!eventId) {
      toast.error("Event ID not found");
      return;
    }

    setIsGenerating(true);

    try {
      // Step 1: Generate files
      toast.loading("Generating invitation card...", { id: "generating" });
      
      const { imageFile, pdfFile } = await generateCardWithOverlay(
        selectedCard.image,
        eventData,
        memberDetails.name
      );

      toast.success("Card generated successfully!", { id: "generating" });

      // Step 2: Send invitation
      toast.loading("Sending invitation...", { id: "sending" });

      await addEventMember({
        eventId,
        memberDetails,
        file: pdfFile,
      }).unwrap();

      toast.success("Invitation sent successfully!", { id: "sending" });
      
      // Reset form
      setMemberDetails({ name: "", email: "" });
      setSelectedCard(null);
      
    } catch (error: any) {
      console.error("Failed to send invitation:", error);
      toast.dismiss("generating");
      toast.dismiss("sending");
      
      const errorMessage = error?.data?.message || error?.message || "Failed to send invitation";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedCard) {
      toast.error("Please select an invitation card");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Generating files...");

    try {
      const { imageFile, pdfFile } = await generateCardWithOverlay(
        selectedCard.image,
        eventData,
        memberDetails.name
      );

      // Download image
      const imgUrl = URL.createObjectURL(imageFile);
      const imgLink = document.createElement("a");
      imgLink.href = imgUrl;
      imgLink.download = imageFile.name;
      document.body.appendChild(imgLink);
      imgLink.click();
      document.body.removeChild(imgLink);
      URL.revokeObjectURL(imgUrl);

      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 100));

      // Download PDF
      const pdfUrl = URL.createObjectURL(pdfFile);
      const pdfLink = document.createElement("a");
      pdfLink.href = pdfUrl;
      pdfLink.download = pdfFile.name;
      document.body.appendChild(pdfLink);
      pdfLink.click();
      document.body.removeChild(pdfLink);
      URL.revokeObjectURL(pdfUrl);

      toast.success("Files downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to download:", error);
      toast.error("Failed to download files", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black via-[#0f0924] to-black">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-r from-black via-[#0f0924] to-black">
      <div className="max-w-7xl md:mt-24 mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="font-medium">Back</span>
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-center text-white mb-8 font-cormorant">
          Send Event Invitation
        </h1>

        {/* Card Category Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 text-center">
            Select Invitation Card Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CARD_CATEGORIES.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCard(category)}
                className={`cursor-pointer rounded-xl overflow-hidden border-4 transition-all duration-300 transform hover:scale-105 ${
                  selectedCard?.id === category.id
                    ? "border-purple-500 shadow-xl shadow-purple-500/50 scale-105 ring-2 ring-purple-400"
                    : "border-gray-700 hover:border-purple-400 hover:shadow-lg"
                }`}
              >
                <div className="relative aspect-[3/4] bg-gray-900">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  {selectedCard?.id === category.id && (
                    <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className={`p-3 text-center transition-colors ${
                  selectedCard?.id === category.id
                    ? "bg-purple-600"
                    : "bg-gray-800"
                }`}>
                  <p className="text-white font-semibold text-sm">
                    {category.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview and Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Preview */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Card Preview
            </h3>
            {selectedCard ? (
              <div className="relative w-full max-w-md aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-4 border-purple-500/30">
                <Image
                  src={selectedCard.image}
                  alt={selectedCard.name}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Dark overlay for better text visibility */}
                <div className="absolute inset-0 bg-black/30"></div>
                
                {/* Text Overlay Preview */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 space-y-3">
                  {memberDetails.name && (
                    <p 
                      className="text-white text-xl md:text-2xl font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                      style={{
                        textShadow: '3px 3px 6px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.8)',
                        WebkitTextStroke: '1px black'
                      }}
                    >
                      Dear {memberDetails.name},
                    </p>
                  )}
                  <p 
                    className="text-yellow-400 text-2xl md:text-3xl font-bold drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)]"
                    style={{
                      textShadow: '4px 4px 8px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.8)',
                      WebkitTextStroke: '1.5px black'
                    }}
                  >
                    {eventData.eventName || eventData.title}
                  </p>
                  {eventData.description && (
                    <p 
                      className="text-white text-sm md:text-base italic drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] max-w-xs"
                      style={{
                        textShadow: '2px 2px 6px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.8)',
                        WebkitTextStroke: '0.5px black'
                      }}
                    >
                      {eventData.description}
                    </p>
                  )}
                  {/* DATE - Extra Clear and Bold */}
                  <p 
                    className="text-yellow-400 text-lg md:text-xl font-bold drop-shadow-[0_3px_8px_rgba(0,0,0,1)]"
                    style={{
                      textShadow: '3px 3px 8px rgba(0,0,0,1), -1px -1px 3px rgba(0,0,0,0.9)',
                      WebkitTextStroke: '1.2px black'
                    }}
                  >
                    {eventData.date}
                  </p>
                  {/* TIME - Extra Clear and Bold */}
                  <p 
                    className="text-white text-base md:text-lg font-bold drop-shadow-[0_3px_8px_rgba(0,0,0,1)]"
                    style={{
                      textShadow: '3px 3px 8px rgba(0,0,0,1), -1px -1px 3px rgba(0,0,0,0.9)',
                      WebkitTextStroke: '1.2px black'
                    }}
                  >
                    {eventData.time}
                  </p>
                  {/* LOCATION - Extra Clear and Bold */}
                  <p 
                    className="text-white text-base md:text-lg font-bold drop-shadow-[0_3px_8px_rgba(0,0,0,1)]"
                    style={{
                      textShadow: '3px 3px 8px rgba(0,0,0,1), -1px -1px 3px rgba(0,0,0,0.9)',
                      WebkitTextStroke: '1.2px black'
                    }}
                  >
                    {eventData.location}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md aspect-[3/4] rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center border-2 border-dashed border-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-500 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-400 text-center px-4 font-medium">
                  Select a card category above to see preview
                </p>
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div className="bg-gradient-to-br from-[#2C233E] to-[#1a1525] border-2 border-purple-500/30 rounded-xl p-6 shadow-2xl">
            <h3 className="text-2xl font-semibold text-purple-400 mb-6 font-cormorant flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Invitation Details
            </h3>

            {/* Member Details */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Member Name *
                </label>
                <input
                  type="text"
                  value={memberDetails.name}
                  onChange={(e) => handleMemberChange("name", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter member name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Member Email *
                </label>
                <input
                  type="email"
                  value={memberDetails.email}
                  onChange={(e) => handleMemberChange("email", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter member email"
                />
              </div>
            </div>

            {/* Event Info */}
            {sourceEvent && (
              <div className="mb-6 p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-purple-500/20">
                <h4 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Event Information
                </h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-purple-300 min-w-[70px]">Title:</span>
                    <span className="flex-1">{sourceEvent.title}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-purple-300 min-w-[70px]">Date:</span>
                    <span className="flex-1">{eventData.date} at {eventData.time}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-purple-300 min-w-[70px]">Location:</span>
                    <span className="flex-1">{eventData.location}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleDownload}
                disabled={isGenerating || !selectedCard || !sourceEvent}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </>
                )}
              </button>

              <button
                onClick={handleSendInvitation}
                disabled={
                  isGenerating || isSending || !selectedCard || !sourceEvent
                }
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isGenerating || isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Send Invitation
                  </>
                )}
              </button>
            </div>

            {!sourceEvent && !eventLoading && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-sm text-red-300">
                  No event found. Please go back and select an event.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
