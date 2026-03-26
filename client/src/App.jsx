import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { EncryptionProvider } from "./contexts/EncryptionContext";
import { AuthGuard, RoleGuard, GuestGuard } from "./guards/AuthGuard";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import ApproverDashboard from "./pages/ApproverDashboard";
import AssistantDashboard from "./pages/AssistantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";
import History from "./pages/History";
import DashboardRedirect from "./pages/DashboardRedirect";
import { Role } from "../utils/enums";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <EncryptionProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#1e293b",
                  color: "#f1f5f9",
                  borderRadius: "12px",
                  fontSize: "14px",
                  padding: "12px 16px",
                },
              }}
            />
            <Routes>
              {/* Public */}
              <Route
                path="/"
                element={
                  <GuestGuard>
                    <Login />
                  </GuestGuard>
                }
              />

              {/* Protected routes */}
              <Route
                element={
                  <AuthGuard>
                    <MainLayout />
                  </AuthGuard>
                }
              >
                {/* Dashboard redirect */}
                <Route path="/dashboard" element={<DashboardRedirect />} />

                {/* Role-specific dashboards */}
                <Route
                  path="/dashboard/approver"
                  element={
                    <RoleGuard allowedRoles={[Role.APPROVER]}>
                      <ApproverDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/dashboard/assistant"
                  element={
                    <RoleGuard
                      allowedRoles={[Role.ASSISTANT, Role.SENIOR_ASSISTANT]}
                    >
                      <AssistantDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/dashboard/admin"
                  element={
                    <RoleGuard allowedRoles={[Role.ADMIN]}>
                      <AdminDashboard />
                    </RoleGuard>
                  }
                />

                {/* Admin only */}
                <Route
                  path="/manage-users"
                  element={
                    <RoleGuard allowedRoles={[Role.ADMIN]}>
                      <ManageUsers />
                    </RoleGuard>
                  }
                />

                {/* Common pages */}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/history" element={<History />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </EncryptionProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
