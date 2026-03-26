import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { authService } from "../services/authService";
import { Role } from "../../utils/enums";
import toast from "react-hot-toast";
import {
  Bell,
  User,
  LogOut,
  Home,
  ChevronDown,
  Shield,
  FileText,
  Users,
  History,
  Menu,
  X,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loggedInUser, logout } = useAuth();
  const { unreadCount, resetCount, fetchNotifications, fcmToken } =
    useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (loggedInUser?.role !== Role.ADMIN) {
      fetchNotifications();
    }
  }, [loggedInUser?.role]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      await authService.logout(fcmToken);
      toast.dismiss(toastId);
      toast.success("Logged out successfully!");
      logout();
      navigate("/");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to logout");
    }
    setProfileOpen(false);
    setMenuOpen(false);
  };

  const navigateTo = (path) => {
    navigate(path);
    setProfileOpen(false);
    setMenuOpen(false);
  };

  const getDashboardPath = () => {
    const role = loggedInUser?.role;
    if (role === Role.APPROVER) return "/dashboard/approver";
    if (role === Role.ADMIN) return "/dashboard/admin";
    return "/dashboard/assistant";
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const roleLabel =
    loggedInUser?.role?.replace("_", " ").charAt(0).toUpperCase() +
    loggedInUser?.role?.replace("_", " ").slice(1);

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo(getDashboardPath())}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-slate-800 leading-none">
                  DocApproval
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                  SYSTEM
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            <NavButton
              icon={<Home className="w-4 h-4" />}
              label="Dashboard"
              active={isActive("/dashboard")}
              onClick={() => navigateTo(getDashboardPath())}
            />
            {loggedInUser?.role !== Role.ADMIN && (
              <NavButton
                icon={<FileText className="w-4 h-4" />}
                label="History"
                active={isActive("/history")}
                onClick={() => navigateTo("/history")}
              />
            )}
            {loggedInUser?.role === Role.ADMIN && (
              <NavButton
                icon={<Users className="w-4 h-4" />}
                label="Manage Users"
                active={isActive("/manage-users")}
                onClick={() => navigateTo("/manage-users")}
              />
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            {loggedInUser?.role !== Role.ADMIN && (
              <button
                onClick={() => {
                  navigateTo("/notifications");
                  resetCount();
                }}
                className="relative p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm shadow-red-500/30 animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                  {loggedInUser?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-slate-700 leading-none">
                    {loggedInUser?.fullName || "User"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {roleLabel}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 hidden sm:block transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200/80 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">
                      {loggedInUser?.fullName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {loggedInUser?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <DropdownItem
                      icon={<User className="w-4 h-4" />}
                      label="Profile"
                      onClick={() => navigateTo("/profile")}
                    />
                    <DropdownItem
                      icon={<History className="w-4 h-4" />}
                      label="History"
                      onClick={() => navigateTo("/history")}
                    />
                    {loggedInUser?.role === Role.ADMIN && (
                      <DropdownItem
                        icon={<Users className="w-4 h-4" />}
                        label="Manage Users"
                        onClick={() => navigateTo("/manage-users")}
                      />
                    )}
                  </div>
                  <div className="border-t border-slate-100 pt-1">
                    <DropdownItem
                      icon={<LogOut className="w-4 h-4" />}
                      label="Log Out"
                      onClick={handleLogout}
                      danger
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-all"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200/60 pt-3 space-y-1 animate-in slide-in-from-top-1">
            <MobileNavItem
              icon={<Home className="w-4 h-4" />}
              label="Dashboard"
              onClick={() => navigateTo(getDashboardPath())}
            />
            {loggedInUser?.role !== Role.ADMIN && (
              <MobileNavItem
                icon={<FileText className="w-4 h-4" />}
                label="History"
                onClick={() => navigateTo("/history")}
              />
            )}
            {loggedInUser?.role === Role.ADMIN && (
              <MobileNavItem
                icon={<Users className="w-4 h-4" />}
                label="Manage Users"
                onClick={() => navigateTo("/manage-users")}
              />
            )}
            {loggedInUser?.role !== Role.ADMIN && (
              <MobileNavItem
                icon={<Bell className="w-4 h-4" />}
                label={`Notifications ${unreadCount > 0 ? `(${unreadCount})` : ""}`}
                onClick={() => {
                  navigateTo("/notifications");
                  resetCount();
                }}
              />
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-blue-50 text-blue-700"
        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
    }`}
  >
    {icon}
    {label}
  </button>
);

const DropdownItem = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 w-full px-4 py-2 text-sm transition-colors ${
      danger
        ? "text-red-600 hover:bg-red-50"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
    }`}
  >
    {icon}
    {label}
  </button>
);

const MobileNavItem = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
  >
    {icon}
    {label}
  </button>
);

export default Navbar;
