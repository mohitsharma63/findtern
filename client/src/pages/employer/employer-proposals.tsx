import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Filter, Search, Calendar, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { getEmployerAuth } from "@/lib/employerAuth";
import { EmployerHeader } from "@/components/employer/EmployerHeader";

// Types
interface EmployerProposal {
  id: string;
  candidateName: string;
  projectName: string;
  flowType: "direct" | "interview_first";
  status: "draft" | "sent" | "accepted" | "rejected" | "interview_scheduled";
  createdAt: string; // ISO date
  amountPerMonth: number;
  durationLabel: string;
  mode: string;
  location: string;
  termLabel: string;
  interviewRatings?: {
    communication: number;
    coding: number;
    aptitude: number;
    overall: number;
  };
  skills: string[];
}

// Map raw backend proposal into view model for this page
function mapToEmployerProposal(p: any): EmployerProposal {
  const offer = p.offerDetails || {};

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

  const termLabel = (() => {
    switch (offer.duration) {
      case "1m":
        return "Short-Term";
      case "3m":
        return "Medium-Term";
      case "6m":
      case "12m":
        return "Long-Term";
      default:
        return "";
    }
  })();

  return {
    id: p.id,
    candidateName: p.internName || "Candidate",
    projectName: p.projectName || "Project",
    flowType: (p.flowType || "direct") as "direct" | "interview_first",
    status: (p.status || "sent") as EmployerProposal["status"],
    createdAt: p.createdAt || new Date().toISOString(),
    amountPerMonth: typeof offer.monthlyAmount === "number" ? offer.monthlyAmount : 0,
    durationLabel,
    mode: p.projectMode || "Remote",
    location: p.projectLocation || "Location not specified",
    termLabel,
    interviewRatings: p.aiRatings || {},
    skills: Array.isArray(p.skills) ? p.skills : [],
  };
}

