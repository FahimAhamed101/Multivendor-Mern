import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole, hasAccess } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  // If not authenticated, redirect to login
  if (!authenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // If allowedRoles is provided, check if user has access
  if (allowedRoles && !hasAccess(allowedRoles)) {
    // Redirect based on role
    if (userRole === 'admin') {
      return <Navigate to="/dashboard/home" replace />;
    } else if (userRole === 'manager') {
      return <Navigate to="/dashboard/requested" replace />;
    } else {
      return <Navigate to="/dashboard/requested" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
