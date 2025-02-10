import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { FaBell, FaUserAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { Role } from "../../utils/enums";
import { useNotifications } from "../contexts/NotificationContext";
import { AiFillHome } from "react-icons/ai";

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { loggedInUser, setLoggedInUser, loading, logout } = useAuth();
  const { unreadCount, resetCount, fetchNotifications, fcmToken } =
    useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const navigateNoti = () => {
    navigate("/notifications");
    resetCount();
    handleMenuClose();
  };

  const navigateHistory = () => {
    navigate("/history");
    handleMenuClose();
  };

  const navigateProfile = () => {
    navigate("/profile");
    handleMenuClose();
  };

  const navigateManageUsers = () => {
    navigate("/users/manage");
    handleMenuClose();
  };

  const navigateHome = () => {
    if (loggedInUser?.role === Role.APPROVER) {
      navigate("/approver/dashboard");
    } else if (loggedInUser?.role === Role.ADMIN) {
      navigate("/admin/dashboard");
    } else {
      navigate("/assistant/dashboard");
    }
    handleMenuClose();
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Logging out...", { position: "top-center" });

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/user/signout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceToken: fcmToken }),
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="navbar w-full h-[8vh] flex items-center justify-between bg-white text-gray-700 px-8 shadow-md">
      {!loggedInUser ? (
        <h1 className="text-lg font-semibold tracking-wider">Loading...</h1>
      ) : (
        <h1 className="text-lg font-semibold tracking-wider">
          {`${loggedInUser.role}'s Dashboard`.toUpperCase()}
        </h1>
      )}

      <div className="flex items-center space-x-6">
        {/* Home Button */}
        <Tooltip title="Home" arrow>
          <button
            onClick={navigateHome}
            className="text-gray-600 mb-2 text-xl hover:text-blue-500"
          >
            <AiFillHome />
          </button>
        </Tooltip>

        {/* Notifications Button */}
        <div className="relative">
          <Tooltip title="Notifications" arrow>
            <button
              onClick={navigateNoti}
              className="text-gray-600 text-xl hover:text-blue-500"
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </Tooltip>
        </div>

        {/* Profile Dropdown */}
        <Tooltip title="Profile" arrow>
          <IconButton onClick={handleMenuOpen} aria-label="Profile">
            <FaUserAlt size={22} className="mb-2 hover:text-blue-500" />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{ style: { maxHeight: 200, width: "20ch" } }}
        >
          <MenuItem onClick={navigateProfile}>View Profile</MenuItem>
          {loggedInUser?.role !== Role.ADMIN && (
            <>
              <MenuItem onClick={navigateHistory}>History</MenuItem>
              {loggedInUser?.role === Role.SENIOR_ASSISTANT && (
                <MenuItem onClick={navigateManageUsers}>Manage Users</MenuItem>
              )}
            </>
          )}
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default Navbar;
