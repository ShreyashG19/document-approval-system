import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast, Toaster } from "react-hot-toast";


// Note: We're using the lucide-react library for icons instead of react-icons
// This library is available in the environment
import { User, Mail, Phone, MapPin, Lock, Edit, Shield, Bell, LogOut } from "lucide-react";

const ProfileDashboard = () => {
  const navigate = useNavigate();
  const { loggedInUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const handleLogout = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Logging out...", { position: "top-center" });

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/auth/logout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // body: JSON.stringify({ deviceToken: fcmToken }),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to logout");

      toast.dismiss(toastId);
      toast.success("Logged out successfully!", {
        position: "top-center",
        duration: 2000,
      });

      logout();
      navigate("/");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message, { position: "top-center", duration: 2000 });
    }
  };
  console.log(loggedInUser);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow p-4 md:p-8">
        <div className="w-full max-w-5xl">
          {/* Header Section */}
          <div className="bg-white shadow-lg rounded-t-2xl p-6 mb-1 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="bg-blue-100 rounded-full p-6 flex items-center justify-center">
                    <User size={48} className="text-blue-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{loggedInUser.fullName}</h2>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleLogout}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white shadow-lg mb-1 p-2">
            <div className="flex overflow-x-auto">
              <button 
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 mx-1 rounded-lg font-medium ${activeTab === "profile" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
              >
                Profile Information
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white shadow-lg rounded-b-2xl p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 p-3 rounded-xl mr-4">
                      <Mail className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                      <p className="text-gray-900 font-medium">{loggedInUser.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 p-3 rounded-xl mr-4">
                      <Phone className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                      <p className="text-gray-900 font-medium">{loggedInUser.mobileNo}</p>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;