import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { Role, FileStatus } from "../../utils/enums";
import {
  Bell, CheckCircle, XCircle, AlertCircle, ArrowLeft, Inbox,
} from "lucide-react";

const fmt = (d) =>
  new Date(d).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const styles = {
  [FileStatus.APPROVED]: { bg: "bg-emerald-50", iBg: "bg-emerald-100", iC: "text-emerald-600", b: "border-emerald-200", Icon: CheckCircle },
  [FileStatus.REJECTED]: { bg: "bg-red-50", iBg: "bg-red-100", iC: "text-red-600", b: "border-red-200", Icon: XCircle },
  [FileStatus.CORRECTION]: { bg: "bg-amber-50", iBg: "bg-amber-100", iC: "text-amber-600", b: "border-amber-200", Icon: AlertCircle },
};
const def = { bg: "bg-blue-50", iBg: "bg-blue-100", iC: "text-blue-600", b: "border-blue-200", Icon: Bell };

const Notifications = () => {
  const { notifications, markAllAsRead } = useNotifications();
  const { loggedInUser } = useAuth();
  const nav = useNavigate();

  const goBack = () => {
    const r = loggedInUser?.role;
    nav(r === Role.APPROVER ? "/dashboard/approver" : r === Role.ADMIN ? "/dashboard/admin" : "/dashboard/assistant");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
            <p className="text-sm text-slate-500 mt-0.5">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {notifications.length > 0 && (
          <button onClick={markAllAsRead} className="px-4 py-2 rounded-xl text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
            Mark all as read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4"><Inbox className="w-8 h-8 text-slate-300" /></div>
          <p className="text-lg font-medium text-slate-500">All caught up!</p>
          <p className="text-sm mt-1">No new notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const s = styles[n.type] || def;
            return (
              <div key={n._id} className={`flex items-start gap-4 p-4 rounded-2xl ${s.bg} border ${s.b} hover:shadow-sm transition-all`}>
                <div className={`w-10 h-10 rounded-xl ${s.iBg} ${s.iC} flex items-center justify-center flex-shrink-0`}>
                  <s.Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-800">{n.title}</h3>
                  <p className="text-sm text-slate-600 mt-0.5">{n.body}</p>
                  <p className="text-xs text-slate-400 mt-2">{fmt(n.date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
