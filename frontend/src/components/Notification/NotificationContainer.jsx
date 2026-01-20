import React from "react";
import Notification from "./Notification";

export default function NotificationContainer({ notifications, removeNotification }) {
  return (
    <div className="fixed top-4 right-4 flex flex-col gap-3 z-[9999]">      {notifications.slice().reverse().map((n) => (
      <Notification
        key={n.id}
        variant={n.variant}
        message={n.message}
        title={n.title}
        icon={n.icon}
        onClose={() => removeNotification(n.id)}
      />
    ))}
    </div>
  );
}