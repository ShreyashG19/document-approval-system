import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const RegistrationSuccessful = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const [newEmail, setNewEmail] = useState("");

  const handleSendEmail = () => {
    // Logic to send email
    console.log("Email sent to:", newEmail);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-white to-blue-100">
      <Toaster />
      <div className="w-96 bg-white shadow-lg border border-gray-200 rounded-lg p-8">
        <h2 className="text-center text-xl font-semibold text-gray-800 mb-6">
          Registration Successful
        </h2>
        <p className="text-center text-gray-700 mb-4">
          Thank you for registering! A confirmation email has been sent to:
        </p>
        <p className="text-center text-blue-500 font-medium">{email}</p>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Email to Send Confirmation
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-700 focus:border-blue-500 focus:outline-none"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <button
            onClick={handleSendEmail}
            className="mt-4 w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition duration-200"
          >
            Send Email
          </button>
        </div>
        <button
          onClick={() => navigate("/")}
          className="mt-6 w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition duration-200"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default RegistrationSuccessful;