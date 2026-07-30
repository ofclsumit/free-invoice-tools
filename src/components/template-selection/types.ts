export interface Template {
  id: string;
  name: string;
  description: string;
  // A component or function rendering a mini visual preview using Tailwind
  previewContent: React.ReactNode;
}

export type DocumentType =
  | "invoice"
  | "quotation"
  | "proforma invoice"
  | "purchase order"
  | "delivery challan";

export interface TemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  documentType?: string; // Accept string, but filter based on supported document types
  currentValue?: string; // Highlight currently active template
}
