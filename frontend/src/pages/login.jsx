import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { toast, Toaster } from "react-hot-toast";
import { Role } from "../../utils/enums";
import { requestFCMToken } from "../../utils/firebaseUtils";
import { useNotifications } from "../contexts/NotificationContext";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";


const Login = () => {
  const [selectedToggle, setSelectedToggle] = useState("Assistant");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        toast.error(
          "Error getting notification token. Please try again later."
        );
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
    setUsernameError("");
    setPasswordError("");

    if (!username) {
      setUsernameError("Username is required");
      setLoading(false);
      return;
    }

    if (/\s/.test(username)) {
      setUsernameError("Username cannot include spaces");
      setLoading(false);
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      setLoading(false);
      return;
    }

    if (/\s/.test(password)) {
      setPasswordError("Password cannot include spaces");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

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

      // Redirect to the appropriate dashboard based on user role
      switch (result.user.role) {
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
          console.warn("Unknown role:", result.user.role);
          navigate("/");
      }
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

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setTimeout(() => {
      navigate("/forgot-password");
    }, 1000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <Toaster />

      {tokenLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <span className="loading loading-bars loading-lg"></span>
          <p className="ml-4 text-gray-700">System is Loading. Please wait...</p>
        </div>
      )}

      {!tokenLoading && (
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome !
            </h1>
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
              {usernameError && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01M12 5a7 7 0 110 14 7 7 0 010-14z"
                    />
                  </svg>
                  {usernameError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={togglePasswordVisibility}
                >
                  {/* {showPassword ? (
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      xmlns="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.veryicon.com%2Ficons%2Fmiscellaneous%2Fmyfont%2Feye-open-4.html&psig=AOvVaw2S85k76xUXcc_syAsibl-K&ust=1739433320904000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCODY55zUvYsDFQAAAAAdAAAAABAE"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.823-.676 1.59-1.186 2.258M15 12a3 3 0 01-6 0 3 3 0 016 0zm-3 3c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm0 0c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm0 0c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      xmlns="https://www.google.com/imgres?q=close%20eye%20icon&imgurl=https%3A%2F%2Fbrandeps.com%2Ficon-download%2FE%2FEye-close-icon-vector-01.svg&imgrefurl=https%3A%2F%2Fbrandeps.com%2Ficon%2FE%2FEye-close-01&docid=lPS7s-YPj4pHwM&tbnid=m9sURFyJcCOiNM&vet=12ahUKEwjQjtSG1L2LAxUKwzgGHVW7GJAQM3oECHkQAA..i&w=800&h=800&hcb=2&ved=2ahUKEwjQjtSG1L2LAxUKwzgGHVW7GJAQM3oECHkQAA"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7 .274-.823.676-1.59 1.186-2.258M15 12a3 3 0 01-6 0 3 3 0 016 0zm-3 3c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm0 0c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm0 0c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"
                      />
                    </svg>
                  )} */}
                  {showPassword ? (
                    <div>
                      <FaEye/>
                    </div>
                  ) : (
                    <div>
                      <FaEyeSlash/>
                    </div>
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01M12 5a7 7 0 110 14 7 7 0 010-14z"
                    />
                  </svg>
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center"
                disabled={forgotLoading}
              >
                {forgotLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Forgot Password?"
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  <span className="ml-2">Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </button>
            <div className="flex justify-center gap-1 space-x-1">
              <h1 className="text-black">Don't have an account?</h1>
              <RouterLink to="/register" className="text-blue-600 hover:underline">
                Sign Up Here
              </RouterLink>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;