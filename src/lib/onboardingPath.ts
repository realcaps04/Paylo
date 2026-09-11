/** Where incomplete sessions should go after sign-in. */
export function onboardingPath(session: {
  onboarded: boolean
  activeShopId: string | null
  shopIds?: string[]
  roleChosen?: boolean
  role: string
} | null) {
  if (!session) return '/login'
  if (session.onboarded && (session.activeShopId || (session.shopIds?.length ?? 0) > 0)) {
    return '/app'
  }
  if (!session.roleChosen) return '/onboarding/role'
  if (session.role === 'worker') return '/onboarding/join'
  return '/onboarding'
}

/** True when the session should land on the dashboard. */
export function isDashboardReady(session: {
  onboarded: boolean
  activeShopId: string | null
  shopIds?: string[]
} | null) {
  if (!session?.onboarded) return false
  return Boolean(session.activeShopId) || (session.shopIds?.length ?? 0) > 0
}
