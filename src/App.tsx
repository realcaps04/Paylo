import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ShopProvider } from '@/context/ShopContext'
import { ToastProvider } from '@/context/ToastContext'
import { PwaProvider } from '@/context/PwaContext'
import { AppShell } from '@/components/layout/AppShell'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { MandatoryUpdateModal } from '@/components/pwa/MandatoryUpdateModal'
import { LoginPage } from '@/pages/LoginPage'
import { ChooseRolePage } from '@/pages/onboarding/ChooseRolePage'
import { JoinShopPage } from '@/pages/onboarding/JoinShopPage'
import { OnboardingWizard } from '@/pages/onboarding/OnboardingWizard'
import { DashboardPage } from '@/pages/DashboardPage'
import { AddWorkPage } from '@/pages/AddWorkPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { PaymentsPage } from '@/pages/PaymentsPage'
import { WorkersPage } from '@/pages/WorkersPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { CustomersPage } from '@/pages/CustomersPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { WorkRecordsPage } from '@/pages/WorkRecordsPage'
import { EarningsPage } from '@/pages/EarningsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { MorePage } from '@/pages/MorePage'
import { SearchPage } from '@/pages/SearchPage'
import { Skeleton } from '@/components/ui'
import { onboardingPath, isDashboardReady } from '@/lib/onboardingPath'
import type { ReactNode } from 'react'

function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white p-6">
      <div className="w-full max-w-sm space-y-3">
        <Skeleton className="mx-auto h-12 w-12 rounded-xl" />
        <Skeleton className="mx-auto h-4 w-2/3" />
        <Skeleton className="h-24 w-full rounded-card" />
      </div>
    </div>
  )
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!session) return <Navigate to="/login" replace />
  return children
}

function RequireOnboarded({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  if (!isDashboardReady(session)) {
    return <Navigate to={onboardingPath(session)} replace />
  }
  return children
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (session) {
    if (isDashboardReady(session)) {
      return <Navigate to="/app" replace />
    }
    return <Navigate to={onboardingPath(session)} replace />
  }
  return children
}

function RequireRoleChoice({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  if (isDashboardReady(session)) {
    return <Navigate to="/app" replace />
  }
  if (session?.roleChosen) {
    return (
      <Navigate
        to={session.role === 'worker' ? '/onboarding/join' : '/onboarding'}
        replace
      />
    )
  }
  return children
}

function RequireOwnerOnboarding({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  if (isDashboardReady(session)) {
    return <Navigate to="/app" replace />
  }
  if (!session?.roleChosen) {
    return <Navigate to="/onboarding/role" replace />
  }
  if (session.role === 'worker') {
    return <Navigate to="/onboarding/join" replace />
  }
  return children
}

function RequireStaffJoin({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  if (isDashboardReady(session)) {
    return <Navigate to="/app" replace />
  }
  if (!session?.roleChosen) {
    return <Navigate to="/onboarding/role" replace />
  }
  if (session.role !== 'worker') {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/onboarding/role"
        element={
          <RequireAuth>
            <RequireRoleChoice>
              <ChooseRolePage />
            </RequireRoleChoice>
          </RequireAuth>
        }
      />
      <Route
        path="/onboarding/join"
        element={
          <RequireAuth>
            <RequireStaffJoin>
              <JoinShopPage />
            </RequireStaffJoin>
          </RequireAuth>
        }
      />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <RequireOwnerOnboarding>
              <OnboardingWizard />
            </RequireOwnerOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </RequireOnboarded>
          </RequireAuth>
        }
      />
      <Route
        path="/app/work/new"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <AppShell>
                <AddWorkPage />
              </AppShell>
            </RequireOnboarded>
          </RequireAuth>
        }
      />
      <Route
        path="/app/work"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <AppShell>
                <WorkRecordsPage />
              </AppShell>
            </RequireOnboarded>
          </RequireAuth>
        }
      />
      <Route
        path="/app/transactions"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <AppShell>
                <TransactionsPage />
              </AppShell>
            </RequireOnboarded>
          </RequireAuth>
        }
      />
      <Route
        path="/app/payments"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <AppShell>
                <PaymentsPage />
              </AppShell>
            </RequireOnboarded>
          </RequireAuth>
        }
      />
      <Route
        path="/app/workers"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <AppShell>
                <WorkersPage />
              </AppShell>
            </RequireOnboarded>
          </RequireAuth>
        }
      />
      <Route
        path="/app/services"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <AppShell>
                <ServicesPage />
              </AppShell>
            </RequireOnboarded>
          </RequireAuth>
        }
      />
      <Route
        path="/app/customers"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <AppShell>
                <CustomersPage />
              </AppShell>
            </RequireOnboarded>
          </RequireAuth>
        }
      />
      <Route
        path="/app/reports"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <AppShell>
                <ReportsPage />
              </AppShell>
            </RequireOnboarded>
          </RequireAuth>
        }
      />
      <Route
        path="/app/earnings"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <AppShell>
                <EarningsPage />
              </AppShell>
            </RequireOnboarded>
          </RequireAuth>
        }
      />
      <Route
        path="/app/settings"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <AppShell>
                <SettingsPage />
              </AppShell>
            </RequireOnboarded>
          </RequireAuth>
        }
      />
      <Route
        path="/app/more"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <AppShell>
                <MorePage />
              </AppShell>
            </RequireOnboarded>
          </RequireAuth>
        }
      />
      <Route
        path="/app/search"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <AppShell>
                <SearchPage />
              </AppShell>
            </RequireOnboarded>
          </RequireAuth>
        }
      />
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <ToastProvider>
            <PwaProvider>
              <AppRoutes />
              <InstallPrompt />
              <MandatoryUpdateModal />
            </PwaProvider>
          </ToastProvider>
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
