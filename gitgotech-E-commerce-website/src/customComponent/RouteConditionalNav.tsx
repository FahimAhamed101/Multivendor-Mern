"use client";

import { usePathname } from "next/navigation";
import FashionSearchNav from "../components/landingPage/FilterProduct";

const RouteConditionalNav = () => {
  const pathname = usePathname();

  // Define routes where FashionSearchNav should be displayed
  const showFashionSearchNav =
    pathname === "/" ||
    pathname.startsWith("/hotdeals") ||
    pathname.startsWith("/new-arrivals") ||
    pathname.startsWith("/showroom/view-showroom") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/profile/event/add-design") ||
    // pathname.startsWith("/messaging") ||
    pathname.startsWith("/top-products");

  if (showFashionSearchNav) {
    return <FashionSearchNav />;
  }

  return null;
};

export default RouteConditionalNav;
