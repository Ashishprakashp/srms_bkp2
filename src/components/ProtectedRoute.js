import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, role }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("auth") === "true"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get('http://localhost:5000/check-auth', {
          withCredentials: true,
        });

        if (response.data.authenticated) {
          setIsAuthenticated(true);
          sessionStorage.setItem("auth", "true");
        } else {
          setIsAuthenticated(false);
          sessionStorage.removeItem("auth");
        }
      } catch (error) {
        setIsAuthenticated(false);
        sessionStorage.removeItem("auth");
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
