import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { toast, Toaster } from "react-hot-toast";
import { Role } from "../../utils/enums";
import { requestFCMToken } from "../../utils/firebaseUtils";
const Login = () => {
  const [selectedToggle, setSelectedToggle] = useState("Assistant");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { loggedInUser, setLoggedInUser } = useContext(AuthContext);
  const [fcmToken, setFcmToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFCMToken = async () => {
      try {
        const deviceToken = await requestFCMToken();
        setFcmToken(deviceToken);
        console.log("deviceToken", deviceToken);
      } catch (error) {
        console.log(
          "login.jsx service :: useEffect fetchFCMTOken :: error : ",
          error
        );
      }
    };

    fetchFCMToken();
  }, []); // Add empty dependency array to prevent infinite loop
  useEffect(() => {
    if (loggedInUser) {
      //todo:role based access
      if (loggedInUser.role === Role.APPROVER) {
        navigate("/approver/dashboard");
      } else if (
        loggedInUser.role === Role.SENIOR_ASSISTANT ||
        loggedInUser.role === Role.ASSISTANT
      ) {
        navigate("/assistant/dashboard");
      } else if (loggedInUser.role === Role.ADMIN) {
        navigate("/admin/dashboard");
      }
    }
  }, [loggedInUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const apiUrl = import.meta.env.VITE_API_URL + "/user/signin";
    const formData = { username, password, deviceToken: fcmToken };

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
        console.log(error);
        throw new Error(error.message);
      }

      const result = await response.json();
      setLoggedInUser(result.user);
      setUsername("");
      setPassword("");
      toast.success("Login successful!", {
        position: "top-center",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error(error.message, {
        position: "top-center",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-white to-blue-100">
      <Toaster />
      <span className="z-40">{fcmToken}</span>
      {/* {loading && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <span className="loading loading-bars loading-lg"></span>
        </div>
      )} */}

      {/* <button
        className="absolute top-4 bg-red-600 text-white p-2 rounded-md right-4"
        onClick={() => navigate("/adminLogin")}
      >
        Admin
      </button> */}
      <div className="w-96 bg-white shadow-lg border border-gray-200 rounded-lg p-8">
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedToggle === "Approver"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setSelectedToggle("Approver")}
          >
            Approver
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedToggle === "Assistant"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setSelectedToggle("Assistant")}
          >
            Assistant
          </button>
        </div>

        <h2 className="text-center text-xl font-semibold text-gray-800 mb-6">
          Welcome Back!
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end items-end mb-4">
            <RouterLink
              to="/forgot-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot Password?
            </RouterLink>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition duration-200"
          >
            Login as {selectedToggle}
          </button>
        </form>

        {selectedToggle === "Assistant" && (
          <div className="text-center mt-6">
            <span className="text-sm text-gray-600">
              Don't have an account?{" "}
            </span>
            <RouterLink
              to="/register"
              className="text-sm text-blue-500 hover:underline"
            >
              Register
            </RouterLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
