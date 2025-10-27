"use client";

import Link from "next/link";

const SettingsIcon = () => (
  <svg
    //xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function AdminPage() {

  const buttonStyle =
    "flex w-full items-center justify-center gap-3 rounded-lg border border-white/20 bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-xl font-medium text-white shadow-lg transition-all duration-300 hover:from-purple-500 hover:to-purple-700 hover:shadow-purple-500/30 active:scale-[0.98]";

  return (

    <main className="min-h-dvh bg-background text-foreground">
      { }
      <div className="mx-auto max-w-5xl p-6 py-10">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SettingsIcon />
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Admin Dashboard
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            Return to Homepage
          </Link>
        </header>

        {/* Admin Actions Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Link href="/admin/add-movie" className={buttonStyle}>
            { }
            <span>Add Movie</span>
          </Link>

          <Link href="/admin/edit-movie" className={buttonStyle}>
            <span>Edit Movie</span>
          </Link>

          <Link href="/admin/statistics" className={buttonStyle}>
            <span>System Statistics</span>
          </Link>

          <Link href="/admin/manage-users" className={buttonStyle}>
            <span>Manage Accounts</span>
          </Link>
        </section>
      </div>
    </main>
  );
}