import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Briefcase, Sparkles, MapPin, Clock, MessageSquare } from "lucide-react";

type EmployerProposal = {
  id: string;
  status?: string;
  employerId?: string;
  internId?: string;
  projectId?: string;
  flowType?: "direct" | "interview_first";
  offerDetails?: {
    roleTitle?: string;
    mode?: string;
    startDate?: string;
    duration?: string;
    monthlyAmount?: number;
    monthlyHours?: number;
    timezone?: string;
    laptop?: string;
    location?: string;
  };
  aiRatings?: {
    communication?: number;
    coding?: number;
    aptitude?: number;
    overall?: number;
  };
  skills?: string[];
};

export default function EmployerProposalDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ id: string }>("/employer/proposals/:id");

  const proposalId = params?.id ?? "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/proposals", proposalId],
    enabled: !!proposalId,
    queryFn: async () => {
      const res = await fetch(`/api/proposals/${proposalId}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const message = errJson?.message || "Failed to fetch proposal";
        throw new Error(message);
      }
      return res.json();
    },
  });

  const proposal = (data?.proposal ?? null) as EmployerProposal | null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 px-4 md:px-6 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md rounded-3xl shadow-md border border-slate-100 bg-white p-6 text-center space-y-3">
          <p className="text-sm text-slate-500">Loading proposal details...</p>
        </Card>
      </div>
    );
  }

  if (error instanceof Error || !proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 px-4 md:px-6 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md rounded-3xl shadow-md border border-red-50 bg-white p-6 text-center space-y-4">
          <p className="text-base font-semibold text-slate-900">Proposal not found</p>
          <p className="text-sm text-slate-500">
            The proposal you are trying to view doesn't exist or may have been removed.
          </p>
          <Button onClick={() => setLocation("/employer/proposals")}>Back to proposals</Button>
        </Card>
      </div>
    );
  }

  const offer = proposal.offerDetails ?? {};
  const skills = Array.isArray(proposal.skills) ? proposal.skills : [];
  const ratings = proposal.aiRatings ?? {};

  const roleTitle = offer.roleTitle || "Internship Proposal";
  const mode = offer.mode || "remote";
  const location = offer.location || "Location not specified";
  const startDate = offer.startDate
    ? new Date(offer.startDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not specified";

  const durationLabel = (() => {
    switch (offer.duration) {
      case "1m":
        return "1 month";
      case "3m":
        return "3 months";
      case "6m":
        return "6 months";
      case "12m":
        return "12 months";
      default:
        return "Duration not specified";
    }
  })();

  const stipendLabel =
    typeof offer.monthlyAmount === "number" && offer.monthlyAmount > 0
      ? `₹${offer.monthlyAmount.toLocaleString("en-IN")} / month`
      : "Not specified";

  const monthlyHoursLabel =
    typeof offer.monthlyHours === "number" && offer.monthlyHours > 0
      ? `${offer.monthlyHours} hrs / month`
      : "Approx. 160 hrs / month";

  const timezoneLabel = offer.timezone || "Asia/Kolkata";
  const laptopLabel = offer.laptop === "company" ? "Company laptop" : "Candidate's own laptop";

  const status = proposal.status || "sent";

  const statusBadgeClasses = (() => {
    switch (status) {
      case "accepted":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "rejected":
        return "border-red-200 bg-red-50 text-red-700";
      case "sent":
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 px-4 md:px-6 py-8 flex justify-center">
      <Card className="w-full max-w-3xl rounded-3xl shadow-lg border border-slate-100 bg-white p-5 md:p-6 space-y-5 md:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-slate-200"
              onClick={() => setLocation("/employer/proposals")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-base md:text-lg font-semibold text-slate-900">
                Proposal — {roleTitle}
              </h1>
              <p className="text-[11px] md:text-xs text-slate-500">
                Review all offer details for this candidate before final confirmation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusBadgeClasses + " text-[11px] px-2 py-0.5"}>
              Status: {status}
            </Badge>
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button
              className="h-9 px-4 text-xs rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => setLocation(`/employer/proposals/${proposalId}/edit`)}
            >
              Edit proposal
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <Card className="col-span-1 md:col-span-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 md:p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-lg">
              {roleTitle[0]?.toUpperCase() || "P"}
            </div>
            <div className="flex-1">
              <h2 className="text-sm md:text-base font-semibold text-slate-900">{roleTitle}</h2>
              <p className="text-xs md:text-sm text-slate-600 flex flex-wrap items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span className="capitalize">{mode}</span>
                <span className="text-slate-300">•</span>
                <span>{location}</span>
                <span className="text-slate-300">•</span>
                <span>{timezoneLabel}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  {durationLabel}
                </Badge>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  Stipend: {stipendLabel}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-slate-100 bg-white p-4 md:p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm md:text-base font-semibold text-slate-900">Internship details</h3>
            </div>
            <div className="grid grid-cols-1 gap-2 text-[12px] md:text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Start date</span>
                <span className="font-medium">{startDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Monthly hours</span>
                <span className="font-medium">{monthlyHoursLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Laptop</span>
                <span className="font-medium">{laptopLabel}</span>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-slate-100 bg-white p-4 md:p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm md:text-base font-semibold text-slate-900">Compensation</h3>
            </div>
            <div className="space-y-1.5 text-[12px] md:text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Monthly pay</span>
                <span className="font-semibold text-emerald-700">{stipendLabel}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Final payout and compliance will be handled via Findtern as per agreed terms.
              </p>
            </div>
          </Card>
        </div>

        <Card className="rounded-2xl border border-slate-100 bg-white p-4 md:p-5 space-y-2">
          <h3 className="text-sm md:text-base font-semibold text-slate-900">Roles &amp; responsibilities</h3>
          <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
            Use this space to review the expectations you have communicated to the candidate. Ensure that
            the scope of work, timelines, and communication expectations are aligned with your internal
            team before sending or confirming the offer.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <Card className="rounded-2xl border border-slate-100 bg-white p-4 md:p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm md:text-base font-semibold text-slate-900">AI interview ratings</h3>
            </div>
            <div className="space-y-1.5 text-xs md:text-sm text-slate-700">
              {["communication", "coding", "aptitude", "overall"].map((key) => {
                const label =
                  key === "overall" ? "Overall" : key.charAt(0).toUpperCase() + key.slice(1);
                const value = (ratings as any)[key] ?? "-";
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-emerald-700">{value === "-" ? "-" : `${value}/10`}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="rounded-2xl border border-slate-100 bg-white p-4 md:p-5 space-y-3">
            <h3 className="text-sm md:text-base font-semibold text-slate-900">Skills highlighted</h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.length === 0 && (
                <span className="text-[11px] text-slate-500">No skills data available for this proposal.</span>
              )}
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="text-[11px] px-2.5 py-1 rounded-full border-slate-200 bg-slate-50 text-slate-700"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            variant="outline"
            className="rounded-full px-6 text-xs md:text-sm"
            onClick={() => setLocation("/employer/proposals")}
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
