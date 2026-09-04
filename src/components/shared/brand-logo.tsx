"use client"

import React, { useState } from "react"
import { Layers } from "lucide-react"

// Official verified brand metadata & domain registry
export interface BrandMeta {
  name: string
  domain: string
  color: string
  iconSlug?: string
}

export const KNOWN_BRANDS: Record<string, BrandMeta> = {
  netflix: { name: "Netflix", domain: "netflix.com", color: "#E50914", iconSlug: "netflix" },
  adobe: { name: "Adobe", domain: "adobe.com", color: "#FA0F00", iconSlug: "adobe" },
  figma: { name: "Figma", domain: "figma.com", color: "#F24E1E", iconSlug: "figma" },
  canva: { name: "Canva", domain: "canva.com", color: "#00C4CC", iconSlug: "canva" },
  spotify: { name: "Spotify", domain: "spotify.com", color: "#1DB954", iconSlug: "spotify" },
  slack: { name: "Slack", domain: "slack.com", color: "#4A154B", iconSlug: "slack" },
  notion: { name: "Notion", domain: "notion.so", color: "#000000", iconSlug: "notion" },
  google: { name: "Google", domain: "google.com", color: "#4285F4", iconSlug: "google" },
  youtube: { name: "YouTube", domain: "youtube.com", color: "#FF0000", iconSlug: "youtube" },
  microsoft: { name: "Microsoft", domain: "microsoft.com", color: "#00A4EF", iconSlug: "microsoft" },
  amazon: { name: "Amazon", domain: "amazon.com", color: "#FF9900", iconSlug: "amazon" },
  aws: { name: "AWS", domain: "aws.amazon.com", color: "#232F3E", iconSlug: "amazonwebservices" },
  apple: { name: "Apple", domain: "apple.com", color: "#000000", iconSlug: "apple" },
  github: { name: "GitHub", domain: "github.com", color: "#181717", iconSlug: "github" },
  dropbox: { name: "Dropbox", domain: "dropbox.com", color: "#0061FF", iconSlug: "dropbox" },
  openai: { name: "OpenAI / ChatGPT", domain: "openai.com", color: "#10A37F", iconSlug: "openai" },
  anthropic: { name: "Claude / Anthropic", domain: "anthropic.com", color: "#191919", iconSlug: "anthropic" },
  cursor: { name: "Cursor", domain: "cursor.com", color: "#000000" },
  stripe: { name: "Stripe", domain: "stripe.com", color: "#635BFF", iconSlug: "stripe" },
  disney: { name: "Disney+", domain: "disneyplus.com", color: "#113CCF", iconSlug: "disneyplus" },
  zoom: { name: "Zoom", domain: "zoom.us", color: "#2D8CFF", iconSlug: "zoom" },
  atlassian: { name: "Atlassian / Jira", domain: "atlassian.com", color: "#0052CC", iconSlug: "atlassian" },
  asana: { name: "Asana", domain: "asana.com", color: "#F06A6A", iconSlug: "asana" },
  linear: { name: "Linear", domain: "linear.app", color: "#5E6AD2", iconSlug: "linear" },
  loom: { name: "Loom", domain: "loom.com", color: "#625DF5", iconSlug: "loom" },
  webflow: { name: "Webflow", domain: "webflow.com", color: "#146EF5", iconSlug: "webflow" },
  shopify: { name: "Shopify", domain: "shopify.com", color: "#7AB55C", iconSlug: "shopify" },
  vercel: { name: "Vercel", domain: "vercel.com", color: "#000000", iconSlug: "vercel" },
  hubspot: { name: "HubSpot", domain: "hubspot.com", color: "#FF7A59", iconSlug: "hubspot" },
  mailchimp: { name: "Mailchimp", domain: "mailchimp.com", color: "#FFE01B", iconSlug: "mailchimp" },
  airtable: { name: "Airtable", domain: "airtable.com", color: "#18BFFF", iconSlug: "airtable" },
  grammarly: { name: "Grammarly", domain: "grammarly.com", color: "#15C39A", iconSlug: "grammarly" },
  clickup: { name: "ClickUp", domain: "clickup.com", color: "#7B68EE", iconSlug: "clickup" },
  salesforce: { name: "Salesforce", domain: "salesforce.com", color: "#00A1E0", iconSlug: "salesforce" },
  intercom: { name: "Intercom", domain: "intercom.com", color: "#0057FF", iconSlug: "intercom" },
  zendesk: { name: "Zendesk", domain: "zendesk.com", color: "#03363D", iconSlug: "zendesk" },
  zapier: { name: "Zapier", domain: "zapier.com", color: "#FF4A00", iconSlug: "zapier" },
  miro: { name: "Miro", domain: "miro.com", color: "#050038", iconSlug: "miro" },
  postman: { name: "Postman", domain: "postman.com", color: "#FF6C37", iconSlug: "postman" },
  digitalocean: { name: "DigitalOcean", domain: "digitalocean.com", color: "#0080FF", iconSlug: "digitalocean" },
  cloudflare: { name: "Cloudflare", domain: "cloudflare.com", color: "#F38020", iconSlug: "cloudflare" },
  supabase: { name: "Supabase", domain: "supabase.com", color: "#3ECF8E", iconSlug: "supabase" },
  onepassword: { name: "1Password", domain: "1password.com", color: "#0A85EA", iconSlug: "1password" },
  bitwarden: { name: "Bitwarden", domain: "bitwarden.com", color: "#175DDC", iconSlug: "bitwarden" },
  nordvpn: { name: "NordVPN", domain: "nordvpn.com", color: "#4687FF", iconSlug: "nordvpn" },
  midjourney: { name: "Midjourney", domain: "midjourney.com", color: "#000000", iconSlug: "midjourney" },
}

