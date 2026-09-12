const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Full registry of all 28 tools on Turnivo
const toolsRegistry = [
  // Document Generators
  {
    category: "Document Generators",
    name: "Invoice Generator",
    slug: "invoice-generator",
    url: "https://turnivo.in/invoice-generator",
    exportFormat: "PDF (A4 Vector/Raster) & Print",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["invoice", "template"]
  },
  {
    category: "Document Generators",
    name: "Quotation Generator",
    slug: "quotation-generator",
    url: "https://turnivo.in/quotation-generator",
    exportFormat: "PDF & Print",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["quotation"]
  },
  {
    category: "Document Generators",
    name: "Resume Generator",
    slug: "resume-generator",
    url: "https://turnivo.in/resume-generator",
    exportFormat: "PDF (A4 Resume) & Print",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["resume", "resume-generator"]
  },
  {
    category: "Document Generators",
    name: "Proforma Invoice",
    slug: "proforma-invoice",
    url: "https://turnivo.in/proforma-invoice",
    exportFormat: "PDF & Print",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["proforma-invoice", "proforma"]
  },
  {
    category: "Document Generators",
    name: "Purchase Order",
    slug: "purchase-order",
    url: "https://turnivo.in/purchase-order",
    exportFormat: "PDF & Print",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["purchase-order"]
  },
  {
    category: "Document Generators",
    name: "Delivery Challan",
    slug: "delivery-challan",
    url: "https://turnivo.in/delivery-challan",
    exportFormat: "PDF & Print",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["delivery-challan"]
  },
  {
    category: "Document Generators",
    name: "Payment Receipt",
    slug: "payment-receipt",
    url: "https://turnivo.in/payment-receipt",
    exportFormat: "PDF & Print",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["payment-receipt", "receipt"]
  },
  {
    category: "Document Generators",
    name: "Rent Receipt",
    slug: "rent-receipt",
    url: "https://turnivo.in/rent-receipt",
    exportFormat: "PDF & Print",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["rent-receipt"]
  },
  {
    category: "Document Generators",
    name: "Salary Slip",
    slug: "salary-slip",
    url: "https://turnivo.in/salary-slip",
    exportFormat: "PDF & Print",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["salary-slip"]
  },
  {
    category: "Document Generators",
    name: "Estimate Generator",
    slug: "estimate-generator",
    url: "https://turnivo.in/estimate-generator",
    exportFormat: "PDF & Print",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["estimate-generator", "estimate"]
  },
  {
    category: "Document Generators",
    name: "Credit Note",
    slug: "credit-note",
    url: "https://turnivo.in/credit-note",
    exportFormat: "PDF & Print",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["credit-note"]
  },
  {
    category: "Document Generators",
    name: "Debit Note",
    slug: "debit-note",
    url: "https://turnivo.in/debit-note",
    exportFormat: "PDF & Print",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["debit-note"]
  },
  {
    category: "Document Generators",
    name: "Business Letter",
    slug: "business-letter",
    url: "https://turnivo.in/business-letter",
    exportFormat: "PDF & Print",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["business-letter"]
  },

  // Financial Calculators
  {
    category: "Financial Calculators",
    name: "Profit Leak Detector",
    slug: "profit-leak-detector",
    url: "https://turnivo.in/profit-leak-detector",
    exportFormat: "PDF Audit Report",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["profit-leak-detector"]
  },
  {
    category: "Financial Calculators",
    name: "Subscription Leak Detector",
    slug: "subscription-leak-detector",
    url: "https://turnivo.in/subscription-leak-detector",
    exportFormat: "PDF Audit Report",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["subscription-leak-detector"]
  },
  {
    category: "Financial Calculators",
    name: "GST Calculator",
    slug: "gst-calculator",
    url: "https://turnivo.in/gst-calculator",
    exportFormat: "PDF Calculation Report",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["gst-calculator"]
  },
  {
    category: "Financial Calculators",
    name: "Reverse GST Calculator",
    slug: "reverse-gst-calculator",
    url: "https://turnivo.in/reverse-gst-calculator",
    exportFormat: "PDF Calculation Report",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["reverse-gst-calculator"]
  },
  {
    category: "Financial Calculators",
    name: "GST Split Calculator",
    slug: "gst-split-calculator",
    url: "https://turnivo.in/gst-split-calculator",
    exportFormat: "PDF Calculation Report",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["gst-split-calculator"]
  },
  {
    category: "Financial Calculators",
    name: "GST Rate Finder",
    slug: "gst-rate-finder",
    url: "https://turnivo.in/gst-rate-finder",
    exportFormat: "PDF Rate Table Export",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["gst-rate-finder"]
  },
  {
    category: "Financial Calculators",
    name: "EMI Calculator",
    slug: "emi-calculator",
    url: "https://turnivo.in/emi-calculator",
    exportFormat: "PDF Repayment Schedule",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["emi-calculator"]
  },
  {
    category: "Financial Calculators",
    name: "Loan Calculator",
    slug: "loan-calculator",
    url: "https://turnivo.in/loan-calculator",
    exportFormat: "PDF Loan Schedule Report",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["loan-calculator"]
  },
  {
    category: "Financial Calculators",
    name: "Interest Calculator",
    slug: "interest-calculator",
    url: "https://turnivo.in/interest-calculator",
    exportFormat: "PDF Interest Report",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["interest-calculator"]
  },
  {
    category: "Financial Calculators",
    name: "Profit Margin Calculator",
    slug: "profit-margin",
    url: "https://turnivo.in/profit-margin",
    exportFormat: "PDF Margin Breakdown",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["profit-margin"]
  },
  {
    category: "Financial Calculators",
    name: "Break-Even Calculator",
    slug: "break-even-calculator",
    url: "https://turnivo.in/break-even-calculator",
    exportFormat: "PDF Analysis Report",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["break-even-calculator"]
  },
  {
    category: "Financial Calculators",
    name: "Commission Calculator",
    slug: "commission-calculator",
    url: "https://turnivo.in/commission-calculator",
    exportFormat: "PDF Calculation Report",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["commission-calculator"]
  },
  {
    category: "Financial Calculators",
    name: "Discount Calculator",
    slug: "discount-calculator",
    url: "https://turnivo.in/discount-calculator",
    exportFormat: "PDF Calculation Report",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["discount-calculator"]
  },

  // Utilities & Tools
  {
    category: "Utilities & Tools",
    name: "HSN Code Finder",
    slug: "hsn-finder",
    url: "https://turnivo.in/hsn-finder",
    exportFormat: "PDF HSN List Export",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["hsn-finder"]
  },
  {
    category: "Utilities & Tools",
    name: "GSTIN Validator",
    slug: "gstin-validator",
    url: "https://turnivo.in/gstin-validator",
    exportFormat: "PDF Verification Report",
    generationMethod: "Client-side (jsPDF + html2canvas)",
    docTypeMatch: ["gstin-validator"]
  }
];

