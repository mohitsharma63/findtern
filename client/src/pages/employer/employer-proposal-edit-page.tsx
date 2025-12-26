import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, MessageSquare, Building2, ShoppingCart, ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import findternLogo from "@assets/logo.jpg";

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

export default function EmployerProposalEditPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ id: string }>("/employer/proposals/:id/edit");

  const proposalId = params?.id ?? "";
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const [formOffer, setFormOffer] = useState<NonNullable<EmployerProposal["offerDetails"]>>({});
  const [formStatus, setFormStatus] = useState<string>("sent");
  const [formFlowType, setFormFlowType] = useState<"direct" | "interview_first">("direct");
  const [formSkills, setFormSkills] = useState<string>("");
  const [formRatings, setFormRatings] = useState<NonNullable<EmployerProposal["aiRatings"]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [proposalRoleTitle, setProposalRoleTitle] = useState("");
  const [proposalJD, setProposalJD] = useState("");
  const [proposalMode, setProposalMode] = useState("remote");
  const [proposalStartDate, setProposalStartDate] = useState("");
  const [proposalDuration, setProposalDuration] = useState("1m");
  const [proposalShiftFrom, setProposalShiftFrom] = useState("09:00");
  const [proposalShiftTo, setProposalShiftTo] = useState("18:00");
  const [proposalTimezone, setProposalTimezone] = useState("Asia/Kolkata");
  const [proposalLaptop, setProposalLaptop] = useState("candidate");
  const [proposalMonthlyHours, setProposalMonthlyHours] = useState("160");
  const [proposalMonthlyAmount, setProposalMonthlyAmount] = useState("");

  const proposalMonths = (() => {
    switch (proposalDuration) {
      case "3m":
        return 3;
      case "6m":
        return 6;
      case "12m":
        return 12;
      default:
        return 1;
    }
  })();

  const proposalTotalPrice = (() => {
    const raw = String(proposalMonthlyAmount ?? "").trim();
    if (raw.length === 0) return "";
    const monthly = Number(raw);
    if (!Number.isFinite(monthly) || monthly < 0) return "";
    const total = monthly * proposalMonths;
    if (!Number.isFinite(total) || total < 0) return "";
    return String(total);
  })();

  useEffect(() => {
    if (!proposal) return;
    const offer = proposal.offerDetails ?? {};
    const ratings = proposal.aiRatings ?? {};
    const skillsArr = Array.isArray(proposal.skills) ? proposal.skills : [];

    setFormOffer(offer);
    setFormStatus(proposal.status || "sent");
    setFormFlowType((proposal.flowType || "direct") as "direct" | "interview_first");
    setFormSkills(skillsArr.join(", "));
    setFormRatings(ratings);

    setProposalRoleTitle((offer as any).roleTitle || "");
    setProposalJD((offer as any).jd || "");
    setProposalMode((offer as any).mode || "remote");
    setProposalStartDate((offer as any).startDate || "");
    setProposalDuration((offer as any).duration || "1m");
    setProposalShiftFrom((offer as any).shiftFrom || "09:00");
    setProposalShiftTo((offer as any).shiftTo || "18:00");
    setProposalTimezone((offer as any).timezone || "Asia/Kolkata");
    setProposalLaptop((offer as any).laptop || "candidate");
    setProposalMonthlyHours(
      (offer as any).monthlyHours != null ? String((offer as any).monthlyHours) : "160",
    );
    setProposalMonthlyAmount(
      (offer as any).monthlyAmount != null ? String((offer as any).monthlyAmount) : "",
    );
  }, [proposal]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 px-4 md:px-6 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md rounded-3xl shadow-md border border-slate-100 bg-white p-6 text-center space-y-3">
          <p className="text-sm text-slate-500">Loading proposal...</p>
        </Card>
      </div>
    );
  }

  if (error instanceof Error || !proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 px-4 md:px-6 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md rounded-3xl shadow-md border border-red-50 bg-white p-6 text-center space-y-4">
          <p className="text-base font-semibold text-slate-900">Proposal not found</p>
          <Button onClick={() => setLocation("/employer/proposals")}>Back to proposals</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      {/* Header – same as employer proposals page */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <img src={findternLogo} alt="Findtern" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-emerald-700">FINDTERN</span>
              <span className="text-xs text-slate-400 ml-1.5">INTERNSHIP SIMPLIFIED</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              onClick={() => setLocation("/employer/proposals")}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              onClick={() => setLocation("/employer/account")}
            >
              <Building2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 relative"
              onClick={() => setLocation("/employer/cart")}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <Bell className="w-4 h-4" />
            </Button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
              N
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container max-w-6xl mx-auto px-4 md:px-6 py-8 flex justify-center">
        <div className="sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-md border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full"
              onClick={() => setLocation("/employer/proposals")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">Back</span>
            </Button>
            <Badge
              variant="outline"
              className="text-[11px] px-2 py-0.5 rounded-full border-slate-200 text-slate-600"
            >
              Edit proposal
            </Badge>
          </div>

          <div className="space-y-1 mb-4">
            <h1 className="text-lg font-semibold text-slate-900">Edit Hiring Proposal</h1>
            <p className="text-sm text-slate-500">
              Update the internship offer details. Changes will be visible to the candidate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Internship Role Title<span className="text-red-500">*</span></label>
                <Input
                  className="h-9 text-sm"
                  placeholder="e.g. Design Intern"
                  value={proposalRoleTitle}
                  onChange={(e) => setProposalRoleTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                  <span>Roles and Responsibilities / JD<span className="text-red-500">*</span></span>
                  <span className="text-[11px] text-slate-400">Optional file upload</span>
                </label>
                <Textarea
                  className="min-h-[80px] text-sm resize-y"
                  placeholder="Briefly describe the role, responsibilities, and expectations."
                  value={proposalJD}
                  onChange={(e) => setProposalJD(e.target.value)}
                />
                <Input type="file" className="h-9 text-xs" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Internship Mode<span className="text-red-500">*</span></label>
                <Select
                  value={proposalMode}
                  onValueChange={(value) => setProposalMode(value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Start Date<span className="text-red-500">*</span></label>
                <div className="relative">
                  <Input
                    type="date"
                    className="h-9 text-sm pr-10"
                    value={proposalStartDate}
                    onChange={(e) => setProposalStartDate(e.target.value)}
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Internship Duration<span className="text-red-500">*</span></label>
                <Select
                  value={proposalDuration}
                  onValueChange={(value) => setProposalDuration(value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 month</SelectItem>
                    <SelectItem value="3m">3 months</SelectItem>
                    <SelectItem value="6m">6 months</SelectItem>
                    <SelectItem value="12m">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Shift Timings<span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={proposalShiftFrom}
                    onValueChange={(value) => setProposalShiftFrom(value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="11:00">11:00</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={proposalShiftTo}
                    onValueChange={(value) => setProposalShiftTo(value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="17:00">17:00</SelectItem>
                      <SelectItem value="18:00">18:00</SelectItem>
                      <SelectItem value="19:00">19:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-[11px] text-slate-500">Local time for your organisation.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Time Zone<span className="text-red-500">*</span></label>
                <Select
                  value={proposalTimezone}
                  onValueChange={(value) => setProposalTimezone(value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">(GMT+05:30) India Standard Time</SelectItem>
                    <SelectItem value="America/Metlakatla">(GMT-09:00) Metlakatla</SelectItem>
                    <SelectItem value="Europe/London">(GMT+00:00) London</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Laptop<span className="text-red-500">*</span></label>
                <Select
                  value={proposalLaptop}
                  onValueChange={(value) => setProposalLaptop(value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="candidate">Candidate's Own Laptop</SelectItem>
                    <SelectItem value="company">Company Provided</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Monthly Working Hours<span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  className="h-9 text-sm"
                  value={proposalMonthlyHours}
                  onChange={(e) => setProposalMonthlyHours(e.target.value)}
                />
                <p className="text-[11px] text-amber-600 flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5" />
                  <span>Considering 40hr/week, 4 weeks a month.</span>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Monthly Payable Amount<span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  className="h-9 text-sm"
                  placeholder="0"
                  value={proposalMonthlyAmount}
                  onChange={(e) => setProposalMonthlyAmount(e.target.value)}
                />
                <p className="text-[11px] text-slate-500">Amount billed each month.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Total Price (auto-filled)<span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  className="h-9 text-sm bg-slate-50"
                  placeholder="5000"
                  value={proposalTotalPrice}
                  readOnly
                />
                <p className="text-[11px] text-slate-500">Total amount for the internship.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex-1">
              You can update this proposal and the candidate will see the latest version.
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isSaving}
              onClick={async () => {
                const monthlyHoursNum = Number(proposalMonthlyHours || "0");
                const monthlyAmountNum = Number(proposalMonthlyAmount || "0");

                if (!proposalRoleTitle.trim()) {
                  toast({
                    title: "Role title is required",
                    description: "Please enter the internship role title.",
                    variant: "destructive",
                  });
                  return;
                }

                if (!proposalJD.trim()) {
                  toast({
                    title: "JD is required",
                    description: "Please describe the role and responsibilities.",
                    variant: "destructive",
                  });
                  return;
                }

                if (!proposalStartDate) {
                  toast({
                    title: "Start date is required",
                    description: "Please select a start date for the internship.",
                    variant: "destructive",
                  });
                  return;
                }

                if (!proposalShiftFrom || !proposalShiftTo) {
                  toast({
                    title: "Shift timings required",
                    description: "Please select both start and end times.",
                    variant: "destructive",
                  });
                  return;
                }

                if (!proposalTimezone) {
                  toast({
                    title: "Time zone is required",
                    description: "Please select a time zone.",
                    variant: "destructive",
                  });
                  return;
                }

                if (!proposalLaptop) {
                  toast({
                    title: "Laptop preference required",
                    description: "Please specify who will provide the laptop.",
                    variant: "destructive",
                  });
                  return;
                }

                if (!monthlyHoursNum || monthlyHoursNum <= 0) {
                  toast({
                    title: "Monthly hours invalid",
                    description: "Please enter a positive number of working hours.",
                    variant: "destructive",
                  });
                  return;
                }

                if (!monthlyAmountNum || monthlyAmountNum <= 0) {
                  toast({
                    title: "Monthly amount invalid",
                    description: "Please enter a positive monthly payable amount.",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  setIsSaving(true);

                  const offerDetails = {
                    roleTitle: proposalRoleTitle,
                    jd: proposalJD,
                    mode: proposalMode,
                    startDate: proposalStartDate,
                    duration: proposalDuration,
                    shiftFrom: proposalShiftFrom,
                    shiftTo: proposalShiftTo,
                    timezone: proposalTimezone,
                    laptop: proposalLaptop,
                    monthlyHours: monthlyHoursNum,
                    monthlyAmount: monthlyAmountNum,
                    totalPrice: Number(proposalTotalPrice || monthlyAmountNum * proposalMonths),
                  } as Record<string, any>;

                  const res = await fetch(`/api/proposals/${proposalId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      status: formStatus,
                      flowType: formFlowType,
                      offerDetails,
                      aiRatings: formRatings,
                      skills: formSkills
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0),
                    }),
                  });

                  if (!res.ok) {
                    const errJson = await res.json().catch(() => null);
                    const message = errJson?.message || "Failed to update proposal";
                    throw new Error(message);
                  }

                  await queryClient.invalidateQueries({ queryKey: ["/api/proposals", proposalId] });

                  toast({
                    title: "Proposal updated",
                    description: "Your changes have been saved.",
                  });

                  setLocation(`/employer/proposals/${proposalId}`);
                } catch (error: any) {
                  console.error("Update proposal error", error);
                  toast({
                    title: "Failed to update proposal",
                    description: error?.message || "Something went wrong while updating proposal.",
                    variant: "destructive",
                  });
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
