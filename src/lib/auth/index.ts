import { prisma } from "@/lib/prisma/client"

let defaultUser: { id: string } | null = null

async function ensureDefaultUser(): Promise<{ id: string }> {
  if (defaultUser) return defaultUser
  const existing = await prisma.user.findFirst()
  if (existing) {
    defaultUser = { id: existing.id }
    return defaultUser
  }
  const user = await prisma.user.create({
    data: {
      name: "My Business",
      email: "business@quoteflow.local",
      businessName: "My Business",
    },
  })
  defaultUser = { id: user.id }
  return defaultUser
}

export async function auth() {
  const user = await ensureDefaultUser()
  return { user: { id: user.id } }
}
