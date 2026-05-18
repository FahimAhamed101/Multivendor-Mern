import React from 'react';
import { Navigate } from 'react-router-dom';
import Login from './auth/Login';
import { isAuthenticated, getUserRole } from './utils/auth';

const Home = () => {
    const authenticated = isAuthenticated();
    const userRole = getUserRole();

    // Redirect authenticated users to their appropriate dashboard
    if (authenticated) {
        if (userRole === 'admin') {
            return <Navigate to="/dashboard/home" replace />;
        } else {
            return <Navigate to="/dashboard/requested" replace />;
        }
    }

    return (
        <div>
             <Login />
        </div>
    );
};

export default Home;