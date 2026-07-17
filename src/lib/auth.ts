import { cookies } from "next/headers"

export interface SessionUser {
  id: string
  name?: string
  email?: string
  picture?: string
}

export interface Session {
  user: SessionUser
}

/**
 * Returns the current session derived from the qf_session cookie.
 * Compatible with the existing API routes that expect `session.user.id`.
 */
export async function auth(): Promise<Session | null> {
  const store = await cookies()
  const raw = store.get("qf_session")?.value
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    const id =
      typeof data.sub === "string" && data.sub
        ? data.sub
        : typeof data.email === "string" && data.email
        ? `email:${data.email}`
        : ""
    if (!id) return null
    return {
      user: {
        id,
        name: data.name,
        email: data.email,
        picture: data.picture,
      },
    }
  } catch {
    return null
  }
}
