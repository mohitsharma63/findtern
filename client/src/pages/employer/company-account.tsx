import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Building2, User, CreditCard, HelpCircle, ArrowRight, ShoppingBag, Shield, LogOut, Trash2 } from "lucide-react";
import { EmployerHeader } from "@/components/employer/EmployerHeader";
import { apiRequest } from "@/lib/queryClient";
import { getEmployerAuth } from "@/lib/employerAuth";

export default function CompanyAccountPage() {
  const [, setLocation] = useLocation();
  const [employer, setEmployer] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      const auth = getEmployerAuth();
      if (!auth) {
        setLocation("/employer/login");
        return;
      }

      try {
        const res = await apiRequest("GET", `/api/employer/${auth.id}`);
        const json = await res.json();
        if (json?.employer) {
          setEmployer(json.employer);
        }
      } catch (error) {
        console.error("Failed to load employer for company account", error);
      }
    };

    load();
  }, [setLocation]);

  const companyName = employer?.companyName ?? "Company";
  const companyEmail = employer?.companyEmail ?? "";
  const cityState = [employer?.city, employer?.state].filter(Boolean).join(", ");
  const primaryContactName = employer?.primaryContactName ?? "Primary contact";
  const primaryContactRole = employer?.primaryContactRole ?? "";

  const maskedPhone = (() => {
    const raw = employer?.phoneNumber as string | undefined;
    if (!raw) return "";
    if (raw.length <= 4) return raw;
    const visible = raw.slice(-4);
    return `${raw.startsWith("+") ? "" : "+91-"}****${visible}`;
  })();

  const maskedAccountNumber = (() => {
    const acc = employer?.accountNumber as string | undefined;
    if (!acc) return "Not added";
    if (acc.length <= 4) return `**** ${acc}`;
    return `**** ${acc.slice(-4)}`;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      <EmployerHeader active="none" />

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-6">
        {/* Page title */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Company Account</h1>
          <p className="text-sm text-slate-600">
            Manage your company profile, billing and orders from one place. This page is a static design preview.
          </p>
        </div>

        {/* Company account options list */}
       

        {/* Top summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Card className="rounded-2xl bg-white/95 border-slate-200 max-w-xs">
          <div className="px-4 pt-3 pb-2 text-xs font-medium text-slate-500">Company Account</div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => setLocation("/employer/profile")}
              className="w-full flex items-center gap-2 px-4 py-1.5 text-sm text-slate-800 hover:bg-emerald-50 cursor-pointer text-left"
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Company Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setLocation("/employer/account/change-password")}
              className="w-full flex items-center gap-2 px-4 py-1.5 text-sm text-slate-800 hover:bg-slate-50 cursor-pointer text-left"
            >
              <Shield className="w-4 h-4 text-slate-600" />
              <span>Change Password</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-4 py-1.5 text-sm text-slate-800 hover:bg-slate-50 cursor-default text-left"
            >
              <ShoppingBag className="w-4 h-4 text-slate-700" />
              <span>Orders (static)</span>
            </button>
            <button
              type="button"
              onClick={() => setLocation("/employer/shedule")}
              className="w-full flex items-center gap-2 px-4 py-1.5 text-sm text-slate-800 hover:bg-slate-50 cursor-pointer text-left"
            >
              <HelpCircle className="w-4 h-4 text-slate-600" />
              <span>Help &amp; Support</span>
            </button>
            <div className="my-1 border-t border-slate-100" />
            <button
              type="button"
              onClick={() => setLocation("/employer/account/deactivate")}
              className="w-full flex items-center gap-2 px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer text-left"
            >
              <Trash2 className="w-4 h-4" />
              <span>Deactivate Account</span>
            </button>
            <button
              type="button"
              onClick={() => setLocation("/employer/login")}
              className="w-full flex items-center gap-2 px-4 py-1.5 text-sm text-slate-800 hover:bg-slate-50 cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </Card>
          <Card className="p-4 rounded-2xl bg-white/90 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
              <Building2 className="w-4 h-4" />
              Company Profile
            </div>
            <p className="text-sm font-semibold text-slate-900">{companyName}</p>
            <p className="text-xs text-slate-600">{cityState || "Update your company location"}</p>
            <Badge variant="outline" className="mt-1 w-max border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px]">
              Verified in Findtern
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-8 rounded-full text-xs"
              onClick={() => setLocation("/employer/profile")}
            >
              View / Edit profile
            </Button>
          </Card>

          {/* <Card className="p-4 rounded-2xl bg-white/90 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
              <CreditCard className="w-4 h-4" />
              Billing
            </div>
            <p className="text-sm font-semibold text-slate-900">Primary plan: Static Demo</p>
            <p className="text-xs text-slate-600">Next billing cycle: 18 Dec 2025</p>
            <Badge variant="outline" className="mt-1 w-max border-amber-200 bg-amber-50 text-amber-700 text-[11px]">
              Payment method: {maskedAccountNumber}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-8 rounded-full text-xs"
            >
              Manage billing (static)
            </Button>
          </Card> */}

          <Card className="p-4 rounded-2xl bg-white/90 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
              <ShoppingBag className="w-4 h-4" />
              Orders
            </div>
            <p className="text-sm font-semibold text-slate-900">3 active intern orders</p>
            <p className="text-xs text-slate-600">Latest: Full Stack Intern · 18 Dec 2025</p>
            <Badge variant="outline" className="mt-1 w-max border-slate-200 bg-slate-50 text-slate-700 text-[11px]">
              Static sample data
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-8 rounded-full text-xs"
            >
              View order history (static)
            </Button>
          </Card>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1.1fr] gap-4 md:gap-6">
          {/* Left column */}
          <div className="space-y-4 md:space-y-6">
            <Card className="p-5 rounded-2xl bg-white/95">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm md:text-base font-semibold text-slate-900">Primary contact</h2>
              </div>
              <p className="text-sm font-medium text-slate-900">{primaryContactName}</p>
              <p className="text-xs text-slate-600">
                {primaryContactRole && `${primaryContactRole} · `}
                {companyName}
              </p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                <div>
                  <p className="text-slate-500">Email</p>
                  <p>{companyEmail || "Not added"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Phone</p>
                  <p>{maskedPhone || "Not added"}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 rounded-2xl bg-white/95">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm md:text-base font-semibold text-slate-900">Security</h2>
              </div>
              <p className="text-sm text-slate-700 mb-3">
                Keep your account secure by updating your password regularly and reviewing active sessions.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  2-factor auth (static)
                </Badge>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                  Last password change: 3 months ago
                </Badge>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full text-xs"
                  onClick={() => setLocation("/employer/account/change-password")}
                >
                  Change password
                </Button>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4 md:space-y-6">
            <Card className="p-5 rounded-2xl bg-white/95">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm md:text-base font-semibold text-slate-900">Help & Support</h2>
              </div>
              <p className="text-sm text-slate-700 mb-3">
                Need help with invoices, projects or interns? Reach out to our support team and we will respond within 24 hours.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full text-xs mb-2"
              >
                Open support chat (static)
              </Button>
              <p className="text-[11px] text-slate-500">support@findtern-demo.com</p>
            </Card>

            <Card className="p-5 rounded-2xl bg-white/95 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-sm md:text-base font-semibold text-slate-900">Deactivate or sign out</h2>
                <p className="text-xs text-slate-600">
                  This is only a design preview. In the live product, you will be able to deactivate your company account here.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full text-xs text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setLocation("/employer/account/deactivate")}
                >
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full text-xs flex items-center gap-1"
                  onClick={() => setLocation("/employer/login")}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-4">
          <ArrowRight className="w-3 h-3" />
          Static company account page · hook real data later.
        </p>
      </main>
    </div>
  );
}