// Match user input string to known brand
export function resolveBrand(name: string): BrandMeta | null {
  if (!name) return null
  const clean = name.toLowerCase().trim()

  // Exact or substring match against known keys
  for (const [key, meta] of Object.entries(KNOWN_BRANDS)) {
    if (clean === key || clean.includes(key) || clean.includes(meta.name.toLowerCase())) {
      return meta
    }
  }

  // Alias checks
  if (clean.includes("photoshop") || clean.includes("illustrator") || clean.includes("lightroom") || clean.includes("creative cloud") || clean.includes("premiere")) {
    return KNOWN_BRANDS.adobe
  }
  if (clean.includes("youtube") || clean.includes("gmail") || clean.includes("google drive") || clean.includes("google one") || clean.includes("gsuite")) {
    return KNOWN_BRANDS.google
  }
  if (clean.includes("office 365") || clean.includes("m365") || clean.includes("teams") || clean.includes("excel") || clean.includes("azure")) {
    return KNOWN_BRANDS.microsoft
  }
  if (clean.includes("prime") || clean.includes("prime video") || clean.includes("audible")) {
    return KNOWN_BRANDS.amazon
  }
  if (clean.includes("icloud") || clean.includes("apple music") || clean.includes("apple tv") || clean.includes("apple one")) {
    return KNOWN_BRANDS.apple
  }
  if (clean.includes("chatgpt") || clean.includes("gpt-4") || clean.includes("dall-e")) {
    return KNOWN_BRANDS.openai
  }
  if (clean.includes("claude")) {
    return KNOWN_BRANDS.anthropic
  }
  if (clean.includes("jira") || clean.includes("confluence") || clean.includes("trello")) {
    return KNOWN_BRANDS.atlassian
  }
  if (clean.includes("hotstar")) {
    return KNOWN_BRANDS.disney
  }

  // If the user typed an explicit domain like "medium.com" or "nytimes.com"
  if (clean.includes(".") && !clean.includes(" ")) {
    return {
      name: name,
      domain: clean,
      color: "#64748B",
    }
  }

  return null
}

export interface BrandLogoProps {
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function BrandLogo({ name, className = "", size = "md" }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false)
  const brand = resolveBrand(name)

  const sizeClasses = {
    sm: "w-6 h-6 p-0.5 text-[10px]",
    md: "w-8 h-8 p-1 text-xs",
    lg: "w-10 h-10 p-1.5 text-sm",
  }[size]

  // If a known brand is detected and image hasn't errored
  if (brand && !imgError) {
    // Real stock brand favicon/logo URL from the official verified brand domain
    const realBrandLogoUrl = `https://www.google.com/s2/favicons?domain=${brand.domain}&sz=128`

    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden ${sizeClasses} ${className}`}
        title={`${brand.name} official brand icon`}
        aria-label={`${brand.name} official brand icon`}
      >
        <img
          src={realBrandLogoUrl}
          alt={`${brand.name} brand`}
          className="w-full h-full object-contain rounded-md"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    )
  }

  // Generic neutral fallback icon for unrecognized/custom subscriptions
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-slate-400 ${sizeClasses} ${className}`}
      title={name ? `${name} subscription` : "Subscription service"}
      aria-label={name ? `${name} subscription` : "Subscription service"}
    >
      <Layers className="w-full h-full stroke-[1.75] p-0.5" />
    </div>
  )
}
