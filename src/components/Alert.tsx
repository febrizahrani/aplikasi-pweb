"use client";

import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

interface AlertProps {
  type: "success" | "error" | "info" | "warning";
  message: string;
  onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: <Info className="w-5 h-5 text-blue-500" />,
    },
  };

  const s = styles[type];

  return (
    <div className={`${s.bg} ${s.border} border rounded-lg p-4 flex items-start gap-3`}>
      {s.icon}
      <p className={`text-sm flex-1 ${s.text}`}>{message}</p>
      {onClose && (
        <button onClick={onClose} className={`${s.text} hover:opacity-70`}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
