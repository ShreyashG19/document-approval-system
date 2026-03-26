import React from "react";
import { Loader2 } from "lucide-react";

const LoadingScreen = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin relative z-10" />
        </div>
        <p className="text-blue-200/80 text-sm font-medium tracking-wide animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
