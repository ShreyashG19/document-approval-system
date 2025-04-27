import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import Login from "../pages/login.jsx";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import OTPUI from "../pages/OTPUI";
import ForgotPassOTP from "../pages/ForgotPassOTP";
import SetNewPassword from "../pages/SetNewPassword";
import RemarkUI from "../pages/RemarkUI";
import Notifications from "../pages/Notifications";
import ManageUsers from "../pages/ManageUsers";
import ApproverDashboard from "../pages/ApproverDashboard";
import History from "../pages/History";
import EditProfile from "../pages/EditProfile";
import ProfileDashboard from "../pages/ProfileDashboard";
import ChangePassword from "../pages/ChangePassword";
import AssistantDashboard from "../pages/AssistantDashboard.jsx";
import Correction from "../pages/Correction";
import AdminLogin from "../pages/AdminLogin";
import Support from "../pages/Support";
import AdminDashboard from "../pages/AdminDashboard";
import RegistrationSuccessful from "../pages/RegistrationSuccessful";

import { AuthProvider } from "../contexts/AuthContext";
import { UsersProvider } from "../contexts/UsersContext";
import { CryptoProvider } from "../contexts/CryptoContext";
import {
  NotificationProvider,
  useNotifications,
} from "../contexts/NotificationContext";

import {
  ApproverRestrictedRoute,
  LoginRestrictedRoute,
  SARestrictedRoute,
} from "../components/RestrictedRoutes";

import MainLayout from "../components/MainLayout";
import { onMessageListener } from "../../utils/firebaseUtils.js";
import { toast, Toaster } from "react-hot-toast";
import { FaBell } from "react-icons/fa";
import PreviewPdf from "../services/PreviewPdf.jsx";
import PdfViewer from "../services/PreviewPdf.jsx";

const AppRoutes = () => {
  const { fetchNotifications } = useNotifications();

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
      fetchNotifications();
    });
  }, [fetchNotifications]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            {/* <Route
              path="/registrationsuccessful"
              element={<RegistrationSuccessful />}
            /> */}
            {/* <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgot-password-otp" element={<ForgotPassOTP />} />
            <Route path="/set-new-pass" element={<SetNewPassword />} /> */}
            {/* <Route path="/admin/login" element={<AdminLogin />} /> */}
            {/* <Route path="/support" element={<Support />} /> */}

            {/* MainLayout Protected Routes */}
            <Route path="/MainPage" element={<MainLayout />}>
              <Route
                path="approver/dashboard"
                element={
                  <ApproverRestrictedRoute>
                    <ApproverDashboard />
                  </ApproverRestrictedRoute>
                }
              />
              <Route
                path="users/manage"
                element={
                  // <SARestrictedRoute>
                  <ManageUsers />
                  // </SARestrictedRoute>
                }
              />
              <Route
                path="assistant/dashboard"
                element={<AssistantDashboard />}
              />
              <Route path="remark-pdf" element={<RemarkUI />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="history" element={<History />} />
              <Route path="edit/profile" element={<EditProfile />} />
              <Route
                path="profile"
                element={
                  <LoginRestrictedRoute>
                    <ProfileDashboard />
                  </LoginRestrictedRoute>
                }
              />
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route
                path="changepassword"
                element={
                  <LoginRestrictedRoute>
                    <ChangePassword />
                  </LoginRestrictedRoute>
                }
              />
              <Route path="correction" element={<Correction />} />
              <Route
                path="/MainPage/previewPdf/:fileName"
                element={<PdfViewer />}
              />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
