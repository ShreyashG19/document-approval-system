import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { loggedInUser } = useAuth();
  const navigate = useNavigate();

  // Separate validation for current password
  const validateCurrentPassword = (value) => {
    if (!value?.trim()) return "Current password is required";
    return "";
  };

  // Strict validation for new password
  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(value))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(value))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(value))
      return "Password must contain at least one number";
    if (!/[!@#$%^&*]/.test(value))
      return "Password must contain at least one special character (!@#$%^&*)";
    return "";
  };

  const handlePasswordChange = (e, field) => {
    const value = e.target.value;

    switch (field) {
      case "current":
        setCurrentPassword(value);
        setErrors((prev) => ({
          ...prev,
          currentPassword: validateCurrentPassword(value),
        }));
        break;
      case "new":
        setNewPassword(value);
        const newPasswordError = validatePassword(value);
        setErrors((prev) => ({
          ...prev,
          newPassword: newPasswordError,
          // Update confirm password error if it was already entered
          confirmPassword:
            confirmPassword && value !== confirmPassword
              ? "Passwords do not match"
              : "",
        }));
        break;
      case "confirm":
        setConfirmPassword(value);
        setErrors((prev) => ({
          ...prev,
          confirmPassword: !value
            ? "Confirm password is required"
            : value !== newPassword
            ? "Passwords do not match"
            : "",
        }));
        break;
      default:
        break;
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate all fields
    const currentPasswordError = validateCurrentPassword(currentPassword);
    const newPasswordError = validatePassword(newPassword);
    const confirmPasswordError = !confirmPassword
      ? "Confirm password is required"
      : confirmPassword !== newPassword
      ? "Passwords do not match"
      : "";

    setErrors({
      currentPassword: currentPasswordError,
      newPassword: newPasswordError,
      confirmPassword: confirmPasswordError,
    });

    if (currentPasswordError || newPasswordError || confirmPasswordError) {
      return;
    }

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "New password must be different from current password",
      }));
      return;
    }

    const toastId = toast.loading("Changing password...");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          withCredentials: true,
        }
      );

      toast.dismiss(toastId);

      if (response.status === 200) {
        toast.success("Password changed successfully!", {
          position: "top-center",
          duration: 3000,
        });

        // Reset form and navigate
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        navigate("/profile");
      }
    } catch (error) {
      toast.dismiss(toastId);

      // Handle specific backend error for invalid current password
      if (
        error.response?.status === 400 &&
        error.response?.data?.message === "Invalid Current Password"
      ) {
        setErrors((prev) => ({
          ...prev,
          currentPassword: "Current password is incorrect",
        }));
      } else {
        toast.error(
          error.response?.data?.message || "Failed to change password",
          {
            position: "top-center",
            duration: 3000,
          }
        );
      }
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-white to-blue-100">
      <Toaster />
      <div className="w-full max-w-md bg-white shadow-lg border border-gray-200 rounded-lg p-8 space-y-6">
        <div className="flex justify-start items-center mb-6">
          <IoArrowBack
            size={25}
            className="text-black mt-1 mr-3 cursor-pointer"
            onClick={() => navigate("/profile")}
          />
          <h2 className="text-xl font-semibold text-gray-800">
            Change Password
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="mb-4">
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              className={`mt-1 px-4 py-2 w-full bg-white border ${
                errors.currentPassword ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                focus:outline-none text-gray-900`}
              value={currentPassword}
              onChange={(e) => handlePasswordChange(e, "current")}
              required
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className={`mt-1 px-4 py-2 w-full bg-white border ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                focus:outline-none text-gray-900`}
              value={newPassword}
              onChange={(e) => handlePasswordChange(e, "new")}
              required
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className={`mt-1 px-4 py-2 w-full bg-white border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                focus:outline-none text-gray-900`}
              value={confirmPassword}
              onChange={(e) => handlePasswordChange(e, "confirm")}
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              errors.currentPassword ||
              errors.newPassword ||
              errors.confirmPassword
            }
            className={`w-full px-4 py-2 ${
              errors.currentPassword ||
              errors.newPassword ||
              errors.confirmPassword
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white font-medium rounded-md transition duration-200`}
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
