import React, { useState, useContext, useEffect } from "react";
import { FaUserPlus, FaTrashAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UsersContext } from "../contexts/UsersContext";
import { AuthContext } from "../contexts/AuthContext";
import { Role } from "../../utils/enums";

const ManageUsers = () => {
  const { loggedInUser } = useContext(AuthContext);
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    mobileNo: "",
    role: "",
  });
  const [assistants, setAssistants] = useState([]);
  const [approver, setApprover] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/");
    } else {
      refreshUsers();
    }
  }, [loggedInUser]);

  const toggleUserStatus = async (user) => {
    try {
      const currentStatus = user.isActive;
      const updateStatusURL =
        import.meta.env.VITE_API_URL + "/user/set-user-status";

      const response = await axios.post(
        updateStatusURL,
        {
          username: user.username,
          isActive: !currentStatus,
        },
        { withCredentials: true }
      );

      console.log("User status updated successfully:", response.data);
      refreshUsers();
      toast.success("User status updated");
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Error updating user");
    }
  };

  const fetchAssistants = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + "/user/get-users",
        { withCredentials: true }
      );

      if (response.status === 200) {
        const users = response.data.users;

        const assistants = users.filter((user) =>
          user.role.toLowerCase().includes("assistant")
        );

        const approver = users.find(
          (user) => user.role.toLowerCase() === "approver"
        );

        setAssistants(assistants);
        setApprover(approver);

        console.log("Filtered Assistants:", assistants);
        console.log("Found Approver:", approver);
      }
    } catch (error) {
      console.error("fetchAssistants error:", error);
    }
  };

  const refreshUsers = () => {
    fetchAssistants();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const registerURL = import.meta.env.VITE_API_URL + "/auth/register";
      await axios.post(registerURL, formData, { withCredentials: true });
      toast.success("User added successfully!");
      refreshUsers();
      setShowAddUser(false);
      setFormData({
        fullName: "",
        email: "",
        username: "",
        password: "",
        mobileNo: "",
        role: "",
      });
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("error : ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100">
      <Toaster />
      <div className="flex items-center justify-center flex-grow p-6">
        <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl p-8 border border-indigo-100">
          <h3 className="text-xl font-bold text-indigo-800 mb-6 border-b pb-3 border-indigo-100">
            Manage Team
          </h3>

          {/* === Approver Section === */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center">
              <span className="inline-block w-2 h-6 bg-indigo-600 rounded mr-2"></span>
              Approver
            </h4>
            {approver ? (
              <div
                key={approver.id}
                className="flex justify-between items-center p-5 bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    {approver.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {approver.fullName}
                    </h3>
                    <p className="text-sm text-gray-600">{approver.email}</p>
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full mt-1 inline-block">
                      {approver.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleUserStatus(approver)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    approver.isActive
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {approver.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                <p className="text-gray-500">No Approver available</p>
              </div>
            )}
          </div>

          {/* === Assistants Section === */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center">
              <span className="inline-block w-2 h-6 bg-indigo-600 rounded mr-2"></span>
              Assistants
            </h4>
            {assistants.length === 0 ? (
              <div className="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                <p className="text-gray-500">No Assistants available</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {assistants.map((user) => (
                  <div
                    key={user.username}
                    className="flex justify-between items-center p-5 bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {user.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full mt-1 inline-block">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        user.isActive
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* === Add User Button === */}
          <div className="flex justify-end border-t pt-4 border-indigo-100">
            <button
              onClick={() => setShowAddUser(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-all duration-300 font-medium"
            >
              <FaUserPlus /> Add User
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-opacity-50 justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn">
            <h2 className="text-xl font-bold text-indigo-800 mb-6 pb-2 border-b border-indigo-100">
              Add New User
            </h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                    }}
                    placeholder="Confirm password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                >
                  <option value="">Select Role</option>
                  <option value={Role.APPROVER}>Approver</option>
                  <option value={Role.ASSISTANT}>Assistant</option>
                </select>
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md"
                >
                  {loading ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
            <span className="text-gray-800 font-medium">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
