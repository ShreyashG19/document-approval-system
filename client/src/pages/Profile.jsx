import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { authService } from "../services/authService";
import toast from "react-hot-toast";
import { User, Mail, Phone, LogOut, Edit, Lock } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { loggedInUser, logout } = useAuth();
  const { fcmToken } = useNotifications();

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      await authService.logout(fcmToken);
      toast.dismiss(toastId);
      toast.success("Logged out!");
      logout();
      navigate("/");
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div className="pb-1">
              <h1 className="text-xl font-bold text-slate-800">
                {loggedInUser?.fullName}
              </h1>
              <p className="text-sm text-slate-500 capitalize">
                {loggedInUser?.role?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={<Mail className="w-5 h-5 text-blue-600" />}
          label="Email Address"
          value={loggedInUser?.email}
        />
        <InfoCard
          icon={<Phone className="w-5 h-5 text-blue-600" />}
          label="Phone Number"
          value={loggedInUser?.mobileNo}
        />
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-2">
        <ActionButton
          icon={<Edit className="w-4 h-4" />}
          label="Edit Profile"
          onClick={() => navigate("/edit-profile")}
        />
        <ActionButton
          icon={<Lock className="w-4 h-4" />}
          label="Change Password"
          onClick={() => navigate("/change-password")}
        />
        <ActionButton
          icon={<LogOut className="w-4 h-4" />}
          label="Log Out"
          onClick={handleLogout}
          danger
        />
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-4">
    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5">{value || "N/A"}</p>
    </div>
  </div>
);

const ActionButton = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      danger
        ? "text-red-600 hover:bg-red-50"
        : "text-slate-700 hover:bg-slate-50"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default Profile;
