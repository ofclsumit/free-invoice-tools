"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

interface AdminContextValue {
  refreshKey: number
  isRefreshing: boolean
  triggerRefresh: () => Promise<void>
  autoRefresh: number // 0 (off), 30, 60, 300 seconds
  setAutoRefresh: (val: number) => void
  setIsRefreshing: (val: boolean) => void
}

const AdminContext = createContext<AdminContextValue>({
  refreshKey: 0,
  isRefreshing: false,
  triggerRefresh: async () => {},
  autoRefresh: 0,
  setAutoRefresh: () => {},
  setIsRefreshing: () => {},
})

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(0) // Default: Off (0)

  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setRefreshKey((prev) => prev + 1)
    // Small settling delay for smooth UI feedback
    setTimeout(() => {
      setIsRefreshing(false)
    }, 450)
  }, [])

  // Auto-refresh interval handling
  useEffect(() => {
    if (!autoRefresh || autoRefresh <= 0) return

    const timer = setInterval(() => {
      triggerRefresh()
    }, autoRefresh * 1000)

    return () => clearInterval(timer)
  }, [autoRefresh, triggerRefresh])

  return (
    <AdminContext.Provider
      value={{
        refreshKey,
        isRefreshing,
        triggerRefresh,
        autoRefresh,
        setAutoRefresh,
        setIsRefreshing,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}
