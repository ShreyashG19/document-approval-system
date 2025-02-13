import React, { useState, useContext } from "react";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { AuthContext } from "../contexts/AuthContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { tempUser, setTempUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpUrl =
      import.meta.env.VITE_API_URL + "/user/send-password-reset-otp";
    try {
      const response = await fetch(otpUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.log(data);
        throw new Error(data.message);
      }
      setTempUser({ ...tempUser, email });
      toast.success("OTP sent successfully to your email!", {
        position: "top-center",
        duration: 2000,
      });
      navigate("/forgot-password-otp");
    } catch (error) {
      toast.error(error.message, {
        position: "top-center",
        duration: 2000,
      });
      console.log("ForgotPassword service :: handleSubmit :: error : ", error);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-white to-blue-100">
      <Toaster />
      <div className="w-96 bg-white shadow-lg border border-gray-200 rounded-lg p-8">
        <div>
          {/* Title */}
          <h2 className="text-center text-xl font-semibold text-gray-800 mb-6">
            Forgot Password
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-black"
              />
            </div>

            <button className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition duration-200">
              Send OTP
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <span className="text-sm text-gray-600">
              Remember your password?{" "}
            </span>
            <RouterLink
              to="/"
              className="text-sm text-blue-500 hover:underline"
            >
              Login
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
