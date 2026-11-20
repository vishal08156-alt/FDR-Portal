
import React from "react";
import {
  // Keep your existing icons
  Bell
} from "lucide-react";
import {
  // Keep your existing icons
  IndianRupee
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  ListChecks,
  BarChart3,
  Settings,
  Landmark,
  X,
  CalendarClock
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard
  },
  {
  title: "Notifications",
  path: "/notifications",
  icon: Bell
},
  {
    title: "Upload FDR",
    path: "/upload-fdr",
    icon: Upload
  },
  {
    title: "Verification Queue",
    path: "/verification-queue",
    icon: ListChecks
  },
  {
    title: "Maturity & Renewal",
    path: "/maturity-management",
    icon: CalendarClock
  },
  {
    title: "Reports",
    path: "/reports",
    icon: BarChart3
  },
  {
  title: "FDR Release & Refund",
  path: "/release-management",
  icon: IndianRupee
},
  {
    title: "Settings",
    path: "/settings",
    icon: Settings
  }
];

function Sidebar({ isOpen, closeSidebar }) {
  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Landmark size={23} />
          </div>

          <div className="brand-text">
            <h2>FDR PORTAL</h2>
            <span>AICTE Management</span>
          </div>

          <button
            className="mobile-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} strokeWidth={2.5} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-icon">
            <Landmark size={17} />
          </div>

          <div>
            <strong>AICTE</strong>
            <span>Ministry of Education</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
