"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Zap, Mail, Lock, User, ArrowRight, Chrome, Apple } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Tab = "login" | "signup"

export function AuthForm() {
  const searchParams = useSearchParams()
  const initial = searchParams.get("tab") === "signup" ? "signup" : "login"
  const [tab, setTab] = useState<Tab>(initial)

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-16 bg-mesh">
      <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-2xl mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-glow-sm">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          QuoteFlow
        </span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-xl p-6 sm:p-8">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-secondary mb-6">
          <button
            onClick={() => setTab("login")}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === "login"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === "signup"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {tab === "login" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@business.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button className="text-xs text-primary hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-9" />
              </div>
            </div>
            <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white gap-1.5">
              Login
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="Your name" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="signup-email" type="email" placeholder="you@business.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="signup-password" type="password" placeholder="Create a password" className="pl-9" />
              </div>
            </div>
            <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white gap-1.5">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or continue with</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Social options */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-11 gap-2">
            <Chrome className="h-4 w-4" />
            Google
          </Button>
          <Button variant="outline" className="h-11 gap-2">
            <Apple className="h-4 w-4" />
            Apple
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {tab === "login" ? "New to QuoteFlow? " : "Already have an account? "}
          <button
            onClick={() => setTab(tab === "login" ? "signup" : "login")}
            className="text-primary font-medium hover:underline"
          >
            {tab === "login" ? "Create an account" : "Login"}
          </button>
        </p>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>
    </div>
  )
}
