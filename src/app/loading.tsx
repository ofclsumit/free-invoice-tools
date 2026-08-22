import { FullScreenLoader } from "@/components/shared/loading"

export default function GlobalLoading() {
  return <FullScreenLoader delayMs={150} message="Loading page..." />
}
