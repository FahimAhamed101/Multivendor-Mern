# Role-Based Access Control (RBAC) Documentation

## Overview
This document describes the role-based access control implementation for the dashboard application.

## User Roles

### 1. **Admin** (Super Admin)
- Full access to all routes and features
- Can manage managers, users, vendors, drivers
- Can access all settings and configurations
- Can view payments and support messages

### 2. **Manager**
- Access to requested users/applications
- Can view all users, vendors, drivers
- Can manage products
- Can access support messages
- Can access settings (view/edit)
- **Cannot** access: Dashboard home, managers management, categories, coupons, careers, payments

### 3. **Tech**
- Same access as Manager
- Access to requested users/applications
- Can view all users, vendors, drivers
- Can manage products
- Can access support messages
- Can access settings (view/edit)
- **Cannot** access: Dashboard home, managers management, categories, coupons, careers, payments

## Route Access Matrix

| Route Path                    | Admin | Manager | Tech | Description                    |
|-------------------------------|-------|---------|------|--------------------------------|
| /dashboard/home               | ✅    | ❌      | ❌   | Dashboard Home (Admin only)    |
| /dashboard/requested          | ✅    | ✅      | ✅   | Requested Users/Applications   |
| /dashboard/users              | ✅    | ✅      | ✅   | All Users List                 |
| /dashboard/vendors            | ✅    | ✅      | ✅   | All Vendors List               |
| /dashboard/drivers            | ✅    | ✅      | ✅   | All Drivers List               |
| /dashboard/managers           | ✅    | ❌      | ❌   | All Managers List              |
| /dashboard/managers/add-manager| ✅   | ❌      | ❌   | Add New Manager                |
| /dashboard/products           | ✅    | ✅      | ✅   | All Products                   |
| /dashboard/categories         | ✅    | ❌      | ❌   | Category Management            |
| /dashboard/coupons            | ✅    | ❌      | ❌   | Coupon Management              |
| /dashboard/careers            | ✅    | ❌      | ❌   | Careers List                   |
| /dashboard/careers/job-details| ✅    | ❌      | ❌   | Job Details                    |
| /dashboard/careers/applied-people| ✅ | ❌      | ❌   | Applied People List            |
| /dashboard/careers/create-job | ✅    | ❌      | ❌   | Create New Job                 |
| /dashboard/payments           | ✅    | ❌      | ❌   | Payment Management             |
| /dashboard/support-messages   | ✅    | ✅      | ✅   | Support Messages               |
| /dashboard/settings           | ✅    | ✅      | ✅   | Settings Page                  |
| /dashboard/settings/privacypolicy| ✅ | ✅      | ✅   | Privacy Policy                 |
| /dashboard/settings/editprivacypolicy| ✅| ✅   | ✅   | Edit Privacy Policy            |
| /dashboard/settings/termcondition| ✅  | ✅      | ✅   | Terms & Conditions             |
| /dashboard/settings/edittermcondition| ✅| ✅   | ✅   | Edit Terms & Conditions        |
| /dashboard/settings/about     | ✅    | ✅      | ✅   | About Page                     |
| /dashboard/settings/editabout | ✅    | ✅      | ✅   | Edit About                     |
| /dashboard/notification       | ✅    | ✅      | ✅   | Notifications                  |
| /dashboard/settings/profile   | ✅    | ✅      | ✅   | User Profile                   |
| /dashboard/editprofile        | ✅    | ✅      | ✅   | Edit Profile                   |

## Login Flow

1. User enters credentials on login page (`/`)
2. System authenticates with backend API
3. On successful authentication:
   - Stores `userRole`, `user`, `userEmail`, `isAuthenticated` in localStorage
   - **Admin** → Redirects to `/dashboard/home`
   - **Manager/Tech/Other** → Redirects to `/dashboard/requested`
4. On failed authentication:
   - Displays error message
   - Stays on login page

## Protected Routes

### Authentication Check
- All `/dashboard/*` routes require authentication
- Unauthenticated users are redirected to `/` (login page)
- `Main.jsx` checks authentication before rendering dashboard layout

### Role-Based Access Check
- `ProtectedRoute` component wraps each route
- Checks if user role is in `allowedRoles` array
- If not authorized:
  - **Admin** → Redirects to `/dashboard/home`
  - **Manager/Tech** → Redirects to `/dashboard/requested`

## Sidebar Menu Visibility

The sidebar dynamically shows/hides menu items based on user role:

### Admin Menu Items
- Dashboard (home)
- Requested
- All Users
- All Vendors
- All Drivers
- All Managers
- All Products
- Category
- Coupons
- Careers
- Payments
- Supports
- Settings

### Manager/Tech Menu Items
- Requested
- All Users
- All Vendors
- All Drivers
- All Products
- Supports
- Settings

## Logout Flow

1. User clicks "Log Out" in sidebar
2. Confirmation dialog appears
3. On confirmation:
   - Clears all localStorage items (token, user, userRole, userEmail, isAuthenticated)
   - Shows success message
   - Redirects to `/` (login page)

## Files Modified/Created

### Created Files
1. `src/utils/auth.js` - Authentication utility functions
2. `src/route/ProtectedRoute.jsx` - Protected route wrapper component

### Modified Files
1. `src/auth/Login.jsx` - Fixed login logic and role-based navigation
2. `src/layout/Sidebar.jsx` - Added role-based menu visibility
3. `src/layout/Main.jsx` - Added authentication check
4. `src/Home.jsx` - Added redirect for authenticated users
5. `src/route/Route.jsx` - Added ProtectedRoute wrapper to all dashboard routes

## Utility Functions

```javascript
// Check if user is authenticated
isAuthenticated() → boolean

// Get current user role
getUserRole() → string ('admin' | 'manager' | 'tech' | null)

// Get current user object
getUser() → object | null

// Check if user has access
hasAccess(allowedRoles) → boolean

// Check if user is admin
isAdmin() → boolean

// Check if user is manager
isManager() → boolean

// Logout user
logout() → void
```

## Security Notes

1. All route protection is done on the frontend
2. Backend should also validate user roles for API endpoints
3. Sensitive operations should be validated server-side
4. Token-based authentication should be implemented for API calls
5. Consider implementing token refresh mechanism

## Testing

To test role-based access:

1. **Admin Login:**
   - Login with admin credentials
   - Should see all menu items
   - Should access `/dashboard/home`

2. **Manager Login:**
   - Login with manager credentials
   - Should see limited menu items
   - Should access `/dashboard/requested`
   - Should be redirected if trying to access admin-only routes

3. **Unauthenticated Access:**
   - Clear localStorage or logout
   - Try accessing any `/dashboard/*` route
   - Should redirect to `/` (login page)
