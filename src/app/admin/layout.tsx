import { Metadata } from "next"
import { AdminProvider } from "@/components/admin/admin-context"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata: Metadata = {
  title: "TURNIVO ADMIN — Analytics & Download Reporting",
  description: "Secure product analytics and usage reporting dashboard for Turnivo tools.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  )
}
