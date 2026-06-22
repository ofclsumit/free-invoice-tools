"use client"

import { useState, useEffect, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
    setIsLoaded(true)
  }, [key])

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return { value: storedValue, setValue, removeValue, isLoaded }
}

export interface SavedDocument {
  id: string
  type: string
  title: string
  data: Record<string, unknown>
  createdAt: string
  updatedAt: string
  status?: string
}

export interface SavedCustomer {
  id: string
  name: string
  email?: string
  phone?: string
  gstin?: string
  address?: string
}

export interface CompanyProfile {
  id: string
  name: string
  gstin?: string
  address?: string
  phone?: string
  email?: string
  logo?: string
  upiId?: string
  bankName?: string
  bankAccount?: string
  bankIfsc?: string
}

export function useDocumentStorage() {
  return useLocalStorage<SavedDocument[]>("quoteflow_documents", [])
}

export function useCustomerStorage() {
  return useLocalStorage<SavedCustomer[]>("quoteflow_customers", [])
}

export function useCompanyProfile() {
  return useLocalStorage<CompanyProfile | null>("quoteflow_company", null)
}

export function useRecentDocuments() {
  return useLocalStorage<SavedDocument[]>("quoteflow_recent", [])
}
