import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Role } from "../../utils/enums";
import LoadingScreen from "../components/LoadingScreen";

const DashboardRedirect = () => {
  const { loggedInUser, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!loggedInUser) return <Navigate to="/" replace />;

  const role = loggedInUser.role;
  if (role === Role.APPROVER) return <Navigate to="/dashboard/approver" replace />;
  if (role === Role.ADMIN) return <Navigate to="/dashboard/admin" replace />;
  return <Navigate to="/dashboard/assistant" replace />;
};

export default DashboardRedirect;
