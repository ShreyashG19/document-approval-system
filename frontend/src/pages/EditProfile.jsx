import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const EditProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { loggedInUser, checkAuthStatus } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();

  // Fetch logged-in user details
  useEffect(() => {
    if (loggedInUser) {
      setName(loggedInUser.fullName);
      setEmail(loggedInUser.email);
      setPhone(loggedInUser.mobileNo);
    }
  }, [loggedInUser]);

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!phone) {
      newErrors.phone = "Mobile number is required";
    } else if (phone.length !== 10 || isNaN(phone)) {
      newErrors.phone = "Mobile number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save Changes logic
  const handleSaveChanges = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const toastId = toast.loading("Saving changes...");
    try {
      const updatedData = {
        fullName: name,
        mobileNo: phone,
      };
      const updateProfileUrl =
        import.meta.env.VITE_API_URL + "/user/update-profile";

      const response = await axios.post(updateProfileUrl, updatedData, {
        withCredentials: true,
      });

      toast.dismiss(toastId);
      if (response.status === 200) {
        checkAuthStatus();
        navigate("/profile");
        toast.success("Profile updated successfully!", {
          position: "top-center",
          duration: 3000,
        });
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error saving changes:", error);
      toast.error(error.response?.data?.message || "An error occurred", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  // Change Password logic
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    try {
      const passwordData = {
        currentPassword,
        newPassword,
      };

      console.log("Password Data:", passwordData);
      toast.success("Password changed successfully!", {
        position: "top-center",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password. Please try again.", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-white to-blue-100">
      <Toaster />
      <div className="w-full max-w-2xl bg-white shadow-lg border border-gray-200 rounded-lg p-8 space-y-6">
        <div className="flex items-start justify-start mb-6 cursor-pointer">
          <IoArrowBack
            className="text-zinc-900 hover:text-zinc-700 text-3xl mt-1 mr-4"
            onClick={() => navigate("/profile")}
          />
          <h1 className="text-2xl font-semibold mt-0.5 text-gray-800">
            Edit Profile
          </h1>
        </div>

        <form onSubmit={handleSaveChanges}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              className={`mt-1 px-4 py-2 w-full bg-white border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900`}
              value={name}
              onChange={handleNameChange}
              required
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 px-4 py-2 w-full opacity-75 bg-white border border-gray-300 rounded-md text-gray-900 cursor-not-allowed"
              value={email}
              disabled
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                +91
              </span>
              <input
                type="text"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 text-gray-700 focus:border-blue-500 focus:outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>
          <button
            type="submit"
            disabled={errors.name || errors.phone}
            className={`w-full px-4 py-2 ${
              errors.name || errors.phone
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white font-medium rounded-md transition duration-200`}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
