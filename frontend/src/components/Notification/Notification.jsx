import React, { useEffect, useState } from "react";
import { FiAlertTriangle, FiCheck, FiSearch } from "react-icons/fi";

export default function Notification({
  title = "Notification",
  message,
  onClose,
  duration = 3000,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);

    const autoDismiss = setTimeout(() => handleClose(), duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoDismiss);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`
        relative flex w-85 rounded-xs shadow-lg bg-[#12131A] text-white overflow-hidden
        transform transition-all duration-300 ease-in-out border border-[#404350]
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >

      <div className="flex-1 p-3">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-sm">{title}</h4>
          <button
            onClick={handleClose}
            className="ml-2 text-gray-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-gray-300 mt-1">{message}</p>
      </div>
    </div>
  );
}