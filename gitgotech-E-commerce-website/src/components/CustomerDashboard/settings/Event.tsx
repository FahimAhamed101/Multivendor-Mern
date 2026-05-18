"use client";

import { useGetEventsQuery } from "@/redux/features/event/eventSlice";
import { Calendar, MapPin, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { FaArrowLeft } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";

// Define the event type
type Participant = {
  _id: string;
  name: string;
  email: string;
  image?: string;
};

type EventType = {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  address: string;
  purchaseOption: string;
  participant: Participant[] | Participant | number;
  createdAt: string;
  status?: string;
};

export default function Event() {
  const [activeTab, setActiveTab] = useState("created");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [emailFields, setEmailFields] = useState([""]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    date: "",
    time: "",
    address: "",
    purchaseOption: "creator",
    description: "",
  });
  const router = useRouter();

  const { data: eventsData, isLoading } = useGetEventsQuery({
    type: activeTab,
    page: 1,
    limit: 10,
  });

  const events: EventType[] = eventsData?.data?.data || [];
  console.log(events);

  const eventStatus = eventsData?.data.eventType;
  console.log(eventStatus);

  const handleAddEmailField = () => {
    setEmailFields([...emailFields, ""]);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmailFields = [...emailFields];
    newEmailFields[index] = value;
    setEmailFields(newEmailFields);
  };

  const handleRemoveEmailField = (index: number) => {
    if (emailFields.length > 1) {
      const newEmailFields = emailFields.filter((_, i) => i !== index);
      setEmailFields(newEmailFields);
    }
  };

  const handleSendInvitations = () => {
    console.log(
      "Sending invitations to:",
      emailFields.filter((email) => email),
    );
    setIsInviteModalOpen(false);
    setEmailFields([""]);
  };

  const openInviteModal = () => {
    setIsInviteModalOpen(true);
    setEmailFields([""]);
  };

  const openEditModal = (event: EventType) => {
    // Navigate to update event page
    router.push(`/settings/events/update?id=${event._id}`);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteEvent = () => {
    // TODO: Implement delete functionality
    console.log("Delete event functionality not yet implemented");
  };

  const handleUpdateEvent = () => {
    // TODO: Implement update functionality
    console.log("Update event functionality not yet implemented");
  };

  // Filter events based on active tab
  const filteredEvents = events?.filter((event) => {
    if (activeTab === "created") {
      return event.status === "Buy Creator";
    } else if (activeTab === "invitations") {
      return event.status === "By Participants";
    }
    return false;
  });

  return (
    <div className="min-h-screen mt-12 md:mt-24 bg-gradient-to-r from-black via-[#0f0924] to-black">
      {/* Header */}
      <div className="flex py-6 container mx-auto justify-between items-center mb-4">
        <div className="container mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
              <FaArrowLeft className="text-black" />
            </div>
          </button>
          <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">
            Event
          </h1>
        </div>

        <button
          onClick={() => router.push("/profile/event/create-event")}
          className="px-4 py-2 w-52 cursor-pointer bg-[#6100FF] text-white rounded transition-all duration-200 flex items-center gap-2"
        >
          + Create Event
        </button>
      </div>

      {/* Subheader */}
      <div className="text-center mb-8">
        <p className="text-gray-400 max-w-2xl mx-auto">
          Plan matching outfits for your event with your selected tailor. Invite
          your friends, share the design, and let everyone order easily from the
          same vendor.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex mb-8 justify-center">
        <button
          onClick={() => setActiveTab("created")}
          className={`px-6 py-2 rounded-l-lg font-medium transition-all duration-200 ${
            activeTab === "created"
              ? "bg-[#6100FF] text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Created
        </button>
        <button
          onClick={() => setActiveTab("invited")}
          className={`px-6 py-2 rounded-r-lg font-medium transition-all duration-200 ${
            activeTab === "invited"
              ? "bg-[#6100FF] text-white"
              : "bg-[#4C455A] text-gray-300 hover:bg-gray-700"
          }`}
        >
          Invitations
        </button>
      </div>

      {/* Events List */}
      <div className="max-w-4xl mx-auto space-y-6 pb-6 px-4">
        {isLoading ? (
          <div className="text-center text-gray-400 py-10">
            Loading events...
          </div>
        ) : events.length > 0 ? (
          events.map((event) => (
            <div
              key={event._id}
              className="bg-[#2C233E] border border-[#67676D] rounded-lg p-6 hover:border-purple-500 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold font-cormorant text-white mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-400 mb-4 font-poppins">
                    {event.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-poppins text-gray-300">
                      <Calendar size={20} />
                      <span>
                        {new Date(event.eventDate).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin size={20} />
                      <span>{event.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[16px] text-[#912DAD]">
                      <span>
                        Participants:{" "}
                        {Array.isArray(event?.participant)
                          ? event.participant.length
                          : typeof event?.participant === "number"
                            ? event.participant
                            : 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <div className="flex gap-3.5 items-center">
                    <p className="bg-[#3D3648] px-4 py-1 rounded-full text-[#912DAD] text-sm">
                      {event.purchaseOption === "creator"
                        ? "Buy Creator"
                        : "By Participants"}
                    </p>
                    <CiEdit
                      onClick={() => openEditModal(event)}
                      className="text-[#1E5EFF] text-2xl cursor-pointer hover:text-[#3D7FFF]"
                    />
                  </div>

                  <Link
                    href={`/profile/event/view-deaign?id=${event._id}&type=${event?.purchaseOption}&status=${eventStatus}`}
                  >
                    <button className="px-4 py-2 cursor-pointer w-full mt-16 bg-[#912DAD] text-white rounded-lg hover:bg-[#7A2491] transition-all duration-200 text-sm">
                      View Design
                    </button>
                  </Link>

                  <button
                    onClick={() => {
                      // Store event data in sessionStorage before navigation
                      sessionStorage.setItem(
                        "selectedEvent",
                        JSON.stringify(event),
                      );
                      router.push(`/profile/event/ainvite?id=${event._id}`);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 text-sm flex items-center justify-center gap-2"
                  >
                    <IoIosShareAlt size={24} />
                    Send Invitation
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-10">
            No events to display. Create your first event!
          </div>
        )}
      </div>

      {/* Invitation Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-black border-2 border-[#6100FF] rounded-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-semibold text-white text-center mb-6">
              Add the Email of the Person
              <br />
              You're Inviting
            </h2>

            <div className="space-y-4 mb-4">
              {emailFields.map((email, index) => (
                <div key={index} className="relative">
                  <label className="block text-sm text-gray-400 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder="Ex: Enter here email"
                      className="w-full bg-[#242428] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 transition-colors"
                    />
                    {emailFields.length > 1 && (
                      <button
                        onClick={() => handleRemoveEmailField(index)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-300"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddEmailField}
              className="bg-gradient-to-l from-blue-600 to-cyan-600 text-white rounded py-1 px-2 mb-2 cursor-pointer"
            >
              <span className="text-lg">+</span> Add email
            </button>

            <button
              onClick={handleSendInvitations}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {isEditModalOpen && (
        <div className="fixed md:mt-12  inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-[#0a2930] to-[#1d0d24] md:mt-2 mt-60 border-2 border-purple-400 rounded-2xl p-6 w-full max-w-lg relative my-8">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-semibold text-white mb-6 font-cormorant">
              Edit Event
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditChange}
                  placeholder="Type Here"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={editFormData.date}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={editFormData.time}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditChange}
                  placeholder="Type Here"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Purchase Options */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Who will purchase?
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="purchaseOption"
                      value="creator"
                      checked={editFormData.purchaseOption === "creator"}
                      onChange={handleEditChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-white">
                      I will purchase for everyone
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="purchaseOption"
                      value="invitees"
                      checked={editFormData.purchaseOption === "invitees"}
                      onChange={handleEditChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-white">
                      Everyone will purchase for themselves
                    </span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  placeholder="Type Here"
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDeleteEvent}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEvent}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
