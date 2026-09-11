import { ConvexReactClient } from 'convex/react'

const url = import.meta.env.VITE_CONVEX_URL?.trim() ?? ''

export const convexUrl = url
export const convexReady = Boolean(url)

export const convex = convexReady ? new ConvexReactClient(url) : null
