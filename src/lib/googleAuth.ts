const OAUTH_MESSAGE = 'paylo-google-oauth'

export function getGoogleClientId() {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ||
    import.meta.env.GOOGLE_CLIENT_ID?.trim() ||
    ''
  )
}

export function googleSetupHint() {
  const origin = window.location.origin
  const redirect = `${origin}/google-callback.html`
  return (
    `Add these in Google Cloud → Credentials → your Web OAuth client:\n` +
    `• Authorized JavaScript origins: ${origin}\n` +
    `• Authorized redirect URIs: ${redirect}`
  )
}

function makeNonce() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export type GoogleProfile = {
  id: string
  email: string
  name: string
  picture: string | null
  emailVerified: boolean
}

/** Decode Google ID token payload (frontend identity; verify on a backend for production). */
export function decodeGoogleIdToken(idToken: string): GoogleProfile {
  const parts = idToken.split('.')
  if (parts.length < 2) throw new Error('Invalid Google token.')

  const payload = JSON.parse(
    atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
  ) as {
    sub?: string
    email?: string
    name?: string
    picture?: string
    email_verified?: boolean | string
    aud?: string
    exp?: number
  }

  const clientId = getGoogleClientId()
  if (clientId && payload.aud && payload.aud !== clientId) {
    throw new Error('Google token audience mismatch.')
  }
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new Error('Google session expired. Please try again.')
  }
  if (!payload.sub || !payload.email) {
    throw new Error('Google account is missing email access.')
  }

  return {
    id: `google_${payload.sub}`,
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture ?? null,
    emailVerified: payload.email_verified === true || payload.email_verified === 'true',
  }
}

export function openGoogleIdTokenPopup(clientId: string): Promise<string> {
  const redirectUri = `${window.location.origin}/google-callback.html`
  const nonce = makeNonce()
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'id_token',
    response_mode: 'fragment',
    scope: 'openid email profile',
    redirect_uri: redirectUri,
    nonce,
    prompt: 'select_account',
  })

  const width = 520
  const height = 640
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2))
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2))

  const popup = window.open(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    'paylo-google-signin',
    `width=${width},height=${height},left=${left},top=${top},popup=yes`,
  )

  if (!popup) {
    return Promise.reject(
      new Error('Popup blocked. Allow popups for this site and try again.'),
    )
  }

  return new Promise((resolve, reject) => {
    let settled = false

    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      window.clearInterval(closedTimer)
      window.removeEventListener('message', onMessage)
      fn()
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      const data = event.data as {
        source?: string
        idToken?: string | null
        error?: string | null
      }
      if (data?.source !== OAUTH_MESSAGE) return

      if (data.idToken) {
        finish(() => resolve(data.idToken as string))
        return
      }

      finish(() =>
        reject(
          new Error(
            data.error === 'access_denied'
              ? 'Google sign-in was cancelled.'
              : `Google sign-in failed (${data.error || 'unknown'}). ${googleSetupHint()}`,
          ),
        ),
      )
    }

    window.addEventListener('message', onMessage)

    const closedTimer = window.setInterval(() => {
      if (!popup.closed) return
      finish(() => reject(new Error('Google sign-in was cancelled.')))
    }, 400)
  })
}

export async function signInWithGooglePopup(): Promise<GoogleProfile> {
  const clientId = getGoogleClientId()
  if (!clientId) {
    throw new Error(
      'Add VITE_GOOGLE_CLIENT_ID to .env, then restart the dev server.',
    )
  }
  const idToken = await openGoogleIdTokenPopup(clientId)
  return decodeGoogleIdToken(idToken)
}
