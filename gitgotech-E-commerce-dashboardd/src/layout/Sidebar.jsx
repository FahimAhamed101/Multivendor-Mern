  

import { AiOutlineProduct } from "react-icons/ai";
import { BiSolidDashboard, BiSupport } from "react-icons/bi";
import { BsFillPersonPlusFill } from "react-icons/bs";
import { CiSettings } from "react-icons/ci";
import { FaUserAlt, FaUserFriends, FaUserMd } from "react-icons/fa";
import { FaHandHoldingDollar, FaUsers } from "react-icons/fa6";
import { FcManager } from "react-icons/fc";
import { HiLogout } from "react-icons/hi";
import { MdCategory } from "react-icons/md";
import { PiHandbagDuotone, PiStorefront } from "react-icons/pi";
import { RiCoupon4Line } from "react-icons/ri";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from '../../public/image/logo.png';
import { getUserRole, logout } from "../utils/auth";

const Sidebar = () => {
  const navigate = useNavigate();
  const userRole = getUserRole();

  const handleLogOut = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to log out from here!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log out!"
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire({
          title: "Logged Out!",
          text: "User has been logged out successfully.",
          icon: "success",
          timer: 2000
        });
        navigate('/');
      }
    });
  };

  // Check if user has access to route based on role
  const hasAccess = (allowedRoles) => {
    return allowedRoles.includes(userRole);
  };

  return (
    <div className="lg:w-[250px] xl:w-[300px] md:w-[200px] sm:w-[120px] border-r-2 border-[#21612E] w-[120px] flex flex-col justify-between h-full min-h-screen rounded-md">
      <div>
        <div className="  grid justify-items-stretch ">
          <img className="w-32 h-full rounded-lg justify-self-center" src={logo} alt="Logo" />
        </div>
        <div className="ml-5">
          <ul>
            {/* Dashboard - Admin only */}
            {hasAccess(['admin']) && (
              <NavLink
                to="home"
                className={({ isActive }) =>
                  isActive
                    ? "flex cursor-pointer items-center text-[18px] font-medium p-[10px] bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white m-[6px] rounded-lg"
                    : "flex text-[#B8B8B8] cursor-pointer items-center text-[18px] font-medium p-[10px] m-[6px] rounded-lg"
                }
              >
                <BiSolidDashboard className="h-7 w-7 lg:h-5 lg:w-5"/>
                <span className="hidden ml-2 sm:block">Dashboard</span>
              </NavLink>
            )}

            {/* Requested - Admin, Manager, support can access */}
            {hasAccess(['admin', 'manager', 'support']) && (
              <NavLink
                to="requested"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center font-medium rounded-lg"
                }
              >
                <BsFillPersonPlusFill className="h-7 w-7 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">Requested</span>
              </NavLink>
            )}

            {/* All Users - Admin, Manager, support can access */}
            {hasAccess(['admin', 'manager', 'support']) && (
              <NavLink
                to="users"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center font-medium rounded-lg"
                }
              >
                <FaUsers className="h-7 w-7 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">All Users</span>
              </NavLink>
            )}

            {/* All Vendors - Admin, Manager, support can access */}
            {hasAccess(['admin', 'manager', 'support']) && (
              <NavLink
                to="vendors"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center font-medium rounded-lg"
                }
              >
                <FaUserMd className="h-7 w-7 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">All Vendors</span>
              </NavLink>
            )}

            {/* All Drivers - Admin, Manager, support can access */}
            {hasAccess(['admin', 'manager', 'support']) && (
              <NavLink
                to="drivers"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center font-medium rounded-lg"
                }
              >
                <FaUserFriends className="h-7 w-7 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">All Drivers</span>
              </NavLink>
            )}

            {/* All Managers - Admin only */}
            {hasAccess(['admin']) && (
              <NavLink
                to="managers"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center font-medium rounded-lg"
                }
              >
                <FcManager className="h-7 w-7 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">All Managers</span>
              </NavLink>
            )}

            {/* All Products - Admin, Manager, support can access */}
            {hasAccess(['admin', 'manager', 'support']) && (
              <NavLink
                to="products"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center font-medium rounded-lg"
                }
              >
                <AiOutlineProduct className="h-7 w-7 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">All Products</span>
              </NavLink>
            )}

            {/* Showroom Requests - Admin, Manager, support can access */}
            {hasAccess(['admin', 'manager', 'support']) && (
              <NavLink
                to="showrooms"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center font-medium rounded-lg"
                }
              >
                <PiStorefront className="h-7 w-7 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">Showroom Requests</span>
              </NavLink>
            )}

            {/* Category - Admin only */}
            {hasAccess(['admin']) && (
              <NavLink
                to="categories"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center font-medium rounded-lg"
                }
              >
                <MdCategory className="h-7 w-7 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">Category</span>
              </NavLink>
            )}

            {/* Coupons - Admin only */}
            {hasAccess(['admin']) && (
              <NavLink
                to="coupons"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center font-medium rounded-lg"
                }
              >
                <RiCoupon4Line className="h-7 w-7 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">Coupons</span>
              </NavLink>
            )}

            {/* Careers - Admin only */}
            {hasAccess(['admin']) && (
              <NavLink
                to="careers"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center font-medium rounded-lg"
                }
              >
                <PiHandbagDuotone className="h-7 w-7 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">Careers</span>
              </NavLink>
            )}

            {/* Payments - Admin only */}
            {hasAccess(['admin']) && (
              <NavLink
                to="payments"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center font-medium rounded-lg"
                }
              >
                <FaHandHoldingDollar className="h-7 w-7 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">Payments</span>
              </NavLink>
            )}

            {/* Support Messages - Admin, Manager, support can access */}
            {hasAccess(['admin', 'manager', 'support']) && (
              <NavLink
                to="support-messages"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center font-medium rounded-lg"
                }
              >
                <BiSupport className="h-7 w-7 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">Supports</span>
              </NavLink>
            )}

            {/* Support Team - Admin only */}
            {hasAccess(['admin']) && (
              <NavLink
                to="support-team"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center font-medium rounded-lg"
                }
              >
                <FaUserAlt className="h-7 w-7 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">Support Team</span>
              </NavLink>
            )}

            {/* Settings - Admin, Manager, support can access */}
            {hasAccess(['admin', 'manager', 'support']) && (
              <NavLink
                to="settings"
                className={({ isActive }) =>
                  isActive
                    ? "flex p-[10px] m-[6px] cursor-pointer items-center text-[18px] font-medium bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white rounded-lg"
                    : "flex text-[#B8B8B8] p-[10px] m-[6px] cursor-pointer items-center text-[18px] font-medium rounded-lg"
                }
              >
                <CiSettings className="h-8 w-8 lg:h-5 lg:w-5" />
                <span className="hidden ml-2 sm:block">Settings</span>
              </NavLink>
            )}
          </ul>
        </div>
      </div>
      <div className="mb-[60px] mt-2">
        <div
          onClick={handleLogOut}
          className="flex items-center ml-[18px] cursor-pointer gap-2 text-[#942020] font-medium"
        >
          <HiLogout className="h-8 w-8 lg:h-5 lg:w-5" />
          <span className="hidden sm:block text-[20px]">Log Out</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;