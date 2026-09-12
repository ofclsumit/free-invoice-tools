"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Settings,
  Shield,
  Power,
  Clock,
  Database,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/shared/loading/skeleton"
import { useAdmin } from "@/components/admin/admin-context"

interface AuditLogItem {
  id: string
  action: string
  adminEmail: string
  details?: string | null
  ipAddress?: string | null
  createdAt: string
}

export default function AdminSettingsPage() {
  const { refreshKey } = useAdmin()

  const [adminEmail, setAdminEmail] = useState("smrtx.sumit@gmail.com")
  const [trackingActive, setTrackingActive] = useState(true)
  const [timezone, setTimezone] = useState("Asia/Kolkata")
  const [retentionDays, setRetentionDays] = useState<number | "indefinite">("indefinite")
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState(false)

  const fetchSettings = useCallback(async () => {
    setError(false)
    try {
      const res = await fetch("/api/admin/settings")
      if (!res.ok) throw new Error("Failed to fetch settings")
      const data = await res.json()

      if (data.adminEmail) setAdminEmail(data.adminEmail)
      setTrackingActive(data.trackingActive ?? true)
      if (data.timezone) setTimezone(data.timezone)
      setRetentionDays(data.retentionDays || "indefinite")
      setAuditLogs(data.auditLogs || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings, refreshKey])

  const handleSaveSettings = async (overrideTracking?: boolean) => {
    setSaving(true)
    setSaveSuccess(false)

    const newTracking = typeof overrideTracking === "boolean" ? overrideTracking : trackingActive

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingActive: newTracking,
          timezone,
          retentionDays: retentionDays === "indefinite" ? null : Number(retentionDays),
        }),
      })

      if (!res.ok) throw new Error("Failed to save")

      if (typeof overrideTracking === "boolean") {
        setTrackingActive(overrideTracking)
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      fetchSettings()
    } catch {
      alert("Failed to save settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleKillswitch = () => {
    const nextState = !trackingActive
    handleSaveSettings(nextState)
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold uppercase tracking-wider mb-1.5">
          <Settings className="w-3.5 h-3.5" />
          <span>System & Controls</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Admin Settings & Audit Log
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage telemetry collection, system killswitch, timezone preferences, and view administrative audit trails.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved and applied successfully.</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: GLOBAL KILLSWITCH & TELEMETRY STATUS */}
        <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  trackingActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}
              >
                <Power className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Global Analytics Killswitch
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instantly toggle telemetry recording on or off
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                trackingActive
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
              }`}
            >
              {trackingActive ? "Active" : "Disabled"}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-white/2 p-3.5 rounded-xl border border-slate-100 dark:border-white/5">
            When disabled, all public tool events (opens, calculations, previews, and PDF downloads) are discarded without logging. Existing historical data remains intact.
          </p>

          <Button
            onClick={handleToggleKillswitch}
            disabled={saving || loading}
            className={`w-full h-10 rounded-xl font-bold text-xs shadow-sm gap-2 cursor-pointer ${
              trackingActive
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            <span>
              {trackingActive ? "Disable Analytics Tracking" : "Enable Analytics Tracking"}
            </span>
          </Button>
        </div>

        {/* CARD 2: ADMIN PROFILE & SECURITY */}
        <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Admin Account & Security
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorized administrator identity
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Authorized Admin Email
              </label>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {adminEmail}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Password Security
              </label>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Managed via deployment environment secret / Supabase Auth (never stored in plaintext)</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Strict server-side authorization active</span>
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: TIMEZONE & RETENTION CONFIGURATION */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Reporting Timezone & Data Retention
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure regional aggregation and event retention policies
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Timezone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Report Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-medium outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
              </select>
            </div>

            {/* Retention */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Analytics Data Retention
              </label>
              <select
                value={retentionDays}
                onChange={(e) =>
                  setRetentionDays(
                    e.target.value === "indefinite" ? "indefinite" : Number(e.target.value)
                  )
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-medium outline-none"
              >
                <option value="indefinite">Keep Indefinitely (Recommended)</option>
                <option value="365">1 Year (365 Days)</option>
                <option value="180">6 Months (180 Days)</option>
                <option value="90">90 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => handleSaveSettings()}
              disabled={saving}
              className="h-9 px-4 rounded-xl font-bold text-xs bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              <span>Save System Settings</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* AUDIT LOG TABLE */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Admin Audit Trail
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Last 30 days of administrator actions
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No audit records logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-2.5">Action</th>
                  <th className="pb-2.5">Admin</th>
                  <th className="pb-2.5">IP Address</th>
                  <th className="pb-2.5">Details</th>
                  <th className="pb-2.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="py-2.5 text-slate-500 font-mono text-[11px]">{log.adminEmail}</td>
                    <td className="py-2.5 text-slate-500 font-mono text-[11px]">{log.ipAddress || "127.0.0.1"}</td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {log.details || "—"}
                    </td>
                    <td className="py-2.5 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
