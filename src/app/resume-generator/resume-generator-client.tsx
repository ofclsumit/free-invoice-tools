"use client"

import React, { useState } from "react"
import { ResumeData, DEFAULT_RESUME_DATA } from "@/types/resume"
import { ResumeForm } from "@/components/resume/resume-form"
import { ResumeEditor } from "@/components/resume/resume-editor"

export function ResumeGeneratorClient() {
  const [view, setView] = useState<"form" | "editor">("form")
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME_DATA)

  const handleContinueToEditor = (data: ResumeData) => {
    setResumeData(data)
    setView("editor")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleBackToForm = (updatedData: ResumeData) => {
    setResumeData(updatedData)
    setView("form")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="w-full">
      {view === "form" ? (
        <ResumeForm
          initialData={resumeData}
          onContinue={handleContinueToEditor}
        />
      ) : (
        <ResumeEditor
          initialData={resumeData}
          onBackToForm={handleBackToForm}
        />
      )}
    </div>
  )
}
