export { default as VelvetReceipt } from "./VelvetReceipt"
export { default as SageReceipt } from "./SageReceipt"
export { default as CarbonReceipt } from "./CarbonReceipt"
export { default as SaffronReceipt } from "./SaffronReceipt"
export { TemplateSelectorDialog } from "./TemplateSelector"

export const TEMPLATES = [
  { id: "VelvetReceipt", name: "Velvet — Luxury Banking" },
  { id: "SageReceipt", name: "Sage — Modern Fintech" },
  { id: "CarbonReceipt", name: "Carbon — Tech / SaaS" },
  { id: "SaffronReceipt", name: "Saffron — Indian Premium" },
] as const

export type CashReceiptTemplateId = (typeof TEMPLATES)[number]["id"]
