"use client";

import url from "@/redux/api/baseUrl.js";
import {
  selectShowroom,
  setSelectedShowroom,
} from "@/redux/features/vendor/showroomSlice/selectedShowroomSlice";
import { useGetShowroomQuery } from "@/redux/features/vendor/showroomSlice/showroomSlice";
import {
  ChevronDown,
  Clock,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  Store,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function ShowroomSelector() {
  const dispatch = useDispatch();
  const selected = useSelector(selectShowroom);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: showroomData } = useGetShowroomQuery({});
  const showrooms: any[] = showroomData?.data ?? [];

  // Auto-select first showroom on load
  useEffect(() => {
    if (showrooms.length > 0 && !selected) {
      const first = showrooms[0];
      dispatch(
        setSelectedShowroom({
          id: first._id,
          name: first.showroom_name,
          logo: first.logo,
        }),
      );
    }
  }, [showrooms, selected]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (showrooms.length === 0) return null;

  return (
    <div ref={ref} className="relative mb-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-1">
        Showroom
      </p>

      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg hover:border-purple-500/50 transition-all"
      >
        {selected ? (
          <>
            <img
              src={`${url}/${selected.logo}`}
              alt={selected.name}
              className="w-7 h-7 rounded-full object-cover border border-gray-600 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-white text-sm font-medium truncate flex-1 text-left">
              {selected.name}
            </span>
          </>
        ) : (
          <>
            <Store size={16} className="text-gray-400 shrink-0" />
            <span className="text-gray-400 text-sm flex-1 text-left">
              Select Showroom
            </span>
          </>
        )}
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e24] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {showrooms.map((s: any) => (
            <button
              key={s._id}
              onClick={() => {
                dispatch(
                  setSelectedShowroom({
                    id: s._id,
                    name: s.showroom_name,
                    logo: s.logo,
                  }),
                );
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 transition-colors ${
                selected?.id === s._id ? "bg-purple-900/30" : ""
              }`}
            >
              <img
                src={`${url}/${s.logo}`}
                alt={s.showroom_name}
                className="w-7 h-7 rounded-full object-cover border border-gray-600 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="flex-1 text-left min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {s.showroom_name}
                </p>
                {!s.isApprove && (
                  <p className="text-yellow-500 text-xs">Pending Approval</p>
                )}
              </div>
              {selected?.id === s._id && (
                <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/vendor-dashboard" },
    { name: "Order History", icon: Clock, path: "/vendor-dashboard/orders" },
    { name: "My Product", icon: Package, path: "/vendor-dashboard/products" },
    {
      name: "Custom Orders",
      icon: FileText,
      path: "/vendor-dashboard/custom-orders",
    },
    // { name: "Analytics", icon: BarChart3, path: "/vendor-dashboard/analytics" },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen pt-24">
      <div className="container mx-auto px-4">
        <div className="flex gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden fixed top-16 left-4 z-50 p-3 bg-[#2E2E34] rounded-lg border border-gray-800 hover:bg-gray-800 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 bg-[#2E2E34] rounded-lg p-6 border border-gray-800">
              <ShowroomSelector />
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-all ${
                      pathname === item.path
                        ? "bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Mobile (Overlay) */}
          {isMobileMenuOpen && (
            <>
              <div
                className="lg:hidden fixed inset-0 bg-black/50 z-40 top-24"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="lg:hidden fixed top-24 left-0 right-0 z-40 mx-4 mt-20 bg-[#2E2E34] rounded-lg p-6 border border-gray-800 shadow-2xl">
                <ShowroomSelector />
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        pathname === item.path
                          ? "bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Main Content */}
          <div className="flex-1 pb-8 mt-4 w-full lg:w-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
