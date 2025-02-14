import React, { useState, useContext, useEffect } from "react";
import { FaUserPlus, FaTrashAlt, FaSearch } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import AddUser from "../components/AddUser";
import { UsersContext } from "../contexts/UsersContext";

const UserAdmin = () => {
  const { approver, assistants, refreshUsers } = useContext(UsersContext);
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // Delete User
  const handleDeleteUser = async (id, role) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}?`)) return;
    
    setDeletingUserId(id);
    try {
      await axios.delete(`/api/delete-user/${id}`);
      toast.success(`${role} deleted successfully!`);
      refreshUsers();
    } catch (error) {
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setDeletingUserId(null);
    }
  };

  // Add User
  const handleAddUser = async (newUserData) => {
    setLoading(true);
    try {
      await axios.post("/api/add-user", newUserData);
      toast.success("User added successfully!");
      refreshUsers();
      setShowAddUser(false);
    } catch (error) {
      toast.error("Error adding user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open Add User Modal
  const handleOpenAddUser = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowAddUser(true);
    }, 1000);
  };

  // Filter users based on search query
  const filteredAssistants = assistants.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
      <Toaster />

      <div className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-3xl bg-white shadow-lg border border-gray-200 rounded-lg p-8">
          

          {/* Search Bar */}
          {/* Header Section with Button & Search Bar */}
{/* Header Section with Button & Search Bar */}
<div className="flex justify-between items-center mb-6">
  {/* Search Bar */}
  <div className="relative w-full max-w-xs">
    <FaSearch className="absolute top-3 left-3 text-gray-400" />
    <input
      type="text"
      placeholder="Search users..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-10 pr-4 py-2.5 rounded-md border bg-white border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      disabled={loading}
    />
  </div>

  {/* Create User Button */}
  <button
    onClick={handleOpenAddUser}
    className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-lg flex items-center gap-2 ml-4"
  >
    {loading ? (
      <span className="loading loading-bars loading-lg"></span>
    ) : (
      <>
        <FaUserPlus /> Create User
      </>
    )}
  </button>
</div>



          {/* Approvers */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Approvers</h3>
          {!approver ? (
            <p className="text-gray-600">No Approvers available</p>
          ) : (
            <div className="space-y-4">
              <div
                key={approver.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{approver.fullName}</h3>
                  <p className="text-sm text-gray-600">{approver.email}</p>
                  <span className="text-xs text-gray-400">{approver.role}</span>
                </div>
                <button
                  title="Delete User"
                  onClick={() => handleDeleteUser(approver.id, "Approver")}
                  className="text-red-600 hover:text-red-800"
                >
                  {deletingUserId === approver.id ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <FaTrashAlt />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Assistants */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-8">Assistants</h3>
          {filteredAssistants.length === 0 ? (
            <p className="text-gray-600">No Assistants available</p>
          ) : (
            <div className="space-y-4">
              {filteredAssistants.map(user => (
                <div
                  key={user.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{user.fullName}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <span className="text-xs text-gray-400">{user.role}</span>
                  </div>
                  <button
                    title="Delete User"
                    onClick={() => handleDeleteUser(user.id, "Assistant")}
                    className="text-red-600 hover:text-red-800"
                  >
                    {deletingUserId === user.id ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      <FaTrashAlt />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <AddUser
        showAddUser={showAddUser}
        setShowAddUser={setShowAddUser}
        handleAddUser={handleAddUser}
      />

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <span className="loading loading-lg"></span>
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default UserAdmin;
