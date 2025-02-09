import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { toast, Toaster } from "react-hot-toast";
const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { setTempUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL + "/user/signup";
    // const apiUrl = "http://localhost:4000/user/signup";
    const toastId = toast.loading("Signing up...", {
      position: "top-center",
    });

    if (mobileNo.length !== 10 || isNaN(mobileNo)) {
      toast.dismiss(toastId);
      toast.error("Mobile number must be exactly 10 digits.", { position: "top-center", duration: 3000 });
      return;
    }
  
    // **Simple Password Validation** (Min 8 chars & at least 1 special character)
    const specialCharacters = "!@#$%^&*()_+-=[]{};:'\"\\|,.<>?/`~";
    const hasSpecialChar = [...password].some((char) => specialCharacters.includes(char));
  
    if (password.length < 8 || !hasSpecialChar) {
      toast.dismiss(toastId);
      toast.error("Password must be at least 8 characters long and contain a special character.", { position: "top-center", duration: 3000 });
      return;
    }

    if (password !== confirmPassword) {
      toast.dismiss(toastId);
      toast.error("Passwords do not match", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }
    const formData = {
      username,
      password,
      email,
      fullName,
      mobileNo,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(error.message);
        toast.dismiss(toastId);
        toast.error(error.message, {
          position: "top-center",
          duration: 2000,
        });

        throw new Error(`HTTP error{! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Please verify the account:", result.message);
      toast.dismiss(toastId);
      toast.success("Signup successful! Please verify the account.", {
        position: "top-center",
        duration: 2000,
      });
      setTempUser({
        username,
        fullName,
        email,
        mobileNo,
      });
      navigate("/otp/verify");
    } catch (error) {
      console.error("Error during signup:", error);
      toast.dismiss(toastId);
      toast.error(error, {
        position: "top-center",
        duration: 2000,
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
            Create an Account
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="Select a username"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-700 focus:border-blue-500 focus:outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-700 focus:border-blue-500 focus:outline-none"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="number"
                placeholder="Enter your mobile number"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500  text-gray-700 focus:border-blue-500 focus:outline-none"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500  text-gray-700 focus:border-blue-500 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md  text-gray-700  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full px-4 py-2  text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition duration-200">
              Register as Assistant
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
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

export default Register;
