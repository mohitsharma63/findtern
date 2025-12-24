import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SignupPage from "@/pages/signup";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";
import OnboardingLoadingPage from "@/pages/onboarding-loading";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard";
import DashboardDocumentsPage from "@/pages/dashboard-documents";
import InterviewsPage from "@/pages/interviews";
import ProposalsPage from "@/pages/proposals";
import ProposalDetailPage from "@/pages/proposal-detail";
import OpportunitiesPage from "@/pages/opportunities";
import SettingsPage from "@/pages/settings";
import EditProfilePage from "@/pages/edit-profile";
import AdminLoginPage from "@/pages/admin/admin-login";
import AdminDashboardPage from "@/pages/admin/admin-dashboard";
import AdminSkillsPage from "@/pages/admin/admin-skills";
import AdminInternsPage from "@/pages/admin/admin-interns";
import AdminCompaniesPage from "@/pages/admin/admin-companies";
import AdminProjectsPage from "@/pages/admin/admin-projects";
import AdminSettingsPage from "@/pages/admin/admin-settings";
import AdminReportsPage from "@/pages/admin/admin-reports";
import AdminUsersPage from "@/pages/admin/admin-users";
import AdminInternDetailPage from "@/pages/admin/admin-intern-detail";
import AdminCompanyDetailPage from "@/pages/admin/admin-company-detail";
import AdminTransactionsPage from "@/pages/admin/admin-transactions";
// Employer Pages
import EmployerSignupPage from "@/pages/employer/employer-signup";
import EmployerLoginPage from "@/pages/employer/employer-login";
import EmployerOnboardingPage from "@/pages/employer/employer-onboarding";
import EmployerDashboardPage from "@/pages/employer/employer-dashboard";
import EmployerSchedulePage from "@/pages/employer/employer-schedule";
import CompanyProfilePage from "@/pages/employer/company-profile";
import CompanySetupPage from "@/pages/employer/company-setup";
import CompanyAccountPage from "@/pages/employer/company-account";
import EmployerChangePasswordPage from "@/pages/employer/employer-change-password";
import EmployerDeactivateAccountPage from "@/pages/employer/employer-deactivate-account";
import EmployerCartPage from "@/pages/employer/employer-cart";
import EmployerComparePage from "@/pages/employer/employer-compare";
import EmployerInternDetailPage from "@/pages/employer/employer-intern-detail";
import EmployerProposalsPage from "@/pages/employer/employer-proposals";
import EmployerProposalDetailPage from "@/pages/employer/employer-proposal-detail";
import EmployerProposalEditPage from "@/pages/employer/employer-proposal-edit-page";
import { useLocation } from "wouter";
import { useEffect, useState, type ReactNode } from "react";
import { getEmployerAuth, type EmployerAuth } from "@/lib/employerAuth";

function AdminIndexRedirect() {
  const [, setLocation] = useLocation();
  setLocation("/admin/dashboard");
  return null;
}

function EmployerIndexRedirect() {
  const [, setLocation] = useLocation();
  setLocation("/employer/dashboard");
  return null;
}

type EmployerStage = "setup" | "onboarding" | "internal";

