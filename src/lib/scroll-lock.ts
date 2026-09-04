// Centralized Body Scroll Lock Manager preserving exact window.scrollY

let lockCount = 0
let savedScrollY = 0

export function lockBodyScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return

  if (lockCount === 0) {
    savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.position = "fixed"
    document.body.style.top = `-${savedScrollY}px`
    document.body.style.left = "0"
    document.body.style.right = "0"
    document.body.style.width = "100%"
    document.body.style.overflow = "hidden"
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
  }

  lockCount++
}

export function unlockBodyScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return

  if (lockCount > 0) {
    lockCount--
  }

  if (lockCount === 0) {
    const scrollY = savedScrollY

    document.body.style.position = ""
    document.body.style.top = ""
    document.body.style.left = ""
    document.body.style.right = ""
    document.body.style.width = ""
    document.body.style.overflow = ""
    document.body.style.paddingRight = ""

    window.scrollTo(0, scrollY)
  }
}
