"use client"

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react"
import { ResumeData, ResumeExperience, ResumeEducation, ResumeLanguage } from "@/types/resume"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Download,
  Plus,
  Save,
  Check,
} from "lucide-react"

const STORAGE_KEY = "qf_resume_data"

function saveData(data: ResumeData) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

interface ResumeEditorProps {
  initialData: ResumeData
  onBackToForm: (updatedData: ResumeData) => void
}

export function ResumeEditor({ initialData, onBackToForm }: ResumeEditorProps) {
  const { toast } = useToast()
  const [data, setData] = useState<ResumeData>(initialData)
  
  // Responsive Scaling & Zoom State
  const [zoomMode, setZoomMode] = useState<"fit" | "custom">("fit")
  const [customZoom, setCustomZoom] = useState<number>(100)
  const [containerWidth, setContainerWidth] = useState<number>(800)
  const [docHeight, setDocHeight] = useState<number>(1123)
  const [isExporting, setIsExporting] = useState<boolean>(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const docRef = useRef<HTMLDivElement>(null)

  // Measure container width and document height for pixel-perfect device fitting
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      } else if (typeof window !== "undefined") {
        setContainerWidth(Math.min(window.innerWidth - 24, 900))
      }
      if (docRef.current) {
        setDocHeight(docRef.current.offsetHeight || 1123)
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateDimensions) : null
    if (containerRef.current && observer) {
      observer.observe(containerRef.current)
    }
    if (docRef.current && observer) {
      observer.observe(docRef.current)
    }

    return () => {
      window.removeEventListener("resize", updateDimensions)
      observer?.disconnect()
    }
  }, [])

  // Auto-fit scale computation (794px is standard A4 at 96 DPI)
  const autoFitScale = Math.min(1, Math.max(0.32, (containerWidth - 20) / 794))
  const currentScale = zoomMode === "fit" ? autoFitScale : customZoom / 100

  // Zoom control handlers
  const handleZoomIn = () => {
    setZoomMode("custom")
    setCustomZoom((z) => Math.min(Math.round((currentScale * 100) + 15), 175))
  }

  const handleZoomOut = () => {
    setZoomMode("custom")
    setCustomZoom((z) => Math.max(Math.round((currentScale * 100) - 15), 35))
  }

  const handleToggleFit = () => {
    if (zoomMode === "fit") {
      setZoomMode("custom")
      setCustomZoom(100)
    } else {
      setZoomMode("fit")
    }
  }

  const handleResetZoom100 = () => {
    setZoomMode("custom")
    setCustomZoom(100)
  }

  // Save to browser
  const handleSaveDraft = () => {
    saveData(data)
    toast({
      title: "Resume draft saved!",
      description: "Saved all visual changes securely to your browser storage.",
    })
  }

  // Sync contenteditable changes back into data state
  const handleTextChange = (field: keyof ResumeData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const handleExpChange = (expIndex: number, field: keyof ResumeExperience, value: any) => {
    setData((prev) => {
      const exps = [...prev.experiences]
      if (!exps[expIndex]) return prev
      exps[expIndex] = { ...exps[expIndex], [field]: value }
      return { ...prev, experiences: exps }
    })
  }

  const handleBulletChange = (expIndex: number, bulletIndex: number, value: string) => {
    setData((prev) => {
      const exps = [...prev.experiences]
      if (!exps[expIndex]) return prev
      const bullets = [...exps[expIndex].bullets]
      bullets[bulletIndex] = value
      exps[expIndex] = { ...exps[expIndex], bullets }
      return { ...prev, experiences: exps }
    })
  }

  const handleEduChange = (eduIndex: number, field: keyof ResumeEducation, value: any) => {
    setData((prev) => {
      const edus = [...prev.educations]
      if (!edus[eduIndex]) return prev
      edus[eduIndex] = { ...edus[eduIndex], [field]: value }
      return { ...prev, educations: edus }
    })
  }

  const handleLangChange = (langIndex: number, field: keyof ResumeLanguage, value: any) => {
    setData((prev) => {
      const langs = [...prev.languages]
      if (!langs[langIndex]) return prev
      langs[langIndex] = { ...langs[langIndex], [field]: value }
      return { ...prev, languages: langs }
    })
  }

  const handleSkillChange = (skillIndex: number, value: string) => {
    setData((prev) => {
      const skills = [...prev.skills]
      skills[skillIndex] = value
      return { ...prev, skills }
    })
  }

  // Add / Remove item handlers inside Editor
  const addExperience = () => {
    const newExp: ResumeExperience = {
      id: `exp-${Date.now()}`,
      jobTitle: "Job Title",
      company: "Company Name",
      location: "Location",
      startDate: "Year",
      endDate: "Present",
      currentJob: true,
      bullets: ["Describe an outcome or responsibility"],
    }
    setData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, newExp],
    }))
  }

  const removeExperience = (index: number) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }))
  }

  const addBullet = (expIndex: number) => {
    setData((prev) => {
      const exps = [...prev.experiences]
      if (!exps[expIndex]) return prev
      exps[expIndex] = {
        ...exps[expIndex],
        bullets: [...exps[expIndex].bullets, "New key achievement or responsibility"],
      }
      return { ...prev, experiences: exps }
    })
  }

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    setData((prev) => {
      const exps = [...prev.experiences]
      if (!exps[expIndex]) return prev
      exps[expIndex] = {
        ...exps[expIndex],
        bullets: exps[expIndex].bullets.filter((_, i) => i !== bulletIndex),
      }
      return { ...prev, experiences: exps }
    })
  }

  const addEducation = () => {
    const newEdu: ResumeEducation = {
      id: `edu-${Date.now()}`,
      degree: "Degree / Program",
      institution: "Institution Name",
      location: "Location",
      startDate: "Year",
      endDate: "Year",
    }
    setData((prev) => ({
      ...prev,
      educations: [...prev.educations, newEdu],
    }))
  }

  const removeEducation = (index: number) => {
    setData((prev) => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index),
    }))
  }

  const addSkill = () => {
    setData((prev) => ({
      ...prev,
      skills: [...prev.skills, "New Skill"],
    }))
  }

  const removeSkill = (index: number) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const addLanguage = () => {
    const newLang: ResumeLanguage = {
      id: `lang-${Date.now()}`,
      language: "Language",
      proficiency: "Proficiency",
    }
    setData((prev) => ({
      ...prev,
      languages: [...prev.languages, newLang],
    }))
  }

  const removeLanguage = (index: number) => {
    setData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }))
  }

  // Print & PDF Download Handler
  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = () => {
    const cleanName = data.fullName.trim() ? `${data.fullName.trim().replace(/\s+/g, "_")}_Resume` : "Resume"
    const origTitle = document.title
    document.title = cleanName
    window.print()
    setTimeout(() => {
      document.title = origTitle
    }, 1000)
  }

  // Handle Back to Form with full current state
  const handleBack = () => {
    onBackToForm(data)
  }

  // Check if contact items exist to avoid empty dividers
  const hasPhoneOrLocation = Boolean(data.location?.trim() || data.phone?.trim())
  const hasEmailOrLinkedin = Boolean(data.email?.trim() || data.linkedin?.trim())
  const hasWebsite = Boolean(data.website?.trim())
  const hasContactBlock = hasPhoneOrLocation || hasEmailOrLinkedin || hasWebsite

  // Check if sections have content
  const hasExperience = data.experiences && data.experiences.length > 0
  const hasEducation = data.educations && data.educations.length > 0
  const hasSkills = data.skills && data.skills.length > 0
  const hasLanguages = data.languages && data.languages.length > 0
  const hasSplitGrid = hasSkills || hasLanguages
  const hasQuoteOrFootSite = Boolean(data.quote?.trim() || data.additionalWebsite?.trim())

  return (
    <div className="w-full space-y-4 pb-16 print:p-0 print:m-0 print:space-y-0">
      {/* ─── RESPONSIVE STICKY EDITOR TOOLBAR (Hidden during print) ───────────────────── */}
      <div className="sticky top-20 z-40 max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-white/95 dark:bg-[#0E0820]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg shadow-black/5 flex flex-wrap items-center justify-between gap-2 sm:gap-3 print:hidden">
        {/* Left: Back to Form & Draft Save */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-xs font-semibold gap-1 px-2.5 h-8 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <ArrowLeft size={14} />
            <span className="hidden xs:inline">Back to Form</span>
            <span className="xs:hidden">Form</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            className="text-xs font-semibold gap-1 px-2.5 h-8 border-violet-500/20 text-violet-600 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30"
            title="Save changes to browser storage"
          >
            <Save size={13} />
            <span className="hidden sm:inline">Save Draft</span>
          </Button>
        </div>

        {/* Center: Quick Add Controls (Tablets & Desktops) */}
        <div className="hidden lg:flex items-center gap-1 border-x border-slate-200 dark:border-white/10 px-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExperience}
            className="text-[11px] h-7 px-2 font-medium gap-1 text-violet-600 dark:text-violet-300 border-slate-200 dark:border-white/10"
          >
            <Plus size={11} /> Experience
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEducation}
            className="text-[11px] h-7 px-2 font-medium gap-1 text-violet-600 dark:text-violet-300 border-slate-200 dark:border-white/10"
          >
            <Plus size={11} /> Education
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSkill}
            className="text-[11px] h-7 px-2 font-medium gap-1 text-violet-600 dark:text-violet-300 border-slate-200 dark:border-white/10"
          >
            <Plus size={11} /> Skill
          </Button>
        </div>

        {/* Right: Smart Device Zoom / Auto-Fit & PDF Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Smart Zoom Controls */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.05] p-0.5">
            <button
              type="button"
              onClick={handleToggleFit}
              title="Auto-Fit Resume to Screen"
              className={`h-7 px-2 text-[11px] font-bold rounded-md transition-colors flex items-center gap-1 ${
                zoomMode === "fit"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Maximize2 size={11} />
              <span>Fit</span>
            </button>

            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className="h-7 w-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ZoomOut size={12} />
            </button>

            <button
              type="button"
              onClick={handleResetZoom100}
              title="Click to reset to 100%"
              className="px-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 min-w-[38px] text-center"
            >
              {Math.round(currentScale * 100)}%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="h-7 w-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ZoomIn size={12} />
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-semibold gap-1.5 h-8 hidden md:inline-flex border-slate-200 dark:border-white/10"
          >
            <Printer size={13} />
            Print
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="text-xs font-bold gap-1.5 h-8 px-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/20"
          >
            <Download size={13} />
            <span className="hidden xs:inline">{isExporting ? "Saving..." : "PDF"}</span>
          </Button>
        </div>
      </div>

      {/* Editor helper cue (Hidden on print) */}
      <div className="text-center px-4 print:hidden">
        <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
          ✏️ <strong>Live Visual Document:</strong> Tap or click anywhere directly on the resume below to edit text in real time.
        </p>
      </div>

      {/* ─── ALL-DEVICE RESPONSIVE CANVAS CONTAINER ───────────────────── */}
      <div
        ref={containerRef}
        className="w-full flex justify-center items-start overflow-hidden px-2 sm:px-4 pb-12 print:p-0 print:m-0 print:overflow-visible"
      >
        {/* Adaptive Sizing Bounding Box (Matches scaled document height to eliminate blank space) */}
        <div
          style={{
            width: `${Math.round(794 * currentScale)}px`,
            height: `${Math.round(docHeight * currentScale)}px`,
            position: "relative",
            transition: "width 0.18s ease-out, height 0.18s ease-out",
          }}
          className="print:w-full print:h-auto"
        >
          <div
            style={{
              transform: `scale(${currentScale})`,
              transformOrigin: "top left",
              width: "794px",
              position: "absolute",
              top: 0,
              left: 0,
              transition: "transform 0.18s ease-out",
            }}
            className="print:transform-none print:relative print:top-auto print:left-auto print:w-full"
          >
            {/* ─── THE EXACT A4 RESUME DOCUMENT ───────────────────── */}
            <div
              ref={docRef}
              className="resume-doc-canvas"
            >
              {/* Inject Exact CSS Styles with Touch & Dark Mode Enhancements */}
              <style dangerouslySetInnerHTML={{ __html: `
                .resume-doc-canvas {
                  position: relative;
                  width: 794px;
                  min-height: 1123px;
                  margin: 0 auto;
                  background: #FFFFFF !important;
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.14);
                  padding: 54px 58px 50px;
                  color: #1E1E1E !important;
                  font-family: 'Inter', system-ui, -apple-system, sans-serif;
                  -webkit-font-smoothing: antialiased;
                  box-sizing: border-box;
                  text-align: left;
                  border-radius: 4px;
                }
                .resume-doc-canvas::before {
                  content: '';
                  position: absolute;
                  inset: 0 0 auto 0;
                  height: 3px;
                  background: #1A1A1A;
                }

                /* Contenteditable styles */
                .resume-doc-canvas [contenteditable="true"] {
                  outline: none;
                  border-bottom: 1px dashed transparent;
                  transition: border-color 0.15s, background-color 0.15s;
                  cursor: text;
                  min-width: 4px;
                  display: inline-block;
                }
                .resume-doc-canvas [contenteditable="true"]:hover {
                  border-bottom-color: #C8C8C8;
                }
                .resume-doc-canvas [contenteditable="true"]:focus {
                  border-bottom-color: #7C3AED;
                  background-color: rgba(124, 58, 237, 0.05);
                  border-radius: 2px;
                }

                /* Header */
                .resume-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  gap: 24px;
                  margin-bottom: 26px;
                }
                .resume-name-block { flex: 1; }
                .resume-full-name {
                  display: block;
                  font-size: 30px;
                  font-weight: 700;
                  letter-spacing: -0.3px;
                  color: #1A1A1A;
                  margin-bottom: 5px;
                  line-height: 1.15;
                }
                .resume-role-title {
                  display: block;
                  font-size: 12.5px;
                  font-weight: 500;
                  letter-spacing: 3px;
                  text-transform: uppercase;
                  color: #8A8A8A;
                }
                .resume-contact-block {
                  text-align: right;
                  flex-shrink: 0;
                  padding-top: 4px;
                }
                .resume-contact-line {
                  display: block;
                  font-size: 10.8px;
                  color: #6E6E6E;
                  line-height: 1.9;
                  white-space: nowrap;
                }
                .resume-contact-line span.sep {
                  color: #CFCFCF;
                  margin: 0 5px;
                }

                /* Divider rules */
                .resume-rule { height: 1px; background: #E2E2E2; }
                .resume-rule-thick { height: 1.5px; background: #1A1A1A; margin: 22px 0 24px; }

                /* Summary */
                .resume-summary {
                  font-size: 11.5px;
                  line-height: 1.8;
                  color: #444444;
                  margin-bottom: 30px;
                }

                /* Section */
                .resume-section { margin-bottom: 28px; }
                .resume-section:last-child { margin-bottom: 0; }

                .resume-section-label {
                  font-size: 9px;
                  font-weight: 700;
                  letter-spacing: 3px;
                  text-transform: uppercase;
                  color: #1A1A1A;
                  padding-bottom: 7px;
                  border-bottom: 1.5px solid #1A1A1A;
                  margin-bottom: 16px;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                }
                .resume-add-inline {
                  background: none;
                  border: none;
                  font-size: 9px;
                  font-weight: 600;
                  letter-spacing: 1px;
                  text-transform: none;
                  color: #8A8A8A;
                  cursor: pointer;
                  padding: 2px 6px;
                  border-radius: 3px;
                  transition: color 0.15s, background-color 0.15s;
                }
                .resume-add-inline:hover { color: #1A1A1A; background-color: #F4F4F5; }

                /* Entry */
                .resume-entry {
                  position: relative;
                  margin-bottom: 18px;
                  padding-right: 24px;
                }
                .resume-entry:last-child { margin-bottom: 0; }

                .resume-entry-top {
                  display: flex;
                  justify-content: space-between;
                  align-items: baseline;
                  gap: 12px;
                  margin-bottom: 2px;
                }
                .resume-entry-role {
                  font-size: 13px;
                  font-weight: 700;
                  color: #1A1A1A;
                }
                .resume-entry-date {
                  font-size: 10px;
                  font-weight: 500;
                  color: #9A9A9A;
                  white-space: nowrap;
                  letter-spacing: 0.3px;
                }
                .resume-entry-org {
                  font-size: 11px;
                  font-weight: 500;
                  color: #7A7A7A;
                  margin-bottom: 7px;
                }
                .resume-entry-org .dot { color: #CFCFCF; margin: 0 6px; }

                .resume-entry ul {
                  list-style: none;
                  padding: 0;
                  margin: 0;
                }
                .resume-entry li {
                  position: relative;
                  font-size: 11px;
                  line-height: 1.7;
                  color: #454545;
                  padding-left: 13px;
                  margin-bottom: 3px;
                }
                .resume-entry li::before {
                  content: '–';
                  position: absolute;
                  left: 0;
                  color: #C0C0C0;
                }

                /* Delete & Add Bullet controls */
                .resume-del-entry {
                  position: absolute;
                  top: 0;
                  right: -4px;
                  opacity: 0;
                  background: none;
                  border: none;
                  color: #B0B0B0;
                  font-size: 16px;
                  line-height: 1;
                  cursor: pointer;
                  padding: 2px 4px;
                  border-radius: 4px;
                  transition: opacity 0.15s, color 0.15s, background-color 0.15s;
                }
                .resume-entry:hover .resume-del-entry { opacity: 1; }
                .resume-del-entry:hover { color: #E11D48; background-color: #FFF1F2; }

                .resume-add-bullet {
                  display: inline-flex;
                  align-items: center;
                  gap: 2px;
                  font-size: 9px;
                  font-weight: 600;
                  color: #9A9A9A;
                  background: none;
                  border: none;
                  cursor: pointer;
                  padding: 2px 4px;
                  margin-top: 2px;
                  border-radius: 3px;
                  opacity: 0;
                  transition: opacity 0.15s, color 0.15s;
                }
                .resume-entry:hover .resume-add-bullet { opacity: 1; }
                .resume-add-bullet:hover { color: #1A1A1A; background-color: #F4F4F5; }

                .resume-del-bullet {
                  opacity: 0;
                  color: #C0C0C0;
                  font-size: 12px;
                  cursor: pointer;
                  margin-left: 6px;
                  background: none;
                  border: none;
                }
                .resume-entry li:hover .resume-del-bullet { opacity: 1; }
                .resume-del-bullet:hover { color: #E11D48; }

                /* Two-column lower section */
                .resume-split-grid {
                  display: grid;
                  grid-template-columns: 1.35fr 1fr;
                  gap: 0 40px;
                }

                /* Skills */
                .resume-skills-wrap {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 7px;
                }
                .resume-skill-pill {
                  font-size: 10px;
                  font-weight: 500;
                  color: #3A3A3A;
                  background: #F2F2F2;
                  border: 1px solid #E4E4E4;
                  padding: 4px 10px;
                  border-radius: 3px;
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                }
                .resume-del-skill {
                  opacity: 0;
                  cursor: pointer;
                  color: #888;
                  font-size: 11px;
                  font-weight: bold;
                  background: none;
                  border: none;
                  line-height: 1;
                }
                .resume-skill-pill:hover .resume-del-skill { opacity: 1; }
                .resume-del-skill:hover { color: #E11D48; }

                /* Plain list for languages */
                .resume-plain-list { list-style: none; padding: 0; margin: 0; }
                .resume-plain-list li {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 11px;
                  color: #454545;
                  padding: 5px 0;
                  border-bottom: 1px solid #F0F0F0;
                  position: relative;
                }
                .resume-plain-list li:last-child { border-bottom: none; }
                .resume-pl-key { font-weight: 600; color: #1A1A1A; }
                .resume-pl-val { color: #8A8A8A; }
                .resume-del-lang {
                  opacity: 0;
                  cursor: pointer;
                  color: #B0B0B0;
                  font-size: 12px;
                  margin-left: 8px;
                  background: none;
                  border: none;
                }
                .resume-plain-list li:hover .resume-del-lang { opacity: 1; }
                .resume-del-lang:hover { color: #E11D48; }

                /* Footer Quote */
                .resume-footer-quote {
                  margin-top: 36px;
                  padding-top: 20px;
                  border-top: 1px solid #E2E2E2;
                  text-align: center;
                }
                .resume-quote-line {
                  display: block;
                  font-size: 11px;
                  font-style: italic;
                  font-weight: 300;
                  color: #A6A6A6;
                  margin-bottom: 8px;
                }
                .resume-site-link {
                  display: inline-block;
                  font-size: 10px;
                  font-weight: 600;
                  letter-spacing: 2px;
                  text-transform: uppercase;
                  color: #1A1A1A;
                  text-decoration: none;
                  border-bottom: 1.5px solid #1A1A1A;
                  padding-bottom: 2px;
                }

                /* ─── TOUCH DEVICE USABILITY (Make controls accessible on phones/tablets) ───────────────────── */
                @media (hover: none), (pointer: coarse) {
                  .resume-del-entry,
                  .resume-add-bullet,
                  .resume-del-bullet,
                  .resume-del-skill,
                  .resume-del-lang {
                    opacity: 0.75 !important;
                  }
                  .resume-add-inline {
                    color: #555555 !important;
                    background-color: #F4F4F5 !important;
                  }
                }

                /* ─── PRINT RULES (Exact A4 vector print integrity) ───────────────────── */
                @media print {
                  @page {
                    size: A4 portrait;
                    margin: 0;
                  }
                  html, body {
                    background: #FFFFFF !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  body * {
                    visibility: hidden !important;
                  }
                  .resume-doc-canvas, .resume-doc-canvas * {
                    visibility: visible !important;
                  }
                  .resume-doc-canvas {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    box-shadow: none !important;
                    width: 210mm !important;
                    min-width: 210mm !important;
                    max-width: 210mm !important;
                    min-height: 297mm !important;
                    margin: 0 auto !important;
                    padding: 14mm 16mm !important;
                    box-sizing: border-box !important;
                    background-color: #FFFFFF !important;
                  }
                  .resume-doc-canvas [contenteditable="true"] {
                    border-bottom: none !important;
                    cursor: default !important;
                    background-color: transparent !important;
                  }
                  .resume-del-entry,
                  .resume-add-inline,
                  .resume-add-bullet,
                  .resume-del-bullet,
                  .resume-del-skill,
                  .resume-del-lang {
                    display: none !important;
                  }
                  .resume-section { break-inside: avoid; }
                  .resume-entry { break-inside: avoid; }
                }
              ` }} />

              {/* 1. HEADER */}
              <div className="resume-header">
                <div className="resume-name-block">
                  <span
                    className="resume-full-name"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange("fullName", e.currentTarget.textContent || "")}
                  >
                    {data.fullName || "Your Full Name"}
                  </span>
                  <span
                    className="resume-role-title"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange("professionalTitle", e.currentTarget.textContent || "")}
                  >
                    {data.professionalTitle || "Professional Title"}
                  </span>
                </div>

                {hasContactBlock && (
                  <div className="resume-contact-block">
                    {hasPhoneOrLocation && (
                      <span className="resume-contact-line">
                        {data.location && (
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleTextChange("location", e.currentTarget.textContent || "")}
                          >
                            {data.location}
                          </span>
                        )}
                        {data.location && data.phone && <span className="sep">•</span>}
                        {data.phone && (
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleTextChange("phone", e.currentTarget.textContent || "")}
                          >
                            {data.phone}
                          </span>
                        )}
                      </span>
                    )}

                    {hasEmailOrLinkedin && (
                      <span className="resume-contact-line">
                        {data.email && (
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleTextChange("email", e.currentTarget.textContent || "")}
                          >
                            {data.email}
                          </span>
                        )}
                        {data.email && data.linkedin && <span className="sep">•</span>}
                        {data.linkedin && (
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleTextChange("linkedin", e.currentTarget.textContent || "")}
                          >
                            {data.linkedin}
                          </span>
                        )}
                      </span>
                    )}

                    {hasWebsite && (
                      <span className="resume-contact-line">
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleTextChange("website", e.currentTarget.textContent || "")}
                        >
                          {data.website}
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 2. SUMMARY */}
              {data.summary && (
                <div>
                  <div
                    className="resume-summary"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange("summary", e.currentTarget.textContent || "")}
                  >
                    {data.summary}
                  </div>
                </div>
              )}

              {/* 3. WORK EXPERIENCE */}
              {hasExperience && (
                <div className="resume-section">
                  <div className="resume-section-label">
                    <span>Work Experience</span>
                    <button
                      type="button"
                      className="resume-add-inline"
                      onClick={addExperience}
                      title="Add job entry"
                    >
                      + Add Role
                    </button>
                  </div>

                  {data.experiences.map((exp, expIdx) => (
                    <div key={exp.id || expIdx} className="resume-entry group">
                      <button
                        type="button"
                        className="resume-del-entry"
                        onClick={() => removeExperience(expIdx)}
                        title="Delete this role"
                      >
                        ×
                      </button>

                      <div className="resume-entry-top">
                        <span
                          className="resume-entry-role"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleExpChange(expIdx, "jobTitle", e.currentTarget.textContent || "")}
                        >
                          {exp.jobTitle || "Job Title"}
                        </span>
                        <span className="resume-entry-date">
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleExpChange(expIdx, "startDate", e.currentTarget.textContent || "")}
                          >
                            {exp.startDate || "Start Year"}
                          </span>
                          {" – "}
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleExpChange(expIdx, "endDate", e.currentTarget.textContent || "")}
                          >
                            {exp.endDate || "Present"}
                          </span>
                        </span>
                      </div>

                      <div className="resume-entry-org">
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleExpChange(expIdx, "company", e.currentTarget.textContent || "")}
                        >
                          {exp.company || "Company"}
                        </span>
                        {exp.location && <span className="dot">•</span>}
                        {exp.location && (
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleExpChange(expIdx, "location", e.currentTarget.textContent || "")}
                          >
                            {exp.location}
                          </span>
                        )}
                      </div>

                      <ul>
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleBulletChange(expIdx, bIdx, e.currentTarget.textContent || "")}
                            >
                              {bullet}
                            </span>
                            {exp.bullets.length > 1 && (
                              <button
                                type="button"
                                className="resume-del-bullet"
                                onClick={() => removeBullet(expIdx, bIdx)}
                                title="Remove bullet point"
                              >
                                ×
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        className="resume-add-bullet"
                        onClick={() => addBullet(expIdx)}
                        title="Add bullet point"
                      >
                        + Add Bullet
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. EDUCATION */}
              {hasEducation && (
                <div className="resume-section">
                  <div className="resume-section-label">
                    <span>Education</span>
                    <button
                      type="button"
                      className="resume-add-inline"
                      onClick={addEducation}
                      title="Add degree entry"
                    >
                      + Add Education
                    </button>
                  </div>

                  {data.educations.map((edu, eduIdx) => (
                    <div key={edu.id || eduIdx} className="resume-entry group">
                      <button
                        type="button"
                        className="resume-del-entry"
                        onClick={() => removeEducation(eduIdx)}
                        title="Delete this degree"
                      >
                        ×
                      </button>

                      <div className="resume-entry-top">
                        <span
                          className="resume-entry-role"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleEduChange(eduIdx, "degree", e.currentTarget.textContent || "")}
                        >
                          {edu.degree || "Degree Name"}
                        </span>
                        <span className="resume-entry-date">
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleEduChange(eduIdx, "startDate", e.currentTarget.textContent || "")}
                          >
                            {edu.startDate || "Start Year"}
                          </span>
                          {" – "}
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleEduChange(eduIdx, "endDate", e.currentTarget.textContent || "")}
                          >
                            {edu.endDate || "Grad Year"}
                          </span>
                        </span>
                      </div>

                      <div className="resume-entry-org">
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleEduChange(eduIdx, "institution", e.currentTarget.textContent || "")}
                        >
                          {edu.institution || "Institution Name"}
                        </span>
                        {edu.location && <span className="dot">•</span>}
                        {edu.location && (
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleEduChange(eduIdx, "location", e.currentTarget.textContent || "")}
                          >
                            {edu.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. SKILLS & LANGUAGES (TWO-COLUMN SECTION) */}
              {hasSplitGrid && (
                <div className="resume-split-grid">
                  {/* Skills */}
                  {hasSkills ? (
                    <div className="resume-section" style={{ marginBottom: 0 }}>
                      <div className="resume-section-label">
                        <span>Skills</span>
                        <button
                          type="button"
                          className="resume-add-inline"
                          onClick={addSkill}
                          title="Add new skill"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="resume-skills-wrap">
                        {data.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="resume-skill-pill">
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleSkillChange(sIdx, e.currentTarget.textContent || "")}
                            >
                              {skill}
                            </span>
                            <button
                              type="button"
                              className="resume-del-skill"
                              onClick={() => removeSkill(sIdx)}
                              title="Remove skill"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : <div />}

                  {/* Languages */}
                  {hasLanguages ? (
                    <div className="resume-section" style={{ marginBottom: 0 }}>
                      <div className="resume-section-label">
                        <span>Languages</span>
                        <button
                          type="button"
                          className="resume-add-inline"
                          onClick={addLanguage}
                          title="Add language"
                        >
                          + Add
                        </button>
                      </div>
                      <ul className="resume-plain-list">
                        {data.languages.map((lang, lIdx) => (
                          <li key={lang.id || lIdx}>
                            <span
                              className="resume-pl-key"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleLangChange(lIdx, "language", e.currentTarget.textContent || "")}
                            >
                              {lang.language}
                            </span>
                            <span className="flex items-center">
                              <span
                                className="resume-pl-val"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleLangChange(lIdx, "proficiency", e.currentTarget.textContent || "")}
                              >
                                {lang.proficiency}
                              </span>
                              <button
                                type="button"
                                className="resume-del-lang"
                                onClick={() => removeLanguage(lIdx)}
                                title="Remove language"
                              >
                                ×
                              </button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : <div />}
                </div>
              )}

              {/* 6. FOOTER QUOTE / BRANDING LINK */}
              {hasQuoteOrFootSite && (
                <div className="resume-footer-quote">
                  {data.quote && (
                    <span
                      className="resume-quote-line"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange("quote", e.currentTarget.textContent || "")}
                    >
                      {data.quote}
                    </span>
                  )}
                  {data.additionalWebsite && (
                    <span
                      className="resume-site-link"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange("additionalWebsite", e.currentTarget.textContent || "")}
                    >
                      {data.additionalWebsite}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
