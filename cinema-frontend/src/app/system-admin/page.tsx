"use client";

import Link from "next/link";
import "./system-admin.css";

const SettingsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon-settings"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function AdminPage() {
  const buttonStyle = "btn-admin-action";

  return (
    <main className="admin-main">
      <div className="admin-wrapper">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <SettingsIcon />
            <h1 className="header-title">Admin Dashboard</h1>
          </div>
          <Link href="/" className="btn-return-home">
            Return to Homepage
          </Link>
        </header>

        {/* Admin Actions Grid */}
        <section className="admin-grid">
          <Link href="/system-admin/add-movie" className={buttonStyle}>
            <span>Add Movie</span>
          </Link>

          <Link href="/system-admin/edit-movie" className={buttonStyle}>
            <span>Edit Movie</span>
          </Link>

          <Link href="/system-admin/schedule-movie" className={buttonStyle}>
            <span>Schedule Movie</span>
          </Link>

          <Link href="/system-admin/statistics" className={buttonStyle}>
            <span>System Statistics</span>
          </Link>

          <Link href="/system-admin/manage-users" className={buttonStyle}>
            <span>Manage Accounts</span>
          </Link>

          <Link href="/system-admin/promotions" className={buttonStyle}>
            <span>Manage Promotions</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
