import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { AuthContext } from "../contexts/AuthContext";

const ForgotPassOTP = () => {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [errors, setErrors] = useState({});
  const [expired, setExpired] = useState(false); 
  const { tempUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Countdown timer effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setExpired(true); 
    }
  }, [timer]);

  const validateForm = () => {
    const newErrors = {};
    if (!otp) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{4}$/.test(otp)) {
      newErrors.otp = "Only enter a 4-digit number from 0-9";
    }

    if (expired) {
      newErrors.otp = "OTP has expired. Request a new one.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setOtp(value);
      setErrors({ ...errors, otp: "" });
    } else {
      setErrors({ ...errors, otp: "Only enter a 4-digit number from 0-9" });
    }
  };

  const handleResendOtp = async () => {
    navigate("/forgot-password");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || expired) {
      setErrors({ ...errors, otp: "OTP has expired. Request a new one." });
      return;
    }

    try {
      const otpUrl = import.meta.env.VITE_API_URL + "/user/verify-sp-otp";
      const response = await fetch(otpUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: tempUser.email,
          otp,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      toast.success("OTP verified successfully!", {
        position: "top-center",
        duration: 3000,
      });
      navigate("/set-new-pass");
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error(error.message, {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-white to-blue-100">
      <Toaster />
      <div className="w-96 bg-white shadow-lg border border-gray-200 rounded-lg p-8">
        <h2 className="text-center text-xl font-semibold text-gray-800 mb-6">
          OTP Verification
        </h2>
        <p className="text-center text-sm text-gray-600 mb-4">
          Please enter the OTP sent to your email.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={handleOtpChange}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-black"
            />
            {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
          </div>

          <div className="flex justify-between items-end mb-6">
            <p className="text-sm text-gray-600">
              Resend OTP in <span className="font-medium text-blue-500">{timer}s</span>
            </p>
            {timer === 0 && (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-sm text-blue-500 hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="submit"
            className={`w-full px-4 py-2 font-medium rounded-md transition duration-200 ${
              expired ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={expired}
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassOTP;
