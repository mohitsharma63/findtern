import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Video,
  MapPin,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CandidateHeader } from "@/components/CandidateHeader";

export default function InterviewsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "scheduled" | "pending" | "missed" | "completed"
  >("all");

  // Use logged-in intern's userId stored by login/signup flow
  const internId = (typeof window !== "undefined" && window.localStorage.getItem("userId")) || "";

  useEffect(() => {
    const load = async () => {
      try {
        if (!internId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/intern/${internId}/interviews`);
        if (!res.ok) {
          throw new Error("Failed to load interviews");
        }
        const json = await res.json();
        setInterviews(json.interviews || []);
      } catch (error) {
        console.error("Load interviews error", error);
        toast({
          title: "Could not load interviews",
          description: "Something went wrong while fetching your interviews.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [internId, toast]);

  const formatSlot = (slot: string | null | undefined) => {
    if (!slot) return null;
    const d = new Date(slot);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleSelectSlot = async (interviewId: string, slot: number) => {
    try {
      setSelectingId(interviewId + "-" + slot);

      const res = await fetch(`/api/interviews/${interviewId}/select-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message = json?.message || "Failed to confirm slot";
        throw new Error(message);
      }

      const { interview } = await res.json();

      setInterviews((prev) =>
        prev.map((i) => (i.id === interview.id ? interview : i)),
      );

      toast({
        title: "Slot confirmed",
        description: "Your interview time has been confirmed.",
      });
    } catch (error: any) {
      console.error("Select slot error", error);
      toast({
        title: "Could not confirm slot",
        description: error?.message || "Something went wrong while confirming your interview slot.",
        variant: "destructive",
      });
    } finally {
      setSelectingId(null);
    }
  };

  const getEffectiveStatus = (interview: any) => {
    const rawStatus = interview.status || "pending";

    if (rawStatus !== "scheduled" || !interview.selectedSlot) {
      return rawStatus;
    }

    const selectedKey = `slot${interview.selectedSlot}` as const;
    const slotValue = interview[selectedKey];
    if (!slotValue) return rawStatus;

    const slotTime = new Date(slotValue);
    if (Number.isNaN(slotTime.getTime())) return rawStatus;

    const now = new Date();
    const graceMs = 15 * 60 * 1000;

    if (now.getTime() > slotTime.getTime() + graceMs) {
      return "missed";
    }

    return rawStatus;
  };

  const getSelectedSlotTime = (interview: any) => {
    const selected = interview?.selectedSlot;
    if (!selected) return null;
    const selectedKey = `slot${selected}` as const;
    const slotValue = interview?.[selectedKey];
    if (!slotValue) return null;
    const d = new Date(slotValue);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const getStatusMeta = (status: string) => {
    switch (status) {
      case "scheduled":
        return {
          label: "Scheduled",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "pending":
        return {
          label: "Pending",
          className: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "missed":
        return {
          label: "Missed",
          className: "bg-slate-100 text-slate-700 border-slate-200",
        };
      case "completed":
        return {
          label: "Completed",
          className: "bg-blue-50 text-blue-700 border-blue-200",
        };
      default:
        return {
          label: status || "Unknown",
          className: "bg-slate-50 text-slate-700 border-slate-200",
        };
    }
  };

  const statusCounts = interviews.reduce(
    (acc, interview) => {
      const status = getEffectiveStatus(interview) || "pending";
      acc.all += 1;
      if (status === "scheduled") acc.scheduled += 1;
      else if (status === "pending") acc.pending += 1;
      else if (status === "missed") acc.missed += 1;
      else if (status === "completed") acc.completed += 1;
      return acc;
    },
    {
      all: 0,
      scheduled: 0,
      pending: 0,
      missed: 0,
      completed: 0,
    },
  );

  const filteredInterviews = interviews.filter((interview) => {
    const status = getEffectiveStatus(interview) || "pending";
    if (statusFilter === "all") return true;
    return status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <CandidateHeader />

      <div className="container px-4 md:px-6 py-8">
        <h1 className="text-2xl font-bold text-[#0E6049] mb-6">My Interviews</h1>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading your interviews...</div>
        ) : interviews.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">You don't have any interviews yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="p-4 md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Status filter</p>
                    <p className="text-xs text-muted-foreground">
                      Showing <span className="font-medium text-slate-900">{filteredInterviews.length}</span> of {interviews.length}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  <div className="flex w-full items-center justify-start md:justify-end overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="inline-flex items-center gap-1 rounded-full border bg-muted/40 p-1">
                      <Button
                        size="sm"
                        variant={statusFilter === "all" ? "default" : "ghost"}
                        aria-pressed={statusFilter === "all"}
                        className="h-8 min-w-max rounded-full px-3 text-xs font-semibold"
                        onClick={() => setStatusFilter("all")}
                      >
                        <span>All</span>
                        <span
                          className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                            statusFilter === "all"
                              ? "bg-primary-foreground/15 text-primary-foreground"
                              : "bg-slate-200/70 text-slate-800"
                          }`}
                        >
                          {statusCounts.all}
                        </span>
                      </Button>

                      <Button
                        size="sm"
                        variant={statusFilter === "scheduled" ? "default" : "ghost"}
                        aria-pressed={statusFilter === "scheduled"}
                        className="h-8 min-w-max rounded-full px-3 text-xs font-semibold"
                        onClick={() => setStatusFilter("scheduled")}
                      >
                        <span>Scheduled</span>
                        <span
                          className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                            statusFilter === "scheduled"
                              ? "bg-primary-foreground/15 text-primary-foreground"
                              : "bg-slate-200/70 text-slate-800"
                          }`}
                        >
                          {statusCounts.scheduled}
                        </span>
                      </Button>

                      <Button
                        size="sm"
                        variant={statusFilter === "pending" ? "default" : "ghost"}
                        aria-pressed={statusFilter === "pending"}
                        className="h-8 min-w-max rounded-full px-3 text-xs font-semibold"
                        onClick={() => setStatusFilter("pending")}
                      >
                        <span>Pending</span>
                        <span
                          className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                            statusFilter === "pending"
                              ? "bg-primary-foreground/15 text-primary-foreground"
                              : "bg-slate-200/70 text-slate-800"
                          }`}
                        >
                          {statusCounts.pending}
                        </span>
                      </Button>

                      <Button
                        size="sm"
                        variant={statusFilter === "missed" ? "default" : "ghost"}
                        aria-pressed={statusFilter === "missed"}
                        className="h-8 min-w-max rounded-full px-3 text-xs font-semibold"
                        onClick={() => setStatusFilter("missed")}
                      >
                        <span>Missed</span>
                        <span
                          className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                            statusFilter === "missed"
                              ? "bg-primary-foreground/15 text-primary-foreground"
                              : "bg-slate-200/70 text-slate-800"
                          }`}
                        >
                          {statusCounts.missed}
                        </span>
                      </Button>

                      <Button
                        size="sm"
                        variant={statusFilter === "completed" ? "default" : "ghost"}
                        aria-pressed={statusFilter === "completed"}
                        className="h-8 min-w-max rounded-full px-3 text-xs font-semibold"
                        onClick={() => setStatusFilter("completed")}
                      >
                        <span>Completed</span>
                        <span
                          className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                            statusFilter === "completed"
                              ? "bg-primary-foreground/15 text-primary-foreground"
                              : "bg-slate-200/70 text-slate-800"
                          }`}
                        >
                          {statusCounts.completed}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {filteredInterviews.length === 0 ? (
              <Card className="p-6">
                <p className="text-sm text-muted-foreground">No interviews found for this filter.</p>
              </Card>
            ) : (
              filteredInterviews.map((interview, index) => (
                <div key={interview.id}>
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            {interview.employerName || "Company"}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{interview.timezone || "Employer timezone"}</span>
                          </p>
                        </div>
                        {(() => {
                          const s = getEffectiveStatus(interview) || "pending";
                          const meta = getStatusMeta(s);
                          return (
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${meta.className}`}
                            >
                              {meta.label}
                            </Badge>
                          );
                        })()}
                      </div>

                      {/* Slots */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Available Slots (shown in your local time)</span>
                        </p>

                        {([1, 2, 3] as const).map((n) => {
                          const key = `slot${n}` as const;
                          const rawSlotValue = interview[key];
                          const label = formatSlot(rawSlotValue);
                          if (!label) return null;

                          const effectiveStatus = getEffectiveStatus(interview);
                          const isSelected = interview.selectedSlot === n;
                          const isPending = effectiveStatus === "pending";
                          const isMissed = effectiveStatus === "missed";
                          const selectKey = interview.id + "-" + n;

                          if (!!interview.selectedSlot && !isSelected) {
                            return null;
                          }

                          let isFutureSlot = false;
                          if (rawSlotValue) {
                            const slotDate = new Date(rawSlotValue);
                            if (!Number.isNaN(slotDate.getTime())) {
                              isFutureSlot = slotDate.getTime() > Date.now();
                            }
                          }

                          const canSelect = (isPending || isMissed) && isFutureSlot;

                          return (
                            <div
                              key={n}
                              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px]">
                                  Slot {n}
                                </Badge>
                                <span>{label}</span>
                              </div>

                              {isSelected ? (
                                <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                  <CheckCircle2 className="h-3 w-3" /> Confirmed
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!canSelect || selectingId === selectKey}
                                  onClick={() => handleSelectSlot(interview.id, n)}
                                >
                                  {selectingId === selectKey ? "Confirming..." : "Choose this time"}
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Meeting link (only after candidate has selected a slot and within valid time window) */}
                      {getEffectiveStatus(interview) === "scheduled" &&
                        !!interview.selectedSlot &&
                        !!interview.meetingLink &&
                        (() => {
                          const selectedSlotTime = getSelectedSlotTime(interview);
                          return !!selectedSlotTime && selectedSlotTime.getTime() >= Date.now();
                        })() && (
                          <div className="pt-2 border-t mt-2">
                            <Button
                              variant="ghost"
                              className="h-auto p-0 text-[#0E6049] hover:underline"
                              onClick={() => window.open(interview.meetingLink, "_blank")}
                            >
                              <Video className="h-4 w-4 mr-1 inline" />
                              Join Meeting
                            </Button>
                          </div>
                        )}
                    </div>
                  </Card>
                  {index < filteredInterviews.length - 1 && <Separator className="my-4" />}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}