import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function MainLayout() {
  return (
    <div
      className="flex h-screen overflow-hidden font-sans"
      style={{
        background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 40%, #f0fdf4 100%)',
      }}
    >
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header />
        <div className="flex-1 overflow-auto pt-5 px-3 md:px-6 pb-6">
          <div className="max-w-[1400px] mx-auto page-enter">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
