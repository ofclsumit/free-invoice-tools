"use client"

import React, { useState, useEffect } from "react"
import { ResumeData, ResumeExperience, ResumeEducation, ResumeLanguage, DEFAULT_RESUME_DATA, EMPTY_RESUME_DATA } from "@/types/resume"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Languages,
  Quote,
  Plus,
  Trash2,
  ArrowRight,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Save,
  HardDrive,
  ShieldCheck
} from "lucide-react"

const STORAGE_KEY = "qf_resume_data"

function loadSaved(): ResumeData | null {
  if (typeof window === "undefined") return null
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

function saveData(data: ResumeData) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

interface ResumeFormProps {
  initialData: ResumeData
  onContinue: (data: ResumeData) => void
}

export function ResumeForm({ initialData, onContinue }: ResumeFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<ResumeData>(initialData)
  const [newSkill, setNewSkill] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [hasSavedDraft, setHasSavedDraft] = useState(false)

  // Check on mount for saved browser data
  useEffect(() => {
    const saved = loadSaved()
    if (saved && saved.fullName) {
      setHasSavedDraft(true)
    }
  }, [])

  const updateField = (field: keyof ResumeData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "fullName" && value.trim()) {
      setError(null)
    }
  }

  // Save to Browser LocalStorage
  const handleSaveDraft = () => {
    saveData(formData)
    setHasSavedDraft(true)
    toast({
      title: "Resume draft saved!",
      description: "Stored securely in your browser's local storage.",
    })
  }

  // Revert / Restore from Browser LocalStorage
  const handleRevertDraft = () => {
    const saved = loadSaved()
    if (!saved) {
      toast({
        title: "No saved draft found",
        description: "There is no saved resume draft in your browser.",
        variant: "destructive",
      })
      return
    }
    setFormData(saved)
    toast({
      title: "Draft restored!",
      description: "Restored your saved resume from browser storage.",
    })
  }

  // Work Experience Handlers
  const addExperience = () => {
    const newExp: ResumeExperience = {
      id: `exp-${Date.now()}`,
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      currentJob: false,
      bullets: [""],
    }
    setFormData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, newExp],
    }))
  }

  const updateExperience = (index: number, field: keyof ResumeExperience, value: any) => {
    setFormData((prev) => {
      const exps = [...prev.experiences]
      exps[index] = { ...exps[index], [field]: value }
      if (field === "currentJob" && value === true) {
        exps[index].endDate = "Present"
      }
      return { ...prev, experiences: exps }
    })
  }

  const removeExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }))
  }

  const addBullet = (expIndex: number) => {
    setFormData((prev) => {
      const exps = [...prev.experiences]
      exps[expIndex] = {
        ...exps[expIndex],
        bullets: [...exps[expIndex].bullets, ""],
      }
      return { ...prev, experiences: exps }
    })
  }

  const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
    setFormData((prev) => {
      const exps = [...prev.experiences]
      const bullets = [...exps[expIndex].bullets]
      bullets[bulletIndex] = value
      exps[expIndex] = { ...exps[expIndex], bullets }
      return { ...prev, experiences: exps }
    })
  }

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    setFormData((prev) => {
      const exps = [...prev.experiences]
      exps[expIndex] = {
        ...exps[expIndex],
        bullets: exps[expIndex].bullets.filter((_, i) => i !== bulletIndex),
      }
      return { ...prev, experiences: exps }
    })
  }

  // Education Handlers
  const addEducation = () => {
    const newEdu: ResumeEducation = {
      id: `edu-${Date.now()}`,
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
    }
    setFormData((prev) => ({
      ...prev,
      educations: [...prev.educations, newEdu],
    }))
  }

  const updateEducation = (index: number, field: keyof ResumeEducation, value: any) => {
    setFormData((prev) => {
      const edus = [...prev.educations]
      edus[index] = { ...edus[index], [field]: value }
      return { ...prev, educations: edus }
    })
  }

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index),
    }))
  }

  // Skills Handlers
  const addSkill = () => {
    const trimmed = newSkill.trim()
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  // Languages Handlers
  const addLanguage = () => {
    const newLang: ResumeLanguage = {
      id: `lang-${Date.now()}`,
      language: "",
      proficiency: "Fluent",
    }
    setFormData((prev) => ({
      ...prev,
      languages: [...prev.languages, newLang],
    }))
  }

  const updateLanguage = (index: number, field: keyof ResumeLanguage, value: any) => {
    setFormData((prev) => {
      const langs = [...prev.languages]
      langs[index] = { ...langs[index], [field]: value }
      return { ...prev, languages: langs }
    })
  }

  const removeLanguage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }))
  }

  // Handle Form Submit & Continue
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fullName.trim()) {
      setError("Full Name is required to build your resume.")
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    setError(null)
    saveData(formData)
    onContinue(formData)
  }

  const loadDemoData = () => {
    setFormData(DEFAULT_RESUME_DATA)
    setError(null)
    toast({
      title: "Sample data loaded",
      description: "Pre-filled with Aarav Sharma's product designer resume.",
    })
  }

  const clearForm = () => {
    setFormData(EMPTY_RESUME_DATA)
    setError(null)
    toast({
      title: "Form cleared",
      description: "All fields have been reset to blank.",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Top Sticky Header — Exact Turnivo Design Pattern */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-display font-bold">Resume Generator</h1>
          <p className="text-xs text-muted-foreground">Create professional A4 resumes with direct visual live editor and PDF download</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 h-8 text-xs flex"
            onClick={handleRevertDraft}
            title="Revert to last saved browser draft"
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Revert</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs flex"
            onClick={handleSaveDraft}
          >
            <Save className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Save Draft</span>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6 pb-12">
        {/* Helper bar for Sample Data / Clear */}
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground px-1">
          <span>Fill in your details below to populate your resume.</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={loadDemoData}
              className="h-7 text-xs text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Load Sample Data
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearForm}
              className="h-7 text-xs text-muted-foreground hover:text-rose-500"
            >
              Clear
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium">
            <AlertCircle size={17} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

      {/* 1. PERSONAL INFORMATION */}
      <section className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#120D24] border border-black/[0.07] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <User size={17} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Your Information</h2>
            <p className="text-xs text-muted-foreground">Your name, contact details, and online links</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="fullName" className="text-xs font-semibold">
              Full Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="e.g. Aarav Sharma"
              value={formData.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className={!formData.fullName.trim() && error ? "border-rose-400 focus-visible:ring-rose-400" : ""}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="professionalTitle" className="text-xs font-semibold">
              Professional Title
            </Label>
            <Input
              id="professionalTitle"
              placeholder="e.g. Senior Product Designer / Software Engineer"
              value={formData.professionalTitle}
              onChange={(e) => updateField("professionalTitle", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. aarav@email.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold">
              Phone Number
            </Label>
            <Input
              id="phone"
              placeholder="e.g. +91 90000 00000"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-semibold">
              Location / City, State
            </Label>
            <Input
              id="location"
              placeholder="e.g. Patna, Bihar or Bengaluru, India"
              value={formData.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="linkedin" className="text-xs font-semibold">
              LinkedIn Profile
            </Label>
            <Input
              id="linkedin"
              placeholder="e.g. linkedin.com/in/aarav"
              value={formData.linkedin}
              onChange={(e) => updateField("linkedin", e.target.value)}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="website" className="text-xs font-semibold">
              Portfolio / Website Link
            </Label>
            <Input
              id="website"
              placeholder="e.g. aaravsharma.design or github.com/username"
              value={formData.website}
              onChange={(e) => updateField("website", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 2. PROFESSIONAL SUMMARY */}
      <section className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#120D24] border border-black/[0.07] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Quote size={17} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">About You</h2>
            <p className="text-xs text-muted-foreground">A short summary of your professional background and strengths</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Textarea
            rows={3}
            placeholder="e.g. Product designer with 6+ years shaping B2B platforms end-to-end — from research and wireframes to shipped, measurable interfaces..."
            value={formData.summary}
            onChange={(e) => updateField("summary", e.target.value)}
            className="text-sm leading-relaxed"
          />
        </div>
      </section>

      {/* 3. WORK EXPERIENCE */}
      <section className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#120D24] border border-black/[0.07] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Briefcase size={17} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Work Experience</h2>
              <p className="text-xs text-muted-foreground">List your jobs and roles starting with the most recent</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExperience}
            className="text-xs font-semibold gap-1 text-violet-600 dark:text-violet-300"
          >
            <Plus size={14} />
            Add Role
          </Button>
        </div>

        {formData.experiences.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
            No work experience added yet. Click &quot;Add Role&quot; above to add your first job.
          </div>
        ) : (
          <div className="space-y-6">
            {formData.experiences.map((exp, expIdx) => (
              <div
                key={exp.id || expIdx}
                className="p-4 sm:p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.015] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Experience #{expIdx + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(expIdx)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                    title="Remove experience"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Job Title</Label>
                    <Input
                      placeholder="e.g. Senior Product Designer"
                      value={exp.jobTitle}
                      onChange={(e) => updateExperience(expIdx, "jobTitle", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Company Name</Label>
                    <Input
                      placeholder="e.g. Northbeam Labs"
                      value={exp.company}
                      onChange={(e) => updateExperience(expIdx, "company", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Location</Label>
                    <Input
                      placeholder="e.g. Bengaluru or Remote"
                      value={exp.location}
                      onChange={(e) => updateExperience(expIdx, "location", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Start Year/Date</Label>
                      <Input
                        placeholder="e.g. 2022"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(expIdx, "startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">End Year/Date</Label>
                      <Input
                        placeholder="e.g. Present"
                        value={exp.endDate}
                        disabled={exp.currentJob}
                        onChange={(e) => updateExperience(expIdx, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Bullets List */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Key Achievements &amp; Responsibilities</Label>
                    <button
                      type="button"
                      onClick={() => addBullet(expIdx)}
                      className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Bullet
                    </button>
                  </div>

                  <div className="space-y-2">
                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">–</span>
                        <Input
                          placeholder="e.g. Led redesign of core dashboard, reducing onboarding time by 34%"
                          value={bullet}
                          onChange={(e) => updateBullet(expIdx, bIdx, e.target.value)}
                          className="text-xs"
                        />
                        {exp.bullets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBullet(expIdx, bIdx)}
                            className="text-muted-foreground hover:text-rose-500 p-1 text-xs shrink-0"
                            title="Remove bullet"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. EDUCATION */}
      <section className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#120D24] border border-black/[0.07] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <GraduationCap size={17} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Education</h2>
              <p className="text-xs text-muted-foreground">Academic qualifications and degrees</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEducation}
            className="text-xs font-semibold gap-1 text-violet-600 dark:text-violet-300"
          >
            <Plus size={14} />
            Add Degree
          </Button>
        </div>

        {formData.educations.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
            No education entries added.
          </div>
        ) : (
          <div className="space-y-4">
            {formData.educations.map((edu, eduIdx) => (
              <div
                key={edu.id || eduIdx}
                className="p-4 sm:p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.015] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Education #{eduIdx + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(eduIdx)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                    title="Remove education"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Degree / Major</Label>
                    <Input
                      placeholder="e.g. B.Des, Communication Design or B.Tech CS"
                      value={edu.degree}
                      onChange={(e) => updateEducation(eduIdx, "degree", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Institution / University</Label>
                    <Input
                      placeholder="e.g. National Institute of Design"
                      value={edu.institution}
                      onChange={(e) => updateEducation(eduIdx, "institution", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Location</Label>
                    <Input
                      placeholder="e.g. Ahmedabad, India"
                      value={edu.location}
                      onChange={(e) => updateEducation(eduIdx, "location", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Start Year</Label>
                      <Input
                        placeholder="e.g. 2015"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(eduIdx, "startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">End Year</Label>
                      <Input
                        placeholder="e.g. 2019"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(eduIdx, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. SKILLS & LANGUAGES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills */}
        <section className="p-6 rounded-[22px] bg-white/80 dark:bg-[#120D24] border border-black/[0.07] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Sparkles size={16} className="text-violet-600 dark:text-violet-400" />
            <h2 className="text-sm font-semibold text-foreground">Skills &amp; Competencies</h2>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add skill (e.g. Figma, Python)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addSkill()
                }
              }}
              className="text-xs"
            />
            <Button type="button" size="sm" onClick={addSkill} className="shrink-0 text-xs">
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[42px] p-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-border">
            {formData.skills.map((skill, sIdx) => (
              <span
                key={sIdx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-white/10 text-foreground border border-black/10 dark:border-white/10 shadow-xs"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(sIdx)}
                  className="text-muted-foreground hover:text-rose-500 font-bold ml-0.5"
                  title="Remove skill"
                >
                  ×
                </button>
              </span>
            ))}
            {formData.skills.length === 0 && (
              <span className="text-xs text-muted-foreground italic py-1">No skills added yet.</span>
            )}
          </div>
        </section>

        {/* Languages */}
        <section className="p-6 rounded-[22px] bg-white/80 dark:bg-[#120D24] border border-black/[0.07] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Languages size={16} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-semibold text-foreground">Languages</h2>
            </div>
            <button
              type="button"
              onClick={addLanguage}
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
            >
              <Plus size={13} /> Add
            </button>
          </div>

          <div className="space-y-2">
            {formData.languages.map((lang, lIdx) => (
              <div key={lang.id || lIdx} className="flex items-center gap-2">
                <Input
                  placeholder="Language (e.g. English)"
                  value={lang.language}
                  onChange={(e) => updateLanguage(lIdx, "language", e.target.value)}
                  className="text-xs flex-1"
                />
                <Input
                  placeholder="Proficiency (e.g. Fluent, Native)"
                  value={lang.proficiency}
                  onChange={(e) => updateLanguage(lIdx, "proficiency", e.target.value)}
                  className="text-xs w-32"
                />
                <button
                  type="button"
                  onClick={() => removeLanguage(lIdx)}
                  className="text-muted-foreground hover:text-rose-500 p-1 text-sm font-bold"
                  title="Remove language"
                >
                  ×
                </button>
              </div>
            ))}
            {formData.languages.length === 0 && (
              <p className="text-xs text-muted-foreground italic py-2">No languages added.</p>
            )}
          </div>
        </section>
      </div>

      {/* 6. OPTIONAL: FOOTER QUOTE & ADDITIONAL WEBSITE */}
      <section className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#120D24] border border-black/[0.07] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <Quote size={17} className="text-amber-500" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Optional Footer Elements</h2>
            <p className="text-xs text-muted-foreground">Signature motto, design quote, or personal branding domain</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="quote" className="text-xs font-semibold">
              Professional Quote / Motto
            </Label>
            <Input
              id="quote"
              placeholder='e.g. "Designing with clarity, shipping with confidence."'
              value={formData.quote}
              onChange={(e) => updateField("quote", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="additionalWebsite" className="text-xs font-semibold">
              Footer Branding Website
            </Label>
            <Input
              id="additionalWebsite"
              placeholder="e.g. aaravsharma.design"
              value={formData.additionalWebsite}
              onChange={(e) => updateField("additionalWebsite", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* BOTTOM CTA: CONTINUE TO RESUME EDITOR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <p className="text-xs text-muted-foreground">
          Step 1 of 2: After clicking continue, you can edit all text directly on the visual resume canvas.
        </p>

        <Button
          type="submit"
          size="lg"
          className="
            w-full sm:w-auto px-8 py-6 rounded-full text-base font-semibold gap-2.5
            bg-gradient-to-r from-violet-600 to-indigo-600
            hover:from-violet-500 hover:to-indigo-500
            text-white shadow-xl shadow-violet-500/25
            transition-all duration-200 hover:-translate-y-0.5
          "
        >
          <span>Continue to Resume Editor</span>
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  </form>
  )
}
