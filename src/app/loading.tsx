import { LoadingSkeleton } from "@/components/shared/loading-elements"
import { UltraShell } from "@/components/ultra/ultra-shell"
import { UltraNav } from "@/components/ultra/ultra-components"

export default function GlobalLoading() {
  return (
    <UltraShell>
      <UltraNav />
      <LoadingSkeleton />
    </UltraShell>
  )
}
