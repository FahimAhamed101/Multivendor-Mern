"use client";

import { useGetWishlistAndCartQuery } from "@/redux/features/home/homeSlice";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RiCoupon4Line } from "react-icons/ri";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

    const {  data: cartData } = useGetWishlistAndCartQuery({type: "cart",
    page: 1,});
  
    console.log("Cart Data:", cartData?.data?.length);

  const pathname = usePathname();
  const router = useRouter();

  // Function to determine if link is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  // Auth logic - Load from localStorage after hydration
  useEffect(() => {
    const updateAuthState = () => {
      const storedUserString = localStorage.getItem("user");
      if (storedUserString) {
        const storedUser = JSON.parse(storedUserString);
        setIsLoggedIn(storedUser?.isLoggedIn || false);
        setUserRole(storedUser?.role || null);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
      setIsHydrated(true);
    };

    updateAuthState();

    // Listen for storage changes (for logout/login across components)
    window.addEventListener("storage", updateAuthState);

    // Also listen for custom auth change events
    window.addEventListener("authChanged", updateAuthState);

    return () => {
      window.removeEventListener("storage", updateAuthState);
      window.removeEventListener("authChanged", updateAuthState);
    };
  }, []);

  // Dynamic routes based on user role
  const dashboardRoute =
    userRole === "vendor" ? "/vendor-dashboard" : "/customer-dashboard";
  const profileRoute = userRole === "vendor" ? "/v-profile" : "/profile";

  return (
    <nav className=" bg-gradient-to-r from-black via-[#0f0924] to-black text-white fixed pb-1.5 top-0 left-0 right-0 z-[100] px-3 sm:px-4 md:px-6 md:pt-3  shadow-lg">
      <div className="container  mx-auto border px-3 py-1 sm:px-4 rounded-[50] border-gray-700  flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <div className="relative">
            {/* <Image
              src="/images/llogo.png"
              alt="Logo"
              fill
              className="object-contain"
              priority  
            /> */}
            <img className="h-16 w-full" src="/images/logo.png" alt="" />
          </div>
        </Link>

        {/* Desktop Navigation & Icons - Hidden on mobile */}
        <div className="hidden lg:flex items-center space-x-2 xl:space-x-1">
          {/* Desktop Navigation Links - Only show for logged in customers */}
          {isLoggedIn && userRole === "customer" && (
            <div className="flex items-center space-x-4 mr-4">
              <Link
                href="/vendors"
                className={`${
                  isActive("/vendors")
                    ? "text-purple-500 font-medium text-[20px]"
                    : "text-[20px] text-white hover:text-white text-2xl "
                } transition-colors  font-cormorant  `}
              >
                Vendors
              </Link>
              <Link
                href="/showroom"
                className={`${
                  isActive("/showroom")
                    ? "text-purple-500 font-medium text-[20px]"
                    : "text-[20px] text-white hover:text-white text-2xl "
                } transition-colors   font-cormorant  `}
              >
                Showrooms
              </Link> 
            </div>
          )}

          {/* Show icons only when logged in */}
          {isLoggedIn ? (
            <>
              {/* Desktop Icon Buttons - Customer only icons */}
              {userRole === "customer" && (
                <>

                 <Link href="/coupon">
                    <button
                      className={`p-1 hover:bg-gray-800 cursor-pointer rounded-full transition-colors ${
                        isActive("/coupon") ? "bg-purple-600/40" : ""
                      }`}
                    >
                      {/* <Image
                        src="/images/love.png"
                        alt="coupon"
                        width={40}
                        height={30}
                      /> */}
                      <RiCoupon4Line />
                    </button>
                  </Link>

                  <Link href="/custom-orders">
                    <button
                      className={`p-1 hover:bg-gray-800 cursor-pointer rounded-full transition-colors ${
                        isActive("/custom-orders") ? "bg-purple-600/40" : ""
                      }`}
                    >
                      <Image
                        src="/images/customOrder.png"
                        alt="Wishlist"
                        width={40}
                        height={30}
                      />
                    </button>
                  </Link>
                  <Link href="/wishlist">
                    <button
                      className={`p-1 hover:bg-gray-800 cursor-pointer rounded-full transition-colors ${
                        isActive("/wishlist") ? "bg-purple-600/40" : ""
                      }`}
                    >
                      <Image
                        src="/images/love.png"
                        alt="Wishlist"
                        width={40}
                        height={30}
                      />
                    </button>
                  </Link>

                  <Link href="/shopping-cart">
                    <button
                      className={`p-1 hover:bg-gray-800 cursor-pointer rounded-full transition-colors relative ${
                        isActive("/shopping-cart") ? "bg-purple-600/40" : ""
                      }`}
                    >
                      <Image
                        src="/images/cart.png"
                        alt="Cart"
                        width={40}
                        height={30}
                      />
                      <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartData?.data?.length || 0}
                      </span>
                    </button>
                  </Link>
                </>
              )}

              {/* Common icons for both customer and vendor */}

              <Link href="/messaging">
                <button
                  className={`p-1 hover:bg-gray-800 cursor-pointer rounded-full transition-colors ${
                    isActive("/messaging") ? "bg-purple-600/40" : ""
                  }`}
                >
                  <Image
                    src="/images/message.png"
                    alt="Messages"
                    width={40}
                    height={30}
                  />
                </button>
              </Link>

              <Link href={profileRoute}>
                <button
                  className={`p-1 hover:bg-gray-800 cursor-pointer rounded-full transition-colors ${
                    isActive(profileRoute) ? "bg-purple-600/40" : ""
                  }`}
                >
                  <Image
                    src="/images/profile.png"
                    alt="Profile"
                    width={40}
                    height={30}
                  />
                </button>
              </Link>

              <Link href="/notification">
                <button
                  className={`p-1 hover:bg-gray-800 cursor-pointer rounded-full transition-colors ${
                    isActive("/notification") ? "bg-purple-600/40" : ""
                  }`}
                >
                  <Image
                    src="/images/notification.png"
                    alt="Notifications"
                    width={40}
                    height={30}
                  />
                </button>
              </Link>

              <Link href={dashboardRoute}>
                <button
                  className={` text-white px-5 xl:px-6 font-poppins  py-2 cursor-pointer rounded-3xl font-medium transition-colors text-sm xl:text-base ${
                    isActive(dashboardRoute)
                      ? "bg-purple-600/40 ring-2 ring-purple-400"
                      : "bg-[#6100FF]"
                  }`}
                >
                  Dashboard
                </button>
              </Link>
            </>
          ) : (
            /* Show Login button when not logged in */
            <Link href="/auth/sign-up">
              <button className="bg-purple-600 cursor-pointer hover:bg-purple-700 text-white px-6 xl:px-8 py-2 rounded-3xl font-medium transition-colors text-sm xl:text-base">
                Sign Up
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Icons - Visible on mobile/tablet */}
        <div className="flex lg:hidden items-center space-x-1 sm:space-x-2">
          {/* Cart Icon - Only show for logged in customers */}
          {isLoggedIn && userRole === "customer" && (
            <Link href="/shopping-cart">
              <button
                className={`p-1.5 sm:p-2 hover:bg-gray-800 cursor-pointer rounded-lg transition-colors relative ${
                  isActive("/shopping-cart")
                    ? "bg-purple-600/20 ring-2 ring-purple-500"
                    : ""
                }`}
              >
                <Image
                  src="/images/cart.png"
                  alt="Cart"
                  width={40}
                  height={30}
                />
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-purple-600 text-white text-[10px] rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center">
                  {cartData?.data?.length || 0}
                </span>
              </button>
            </Link>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 sm:p-2 hover:bg-gray-800 cursor-pointer rounded-lg transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Slides down when open */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container mx-auto pt-3 sm:pt-4 pb-2 space-y-2 sm:space-y-3 border-t border-gray-800 mt-3 sm:mt-4 px-3 sm:px-4">
          {/* Mobile Navigation Links - Only show for logged in customers */}
          {isLoggedIn && userRole === "customer" && (
            <>
              <Link
                href="/vendors"
                onClick={() => setIsMenuOpen(false)}
                className={`block ${
                  isActive("/vendors")
                    ? "text-purple-500 font-medium"
                    : "text-gray-400 hover:text-white"
                } transition-colors py-2 text-sm sm:text-base`}
              >
                vendors
              </Link>
              <Link
                href="/showroom"
                onClick={() => setIsMenuOpen(false)}
                className={`block ${
                  isActive("/showroom")
                    ? "text-purple-500 font-medium"
                    : "text-gray-400 hover:text-white"
                } transition-colors py-2 text-sm sm:text-base`}
              >
                showroom
              </Link>
              <Link
                href="/coupon"
                onClick={() => setIsMenuOpen(false)}
                className={`block ${
                  isActive("/coupon")
                    ? "text-purple-500 font-medium"
                    : "text-gray-400 hover:text-white"
                } transition-colors py-2 text-sm sm:text-base`}
              >
                coupon
              </Link>
            </>
          )}

          {/* Mobile content based on login status */}
          {isLoggedIn ? (
            <>
              {/* Mobile Icon Buttons */}
              <div className="flex items-center space-x-2 sm:space-x-3 pt-2 sm:pt-3 pb-2">
                {/* Coupon icon - Only for customers */}
                {userRole === "customer" && (
                  <Link href="/coupon">
                    <button
                      className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${
                        isActive("/coupon")
                          ? "bg-purple-600/20 ring-2 ring-purple-500"
                          : ""
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-purple-400"
                      >
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                      </svg>
                    </button>
                  </Link>
                )}

                {userRole === "customer" && (
                  <Link href="/custom-orders">
                    <button
                      className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${
                        isActive("/custom-orders")
                          ? "bg-purple-600/20 ring-2 ring-purple-500"
                          : ""
                      }`}
                    >
                      <Image
                        src="/images/customOrder.png"
                        alt="Custom Orders"
                        width={40}
                        height={30}
                      />
                    </button>
                  </Link>
                )}

                {userRole === "customer" && (
                  <Link href="/wishlist">
                    <button
                      className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${
                        isActive("/wishlist")
                          ? "bg-purple-600/20 ring-2 ring-purple-500"
                          : ""
                      }`}
                    >
                      <Image
                        src="/images/love.png"
                        alt="Wishlist"
                        width={40}
                        height={30}
                      />
                    </button>
                  </Link>
                )}

                {/* Common icons for both */}
                <Link href="/messaging">
                  <button
                    className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${
                      isActive("/messaging")
                        ? "bg-purple-600/20 ring-2 ring-purple-500"
                        : ""
                    }`}
                  >
                    <Image
                      src="/images/message.png"
                      alt="Messages"
                      width={40}
                      height={30}
                    />
                  </button>
                </Link>

                <Link href={profileRoute}>
                  <button
                    className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${
                      isActive(profileRoute)
                        ? "bg-purple-600/20 ring-2 ring-purple-500"
                        : ""
                    }`}
                  >
                    <Image
                      src="/images/profile.png"
                      alt="Profile"
                      width={40}
                      height={30}
                    />
                  </button>
                </Link>

                <Link href="/notification">
                  <button
                    className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${
                      isActive("/notification")
                        ? "bg-purple-600/20 ring-2 ring-purple-500"
                        : ""
                    }`}
                  >
                    <Image
                      src="/images/notification.png"
                      alt="Notifications"
                      width={40}
                      height={30}
                    />
                  </button>
                </Link>
              </div>

              {/* Mobile Dashboard Button */}
              <Link href={dashboardRoute}>
                <button
                  className={`w-full cursor-pointer text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-medium transition-colors text-sm sm:text-base ${
                    isActive(dashboardRoute)
                      ? "bg-purple-600/20 ring-2 ring-purple-400"
                      : "bg-[#6100FF]"
                  }`}
                >
                  Dashboard
                </button>
              </Link>
            </>
          ) : (
            /* Mobile Login Button */
            <Link href="/auth/login">
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-medium transition-colors text-sm sm:text-base">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
