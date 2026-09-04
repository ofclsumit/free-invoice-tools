/**
 * TURNIVO — SWAPAD AD EXCHANGE CENTRAL CONFIGURATION
 * 
 * Centralized control for Swapad ad network integration.
 * Toggle SWAPAD_ENABLED or adjust allowedRoutes to manage site-wide ad visibility.
 */

export const SWAPAD_CONFIG = {
  // Master on/off toggle for Swapad across the entire website
  ENABLED: true,

  // Exact Swapboard ID and script source provided by Swapad
  SWAPBOARD_ID: "89a03b74774787304a",
  SCRIPT_URL: "https://swapad.net/api/public/embed.js",

  // Explicitly excluded routes (Critical workflows, document editing, previews, share links, PDFs)
  EXCLUDED_ROUTE_PATTERNS: [
    /^\/preview/,
    /^\/share/,
    /^\/api/,
    /^\/invoice-generator/,
    /^\/quotation-generator/,
    /^\/purchase-order/,
    /^\/proforma-invoice/,
    /^\/delivery-challan/,
    /^\/estimate-generator/,
    /^\/credit-note/,
    /^\/debit-note/,
    /^\/rent-receipt$/,
    /^\/salary-slip$/,
    /^\/business-letter$/,
    /^\/resume-generator$/,
    /^\/payment-receipt$/,
  ],

  // Eligible public routes where Swapad can be displayed in safe, non-critical lower zones
  ALLOWED_ROUTE_PATTERNS: [
    /^\/$/,                         // Home page (lower section)
    /^\/about/,                     // About page
    /^\/privacy/,                   // Privacy Policy
    /^\/terms/,                     // Terms of Service
    /^\/contact/,                   // Contact page
    /^\/blog/,                      // Blog index and articles
    /^\/guides/,                    // Guides & educational pages
    /^\/gst-calculator/,            // Financial calculators (lower informative area)
    /^\/reverse-gst-calculator/,
    /^\/gst-split-calculator/,
    /^\/gst-rate-finder/,
    /^\/gstin-validator/,
    /^\/hsn-finder/,
    /^\/emi-calculator/,
    /^\/loan-calculator/,
    /^\/interest-calculator/,
    /^\/discount-calculator/,
    /^\/profit-margin/,
    /^\/break-even-calculator/,
    /^\/commission-calculator/,
    /^\/profit-leak-detector/,
    /^\/subscription-leak-detector/,
    /^\/rent-receipt-generator/,
    /^\/salary-slip-generator/,
  ],
}

/**
 * Validates if the current pathname is eligible for displaying Swapad.
 */
export function isRouteEligibleForSwapad(pathname: string | null | undefined): boolean {
  if (!SWAPAD_CONFIG.ENABLED || !pathname) return false

  // 1. Strict check: Never allow excluded routes (previews, document editors, print views)
  const isExcluded = SWAPAD_CONFIG.EXCLUDED_ROUTE_PATTERNS.some((pattern) =>
    pattern.test(pathname)
  )
  if (isExcluded) return false

  // 2. Check if route matches allowed public patterns
  const isAllowed = SWAPAD_CONFIG.ALLOWED_ROUTE_PATTERNS.some((pattern) =>
    pattern.test(pathname)
  )

  return isAllowed
}
