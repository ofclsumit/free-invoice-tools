"use client"

import React from "react"
import { FullScreenLoader } from "./loading/full-screen-loader"

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return <FullScreenLoader message={message} delayMs={100} />
}
