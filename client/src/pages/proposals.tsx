import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  GraduationCap,
  Check,
  X,
  MapPin,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CandidateHeader } from "@/components/CandidateHeader";

export default function ProposalsPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const storedUserId =
    typeof window !== "undefined" ? window.localStorage.getItem("userId") : null;

  const proposalsQueryKey: [string, string | null] = [
    "/api/intern/proposals",
    storedUserId,
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: proposalsQueryKey,
    enabled: !!storedUserId,
    queryFn: async () => {
      if (!storedUserId) {
        throw new Error("User not logged in");
      }
      const res = await fetch(`/api/intern/${storedUserId}/proposals`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const message = errJson?.message || "Failed to fetch proposals";
        throw new Error(message);
      }
      return res.json();
    },
  });

  const proposals = (data?.proposals ?? []) as any[];

  async function handleUpdateStatus(
    proposalId: string,
    status: "accepted" | "rejected",
  ) {
    try {
      const res = await fetch(`/api/proposals/${proposalId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const message = errJson?.message || "Failed to update proposal status";
        throw new Error(message);
      }

      toast({
        title: status === "accepted" ? "Proposal accepted" : "Proposal rejected",
        description:
          status === "accepted"
            ? "You have accepted this internship offer."
            : "You have rejected this internship offer.",
      });

      await queryClient.invalidateQueries({ queryKey: proposalsQueryKey });
    } catch (err: any) {
      toast({
        title: "Action failed",
        description: err?.message || "Could not update proposal status.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <CandidateHeader />

      <div className="container px-4 md:px-6 py-8">
        <h1 className="text-2xl font-bold text-[#0E6049] mb-2">Internship Proposals</h1>
        {isLoading && (
          <p className="text-sm text-muted-foreground mb-6">Loading your proposals...</p>
        )}
        {!isLoading && error instanceof Error && (
          <p className="text-sm text-red-500 mb-6">{error.message}</p>
        )}
        {!isLoading && !error && proposals.length === 0 && (
          <p className="text-sm text-muted-foreground mb-6">
            You don't have any proposals yet. Once employers send you offers, they will appear here.
          </p>
        )}

        {proposals.map((proposal) => {
          const offer = (proposal.offerDetails || {}) as any;
          const ratings = (proposal.aiRatings || {}) as any;
          const skills = (proposal.skills || []) as string[];
          const status: string | undefined = proposal.status;
          const isAccepted = status === "accepted";
          const isRejected = status === "rejected";
          const isFinal = isAccepted || isRejected;

          return (
            <Card
              key={proposal.id}
              className="max-w-xl border border-emerald-50 shadow-sm rounded-2xl p-4 md:p-5 flex flex-col gap-3 mb-4"
            >
              {/* Header: company + meta */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <p className="text-sm font-semibold text-slate-900">
                      {offer.roleTitle || "Internship Offer"}
                    </p>
                  </div>
                  <p className="flex items-center gap-1 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {offer.location || "Location not specified"}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-100">
                      {offer.duration || "Duration not specified"}
                    </span>
                    {offer.monthlyAmount && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 border border-amber-100">
                        Stipend: ₹{offer.monthlyAmount} / month
                      </span>
                    )}
                  </div>
                </div>

                {/* Chat icon button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shrink-0"
                  onClick={() => setLocation(`/proposals/${proposal.id}`)}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>

              {/* Ratings */}
              <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                <p className="mb-1 flex items-center gap-1 font-semibold text-slate-800">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  AI Interview Ratings
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700">
                  <span className="flex items-center justify-between">
                    <span>Communication</span>
                    <span className="font-semibold text-emerald-700">{ratings.communication ?? "-"}</span>
                  </span>
                  <span className="flex items-center justify-between">
                    <span>Coding</span>
                    <span className="font-semibold text-emerald-700">{ratings.coding ?? "-"}</span>
                  </span>
                  <span className="flex items-center justify-between">
                    <span>Aptitude</span>
                    <span className="font-semibold text-emerald-700">{ratings.aptitude ?? "-"}</span>
                  </span>
                  <span className="flex items-center justify-between">
                    <span>Overall Interview</span>
                    <span className="font-semibold text-emerald-700">{ratings.overall ?? "-"}</span>
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-800">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.length === 0 && (
                    <span className="text-[11px] text-slate-500">No skills data available</span>
                  )}
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer CTA */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <Button
                  className="flex-1 rounded-full h-9 text-xs font-medium flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: "#0E6049" }}
                  disabled={isFinal}
                  onClick={() => {
                    if (!isFinal) handleUpdateStatus(proposal.id, "accepted");
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  {isAccepted ? "Accepted" : "Accept"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full h-9 text-xs font-medium flex items-center justify-center gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                  disabled={isFinal}
                  onClick={() => {
                    if (!isFinal) handleUpdateStatus(proposal.id, "rejected");
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                  {isRejected ? "Rejected" : "Reject"}
                </Button>
                <Button
                  className="flex-1 rounded-full h-9 text-xs font-medium"
                  variant="secondary"
                  onClick={() => setLocation(`/proposals/${proposal.id}`)}
                >
                  View Proposal
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}