async function generateExcelReport() {
  console.log("Reading database records...");
  const shareLinks = await prisma.shareLink.findMany({
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Found ${shareLinks.length} shareLink records in SQLite.`);

  // Parse share links to attribute to tools
  const shareCounts = {};
  const detailedShareLogs = [];

  for (const link of shareLinks) {
    let docType = "unknown";
    let title = link.title || "Document";
    let details = {};

    try {
      const parsed = JSON.parse(link.data);
      docType = parsed.docType || parsed.type || "unknown";
      if (parsed.title) title = parsed.title;
      details = parsed;
    } catch (e) {
      // fallback
    }

    shareCounts[docType] = (shareCounts[docType] || 0) + 1;

    detailedShareLogs.push({
      "Share ID": link.id,
      "Document Type": docType,
      "Document Title": title,
      "Created At (UTC)": new Date(link.createdAt).toISOString(),
      "Created Date": new Date(link.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }),
      "Created Time (IST)": new Date(link.createdAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
      "Expires At": new Date(link.expiresAt).toISOString(),
    });
  }

  // Build Tool Downloads & Usage Data
  const toolRows = toolsRegistry.map((tool, idx) => {
    let sharedCount = 0;
    for (const match of tool.docTypeMatch) {
      if (shareCounts[match]) {
        sharedCount += shareCounts[match];
      }
    }

    return {
      "S.No": idx + 1,
      "Tool Name": tool.name,
      "Category": tool.category,
      "Tool URL": tool.url,
      "Supported Export / Download Format": tool.exportFormat,
      "Generation Architecture": tool.generationMethod,
      "Server-Recorded File Downloads": 0,
      "Cloud Shared Links Created": sharedCount,
      "Download Tracking Telemetry": "Not Configured (Client-side Only)",
      "Remarks / Explanation": "PDFs are generated 100% in client browser memory (jsPDF/html2canvas). Downloads bypass server."
    };
  });

  // Calculate totals
  const totalTools = toolsRegistry.length;
  const totalShareLinks = shareLinks.length;
  const totalServerDownloads = 0;

  // Build Sheet 1: Executive Summary Dashboard
  const summaryData = [
    { "Metric": "Report Title", "Value": "Turnivo.in - Tools Download & Usage Audit Report" },
    { "Metric": "Generated Date", "Value": new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " (IST)" },
    { "Metric": "Website Domain", "Value": "https://turnivo.in" },
    { "Metric": "Total Active Tools", "Value": totalTools },
    { "Metric": "Document Generator Tools", "Value": toolsRegistry.filter(t => t.category === "Document Generators").length },
    { "Metric": "Financial Calculator Tools", "Value": toolsRegistry.filter(t => t.category === "Financial Calculators").length },
    { "Metric": "Utility Tools", "Value": toolsRegistry.filter(t => t.category === "Utilities & Tools").length },
    { "Metric": "Total Server-Logged File Downloads", "Value": totalServerDownloads },
    { "Metric": "Total Cloud Share Links Generated (DB)", "Value": totalShareLinks },
    { "Metric": "Database Engine Inspected", "Value": "SQLite (dev.db) / Prisma ORM" },
    { "Metric": "Analytics In Place", "Value": "Google Analytics 4 (Measurement ID: G-21CX92SPJN)" },
    { "Metric": "Current Download Architecture", "Value": "100% Client-Side via jsPDF & html2canvas (Zero server overhead, private)" },
    { "Metric": "Key Finding", "Value": "Direct file downloads are triggered directly in browser memory without sending an API event to the server database. Hence, server-side download count is 0." },
    { "Metric": "Recommended Action", "Value": "Add a lightweight POST /api/track-download telemetry route or GA4 custom event gtag('event', 'file_download') to record every download." }
  ];

  // Build Sheet 4: Implementation Roadmap for Download Tracking
  const guideData = [
    {
      "Step": "Step 1: Database Model",
      "Component": "prisma/schema.prisma",
      "Description": "Add a DownloadLog model (toolName, toolSlug, fileType, ipAddress, userAgent, timestamp) to dev.db / Supabase."
    },
    {
      "Step": "Step 2: Tracking API Route",
      "Component": "src/app/api/track-download/route.ts",
      "Description": "Create a fast Next.js API route that increments tool download counters upon export completion."
    },
    {
      "Step": "Step 3: Client Export Hook",
      "Component": "src/components/invoice-templates/utils/exportPdf.ts",
      "Description": "Inside exportNodeToPdf(), add navigator.sendBeacon('/api/track-download', ...) so tracking is non-blocking."
    },
    {
      "Step": "Step 4: GA4 Event Tracking",
      "Component": "Google Analytics (G-21CX92SPJN)",
      "Description": "Trigger gtag('event', 'file_download', { tool: toolName, file_extension: 'pdf' }) on every download button click."
    },
    {
      "Step": "Step 5: Admin Analytics Dashboard",
      "Component": "src/app/admin/downloads/page.tsx",
      "Description": "Create an internal admin dashboard displaying real-time daily, weekly, and all-time download counts per tool."
    }
  ];

  // Create Workbook
  const wb = XLSX.utils.book_new();

  // Convert to Worksheets
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  const wsTools = XLSX.utils.json_to_sheet(toolRows);
  const wsShareLogs = XLSX.utils.json_to_sheet(detailedShareLogs);
  const wsGuide = XLSX.utils.json_to_sheet(guideData);

  // Set column widths
  wsSummary['!cols'] = [{ wch: 35 }, { wch: 90 }];
  wsTools['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 30 }, // Tool Name
    { wch: 24 }, // Category
    { wch: 42 }, // Tool URL
    { wch: 34 }, // Supported Export Format
    { wch: 36 }, // Generation Architecture
    { wch: 28 }, // Server-Recorded File Downloads
    { wch: 28 }, // Cloud Shared Links Created
    { wch: 32 }, // Download Tracking Telemetry
    { wch: 60 }  // Remarks
  ];
  wsShareLogs['!cols'] = [
    { wch: 34 }, // Share ID
    { wch: 26 }, // Document Type
    { wch: 30 }, // Document Title
    { wch: 28 }, // Created At UTC
    { wch: 16 }, // Created Date
    { wch: 18 }, // Created Time IST
    { wch: 28 }  // Expires At
  ];
  wsGuide['!cols'] = [
    { wch: 20 },
    { wch: 35 },
    { wch: 75 }
  ];

  // Append Sheets
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary Dashboard");
  XLSX.utils.book_append_sheet(wb, wsTools, "Tool Downloads & Usage");
  XLSX.utils.book_append_sheet(wb, wsShareLogs, "DB Share Links Log");
  XLSX.utils.book_append_sheet(wb, wsGuide, "Tracking Setup Guide");

  // Output file paths
  const rootPath = path.resolve(__dirname, "..", "Turnivo_Tools_Download_Report.xlsx");
  const turnivoPath = path.resolve(__dirname, "Turnivo_Tools_Download_Report.xlsx");

  XLSX.writeFile(wb, rootPath);
  XLSX.writeFile(wb, turnivoPath);

  console.log(`Excel file generated successfully!`);
  console.log(`Saved at: ${rootPath}`);
  console.log(`Saved at: ${turnivoPath}`);
}

generateExcelReport()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
