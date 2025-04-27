import React, { useState } from "react";
import {
  FaBell,
  FaArrowLeft,
  FaUser,
  FaHistory,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNotifications } from "../contexts/NotificationContext";
import { Role, FileStatus } from "../../utils/enums.js";

// Add this helper function at the top of the file
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Notifications = () => {
  const { notifications, markAllAsRead } = useNotifications();
  const { loggedInUser, setLoggedInUser, loading, logout } = useAuth();
  const navigate = useNavigate();

  const navigateback = () => {
    {
      loggedInUser.role === Role.APPROVER
        ? navigate("/MainPage/approver/dashboard")
        : loggedInUser.role === Role.SENIOR_ASSISTANT
        ? navigate("/MainPage/assistant/dashboard")
        : navigate("/MainPage/admin/dashboard");
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case FileStatus.APPROVED:
        return "bg-green-100 text-green-600";
      case FileStatus.REJECTED:
        return "bg-red-100 text-red-600";
      case FileStatus.CORRECTION:
        return "bg-yellow-100 text-yellow-600";
      case FileStatus.PENDING:
        return "bg-blue-50 text-blue-600";
      default:
        return "bg-blue-50 text-blue-600";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case FileStatus.APPROVED:
        return <FaCheckCircle size={20} />;
      case FileStatus.REJECTED:
        return <FaTimesCircle size={20} />;
      case FileStatus.CORRECTION:
        return <FaExclamationCircle size={20} />;
      case FileStatus.PENDING:
        return <FaBell size={20} />;
      default:
        return <FaBell size={20} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-white to-blue-100">
      {/* Navbar */}

      {/* Main Content */}
      <div className="flex items-center justify-center flex-grow">
        <div className="w-full max-w-3xl bg-white shadow-lg border border-gray-200 rounded-lg p-8">
          {/* Back Button */}
          <button
            className="text-blue-600 hover:text-blue-800 mb-6 flex items-center transition-colors duration-300"
            onClick={navigateback}
          >
            <FaArrowLeft size={24} className="mr-2" />
            Back to Dashboard
          </button>

          {/* Notifications List */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Your Notifications
              </h2>
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-300"
              >
                Mark all as read
              </button>
            </div>

            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex justify-between items-center p-4 mb-4 rounded-lg ${getNotificationColor(
                  notification.type
                )} shadow-md transform transition-all  `}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-full shadow-md">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600">{notification.body}</p>
                    <span className="text-xs font-medium text-gray-500">
                      {formatDateTime(notification.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
