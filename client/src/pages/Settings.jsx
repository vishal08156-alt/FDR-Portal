
import React, { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Users,
  ShieldCheck,
  Bell,
  Save,
  Plus,
  Trash2,
  UserRound,
  X
} from "lucide-react";

const SETTINGS_KEY = "aicte_fdr_portal_settings";
const USERS_KEY = "aicte_fdr_portal_users";

const defaultSettings = {
  portalName: "AICTE FDR Management Portal",
  organization: "All India Council for Technical Education",
  supportEmail: "",
  maturityReminder: true,
  verificationAlerts: true,
  releaseAlerts: true,
  renewalAlerts: true
};

function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(defaultSettings);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "Officer",
    institution: ""
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const savedSettings = JSON.parse(
        localStorage.getItem(SETTINGS_KEY) || "null"
      );
      const savedUsers = JSON.parse(
        localStorage.getItem(USERS_KEY) || "[]"
      );

      if (savedSettings) {
        setSettings({ ...defaultSettings, ...savedSettings });
      }

      if (Array.isArray(savedUsers)) {
        setUsers(savedUsers);
      }
    } catch {
      setSettings(defaultSettings);
      setUsers([]);
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setMessage("Portal settings saved successfully.");

    setTimeout(() => setMessage(""), 3000);
  };

  const updateSetting = (name, value) => {
    setSettings((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  };

  const openAddUser = () => {
    setEditingUserId(null);
    setUserForm({
      name: "",
      email: "",
      role: "Officer",
      institution: ""
    });
    setShowModal(true);
  };

  const openEditUser = (user) => {
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution || ""
    });
    setShowModal(true);
  };

  const handleUserInput = (e) => {
    const { name, value } = e.target;

    setUserForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSaveUser = (e) => {
    e.preventDefault();

    if (!userForm.name.trim() || !userForm.email.trim()) {
      alert("Please enter the user's name and email.");
      return;
    }

    const email = userForm.email.trim().toLowerCase();

    const duplicate = users.some(
      (user) =>
        user.email.toLowerCase() === email &&
        user.id !== editingUserId
    );

    if (duplicate) {
      alert("A user with this email already exists.");
      return;
    }

    if (editingUserId) {
      const updatedUsers = users.map((user) =>
        user.id === editingUserId
          ? { ...user, ...userForm, email }
          : user
      );

      saveUsers(updatedUsers);
    } else {
      const newUser = {
        id: `user-${Date.now()}`,
        ...userForm,
        email,
        status: "Active",
        createdAt: new Date().toISOString()
      };

      saveUsers([...users, newUser]);
    }

    setShowModal(false);
    setEditingUserId(null);
  };

  const toggleUserStatus = (userId) => {
    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            status: user.status === "Active" ? "Inactive" : "Active"
          }
        : user
    );

    saveUsers(updatedUsers);
  };

  const deleteUser = (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    saveUsers(users.filter((user) => user.id !== userId));
  };

  return (
    <div className="settings-page">
      <div className="settings-heading">
        <div>
          <h1>Settings & User Management</h1>
          <p>Manage portal configuration, users and preferences.</p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <button
            className={activeTab === "general" ? "active" : ""}
            onClick={() => setActiveTab("general")}
          >
            <SettingsIcon size={18} />
            General Settings
          </button>

          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            <Users size={18} />
            User Management
          </button>

          <button
            className={activeTab === "roles" ? "active" : ""}
            onClick={() => setActiveTab("roles")}
          >
            <ShieldCheck size={18} />
            Roles & Permissions
          </button>

          <button
            className={activeTab === "notifications" ? "active" : ""}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={18} />
            Notifications
          </button>
        </aside>

        <main className="settings-content">

          {activeTab === "general" && (
            <section>
              <div className="settings-section-heading">
                <h2>General Portal Settings</h2>
                <p>Configure the basic portal information.</p>
              </div>

              <div className="settings-form">
                <label>Portal Name</label>
                <input
                  value={settings.portalName}
                  onChange={(e) =>
                    updateSetting("portalName", e.target.value)
                  }
                />

                <label>Organization Name</label>
                <input
                  value={settings.organization}
                  onChange={(e) =>
                    updateSetting("organization", e.target.value)
                  }
                />

                <label>Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) =>
                    updateSetting("supportEmail", e.target.value)
                  }
                  placeholder="Enter official support email"
                />

                <button className="settings-save-btn" onClick={saveSettings}>
                  <Save size={17} />
                  Save Settings
                </button>

                {message && (
                  <p className="settings-success-message">{message}</p>
                )}
              </div>
            </section>
          )}

          {activeTab === "users" && (
            <section>
              <div className="settings-section-heading users-heading">
                <div>
                  <h2>User Management</h2>
                  <p>Add, edit, activate or deactivate portal users.</p>
                </div>

                <button className="add-user-btn" onClick={openAddUser}>
                  <Plus size={18} />
                  Add User
                </button>
              </div>

              <div className="user-count">
                <Users size={19} />
                <span>Total Registered Users: <strong>{users.length}</strong></span>
              </div>

              <div className="settings-table-wrapper">
                <table className="settings-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Institution</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="settings-empty">
                          No users added yet. Click Add User to create one.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="settings-user-name">
                              <UserRound size={17} />
                              {user.name}
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>{user.institution || "-"}</td>
                          <td>
                            <span
                              className={`user-status ${
                                user.status === "Active"
                                  ? "user-active"
                                  : "user-inactive"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td>
                            <div className="user-actions">
                              <button onClick={() => openEditUser(user)}>
                                Edit
                              </button>
                              <button
                                onClick={() => toggleUserStatus(user.id)}
                              >
                                {user.status === "Active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                              <button
                                className="delete-user-btn"
                                onClick={() => deleteUser(user.id)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "roles" && (
            <section>
              <div className="settings-section-heading">
                <h2>Roles & Permissions</h2>
                <p>
                  Reference permissions planned for the portal.
                </p>
              </div>

              <div className="role-list">
                <div className="role-card">
                  <div className="role-card-heading">
                    <ShieldCheck size={22} />
                    <h3>Administrator</h3>
                  </div>
                  <p>Full portal administration and configuration access.</p>
                  <ul>
                    <li>Manage users and roles</li>
                    <li>View all institution records</li>
                    <li>Review and verify FDRs</li>
                    <li>Manage maturity and release workflows</li>
                    <li>View and export reports</li>
                    <li>Configure portal settings</li>
                  </ul>
                </div>

                <div className="role-card">
                  <div className="role-card-heading">
                    <Users size={22} />
                    <h3>Officer</h3>
                  </div>
                  <p>Operational access for assigned FDR management tasks.</p>
                  <ul>
                    <li>View assigned FDR records</li>
                    <li>Review submitted documents</li>
                    <li>Update verification workflow</li>
                    <li>Manage maturity and release records</li>
                    <li>View permitted reports</li>
                  </ul>
                </div>

                <div className="role-card">
                  <div className="role-card-heading">
                    <UserRound size={22} />
                    <h3>Viewer</h3>
                  </div>
                  <p>Read-only access to permitted portal information.</p>
                  <ul>
                    <li>View permitted FDR records</li>
                    <li>View dashboards</li>
                    <li>View permitted reports</li>
                    <li>No record modification</li>
                  </ul>
                </div>
              </div>

              <p className="settings-note">
                These are planned role definitions. Actual access restrictions
                must be enforced by the backend before production use.
              </p>
            </section>
          )}

          {activeTab === "notifications" && (
            <section>
              <div className="settings-section-heading">
                <h2>Notification Preferences</h2>
                <p>Choose which alerts should be generated by the portal.</p>
              </div>

              <div className="notification-preferences">
                {[
                  {
                    key: "maturityReminder",
                    title: "Maturity Reminders",
                    description: "Alerts for FDRs approaching maturity."
                  },
                  {
                    key: "verificationAlerts",
                    title: "Verification Alerts",
                    description: "Alerts for FDRs awaiting verification."
                  },
                  {
                    key: "renewalAlerts",
                    title: "Renewal Alerts",
                    description: "Alerts for upcoming renewal decisions."
                  },
                  {
                    key: "releaseAlerts",
                    title: "Release Alerts",
                    description: "Alerts for matured FDRs awaiting release."
                  }
                ].map((item) => (
                  <label className="preference-item" key={item.key}>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>

                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={(e) =>
                        updateSetting(item.key, e.target.checked)
                      }
                    />
                  </label>
                ))}

                <button className="settings-save-btn" onClick={saveSettings}>
                  <Save size={17} />
                  Save Preferences
                </button>

                {message && (
                  <p className="settings-success-message">{message}</p>
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {showModal && (
        <div className="settings-modal-overlay">
          <div className="settings-modal">
            <div className="settings-modal-heading">
              <div>
                <h2>{editingUserId ? "Edit User" : "Add New User"}</h2>
                <p>Enter the user's portal details.</p>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <label>Full Name</label>
              <input
                name="name"
                value={userForm.name}
                onChange={handleUserInput}
                placeholder="Enter full name"
                required
              />

              <label>Email Address</label>
              <input
                name="email"
                type="email"
                value={userForm.email}
                onChange={handleUserInput}
                placeholder="Enter email address"
                required
              />

              <label>Role</label>
              <select
                name="role"
                value={userForm.role}
                onChange={handleUserInput}
              >
                <option value="Administrator">Administrator</option>
                <option value="Officer">Officer</option>
                <option value="Viewer">Viewer</option>
              </select>

              <label>Institution</label>
              <input
                name="institution"
                value={userForm.institution}
                onChange={handleUserInput}
                placeholder="Enter institution name (optional)"
              />

              <button className="settings-save-btn" type="submit">
                <Save size={17} />
                {editingUserId ? "Update User" : "Create User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
