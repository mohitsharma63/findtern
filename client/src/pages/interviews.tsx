import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  Video,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CandidateHeader } from "@/components/CandidateHeader";

export default function InterviewsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<string | null>(null);

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
            {interviews.map((interview, index) => (
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
                      <Badge variant="outline" className="text-xs">
                        {getEffectiveStatus(interview) || "pending"}
                      </Badge>
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
                      !!interview.meetingLink && (
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
                {index < interviews.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}