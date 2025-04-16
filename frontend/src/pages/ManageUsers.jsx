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
  // const []

  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/");
    } else {
      refreshUsers();
    }
  }, [loggedInUser]);

  const setUserStatus = async (id, role) => {
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
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-white to-blue-100">
      <Toaster />
      <div className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-3xl bg-white shadow-lg border border-gray-200 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Manage Team
          </h3>

          {/* === Approver Section === */}
          <div className="mb-6">
            <h4 className="text-md font-bold text-indigo-700 mb-2">Approver</h4>
            {approver ? (
              <div
                key={approver.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {approver.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">{approver.email}</p>
                  <span className="text-xs text-gray-400">{approver.role}</span>
                </div>
                <button
                  title="Delete Approver"
                  onClick={() => setUserStatus(approver.id, "Approver")}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrashAlt />
                </button>
              </div>
            ) : (
              <p className="text-gray-600">No Approver available</p>
            )}
          </div>

          {/* === Assistants Section === */}
          <div className="mb-6">
            <h4 className="text-md font-bold text-indigo-700 mb-2">
              Assistants
            </h4>
            {assistants.length === 0 ? (
              <p className="text-gray-600">No Assistants available</p>
            ) : (
              <div className="space-y-4">
                {assistants.map((user) => (
                  <div
                    key={user.username}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {user.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <span className="text-xs text-gray-400">{user.role}</span>
                    </div>
                    <button
                      title="Delete Assistant"
                      onClick={() => setUserStatus(user.username, "Assistant")}
                      className="text-red-600 hover:text-red-800"
                    >
                      {user.isActive ? (
                        <button>DEACTIVATE</button>
                      ) : (
                        <button>ACTIVATE</button>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* === Add User Button === */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddUser(true)}
              className="text-white bg-indigo-600 hover:bg-indigo-700 p-2 rounded-lg flex items-center gap-2"
            >
              <FaUserPlus /> Add User
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add New User
            </h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />

              <input
                type="text"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                placeholder="Mobile No"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              {/* Password Field */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                  }}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Role</option>
                <option value={Role.APPROVER}>Approver</option>
                <option value={Role.ASSISTANT}>Assistant</option>
              </select>
              <div className="flex justify-between mt-4">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  {loading ? "Adding..." : "Add User"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <span className="text-white text-xl">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
