import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";

const AddUser = ({ showAddUser, setShowAddUser, handleAddUser, userType }) => {
  const [newUserData, setNewUserData] = useState({
    username: "",
    fullName: "",
    email: "",
    mobileNo: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setNewUserData({ ...newUserData, [e.target.name]: e.target.value });
  };

  const validateInputs = (user) => {
    let valid = true;
    if (!user.username.trim()) {
      toast.error("Username is required.", {
        position: "top-right",
        duration: 3000,
      });
      valid = false;
    }
    if (!user.fullName.trim()) {
      toast.error("Full Name is required.", {
        position: "top-right",
        duration: 3000,
      });
      valid = false;
    }
    if (!user.email.trim()) {
      toast.error("Email is required.", {
        position: "top-right",
        duration: 3000,
      });
      valid = false;
    }
    if (!user.mobileNo.trim() || !/^\d{10}$/.test(user.mobileNo)) {
      toast.error("A valid 10-digit Mobile Number is required.", {
        position: "top-right",
        duration: 3000,
      });
      valid = false;
    }
    if (!user.password.trim() || user.password.length < 6) {
      toast.error("Password must be at least 6 characters long.", {
        position: "top-right",
        duration: 3000,
      });
      valid = false;
    }
    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match.", {
        position: "top-right",
        duration: 3000,
      });
      valid = false;
    }

    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateInputs(newUserData)) {
      handleAddUser({ ...newUserData, role: userType });
      setShowAddUser(false);
    }
  };

  if (!showAddUser) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Add {userType === "Assistant" ? "Assistant" : "Approver"}
          </h2>
          <button onClick={() => setShowAddUser(false)} className="text-gray-600 hover:text-gray-800">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={newUserData.username}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={newUserData.fullName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={newUserData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Mobile Number</label>
            <input
              type="text"
              name="mobileNo"
              value={newUserData.mobileNo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={newUserData.password}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={newUserData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add {userType === "Assistant" ? "Assistant" : "Approver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;