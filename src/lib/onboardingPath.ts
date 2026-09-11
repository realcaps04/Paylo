/** Where incomplete sessions should go after sign-in. */
export function onboardingPath(session: {
  onboarded: boolean
  activeShopId: string | null
  roleChosen?: boolean
  role: string
} | null) {
  if (!session || session.onboarded) return '/app'
  if (!session.roleChosen) return '/onboarding/role'
  if (session.role === 'worker') return '/onboarding/join'
  return '/onboarding'
}
