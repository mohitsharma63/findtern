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
import InterviewsPage from "@/pages/interviews";
import ProposalsPage from "@/pages/proposals";
import OpportunitiesPage from "@/pages/opportunities";
import SettingsPage from "@/pages/settings";
import EditProfilePage from "@/pages/edit-profile";
import AdminLoginPage from "@/pages/admin/admin-login";
import AdminDashboardPage from "@/pages/admin/admin-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/onboarding-loading" component={OnboardingLoadingPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/interviews" component={InterviewsPage} />
      <Route path="/proposals" component={ProposalsPage} />
      {/* <Route path="/opportunities" component={OpportunitiesPage} /> */}
      <Route path="/settings" component={SettingsPage} />
      <Route path="/edit-profile" component={EditProfilePage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
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
