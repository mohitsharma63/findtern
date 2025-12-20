import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Sparkles,
  Briefcase,
  MessageSquare,
} from "lucide-react";

type Proposal = {
  id: string;
  status: string;
  offerDetails?: {
    roleTitle?: string;
    mode?: string;
    startDate?: string;
    duration?: string;
    monthlyAmount?: number;
    monthlyHours?: number;
    timezone?: string;
    laptop?: string;
  };
  aiRatings?: {
    communication?: number;
    coding?: number;
    aptitude?: number;
    overall?: number;
  };
  skills?: string[];
};

export default function ProposalDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/proposals/:id");
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

  const proposal = (data?.proposal ?? null) as Proposal | null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <p className="text-sm text-slate-600">Loading proposal...</p>
        </Card>
      </div>
    );
  }

  if (error instanceof Error || !proposal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <p className="text-lg font-semibold">Proposal not found</p>
          <Button onClick={() => setLocation("/proposals")}>Back to proposals</Button>
        </Card>
      </div>
    );
  }

  const offer = proposal.offerDetails ?? {};
  const skills = Array.isArray(proposal.skills) ? proposal.skills : [];
  const ratings = proposal.aiRatings ?? {};

  const roleTitle = offer.roleTitle || "Internship Offer";
  const mode = offer.mode || "remote";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/15 to-teal-50/30 px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-700"
            onClick={() => setLocation("/proposals")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Header card */}
        <Card className="p-5 md:p-6 rounded-2xl bg-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-lg">
              {roleTitle[0]?.toUpperCase() || "P"}
            </div>
            <div className="flex-1 space-y-1.5">
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">{roleTitle}</h1>
              <p className="text-sm text-slate-700 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="capitalize">{mode}</span>
                <span className="text-slate-400">•</span>
                <span>{timezoneLabel}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  {durationLabel}
                </Badge>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  Stipend: {stipendLabel}
                </Badge>
                <Badge variant="outline" className={statusBadgeClasses}>
                  Status: {status}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
              <p className="text-[11px] text-slate-500">Direct offer preview</p>
            </div>
          </div>
        </Card>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1.1fr] gap-4 md:gap-6">
          {/* Left column */}
          <div className="space-y-4 md:space-y-6">
            {/* Role summary */}
            <Card className="p-4 md:p-5 rounded-2xl bg-white/95">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm md:text-base font-semibold text-slate-900">Role summary</h2>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                You have received a direct internship offer for the role of <span className="font-semibold">{roleTitle}</span>.
                This is a <span className="font-semibold capitalize">{mode}</span> internship starting on
                <span className="font-semibold"> {startDate}</span>, for approximately
                <span className="font-semibold"> {durationLabel}</span> with a monthly stipend of
                <span className="font-semibold"> {stipendLabel}</span>.
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                <div className="flex flex-col">
                  <span className="text-slate-400">Monthly hours</span>
                  <span className="font-medium">{monthlyHoursLabel}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400">Time zone</span>
                  <span className="font-medium">{timezoneLabel}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400">Laptop</span>
                  <span className="font-medium">{laptopLabel}</span>
                </div>
              </div>
            </Card>

            {/* What you will work on */}
            <Card className="p-4 md:p-5 rounded-2xl bg-white/95">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">What you will work on</h2>
              <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                <li>Apply your core skills in real-world project work for the employer.</li>
                <li>Collaborate remotely with the team and deliver assigned tasks on time.</li>
                <li>Gain hands-on experience over the full duration of the internship.</li>
              </ul>
            </Card>

            {/* What the company expects */}
            <Card className="p-4 md:p-5 rounded-2xl bg-white/95">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">What the company expects</h2>
              <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                <li>Availability for around {monthlyHoursLabel}.</li>
                <li>Professional communication and responsiveness during working hours.</li>
                <li>Ability to work using {laptopLabel.toLowerCase()} and a stable internet connection.</li>
              </ul>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4 md:space-y-6">
            {/* AI ratings */}
            <Card className="p-4 md:p-5 rounded-2xl bg-white/95">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm md:text-base font-semibold text-slate-900">AI interview ratings</h2>
              </div>
              <div className="space-y-1.5 text-sm text-slate-700">
                {["communication", "coding", "aptitude", "overall"].map((key) => {
                  const label =
                    key === "overall"
                      ? "Overall interview"
                      : key.charAt(0).toUpperCase() + key.slice(1);
                  const value = (ratings as any)[key] ?? 0;
                  return (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span>{label}</span>
                      <span className="font-semibold text-emerald-700">{value}/10</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Skills */}
            <Card className="p-4 md:p-5 rounded-2xl bg-white/95">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Key skills highlighted</h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.length === 0 && (
                  <span className="text-[11px] text-slate-500">No skills highlighted in this offer.</span>
                )}
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-xs px-2.5 py-1 rounded-full border-slate-200 bg-slate-50 text-slate-700"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            
          </div>
        </div>
      </div>
    </div>
  );
}

