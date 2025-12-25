import "bootstrap/dist/css/bootstrap.min.css"; // Using your saved path
import "../App.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState, type ReactNode } from "react";

import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { getEmployerAuth, type EmployerAuth } from "@/lib/employerAuth";

import Layout from "./layout/Layout";

// Marketing pages
import Home from "./pages/findtern-ui/Home";
import About from "./pages/findtern-ui/About";
import Pricing from "./pages/findtern-ui/Pricing";
import Blog from "./pages/findtern-ui/Blog";
import BlogDetail from "./pages/findtern-ui/BlogDetail";
import Contact from "./pages/findtern-ui/Contact";
import Faq from "./pages/findtern-ui/Faq";
import Terms from "./pages/findtern-ui/Terms";

// Intern pages
import SignupPage from "@/pages/signup";
import LoginPage from "@/pages/login";
import OnboardingLoadingPage from "@/pages/onboarding-loading";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard";
import DashboardDocumentsPage from "@/pages/dashboard-documents";
import InterviewsPage from "@/pages/interviews";
import ProposalsPage from "@/pages/proposals";
import ProposalDetailPage from "@/pages/proposal-detail";
import SettingsPage from "@/pages/settings";
import EditProfilePage from "@/pages/edit-profile";

// Admin pages
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

// Employer pages
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

import NotFound from "@/pages/not-found";

function AdminIndexRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/admin/dashboard");
  }, [setLocation]);
  return null;
}

function EmployerIndexRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/employer/dashboard");
  }, [setLocation]);
  return null;
}

function InternAliasRedirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [setLocation, to]);
  return null;
}

type EmployerStage = "setup" | "onboarding" | "internal";

function EmployerRouteGuard({
  requiredStage,
  children,
}: {
  requiredStage: EmployerStage;
  children: ReactNode;
}) {
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

function MarketingPage({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      {/* Marketing */}
      <Route path="/">
        <MarketingPage>
          <Home />
        </MarketingPage>
      </Route>
      <Route path="/about">
        <MarketingPage>
          <About />
        </MarketingPage>
      </Route>
      <Route path="/pricing">
        <MarketingPage>
          <Pricing />
        </MarketingPage>
      </Route>
      <Route path="/blog">
        <MarketingPage>
          <Blog />
        </MarketingPage>
      </Route>
      <Route path="/blog/:slug">
        {(params) => (
          <MarketingPage>
            <BlogDetail params={params} />
          </MarketingPage>
        )}
      </Route>
      <Route path="/contact">
        <MarketingPage>
          <Contact />
        </MarketingPage>
      </Route>
      <Route path="/faq">
        <MarketingPage>
          <Faq />
        </MarketingPage>
      </Route>
      <Route path="/terms-and-conditions">
        <MarketingPage>
          <Terms />
        </MarketingPage>
      </Route>

      {/* Intern (canonical routes) */}
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/onboarding-loading" component={OnboardingLoadingPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/dashboard/documents" component={DashboardDocumentsPage} />
      <Route path="/interviews" component={InterviewsPage} />
      <Route path="/proposals" component={ProposalsPage} />
      <Route path="/proposals/:id" component={ProposalDetailPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/edit-profile" component={EditProfilePage} />

      {/* Intern aliases under /intern/* */}
      <Route path="/intern/login">
        <InternAliasRedirect to="/login" />
      </Route>
      <Route path="/intern/signup">
        <InternAliasRedirect to="/signup" />
      </Route>
      <Route path="/intern/onboarding-loading">
        <InternAliasRedirect to="/onboarding-loading" />
      </Route>
      <Route path="/intern/onboarding">
        <InternAliasRedirect to="/onboarding" />
      </Route>
      <Route path="/intern/dashboard">
        <InternAliasRedirect to="/dashboard" />
      </Route>
      <Route path="/intern/dashboard/documents">
        <InternAliasRedirect to="/dashboard/documents" />
      </Route>
      <Route path="/intern/interviews">
        <InternAliasRedirect to="/interviews" />
      </Route>
      <Route path="/intern/proposals">
        <InternAliasRedirect to="/proposals" />
      </Route>
      <Route path="/intern/proposals/:id">
        {(params) => <InternAliasRedirect to={`/proposals/${params.id ?? ""}`} />}
      </Route>
      <Route path="/intern/settings">
        <InternAliasRedirect to="/settings" />
      </Route>
      <Route path="/intern/edit-profile">
        <InternAliasRedirect to="/edit-profile" />
      </Route>

      {/* Employer */}
      <Route path="/employer" component={EmployerIndexRedirect} />
      <Route path="/employer/signup" component={EmployerSignupPage} />
      <Route path="/employer/login" component={EmployerLoginPage} />

      <Route path="/employer/setup">
        <EmployerRouteGuard requiredStage="setup">
          <CompanySetupPage />
        </EmployerRouteGuard>
      </Route>
      <Route path="/employer/onboarding">
        <EmployerRouteGuard requiredStage="onboarding">
          <EmployerOnboardingPage />
        </EmployerRouteGuard>
      </Route>
      <Route path="/employer/dashboard">
        <EmployerRouteGuard requiredStage="internal">
          <EmployerDashboardPage />
        </EmployerRouteGuard>
      </Route>
      <Route path="/employer/profile">
        <EmployerRouteGuard requiredStage="internal">
          <CompanyProfilePage />
        </EmployerRouteGuard>
      </Route>
      <Route path="/employer/account">
        <EmployerRouteGuard requiredStage="internal">
          <CompanyAccountPage />
        </EmployerRouteGuard>
      </Route>
      <Route path="/employer/account/change-password">
        <EmployerRouteGuard requiredStage="internal">
          <EmployerChangePasswordPage />
        </EmployerRouteGuard>
      </Route>
      <Route path="/employer/account/deactivate">
        <EmployerRouteGuard requiredStage="internal">
          <EmployerDeactivateAccountPage />
        </EmployerRouteGuard>
      </Route>
      <Route path="/employer/schedule">
        <EmployerRouteGuard requiredStage="internal">
          <EmployerSchedulePage />
        </EmployerRouteGuard>
      </Route>
      {/* Backward-compatible typo route */}
      <Route path="/employer/shedule">
        <InternAliasRedirect to="/employer/schedule" />
      </Route>
      <Route path="/employer/cart">
        <EmployerRouteGuard requiredStage="internal">
          <EmployerCartPage />
        </EmployerRouteGuard>
      </Route>
      <Route path="/employer/proposals">
        <EmployerRouteGuard requiredStage="internal">
          <EmployerProposalsPage />
        </EmployerRouteGuard>
      </Route>
      <Route path="/employer/proposals/:id">
        <EmployerRouteGuard requiredStage="internal">
          <EmployerProposalDetailPage />
        </EmployerRouteGuard>
      </Route>
      <Route path="/employer/proposals/:id/edit">
        <EmployerRouteGuard requiredStage="internal">
          <EmployerProposalEditPage />
        </EmployerRouteGuard>
      </Route>
      <Route path="/employer/compare">
        <EmployerRouteGuard requiredStage="internal">
          <EmployerComparePage />
        </EmployerRouteGuard>
      </Route>
      <Route path="/employer/intern/:id">
        <EmployerRouteGuard requiredStage="internal">
          <EmployerInternDetailPage />
        </EmployerRouteGuard>
      </Route>

      {/* Admin */}
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}