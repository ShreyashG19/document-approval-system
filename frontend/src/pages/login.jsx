import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { toast, Toaster } from "react-hot-toast";
import { Role } from "../../utils/enums";
import { requestFCMToken } from "../../utils/firebaseUtils";
import { useNotifications } from "../contexts/NotificationContext";

const Login = () => {
  const [selectedToggle, setSelectedToggle] = useState("Assistant");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState(false);
  const { loggedInUser, setLoggedInUser } = useContext(AuthContext);
  const { fcmToken, setFcmToken } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFCMToken = async () => {
      try {
        const deviceToken = await requestFCMToken();
        setFcmToken(deviceToken);
        console.log("deviceToken", deviceToken);
      } catch (error) {
        console.error("Error fetching FCM Token:", error);
        setTokenError(true);
        toast.error("Error getting notification token. Please try again later.");
      } finally {
        setTokenLoading(false);
      }
    };
    fetchFCMToken();
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      switch (loggedInUser.role) {
        case Role.APPROVER:
          navigate("/approver/dashboard");
          break;
        case Role.SENIOR_ASSISTANT:
        case Role.ASSISTANT:
          navigate("/assistant/dashboard");
          break;
        case Role.ADMIN:
          navigate("/admin/dashboard");
          break;
        default:
          console.warn("Unknown role:", loggedInUser.role);
          navigate("/");
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <Toaster />

      {tokenLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <span className="loading loading-bars loading-lg"></span>
          <p className="ml-4 text-gray-700">System Loading. Please wait...</p>
        </div>
      )}

      {!tokenLoading && (
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <RouterLink
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot Password?
              </RouterLink>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                `Login as ${selectedToggle}`
              )}
            </button>
          </form>

          {selectedToggle === "Assistant" && (
            <div className="text-center mt-6">
              <span className="text-sm text-gray-600">
                Don't have an account?{" "}
              </span>
              <RouterLink
                to="/register"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Register As <span className="font-semibold">Assistant</span>
              </RouterLink>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Login;