import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { Role } from "../../utils/enums";
import toast from "react-hot-toast";
import {
  UserPlus,
  Eye,
  EyeOff,
  Users,
  Shield,
  X,
  ToggleLeft,
  ToggleRight,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";

const ManageUsers = () => {
  const { loggedInUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
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

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/");
      return;
    }
    fetchUsers();
  }, [loggedInUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      // Backend returns: { status, message, data: { users } }
      setUsers(data.data?.users || data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await userService.setUserStatus(user.username, !user.isActive);
      toast.success("User status updated");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setAddLoading(true);
    try {
      await authService.register(formData);

      toast.success("User added successfully!");
      setShowAddModal(false);
      setFormData({
        fullName: "",
        email: "",
        username: "",
        password: "",
        mobileNo: "",
        role: "",
      });
      setConfirmPassword("");
      fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to add user";
      toast.error(msg);
    } finally {
      setAddLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const approvers = users.filter(
    (u) => u.role?.toLowerCase() === "approver"
  );
  const assistants = users.filter((u) =>
    u.role?.toLowerCase().includes("assistant")
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
          <p className="text-sm text-slate-500 mt-1">
            {users.length} user{users.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Approvers Section */}
          <Section title="Approvers" icon={<Shield className="w-5 h-5 text-indigo-600" />}>
            {approvers.length === 0 ? (
              <EmptySection text="No approvers found" />
            ) : (
              <div className="space-y-3">
                {approvers.map((user) => (
                  <UserCard
                    key={user.username}
                    user={user}
                    onToggle={() => toggleUserStatus(user)}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Assistants Section */}
          <Section title="Assistants" icon={<Users className="w-5 h-5 text-blue-600" />}>
            {assistants.length === 0 ? (
              <EmptySection text="No assistants found" />
            ) : (
              <div className="space-y-3">
                {assistants.map((user) => (
                  <UserCard
                    key={user.username}
                    user={user}
                    onToggle={() => toggleUserStatus(user)}
                  />
                ))}
              </div>
            )}
          </Section>
        </>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Add New User</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddUser} className="px-6 py-5 space-y-4">
              <FormInput
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Mobile Number"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                required
              />

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter password"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm password"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                >
                  <option value="">Select Role</option>
                  <option value={Role.APPROVER}>Approver</option>
                  <option value={Role.ASSISTANT}>Assistant</option>
                </select>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-50"
                >
                  {addLoading ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
      {icon}
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const UserCard = ({ user, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 hover:border-blue-200 hover:shadow-sm transition-all">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-blue-700 font-bold text-sm">
        {user.fullName?.charAt(0)?.toUpperCase()}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-800">
          {user.fullName}
        </h3>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Mail className="w-3 h-3" />
            {user.email}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {user.role?.toUpperCase()}
          </span>
          <span
            className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${
              user.isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {user.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
        user.isActive
          ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
      }`}
    >
      {user.isActive ? (
        <>
          <ToggleRight className="w-4 h-4" /> Deactivate
        </>
      ) : (
        <>
          <ToggleLeft className="w-4 h-4" /> Activate
        </>
      )}
    </button>
  </div>
);

const EmptySection = ({ text }) => (
  <div className="py-8 text-center">
    <p className="text-sm text-slate-400">{text}</p>
  </div>
);

const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  required,
  placeholder,
}) => (
  <div>
    <label className="block text-sm font-semibold text-slate-600 mb-1.5">
      {label} {required && "*"}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
    />
  </div>
);

export default ManageUsers;
