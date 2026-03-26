import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import toast from "react-hot-toast";
import { ArrowLeft, Lock, Loader2, Eye, EyeOff } from "lucide-react";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState({ c: false, n: false, cf: false });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!current) e.current = "Required";
    if (!newPw) e.newPw = "Required";
    else if (newPw.length < 8) e.newPw = "Min 8 characters";
    else if (!/[A-Z]/.test(newPw)) e.newPw = "Need uppercase letter";
    else if (!/[a-z]/.test(newPw)) e.newPw = "Need lowercase letter";
    else if (!/[0-9]/.test(newPw)) e.newPw = "Need a number";
    else if (!/[!@#$%^&*]/.test(newPw)) e.newPw = "Need special char";
    if (!confirm) e.confirm = "Required";
    else if (confirm !== newPw) e.confirm = "Passwords don't match";
    if (current && newPw && current === newPw) e.newPw = "Must differ from current";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await userService.changePassword(current, newPw);
      toast.success("Password changed!");
      navigate("/profile");
    } catch (err) {
      if (err.response?.status === 400) setErrors((p) => ({ ...p, current: "Incorrect password" }));
      else toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const PwField = ({ label, value, onChange, errKey, showKey }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-600 mb-1.5">{label}</label>
      <div className="relative">
        <input type={show[showKey] ? "text" : "password"} value={value} onChange={onChange} required
          className={`w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 border text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${errors[errKey] ? "border-red-300 text-red-800" : "border-slate-200 text-slate-800 focus:border-blue-300"}`} />
        <button type="button" onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {errors[errKey] && <p className="text-red-500 text-xs mt-1">{errors[errKey]}</p>}
    </div>
  );

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <button onClick={() => navigate("/profile")} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Change Password</h1>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <PwField label="Current Password" value={current} onChange={(e) => setCurrent(e.target.value)} errKey="current" showKey="c" />
          <PwField label="New Password" value={newPw} onChange={(e) => setNewPw(e.target.value)} errKey="newPw" showKey="n" />
          <PwField label="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} errKey="confirm" showKey="cf" />
          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Changing...</> : <><Lock className="w-4 h-4" /> Change Password</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
