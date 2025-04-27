import React, { useEffect } from "react";
import Navbar from "./Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const MainLayout = ({ children }) => {
  const { isAuthenticated, user, loggedInUser } = useAuth();
  const userRole = user?.role;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/");
    } else if (userRole === "admin") {
      navigate("/MainPage/admin/dashboard");
    } else if (userRole === "assistant") {
      navigate("/MainPage/assistant/dashboard");
    } else if (userRole === "approver") {
      navigate("/MainPage/approver/dashboard");
    }
  }, [isAuthenticated, userRole, location, navigate]);

  return (
    <div className="min-h-screen w-full">
      {<Navbar />}
      <Outlet />
    </div>
  );
};

export default MainLayout;
