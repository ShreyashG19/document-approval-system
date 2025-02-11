import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { toast, Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setTempUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!username) {
      newErrors.username = "Username is required";
    } else if (/\s/.test(username)) {
      newErrors.username = "Username cannot contain spaces";
    }
    if (!fullName) newErrors.fullName = "Full Name is required";
    if (!mobileNo) {
      newErrors.mobileNo = "Mobile number is required";
    } else if (mobileNo.length !== 10 || isNaN(mobileNo)) {
      newErrors.mobileNo = "Mobile number must be exactly 10 digits";
    }
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validateForm();
  }, [username, fullName, mobileNo, email, password, confirmPassword]);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const apiUrl = import.meta.env.VITE_API_URL + "/user/signup";
    const toastId = toast.loading("Signing up...", {
      position: "bottom-right",
    });

    const formData = {
      username,
      password,
      email,
      fullName,
      mobileNo: `+91${mobileNo}`,
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

        throw new Error(`HTTP error! status: ${response.status}`);
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
        mobileNo: `+91${mobileNo}`,
      });
      navigate("/otp/verify");
    } catch (error) {
      console.error("Error during signup:", error);
      toast.dismiss(toastId);
      toast.error(error.message, {
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
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-700 focus:border-blue-500 focus:outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleBlur("username")}
              />
              {touched.username && errors.username && (
                <p className="text-red-500 text-sm flex items-center">
                  <FaExclamationCircle className="mr-1" /> {errors.username}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-700 focus:border-blue-500 focus:outline-none"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => handleBlur("fullName")}
              />
              {touched.fullName && errors.fullName && (
                <p className="text-red-500 text-sm flex items-center">
                  <FaExclamationCircle className="mr-1" /> {errors.fullName}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 text-gray-700 focus:border-blue-500 focus:outline-none"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  onBlur={() => handleBlur("mobileNo")}
                />
              </div>
              {touched.mobileNo && errors.mobileNo && (
                <p className="text-red-500 text-sm flex items-center">
                  <FaExclamationCircle className="mr-1" /> {errors.mobileNo}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-700 focus:border-blue-500 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
              />
              {touched.email && errors.email && (
                <p className="text-red-500 text-sm flex items-center">
                  <FaExclamationCircle className="mr-1" /> {errors.email}
                </p>
              )}
            </div>

            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span> (min 8
                characters)
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
              />
              <span
                className="absolute right-3 top-10 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {touched.password && errors.password && (
                <p className="text-red-500 text-sm flex items-center">
                  <FaExclamationCircle className="mr-1" /> {errors.password}
                </p>
              )}
            </div>

            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
              />
              <span
                className="absolute right-3 top-10 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-red-500 text-sm flex items-center">
                  <FaExclamationCircle className="mr-1" /> {errors.confirmPassword}
                </p>
              )}
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