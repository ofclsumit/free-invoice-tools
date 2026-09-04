export interface ResumeExperience {
  id: string
  jobTitle: string
  company: string
  location: string
  startDate: string
  endDate: string
  currentJob?: boolean
  bullets: string[]
}

export interface ResumeEducation {
  id: string
  degree: string
  institution: string
  location: string
  startDate: string
  endDate: string
}

export interface ResumeLanguage {
  id: string
  language: string
  proficiency: string
}

export interface ResumeData {
  fullName: string
  professionalTitle: string
  location: string
  phone: string
  email: string
  linkedin: string
  website: string
  summary: string
  experiences: ResumeExperience[]
  educations: ResumeEducation[]
  skills: string[]
  languages: ResumeLanguage[]
  quote: string
  additionalWebsite: string
}

export const DEFAULT_RESUME_DATA: ResumeData = {
  fullName: "Aarav Sharma",
  professionalTitle: "Product Designer",
  location: "Patna, Bihar",
  phone: "+91 90000 00000",
  email: "aarav@email.com",
  linkedin: "linkedin.com/in/aarav",
  website: "aaravsharma.design",
  summary:
    "Product designer with 6+ years shaping B2B and consumer platforms end-to-end — from research and wireframes to shipped, measurable interfaces. Focused on systems thinking, clarity under constraint, and design that holds up in engineering handoff.",
  experiences: [
    {
      id: "exp-1",
      jobTitle: "Senior Product Designer",
      company: "Northbeam Labs",
      location: "Bengaluru",
      startDate: "2022",
      endDate: "Present",
      currentJob: true,
      bullets: [
        "Led redesign of the core dashboard, reducing onboarding time by 34%",
        "Built and maintained a shared design system adopted across 5 product teams",
        "Partnered with engineering to ship 12 major releases with zero design debt",
      ],
    },
    {
      id: "exp-2",
      jobTitle: "Product Designer",
      company: "Vantage Studio",
      location: "Remote",
      startDate: "2019",
      endDate: "2022",
      currentJob: false,
      bullets: [
        "Designed end-to-end flows for 3 SaaS clients across fintech and logistics",
        "Ran weekly user interviews to validate early-stage product decisions",
      ],
    },
  ],
  educations: [
    {
      id: "edu-1",
      degree: "B.Des, Communication Design",
      institution: "National Institute of Design",
      location: "Ahmedabad",
      startDate: "2015",
      endDate: "2019",
    },
  ],
  skills: [
    "Figma",
    "Design Systems",
    "User Research",
    "Prototyping",
    "HTML / CSS",
    "Motion Design",
  ],
  languages: [
    { id: "lang-1", language: "English", proficiency: "Fluent" },
    { id: "lang-2", language: "Hindi", proficiency: "Native" },
    { id: "lang-3", language: "Japanese", proficiency: "Basic" },
  ],
  quote: '"Designing with clarity, shipping with confidence."',
  additionalWebsite: "aaravsharma.design",
}

export const EMPTY_RESUME_DATA: ResumeData = {
  fullName: "",
  professionalTitle: "",
  location: "",
  phone: "",
  email: "",
  linkedin: "",
  website: "",
  summary: "",
  experiences: [
    {
      id: "exp-new-1",
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      currentJob: false,
      bullets: [""],
    },
  ],
  educations: [
    {
      id: "edu-new-1",
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
    },
  ],
  skills: [],
  languages: [],
  quote: "",
  additionalWebsite: "",
}
