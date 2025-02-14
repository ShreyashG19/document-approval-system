import React, { useState, useContext, useEffect } from "react";
import { FaUserPlus, FaTrashAlt } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddUser from "../components/AddUser";
import { UsersContext } from "../contexts/UsersContext";
import { AuthContext } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";

const ManageUsers = () => {
  const { approver, assistants, refreshUsers } = useContext(UsersContext);
  const navigate = useNavigate();
  const { loggedInUser } = useContext(AuthContext);
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(false); // Add a loading state
  const [userType, setUserType] = useState(""); // Add a state to track the type of user being added
  
  useEffect(() => {
    if (!loggedInUser) {
      navigate("/");
    } else {
      refreshUsers();
    }
  }, [loggedInUser]);

  const handleDeleteUser = (id, role) => {
    // Your delete user logic here
  };

  const handleAddUser = async (newUserData) => {
    setLoading(true); // Start loading
    try {
      // Your API call to add a new user
      await axios.post("/assistant/create-user", newUserData);
      toast.success("User added successfully!");
      refreshUsers(); // Refresh user list after adding the new user
    } catch (error) {
      toast.error("Error adding user. Please try again.");
    } finally {
      setLoading(false); // Stop loading once the process is done
    }
  };

  const handleOpenAddUser = (type) => {
    setUserType(type);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowAddUser(true);
    }, 1000); // Simulate loading delay before showing modal
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-white to-blue-100">
      <Toaster />
      {/* <Navbar/> */}
      <div className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-3xl bg-white shadow-lg border border-gray-200 rounded-lg p-8">
          <div className="flex gap-4 mb-6 justify-end">
            <button
              onClick={handleOpenAddUser}
              className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-lg flex items-center gap-2"
            >
              {loading ? <span className="loading loading-bars loading-lg"></span> : <><FaUserPlus /> Create Employer Credentials</>}
            </button>
          </div>

          {/* Approvers */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Manage Team
          </h3>
          {!approver ? (
            <p className="text-gray-600">No Approvers available</p>
          ) : (
            <div className="space-y-4">
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
                  title="Delete User"
                  onClick={() => handleDeleteUser(approver.id, "Approver")}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          )}

          {/* Assistants */}
          
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
                    title="Delete User"
                    onClick={() => handleDeleteUser(user.id, "Assistant")}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4 mt-8 justify-end">
            <button
              onClick={() => handleOpenAddUser("Assistant")}
              className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-lg flex items-center gap-2"
            >
              {loading ? <span className="loading loading-bars loading-lg"></span> : <><FaUserPlus /> Add Assistant</>}
            </button>
            <button
              onClick={() => handleOpenAddUser("Approver")}
              className="text-white bg-green-600 hover:bg-green-700 p-2 rounded-lg flex items-center gap-2"
            >
              {loading ? <span className="loading loading-bars loading-lg"></span> : <><FaUserPlus /> Add Approver</>}
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AddUser
        showAddUser={showAddUser}
        setShowAddUser={setShowAddUser}
        handleAddUser={handleAddUser} // Pass the add user function to the modal
        userType={userType} // Pass the user type to the modal
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

export default ManageUsers;