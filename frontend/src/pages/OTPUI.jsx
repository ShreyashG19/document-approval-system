import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { AuthContext } from "../contexts/AuthContext";

const OTPUI = () => {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [errors, setErrors] = useState({});
  const { tempUser, loggedInUser, setLoggedInUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Countdown timer effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setOtp(value);
    }
  };

  const handleResendOtp = async () => {
    const toastId = toast.loading("Resending OTP...", {
      position: "top-center",
    });
    try {
      const otpUrl = import.meta.env.VITE_API_URL + "/user/resend-otp";
      const response = await fetch(otpUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: tempUser.username,
          email: tempUser.email,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(error.message);
        toast.dismiss(toastId);
        toast.error("Error sending OTP", {
          position: "top-center",
          duration: 3000,
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("OTP sent:", result.message);
      toast.dismiss(toastId);
      toast.success("OTP sent successfully!", {
        position: "top-center",
        duration: 3000,
      });
      setTimer(30); // Reset timer to 30 seconds after resending OTP
    } catch (error) {
      console.log(error);
      toast.dismiss(toastId);
      toast.error("Error sending OTP", {
        position: "top-center",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!otp) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{4}$/.test(otp)) {
      newErrors.otp = "OTP must be exactly 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const toastId = toast.loading("Verifying OTP...", {
      position: "top-center",
    });
    try {
      const otpUrl = import.meta.env.VITE_API_URL + "/user/verify-otp";
      const response = await fetch(otpUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: tempUser.username,
          otp,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.dismiss(toastId);
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      setLoggedInUser({
        ...loggedInUser,
        username: tempUser.username,
      });
      toast.dismiss(toastId);
      toast.success("OTP verified successfully!", {
        position: "top-center",
        duration: 3000,
      });
      navigate("/");
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.dismiss(toastId);
      toast.error("Invalid OTP", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-white to-blue-100">
      <Toaster />
      <div className="w-96 bg-white shadow-lg border border-gray-200 rounded-lg p-8">
        <div>
          {/* Title */}
          <h2 className="text-center text-xl font-semibold text-gray-800 mb-6">
            OTP Verification
          </h2>

          {/* Note */}
          <p className="text-center text-sm text-gray-600 mb-4">
            Please enter the OTP sent to your email.
          </p>

          {/* Form */}
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
              {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}
            </div>

            {/* Timer and Resend Link */}
            <div className="flex justify-between items-end mb-6">
              <p className="text-sm text-gray-600">
                Resend OTP in{" "}
                <span className="font-medium text-blue-500">{timer}s</span>
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

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition duration-200"
            >
              Verify OTP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPUI;
