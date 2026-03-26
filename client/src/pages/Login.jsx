import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { authService } from "../services/authService";
import { requestFCMToken } from "../../utils/firebaseUtils";
import { Role } from "../../utils/enums";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";

const roleRoutes = {
  [Role.APPROVER]: "/dashboard/approver",
  [Role.SENIOR_ASSISTANT]: "/dashboard/assistant",
  [Role.ASSISTANT]: "/dashboard/assistant",
  [Role.ADMIN]: "/dashboard/admin",
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const fcmFetched = useRef(false);

  const { loggedInUser, setLoggedInUser } = useAuth();
  const { fcmToken, setFcmToken } = useNotifications();
  const navigate = useNavigate();

  // Fetch FCM token once (blocking, shows loading screen)
  useEffect(() => {
    if (fcmFetched.current) return;
    fcmFetched.current = true;

    const fetchToken = async () => {
      try {
        const token = await requestFCMToken();
        setFcmToken(token);
        console.log("FCM Token:", token);
      } catch (err) {
        console.error("FCM Token Error:", err);
        toast.error("Error getting notification token. Try again later.");
      } finally {
        setTokenLoading(false);
      }
    };

    fetchToken();
  }, [setFcmToken]);



  const validate = () => {
    const newErrors = { username: "", password: "" };
    if (!username.trim()) newErrors.username = "Username is required";
    else if (/\s/.test(username))
      newErrors.username = "Username cannot include spaces";
    if (!password.trim()) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await authService.login({
        username,
        password,
        deviceToken: fcmToken,
      });

      // Backend returns: { status, message, data: { user, token } }
      const { user, token } = result.data;
      localStorage.setItem("token", token);
      // Update auth state before navigating so AuthGuard sees isAuthenticated=true
      setLoggedInUser(user);
      toast.success("Login successful!");
      navigate(roleRoutes[user.role] || "/dashboard", { replace: true });
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-4 relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {tokenLoading ? (
        <div className="flex flex-col items-center justify-center z-50 relative">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-blue-200/70 text-lg">
            System is Loading. Please wait...
          </p>
        </div>
      ) : (
        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              DocApproval
            </h1>
            <p className="text-blue-200/60 text-sm mt-1">
              Document Approval System
            </p>
          </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-blue-200/50 text-sm mt-2">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-blue-100/70 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-white/10 transition-all outline-none"
              />
              {errors.username && (
                <p className="text-red-400 text-xs mt-1.5">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-100/70 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-white/10 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2025 Document Approval System
        </p>
      </div>
      )}
    </div>
  );
};

export default Login;
