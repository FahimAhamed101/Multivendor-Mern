
import { createBrowserRouter, Navigate } from "react-router-dom";
import ForgotPassword from "../auth/ForgotPassword";
import UpdatePassword from "../auth/UpdatePassword";
import VerifyOtp from "../auth/VerifyEmail";
import DashboardHome from "../dashboard/home/DashboardHome";
import AddJob from "../dashboard/sidebarMenu/AddJob";
import AddManagerPage from "../dashboard/sidebarMenu/AddManager";
import AppliedPeople from "../dashboard/sidebarMenu/AppliedPeople";
import Careers from "../dashboard/sidebarMenu/Careers";
import Category from "../dashboard/sidebarMenu/Category";
import Coupon from "../dashboard/sidebarMenu/Coupon";
import Drivers from "../dashboard/sidebarMenu/Drivers";
import JobDetailsPage from "../dashboard/sidebarMenu/JobDetailsPage";
import Managers from "../dashboard/sidebarMenu/Managers";
import Payment from "../dashboard/sidebarMenu/Payment";
import Product from "../dashboard/sidebarMenu/Product";
import EditProfiel from "../dashboard/sidebarMenu/profile/EditProfile";
import Notification from "../dashboard/sidebarMenu/profile/Notification";
import Profile from "../dashboard/sidebarMenu/profile/Profile";
import RequestsPage from "../dashboard/sidebarMenu/Requested";
import About from "../dashboard/sidebarMenu/settings/Aboute";
import EditAbout from "../dashboard/sidebarMenu/settings/EditAbout";
import EditPrivacy from "../dashboard/sidebarMenu/settings/EditPrivacy";
import EditTermCondition from "../dashboard/sidebarMenu/settings/EditTermCondition";
import PrivacyPolicy from "../dashboard/sidebarMenu/settings/PrivacyPolicy";
import Settings from "../dashboard/sidebarMenu/settings/Settings";
import TermCondition from "../dashboard/sidebarMenu/settings/TermCondition";
import ShowroomRequest from "../dashboard/sidebarMenu/showroom/ShowroomRequest";
import SupportMessage from "../dashboard/sidebarMenu/SupportMessage";
import UserListsPage from "../dashboard/sidebarMenu/Users";
import Vendors from "../dashboard/sidebarMenu/Vendors";
import Home from "../Home";
import Main from "../layout/Main";
import ErrorPage from "./ErrorPage";
import ProtectedRoute from "./ProtectedRoute";
import SupportTeamPage from "../dashboard/sidebarMenu/SupportTeam";

// Role-based route configuration
const adminOnlyRoutes = ['home', 'managers', 'categories', 'coupons', 'careers', 'payments', 'support-team'];
const allRolesRoutes = ['requested', 'users', 'vendors', 'drivers', 'products', 'showrooms', 'support-messages', 'settings'];

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home></Home>,
        errorElement: <ErrorPage />
    },
    {
        path: "forgotpassword",
        element: <ForgotPassword></ForgotPassword>
    },
    {
        path: "verifyotp",
        element: <VerifyOtp></VerifyOtp>
    },
    {
        path: "updatepassword",
        element: <UpdatePassword />
    },

    {
        path: "dashboard",
        element: <Main></Main>,
        children: [
            {
                path: "home",
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <DashboardHome />
                    </ProtectedRoute>
                )
            },
            {
                path: "requested",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <RequestsPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "users",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <UserListsPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "vendors",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <Vendors />
                    </ProtectedRoute>
                )
            },
            {
                path: "drivers",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <Drivers />
                    </ProtectedRoute>
                )
            },
            {
                path: "managers",
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Managers />
                    </ProtectedRoute>
                )
            },
            {
                path: "managers/add-manager",
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AddManagerPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "products",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <Product />
                    </ProtectedRoute>
                )
            },
            {
                path: "showrooms",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <ShowroomRequest />
                    </ProtectedRoute>
                )
            },
            {
                path: "categories",
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Category />
                    </ProtectedRoute>
                )
            },
            {
                path: "coupons",
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Coupon />
                    </ProtectedRoute>
                )
            },
            {
                path: "careers",
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Careers />
                    </ProtectedRoute>
                )
            },
            {
                path: "careers/job-details/:id",
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <JobDetailsPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "careers/applied-people/:jobId?",
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AppliedPeople />
                    </ProtectedRoute>
                )
            },
            {
                path: "careers/create-job",
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AddJob />
                    </ProtectedRoute>
                )
            },
            {
                path: "payments",
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Payment />
                    </ProtectedRoute>
                )
            },
            {
                path: "support-messages",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <SupportMessage />
                    </ProtectedRoute>
                )
            },
            {
                path: "support-team",
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <SupportTeamPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'settings',
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <Settings />
                    </ProtectedRoute>
                )
            },
            {
                path:'settings/privacypolicy',
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <PrivacyPolicy />
                    </ProtectedRoute>
                )
            },
            {
                path:'settings/editprivacypolicy',
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <EditPrivacy />
                    </ProtectedRoute>
                )
            },
            {
                path:"settings/termcondition",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <TermCondition />
                    </ProtectedRoute>
                )
            },
            {
                path: "settings/edittermcondition",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <EditTermCondition />
                    </ProtectedRoute>
                )
            },
            {
                path:'settings/about',
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <About />
                    </ProtectedRoute>
                )
            },
            {
                path:'settings/editabout',
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <EditAbout />
                    </ProtectedRoute>
                )
            },
            {
                path: "notification",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <Notification />
                    </ProtectedRoute>
                )
            },
            {
                path: "settings/profile",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <Profile />
                    </ProtectedRoute>
                )
            },
            {
                path: "dashboard/profile",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <Profile />
                    </ProtectedRoute>
                )
            },
            {
                path: "settings/editprofile",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <EditProfiel />
                    </ProtectedRoute>
                )
            },
            {
                path: "dashboard/editprofile",
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
                        <EditProfiel />
                    </ProtectedRoute>
                )
            },
            // Default redirect for dashboard
            {
                index: true,
                element: <Navigate to="/dashboard/home" replace />
            }
        ]
    }
])