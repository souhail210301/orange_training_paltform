import React from 'react';

const AdminNavbar = () => {
  return (
    <nav className="w-full bg-white flex items-center justify-between px-8 py-3 shadow-sm">
      {/* Logo and title */}
      <div className="flex items-center gap-2">
        <img src="/certif_logo.png" alt="Certif Logo" className="h-10 w-auto" />
      </div>
      {/* Search bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-lg">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
          </span>
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>
      {/* Notification and profile */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <div className="relative">
          <button className="bg-white rounded-full p-2 shadow hover:bg-gray-100">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          {/* Red dot */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
        {/* Profile icon */}
        <div className="bg-orange-500 rounded-full p-2 flex items-center justify-center">
          <img src="/avatar.png" alt="Profile" className="h-7 w-7 object-contain" />
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
