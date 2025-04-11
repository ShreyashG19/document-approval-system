import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { toast, Toaster } from "react-hot-toast";
import { Role } from "../../utils/enums";
import { requestFCMToken } from "../../utils/firebaseUtils";
import { useNotifications } from "../contexts/NotificationContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });

  const { loggedInUser, setLoggedInUser } = useContext(AuthContext);
  const { fcmToken, setFcmToken } = useNotifications();
  const navigate = useNavigate();

  // Fetch FCM token on mount
  useEffect(() => {
    const fetchFCMToken = async () => {
      try {
        const deviceToken = await requestFCMToken();
        setFcmToken(deviceToken);
        console.log("FCM Token:", deviceToken);
      } catch (error) {
        console.error("FCM Token Error:", error);
        setTokenError(true);
        toast.error("Error getting notification token. Try again later.");
      } finally {
        setTokenLoading(false);
      }
    };
    fetchFCMToken();
  }, []);

  // Redirect if user is already logged in
  //! Make Routing neat and clean 
  const roleRoutes = {
    [Role.APPROVER]: "/MainPage/approver/dashboard",
    [Role.SENIOR_ASSISTANT]: "/MainPage/assistant/dashboard",
    [Role.ASSISTANT]: "/MainPage/assistant/dashboard",
    [Role.ADMIN]: "/MainPage/admin/dashboard",
  };

  // 🚀 Redirect if user is already logged in
  useEffect(() => {
    if (loggedInUser?.role) {
      navigate(roleRoutes[loggedInUser.role] || "/");
    }
  }, [loggedInUser, navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ username: "", password: "" });

    // Validation
    if (!username.trim())
      return (
        setErrors({ ...errors, username: "Username is required" }),
        setLoading(false)
      );
    if (/\s/.test(username))
      return (
        setErrors({ ...errors, username: "Username cannot include spaces" }),
        setLoading(false)
      );
    if (!password.trim())
      return (
        setErrors({ ...errors, password: "Password is required" }),
        setLoading(false)
      );
    if (/\s/.test(password))
      return (
        setErrors({ ...errors, password: "Password cannot include spaces" }),
        setLoading(false)
      );
    if (password.length < 8)
      return (
        setErrors({
          ...errors,
          password: "Password must be at least 8 characters",
        }),
        setLoading(false)
      );

    // API call
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, deviceToken: fcmToken }),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error((await response.json()).message);

      const result = await response.json();
      console.log('User: ',result);
      
      setLoggedInUser(result.user);
      setUsername("");
      setPassword("");

      toast.success("Login successful!", { position: "top-center" });

      // Redirect based on role
      navigate(
        {
          [Role.APPROVER]: "/approver/dashboard",
          [Role.SENIOR_ASSISTANT]: "/assistant/dashboard",
          [Role.ASSISTANT]: "/assistant/dashboard",
          [Role.ADMIN]: "/admin/dashboard",
        }[result.user.role] || "/"
      );
    } catch (error) {
      toast.error(error.message, { position: "top-center" });
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
          <p className="ml-4 text-gray-700">
            System is Loading. Please wait...
          </p>
        </div>
      )}
      {!tokenLoading && (
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <InputField
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
            />

            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={showPassword ? <FaEye /> : <FaEyeSlash />}
              onIconClick={() => setShowPassword(!showPassword)}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
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
          </form>
        </div>
      )}
    </div>
  );
};

// Reusable Input Component
const InputField = ({
  label,
  type,
  value,
  onChange,
  error,
  icon,
  onIconClick,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200"
      />
      {icon && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={onIconClick}
        >
          {icon}
        </button>
      )}
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default Login;
