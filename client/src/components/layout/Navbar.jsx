
import React, { useState } from "react";
import {
  User,
  ChevronDown,
  Menu,
  ShieldCheck
} from "lucide-react";

function Navbar({ onMenuClick }) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          className="menu-toggle"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={23} />
        </button>

        <div className="navbar-logo">
          <ShieldCheck size={20} />
        </div>

        <h2>FDR PORTAL</h2>

        <span className="navbar-description">
          AI-Powered Fixed Deposit Receipt Verification System
        </span>
      </div>

      <div className="navbar-right">
        <div className="profile-container">
          <button
            className="profile-button"
            onClick={() => setShowProfile(!showProfile)}
          >
            <User size={17} />
            <span>AICTE Verification Officer</span>
            <ChevronDown size={15} />
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <strong>AICTE Officer</strong>
              <span>Verification Department</span>

              <hr />

              <button
                onClick={() => setShowProfile(false)}
              >
                Close Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
