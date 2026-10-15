"use client";

import Link from "next/link";
import {
  BookOpen,
  LogOut,
  Camera,
  User,
  ShieldCheck,
  Info,
} from "lucide-react";

export default function Settings() {
  return (
    <main className="min-h-screen px-6 py-12 text-zinc-800">
      <div className="mx-auto max-w-2xl">
        {/* Header Navigation and Logout */}
        <div className="mb-12 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-[#F5F1E6] transition-transform group-hover:scale-95">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black leading-none">Settings</h1>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Motif AI
              </p>
            </div>
          </Link>

          <Link href="/signin" className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-red-500 shadow-sm transition hover:bg-red-50">
            <LogOut size={16} />
            Logout
          </Link>
        </div>

        <div className="space-y-8">
          {/* Identity Section */}
          <section className="rounded-[2.5rem] border border-zinc-200 bg-white p-10 shadow-sm">
            <div className="mb-10 flex flex-col items-center sm:flex-row sm:gap-8">
              <div className="relative mb-4 sm:mb-0">
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-zinc-50 bg-zinc-100 shadow-inner"></div>

                {/* Button to Generate Avatar */}
                <button
                  type="button"
                  title="Generate new avatar"
                  className="absolute bottom-1 right-1 rounded-full bg-zinc-900 p-2 text-[#F5F1E6] shadow-xl transition hover:scale-110 active:scale-90"
                >
                  <Camera size={18} />
                </button>
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-black">Profile Identity</h2>
                <p className="text-sm font-medium text-zinc-400">
                  Manage how you appear to others.
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                  Click the camera button to generate a new avatar, then save
                  your changes.
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Full Name Input */}
              <div className="space-y-2">
                <label className="ml-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                  <User size={14} /> Legal Name
                </label>
                <input
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Bio Textarea */}
              <div className="space-y-2">
                <label className="ml-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                  <Info size={14} /> Short Bio
                </label>
                <textarea
                  className="w-full resize-none rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5"
                  placeholder="Tell us a little about your music and style..."
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="rounded-[2.5rem] border border-zinc-200 bg-white p-10 shadow-sm">
            <div className="mb-8">
              <h2 className="flex items-center gap-2 text-2xl font-black">
                Security
              </h2>
              <p className="text-sm font-medium text-zinc-400">
                Update your credentials to keep your account safe.
              </p>
            </div>

            <div className="grid gap-4">
              {/* New Password Input */}
              <div className="space-y-2">
                <label className="ml-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                  <ShieldCheck size={14} /> New Password
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 outline-none transition-all focus:border-zinc-900 focus:bg-white"
                />
              </div>

              {/* Confirm Password Input */}
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 outline-none transition-all focus:border-zinc-900 focus:bg-white"
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