function EmployerRouteGuard({ requiredStage, children }: { requiredStage: EmployerStage; children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [checked, setChecked] = useState(false);
  const [auth, setAuth] = useState<EmployerAuth | null>(null);

  useEffect(() => {
    const current = getEmployerAuth();
    setAuth(current);

    if (!current) {
      setLocation("/employer/login");
      setChecked(true);
      return;
    }

    if (requiredStage === "setup") {
      if (current.setupCompleted) {
        if (current.onboardingCompleted) {
          setLocation("/employer/dashboard");
        } else {
          setLocation("/employer/onboarding");
        }
      }
      setChecked(true);
      return;
    }

    if (requiredStage === "onboarding") {
      if (!current.setupCompleted) {
        setLocation("/employer/setup");
      } else if (current.onboardingCompleted) {
        setLocation("/employer/dashboard");
      }
      setChecked(true);
      return;
    }

    if (requiredStage === "internal") {
      if (!current.setupCompleted) {
        setLocation("/employer/setup");
        setChecked(true);
        return;
      }
      if (!current.onboardingCompleted) {
        setLocation("/employer/onboarding");
        setChecked(true);
        return;
      }
    }

    setChecked(true);
  }, [requiredStage, setLocation]);

  if (!checked || !auth) return null;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/onboarding-loading" component={OnboardingLoadingPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/dashboard/documents" component={DashboardDocumentsPage} />
      <Route path="/interviews" component={InterviewsPage} />
      <Route path="/proposals" component={ProposalsPage} />
      <Route path="/proposals/:id" component={ProposalDetailPage} />
      {/* <Route path="/opportunities" component={OpportunitiesPage} /> */}
      <Route path="/settings" component={SettingsPage} />
      <Route path="/edit-profile" component={EditProfilePage} />

      {/* Employer routes */}
      <Route path="/employer" component={EmployerIndexRedirect} />
      <Route path="/employer/signup" component={EmployerSignupPage} />
      <Route path="/employer/login" component={EmployerLoginPage} />
      <Route
        path="/employer/setup"
        component={() => (
          <EmployerRouteGuard requiredStage="setup">
            <CompanySetupPage />
          </EmployerRouteGuard>
        )}
      />
      <Route
        path="/employer/onboarding"
        component={() => (
          <EmployerRouteGuard requiredStage="onboarding">
            <EmployerOnboardingPage />
          </EmployerRouteGuard>
        )}
      />
      <Route
        path="/employer/dashboard"
        component={() => (
          <EmployerRouteGuard requiredStage="internal">
            <EmployerDashboardPage />
          </EmployerRouteGuard>
        )}
      />
      <Route
        path="/employer/profile"
        component={() => (
          <EmployerRouteGuard requiredStage="internal">
            <CompanyProfilePage />
          </EmployerRouteGuard>
        )}
      />
      <Route
        path="/employer/account"
        component={() => (
          <EmployerRouteGuard requiredStage="internal">
            <CompanyAccountPage />
          </EmployerRouteGuard>
        )}
      />
      <Route
        path="/employer/account/change-password"
        component={() => (
          <EmployerRouteGuard requiredStage="internal">
            <EmployerChangePasswordPage />
          </EmployerRouteGuard>
        )}
      />
      <Route
        path="/employer/account/deactivate"
        component={() => (
          <EmployerRouteGuard requiredStage="internal">
            <EmployerDeactivateAccountPage />
          </EmployerRouteGuard>
        )}
      />
      <Route
        path="/employer/shedule"
        component={() => (
          <EmployerRouteGuard requiredStage="internal">
            <EmployerSchedulePage />
          </EmployerRouteGuard>
        )}
      />
      <Route
        path="/employer/cart"
        component={() => (
          <EmployerRouteGuard requiredStage="internal">
            <EmployerCartPage />
          </EmployerRouteGuard>
        )}
      />
      <Route
        path="/employer/proposals"
        component={() => (
          <EmployerRouteGuard requiredStage="internal">
            <EmployerProposalsPage />
          </EmployerRouteGuard>
        )}
      />
      <Route
        path="/employer/proposals/:id"
        component={() => (
          <EmployerRouteGuard requiredStage="internal">
            <EmployerProposalDetailPage />
          </EmployerRouteGuard>
        )}
      />
      <Route
        path="/employer/proposals/:id/edit"
        component={() => (
          <EmployerRouteGuard requiredStage="internal">
            <EmployerProposalEditPage />
          </EmployerRouteGuard>
        )}
      />
      <Route
        path="/employer/compare"
        component={() => (
          <EmployerRouteGuard requiredStage="internal">
            <EmployerComparePage />
          </EmployerRouteGuard>
        )}
      />
      <Route
        path="/employer/intern/:id"
        component={() => (
          <EmployerRouteGuard requiredStage="internal">
            <EmployerInternDetailPage />
          </EmployerRouteGuard>
        )}
      />

      {/* Admin routes */}
      <Route path="/admin" component={AdminIndexRedirect} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/skills" component={AdminSkillsPage} />
      <Route path="/admin/interns" component={AdminInternsPage} />
      <Route path="/admin/interns/:id" component={AdminInternDetailPage} />
      <Route path="/admin/companies" component={AdminCompaniesPage} />
      <Route path="/admin/companies/:id" component={AdminCompanyDetailPage} />
      <Route path="/admin/projects" component={AdminProjectsPage} />
      <Route path="/admin/transactions" component={AdminTransactionsPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route path="/admin/reports" component={AdminReportsPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;