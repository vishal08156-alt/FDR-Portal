
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function MainLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="app-layout">
      <Navbar
        onMenuClick={() => setIsOpen(!isOpen)}
      />

      <div className="layout-body">
        <Sidebar
          isOpen={isOpen}
          closeSidebar={() => setIsOpen(false)}
        />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
