import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import RemarkUI from "./pages/RemarkUI";
import Notifications from "./pages/Notifications";
import ManageUsers from "./pages/ManageUsers";
import ApproverDashboard from "./pages/ApproverDashboard";
import History from "./pages/History";
import EditProfile from "./pages/EditProfile";
import OTPUI from "./pages/OTPUI";
import ProfileDashboard from "./pages/ProfileDashboard";
import { AuthProvider } from "../src/contexts/AuthContext";
import { UsersProvider } from "./contexts/UsersContext";
import ChangePassword from "./pages/ChangePassword";
import AssistantDashboard from "./pages/AssistantDashboard.jsx";
import Correction from "./pages/Correction";
import AdminLogin from "./pages/AdminLogin";
import Support from "./pages/Support";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassOTP from "./pages/ForgotPassOTP";
import SetNewPassword from "./pages/SetNewPassword";
import { onMessageListener } from "../utils/firebaseUtils.js";
import PrepareLetter from "./pages/PrepareLetter.jsx";
import { toast, Toaster } from "react-hot-toast";
import { FaBell } from "react-icons/fa";
import MainLayout from "./components/MainLayout";

import {
  ApproverRestrictedRoute,
  LoginRestrictedRoute,
  SARestrictedRoute,
  AdminRestrictedRoute,
  AssistantRestrictedRoute,
} from "./components/RestrictedRoutes";
import {
  NotificationProvider,
  useNotifications,
} from "./contexts/NotificationContext";
import DocumentsListHistory from "./pages/DocumentsListHistory.jsx";
import UserAdmin from "./pages/UserAdmin.jsx";

const App = () => {
  const { fetchNotifications, setUnreadCount } = useNotifications();
  useEffect(() => {
    onMessageListener((payload) => {
      toast(
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <FaBell className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {payload.notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {payload.notification.body}
            </p>
          </div>
        </div>,
        {
          position: "top-center",
          duration: 2000,
          className: "bg-white shadow-lg rounded-lg p-4",
        }
      );
      // Call fetchNotifications from the stored reference
      fetchNotifications();
    });
  }, [fetchNotifications]);

  return (
    <AuthProvider>
      <UsersProvider>
        <NotificationProvider>
          <Toaster />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/otp/verify" element={<OTPUI />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgot-password-otp" element={<ForgotPassOTP />} />
            <Route path="/set-new-pass" element={<SetNewPassword />} />
            <Route
              path="/approver/dashboard"
              element={
                <ApproverRestrictedRoute>
                  <MainLayout>
                    <ApproverDashboard />
                  </MainLayout>
                </ApproverRestrictedRoute>
              }
            />
            <Route
              path="/admin/user"
              element={
                <MainLayout>
                  <UserAdmin />
                </MainLayout>
              }
            />
            <Route
              path="/users/manage"
              element={
                <SARestrictedRoute>
                  <MainLayout>
                    <ManageUsers />
                  </MainLayout>
                </SARestrictedRoute>
              }
            />
            <Route
              path="/assistant/dashboard"
              element={
                <AssistantRestrictedRoute>
                  <MainLayout>
                    <AssistantDashboard />
                  </MainLayout>
                </AssistantRestrictedRoute>
              }
            />
            <Route
              path="/remark-pdf"
              element={
                <MainLayout>
                  <RemarkUI />
                </MainLayout>
              }
            />
            <Route
              path="/notifications"
              element={
                <MainLayout>
                  <Notifications />
                </MainLayout>
              }
            />
            <Route
              path="/history"
              element={
                <MainLayout>
                  <History />
                </MainLayout>
              }
            />
            <Route
              path="/edit/profile"
              element={
                <MainLayout>
                  <EditProfile />
                </MainLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <LoginRestrictedRoute>
                  <MainLayout>
                    <ProfileDashboard />
                  </MainLayout>
                </LoginRestrictedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRestrictedRoute>
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </AdminRestrictedRoute>
              }
            />
            <Route
              path="/changepassword"
              element={
                <LoginRestrictedRoute>
                  <MainLayout>
                    <ChangePassword />
                  </MainLayout>
                </LoginRestrictedRoute>
              }
            />
            <Route
              path="/correction"
              element={
                <MainLayout>
                  <Correction />
                </MainLayout>
              }
            />
            <Route path="/support" element={<Support />} />
            <Route path="/admin/user" element={<UserAdmin />} />
          </Routes>
        </NotificationProvider>
      </UsersProvider>
    </AuthProvider>
  );
};

export default App;