export default function EmployerProposalsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const auth = getEmployerAuth();
  const employerId = auth?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/employer/proposals", employerId],
    enabled: !!employerId,
    queryFn: async () => {
      if (!employerId) {
        throw new Error("Employer not logged in");
      }
      const res = await fetch(`/api/employer/${employerId}/proposals`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const message = errJson?.message || "Failed to fetch employer proposals";
        throw new Error(message);
      }
      return res.json();
    },
  });

  const [search, setSearch] = useState("");
  const [flowFilter, setFlowFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const rawProposals = (data?.proposals ?? []) as any[];
  const proposals: EmployerProposal[] = useMemo(
    () => rawProposals.map(mapToEmployerProposal),
    [rawProposals],
  );

  const [activeProposalId, setActiveProposalId] = useState<string | null>(
    proposals[0]?.id ?? null,
  );

  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.candidateName.toLowerCase().includes(search.toLowerCase()) ||
        p.projectName.toLowerCase().includes(search.toLowerCase());

      const matchesFlow = flowFilter === "all" || p.flowType === flowFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesFlow && matchesStatus;
    });
  }, [proposals, search, flowFilter, statusFilter]);

  const directCount = proposals.filter((p) => p.flowType === "direct").length;
  const interviewCount = proposals.filter(
    (p) => p.flowType === "interview_first",
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      <EmployerHeader active="proposals" />

      <div className="container max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">
        {/* Page title + quick stats */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Hiring Proposals
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track all proposals you sent – whether directly or after interviews.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:w-[320px]">
            <Card className="p-3 rounded-2xl border-emerald-100 bg-emerald-50/80">
              <p className="text-[11px] font-medium text-emerald-700 mb-1">
                Direct Hiring
              </p>
              <p className="text-lg font-semibold text-emerald-900">{directCount}</p>
            </Card>
            <Card className="p-3 rounded-2xl border-slate-100 bg-slate-50">
              <p className="text-[11px] font-medium text-slate-700 mb-1">
                Interview First
              </p>
              <p className="text-lg font-semibold text-slate-900">{interviewCount}</p>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 md:p-5 rounded-2xl border-slate-100 bg-white shadow-sm flex flex-wrap gap-3 md:items-center md:justify-between">
          <div className="flex flex-1 min-w-[220px] items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by candidate or project..."
                className="h-10 pl-9 rounded-xl border-slate-200 focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Select value={flowFilter} onValueChange={setFlowFilter}>
              <SelectTrigger className="h-9 w-[150px] rounded-xl border-slate-200 text-xs">
                <SelectValue placeholder="Flow type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All flows</SelectItem>
                <SelectItem value="direct">Direct hiring</SelectItem>
                <SelectItem value="interview_first">Interview first</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[150px] rounded-xl border-slate-200 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="interview_scheduled">Interview scheduled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs flex items-center gap-1 border-slate-200"
            >
              <Filter className="w-3.5 h-3.5" />
              More filters
            </Button>
          </div>
        </Card>

        {/* Table list */}
        <div className="space-y-3">
          {isLoading && (
            <Card className="p-8 text-center rounded-3xl border-slate-100 bg-white/80">
              <p className="text-sm text-slate-600">Loading proposals...</p>
            </Card>
          )}

          {!isLoading && error instanceof Error && (
            <Card className="p-8 text-center rounded-3xl border-red-100 bg-red-50/80">
              <p className="text-sm font-medium text-red-700 mb-1">Failed to load proposals</p>
              <p className="text-xs text-red-600">{error.message}</p>
            </Card>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <Card className="p-8 text-center rounded-3xl border-dashed border-slate-200 bg-white/80">
              <p className="text-sm font-medium text-slate-700 mb-1">
                No proposals match your filters.
              </p>
              <p className="text-xs text-slate-500">
                Try clearing filters or adjusting the search keywords.
              </p>
            </Card>
          )}

          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr className="text-xs text-slate-500">
                    <th className="px-4 py-3 text-left font-medium">Candidate</th>
                    <th className="px-4 py-3 text-left font-medium">Flow</th>
                    <th className="px-4 py-3 text-left font-medium">Project & location</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Monthly stipend</th>
                    <th className="px-4 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((proposal) => {
                    const isDirect = proposal.flowType === "direct";
                    const statusLabelMap: Record<EmployerProposal["status"], string> = {
                      draft: "Draft",
                      sent: "Sent",
                      accepted: "Accepted",
                      rejected: "Rejected",
                      interview_scheduled: "Interview scheduled",
                    };

                    const statusColorMap: Record<EmployerProposal["status"], string> = {
                      draft: "bg-slate-100 text-slate-700 border-slate-200",
                      sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      accepted: "bg-emerald-600 text-white border-emerald-700",
                      rejected: "bg-red-50 text-red-700 border-red-200",
                      interview_scheduled: "bg-amber-50 text-amber-700 border-amber-200",
                    };

                    const monthly = new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(proposal.amountPerMonth);

                    return (
                      <tr
                        key={proposal.id}
                        className="border-t border-slate-100 hover:bg-emerald-50/40 transition-colors"
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="font-semibold text-slate-900">
                            {proposal.candidateName}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                              isDirect
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            {isDirect ? "Direct Hiring" : "Interview First"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                            <span className="font-medium text-slate-800 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                              {proposal.projectName}
                            </span>
                            <span>
                              {proposal.location} · {proposal.mode} · {proposal.durationLabel}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColorMap[proposal.status]}`}
                          >
                            {statusLabelMap[proposal.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 align-top text-right">
                          <div className="text-xs text-slate-500">Monthly stipend</div>
                          <div className="text-sm font-semibold text-slate-900">{monthly}</div>
                        </td>
                        <td className="px-4 py-3 align-top text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-xs flex items-center gap-1.5"
                              onClick={() => {
                                setLocation(`/employer/proposals/${proposal.id}`);
                              }}
                            >
                              View proposal
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 rounded-full border-slate-200 text-slate-500 hover:text-slate-700"
                                >
                                  ···
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 text-xs">
                               
                                <DropdownMenuItem
                                  onClick={() =>
                                    setLocation(`/employer/proposals/${proposal.id}/edit`)
                                  }
                                >
                                  Edit proposal
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setLocation(`/employer/intern/${proposal.id}`)
                                  }
                                >
                                  View profile
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((proposal) => {
              const isDirect = proposal.flowType === "direct";
              const statusLabelMap: Record<EmployerProposal["status"], string> = {
                draft: "Draft",
                sent: "Sent",
                accepted: "Accepted",
                rejected: "Rejected",
                interview_scheduled: "Interview scheduled",
              };

              const statusColorMap: Record<EmployerProposal["status"], string> = {
                draft: "bg-slate-100 text-slate-700 border-slate-200",
                sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
                accepted: "bg-emerald-600 text-white border-emerald-700",
                rejected: "bg-red-50 text-red-700 border-red-200",
                interview_scheduled: "bg-amber-50 text-amber-700 border-amber-200",
              };

              const monthly = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(proposal.amountPerMonth);

              return (
                <Card
                  key={proposal.id}
                  className="p-4 rounded-2xl bg-white shadow-sm flex flex-col gap-2 border border-slate-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-900">
                          {proposal.candidateName}
                        </h2>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            isDirect
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {isDirect ? "Direct Hiring" : "Interview First"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColorMap[proposal.status]}`}
                        >
                          {statusLabelMap[proposal.status]}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 flex flex-wrap items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{proposal.projectName}</span>
                        <span className="mx-1 text-slate-400">·</span>
                        <span>{proposal.location}</span>
                        <span className="mx-1 text-slate-400">·</span>
                        <span>{proposal.mode}</span>
                        <span className="mx-1 text-slate-400">·</span>
                        <span>{proposal.durationLabel}</span>
                      </p>
                    </div>
                      <div className="text-right text-xs">
                      <p className="text-slate-500 mb-0.5">Monthly stipend</p>
                      <p className="text-sm font-semibold text-slate-900">{monthly}</p>
                    </div>
                  </div>
                  <div className="pt-2 flex flex-wrap justify-between gap-2">
                    <div className="flex gap-1 text-[11px] text-slate-500 items-center">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Project: {proposal.projectName}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-[11px] px-3 flex items-center gap-1.5"
                        onClick={() => {
                          setLocation(`/employer/proposals/${proposal.id}`);
                        }}
                      >
                        View proposal
                        <ArrowUpRight className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full text-[11px] px-3 border-slate-200"
                        onClick={() => {
                          setLocation(`/employer/proposals/${proposal.id}`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full text-[11px] px-3 border-slate-200"
                        onClick={() => {
                          setLocation(`/employer/intern/${proposal.id}`);
                        }}
                      >
                        Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
