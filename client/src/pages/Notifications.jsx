
import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarClock,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Check,
  CheckCheck,
  Filter
} from "lucide-react";

import { getFDRs } from "../services/fdrService";

const READ_STORAGE_KEY = "aicte_fdr_read_notifications";

function getDaysRemaining(dateValue) {
  if (!dateValue) return null;

  const maturity = new Date(dateValue + "T00:00:00");

  if (Number.isNaN(maturity.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil(
    (maturity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function buildNotifications(records) {
  const notifications = [];

  records.forEach((record) => {
    const institution = record.institutionName || "Unknown institution";
    const fdrNumber = record.fdrNumber || "Unknown FDR";
    const days = getDaysRemaining(record.maturityDate);
    const verification = record.verificationStatus || "Pending";
    const release = record.releaseStatus || "Pending";

    const addNotification = (type, title, message, priority) => {
      notifications.push({
        id: `${type}-${record.id}`,
        type,
        title,
        message,
        priority,
        institution,
        fdrNumber,
        recordId: record.id
      });
    };

    // Verification pending
    if (verification === "Pending") {
      addNotification(
        "verification",
        "Verification Pending",
        `${fdrNumber} submitted by ${institution} is awaiting verification.`,
        "High"
      );
    }

    // Maturity reminders
    if (days !== null && days >= 0 && days <= 30) {
      let reminder = "Upcoming maturity";

      if (days <= 7) reminder = "Maturity within 7 days";
      else if (days <= 15) reminder = "Maturity within 15 days";

      addNotification(
        "maturity",
        reminder,
        `${fdrNumber} belonging to ${institution} matures in ${days} day(s).`,
        days <= 7 ? "High" : "Medium"
      );
    }

    // Matured FDR not yet released
    if (days !== null && days < 0 && release !== "Released") {
      addNotification(
        "overdue",
        "Matured FDR Awaiting Release",
        `${fdrNumber} belonging to ${institution} matured ${Math.abs(days)} day(s) ago and has not been released.`,
        "High"
      );
    }

    // Renewal reminder for upcoming maturity
    if (
      days !== null &&
      days >= 0 &&
      days <= 30 &&
      record.renewalStatus !== "Renewed" &&
      record.renewalStatus !== "Not Renewed"
    ) {
      addNotification(
        "renewal",
        "Renewal Action Required",
        `${fdrNumber} belonging to ${institution} needs a renewal decision.`,
        "Medium"
      );
    }

    // Release processing alert
    if (days !== null && days < 0 && release === "Processing") {
      addNotification(
        "release",
        "Release Processing",
        `Release details for ${fdrNumber} belonging to ${institution} are still being processed.`,
        "Medium"
      );
    }
  });

  return notifications;
}

function Notifications() {
  const [records, setRecords] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("All");

  const loadRecords = () => {
    setRecords(getFDRs());
  };

  useEffect(() => {
    loadRecords();

    window.addEventListener("fdr-records-updated", loadRecords);
    window.addEventListener("storage", loadRecords);

    return () => {
      window.removeEventListener("fdr-records-updated", loadRecords);
      window.removeEventListener("storage", loadRecords);
    };
  }, []);

  const notifications = useMemo(
    () => buildNotifications(records),
    [records]
  );

  const unreadCount = notifications.filter(
    (item) => !readIds.includes(item.id)
  ).length;

  const filteredNotifications = notifications.filter((item) => {
    const matchesCategory = filter === "All" || item.type === filter;

    const isRead = readIds.includes(item.id);

    const matchesView =
      view === "All" ||
      (view === "Unread" && !isRead) ||
      (view === "Read" && isRead);

    return matchesCategory && matchesView;
  });

  const saveReadIds = (updatedIds) => {
    setReadIds(updatedIds);
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(updatedIds));
  };

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      saveReadIds([...readIds, id]);
    }
  };

  const markAsUnread = (id) => {
    saveReadIds(readIds.filter((item) => item !== id));
  };

  const markAllAsRead = () => {
    saveReadIds([
      ...new Set([...readIds, ...notifications.map((item) => item.id)])
    ]);
  };

  const getIcon = (type) => {
    const icons = {
      verification: ShieldCheck,
      maturity: CalendarClock,
      overdue: AlertTriangle,
      renewal: RefreshCw,
      release: Clock
    };

    return icons[type] || Bell;
  };

  const getPriorityClass = (priority) => {
    return priority === "High" ? "notification-high" : "notification-medium";
  };

  return (
    <div className="notifications-page">
      <div className="notifications-heading">
        <div>
          <h1>Notifications & Alerts</h1>
          <p>Monitor important FDR events and pending actions.</p>
        </div>

        <div className="notification-count">
          <Bell size={19} />
          <span>{unreadCount} unread</span>
        </div>
      </div>

      <div className="notification-summary">
        <div className="notification-stat">
          <div className="notification-stat-icon">
            <Bell size={21} />
          </div>
          <div>
            <p>Total Alerts</p>
            <h2>{notifications.length}</h2>
          </div>
        </div>

        <div className="notification-stat">
          <div className="notification-stat-icon unread-stat">
            <AlertTriangle size={21} />
          </div>
          <div>
            <p>Unread Alerts</p>
            <h2>{unreadCount}</h2>
          </div>
        </div>

        <div className="notification-stat">
          <div className="notification-stat-icon read-stat">
            <CheckCircle size={21} />
          </div>
          <div>
            <p>Read Alerts</p>
            <h2>{notifications.length - unreadCount}</h2>
          </div>
        </div>
      </div>

      <div className="notifications-panel">
        <div className="notifications-toolbar">
          <div>
            <h2>Alert Centre</h2>
            <p>Notifications are generated from your current FDR records.</p>
          </div>

          <button
            className="mark-all-btn"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={17} />
            Mark All as Read
          </button>
        </div>

        <div className="notifications-filters">
          <div className="notification-filter-label">
            <Filter size={17} />
            Filter:
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="verification">Verification</option>
            <option value="maturity">Maturity</option>
            <option value="overdue">Overdue</option>
            <option value="renewal">Renewal</option>
            <option value="release">Release</option>
          </select>

          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option value="All">All Notifications</option>
            <option value="Unread">Unread Only</option>
            <option value="Read">Read Only</option>
          </select>
        </div>

        <div className="notification-list">
          {filteredNotifications.length === 0 ? (
            <div className="notification-empty">
              <CheckCircle size={38} />
              <h3>No notifications found</h3>
              <p>There are no alerts matching your selected filters.</p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const Icon = getIcon(item.type);
              const isRead = readIds.includes(item.id);

              return (
                <div
                  className={`notification-item ${isRead ? "is-read" : "is-unread"}`}
                  key={item.id}
                >
                  <div className={`notification-icon notification-${item.type}`}>
                    <Icon size={21} />
                  </div>

                  <div className="notification-content">
                    <div className="notification-title-row">
                      <h3>{item.title}</h3>
                      <span className={`notification-priority ${getPriorityClass(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>

                    <p>{item.message}</p>

                    <div className="notification-meta">
                      <span>{item.institution}</span>
                      <span>FDR: {item.fdrNumber}</span>
                    </div>
                  </div>

                  <div className="notification-item-action">
                    {isRead ? (
                      <button onClick={() => markAsUnread(item.id)}>
                        Mark Unread
                      </button>
                    ) : (
                      <button onClick={() => markAsRead(item.id)}>
                        <Check size={16} />
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="notifications-footer">
          Showing {filteredNotifications.length} of {notifications.length} alerts
        </div>
      </div>
    </div>
  );
}

export default Notifications;
