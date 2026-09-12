"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Download,
  FileSpreadsheet,
  Settings,
  LogOut,
  RefreshCw,
  Clock,
  Shield,
  Menu,
  X,
  ExternalLink,
} from "lucide-react"
import { SiteLogo } from "@/components/shared/site-logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/ui/button"
import { useAdmin } from "./admin-context"

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usage", label: "Tool Usage", icon: BarChart3 },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/reports", label: "Reports", icon: FileSpreadsheet },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isRefreshing, triggerRefresh, autoRefresh, setAutoRefresh } = useAdmin()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // If on login page, render clean login view without admin shell
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" })
      router.push("/admin/login")
      router.refresh()
    } catch {
      router.push("/admin/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 transition-colors">
      {/* ============================================================ */}
      {/* TOP HEADER: BRANDING, ACTIONS & CONTROLS */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F1422]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Left: Brand Logo & Admin Badge */}
            <div className="flex items-center gap-2.5 shrink-0">
              <SiteLogo href="/admin/dashboard" />
              <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                Admin
              </span>
            </div>

            {/* Middle: Desktop Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right: Actions (Refresh, Auto-refresh, Theme, Logout) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Refresh Data Button with Loading State */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerRefresh()}
                disabled={isRefreshing}
                className="h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10"
                title="Refresh Analytics Data"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-violet-600 dark:text-violet-400 sm:mr-1.5 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                <span className="hidden sm:inline">
                  {isRefreshing ? "◌ Refreshing..." : "Refresh Data"}
                </span>
              </Button>

              {/* Auto Refresh Dropdown */}
              <div className="hidden lg:flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 h-8">
                <Clock className="w-3 h-3 text-slate-400 mr-1.5" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1 font-medium">Auto:</span>
                <select
                  value={autoRefresh}
                  onChange={(e) => setAutoRefresh(Number(e.target.value))}
                  className="bg-transparent text-[11px] font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                  aria-label="Auto Refresh Interval"
                >
                  <option value={0} className="bg-white dark:bg-slate-900">Off</option>
                  <option value={30} className="bg-white dark:bg-slate-900">30 sec</option>
                  <option value={60} className="bg-white dark:bg-slate-900">1 min</option>
                  <option value={300} className="bg-white dark:bg-slate-900">5 min</option>
                </select>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* View Public Site */}
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden xl:flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-md"
                title="Open Public Turnivo Site in New Tab"
              >
                <span>Live Site</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="h-8 px-2 sm:px-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold rounded-lg"
                title="Sign out of Admin"
              >
                <LogOut className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE NAVIGATION DRAWER */}
        {/* ============================================================ */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F1422] px-4 py-3 space-y-1.5 animate-in slide-in-from-top-2 duration-150">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                    isActive
                      ? "bg-violet-500/10 text-violet-700 dark:text-violet-300 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs px-2">
              <span className="text-slate-500">Auto Refresh:</span>
              <select
                value={autoRefresh}
                onChange={(e) => setAutoRefresh(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value={0} className="bg-white dark:bg-slate-900">Off</option>
                <option value={30} className="bg-white dark:bg-slate-900">30 sec</option>
                <option value={60} className="bg-white dark:bg-slate-900">1 min</option>
                <option value={300} className="bg-white dark:bg-slate-900">5 min</option>
              </select>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 bg-white/50 dark:bg-transparent py-4 text-center text-xs text-slate-500 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">TURNIVO Product Analytics</span>
          </div>
          <p className="text-[11px]">
            Server Timezone: UTC • Display: Admin Local / IST • Authorized Admin: smrtx.sumit@gmail.com
          </p>
        </div>
      </footer>
    </div>
  )
}
