import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocation } from "wouter";
import { Check, Calendar, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmployerHeader } from "@/components/employer/EmployerHeader";
import { getEmployerAuth } from "@/lib/employerAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function EmployerSchedulePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [activeInterview, setActiveInterview] = useState<any | null>(null);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [rescheduleSlots, setRescheduleSlots] = useState({ slot1: "", slot2: "", slot3: "" });
  const [isSendingSlots, setIsSendingSlots] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const auth = getEmployerAuth();
        const employerId = auth?.id as string | undefined;
        if (!employerId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/employer/${employerId}/interviews`);
        if (!res.ok) {
          throw new Error("Failed to load interviews");
        }
        const json = await res.json();
        setInterviews(json.interviews || []);
      } catch (error) {
        console.error("Employer schedule load error", error);
        toast({
          title: "Could not load interviews",
          description: "Something went wrong while fetching your interview schedule.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [toast]);

  const formatSlot = (slot: string | null | undefined) => {
    if (!slot) return null;
    const d = new Date(slot);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const openRescheduleDialog = (interview: any) => {
    setActiveInterview(interview);
    setRescheduleSlots({ slot1: "", slot2: "", slot3: "" });
    setIsRescheduleDialogOpen(true);
  };

  const handleSubmitReschedule = async () => {
    if (!activeInterview) return;

    const { slot1, slot2, slot3 } = rescheduleSlots;
    if (!slot1 || !slot2 || !slot3) {
      toast({
        title: "Add all 3 slots",
        description: "Please select all three meeting slots before sending.",
        variant: "destructive",
      });
      return;
    }

    const auth = getEmployerAuth();
    const employerId = auth?.id as string | undefined;
    if (!employerId) {
      toast({
        title: "Employer not found",
        description: "Please log in again as employer to schedule interviews.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSendingSlots(true);

      const slots = [slot1, slot2, slot3];

      const res = await fetch(`/api/employer/${employerId}/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internId: activeInterview.internId,
          projectId: activeInterview.projectId ?? null,
          timezone: activeInterview.timezone || "Asia/Kolkata",
          slots,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message = json?.message || "Failed to create interview slots";
        throw new Error(message);
      }

      const json = await res.json().catch(() => null);
      const interview = json?.interview;
      if (interview) {
        setInterviews((prev) => [interview, ...prev]);
      }

      toast({
        title: "Slots sent",
        description: `New meeting slots have been shared with ${activeInterview.internName || "the candidate"}.`,
      });

      setIsRescheduleDialogOpen(false);
      setActiveInterview(null);
      setRescheduleSlots({ slot1: "", slot2: "", slot3: "" });
    } catch (error: any) {
      console.error("Submit reschedule error", error);
      toast({
        title: "Could not send slots",
        description: error?.message || "Something went wrong while creating interview slots.",
        variant: "destructive",
      });
    } finally {
      setIsSendingSlots(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/10 to-slate-50">
      <EmployerHeader active="schedule" />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 text-center md:text-left">
              Interview Scheduling
            </h2>
            <p className="mt-1 text-xs md:text-sm text-slate-600">
              Track all upcoming interviews, candidate confirmations and meeting links in one place.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Confirmed
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              Pending
            </span>
          </div>
        </div>

        <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/60 px-4 md:px-6 py-3 flex items-center justify-between">
            <p className="text-xs md:text-sm text-slate-600">
              Showing <span className="font-medium text-slate-900">{interviews.length}</span> interviews
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Export (static)
              </Button>
              <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                New Interview (static)
              </Button>
            </div>
          </div>

          <div className="px-2 md:px-4 pb-2 md:pb-4 pt-2 bg-white">
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[60px] text-xs md:text-sm">Sr. No.</TableHead>
                    <TableHead className="min-w-[120px] text-xs md:text-sm">Intern Name</TableHead>
                    <TableHead className="min-w-[160px] text-xs md:text-sm">Project Title</TableHead>
                    <TableHead className="min-w-[150px] text-xs md:text-sm">Meeting Status</TableHead>
                    <TableHead className="min-w-[180px] text-xs md:text-sm">Meeting Timing</TableHead>
                    <TableHead className="min-w-[160px] text-xs md:text-sm">Meeting Details</TableHead>
                    <TableHead className="w-[140px] text-xs md:text-sm text-right pr-4">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="text-xs md:text-sm">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-slate-500">
                        Loading interviews...
                      </TableCell>
                    </TableRow>
                  ) : interviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-slate-500">
                        No interviews yet. Schedule meetings from your cart.
                      </TableCell>
                    </TableRow>
                  ) : (
                    interviews.map((interview, index) => {
                      const isScheduled = interview.status === "scheduled" && interview.selectedSlot;
                      const slotKey: string | null = isScheduled
                        ? `slot${interview.selectedSlot}`
                        : null;

                      let rawDate: Date | null = null;
                      let meetingTime: string | null = null;
                      if (slotKey) {
                        const value = interview[slotKey] as string | null | undefined;
                        if (value) {
                          const d = new Date(value);
                          if (!Number.isNaN(d.getTime())) {
                            rawDate = d;
                            meetingTime = formatSlot(value);
                          }
                        }
                      }

                      const now = new Date();
                      const isPast = !!(rawDate && rawDate.getTime() < now.getTime());

                      return (
                        <TableRow
                          key={interview.id}
                          className={isScheduled ? "hover:bg-emerald-50/40" : "hover:bg-slate-50"}
                        >
                          <TableCell className="font-medium text-slate-700">{index + 1}</TableCell>
                          <TableCell className="font-medium text-slate-900">
                            {interview.internName || "Intern"}
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {interview.projectName || "-"}
                          </TableCell>
                          <TableCell>
                            {isScheduled ? (
                              isPast ? (
                                <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[11px] font-semibold rounded-full px-2 py-0.5">
                                  Time Over
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[11px] font-semibold rounded-full px-2 py-0.5">
                                  Scheduled
                                </Badge>
                              )
                            ) : (
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[11px] rounded-full px-2 py-0.5">
                                Pending Candidate Approval
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className={meetingTime ? "text-slate-700" : "text-slate-400 italic"}>
                            {meetingTime || "Not Scheduled"}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {isScheduled && interview.meetingLink
                              ? isPast
                                ? "Meeting time has passed. Consider rescheduling."
                                : "Via Google Meet (auto-generated)"
                              : "Waiting for candidate to pick a slot"}
                          </TableCell>
                          <TableCell className="text-right pr-4 space-x-2">
                            {isScheduled && interview.meetingLink && !isPast && (
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
                                onClick={() => window.open(interview.meetingLink, "_blank")}
                              >
                                Join Meeting
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs rounded-full text-slate-600 border-slate-200"
                              disabled={isPast && reschedulingId === interview.id}
                              onClick={isPast ? () => openRescheduleDialog(interview) : undefined}
                            >
                              {isPast
                                ? reschedulingId === interview.id
                                  ? "Rescheduling..."
                                  : "Reschedule"
                                : "Send Reminder"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 px-2 py-3 text-[11px] text-slate-500">
              <p>
                Tip: Use this page after shortlisting candidates from your cart to keep all interviews organised.
              </p>
              <p className="md:text-right">
                This is a static preview. Hook live data from your backend when ready.
              </p>
            </div>
          </div>
        </Card>
      </main>

      <Dialog
        open={isRescheduleDialogOpen}
        onOpenChange={(open) => {
          setIsRescheduleDialogOpen(open);
          if (!open) {
            setActiveInterview(null);
            setRescheduleSlots({ slot1: "", slot2: "", slot3: "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeInterview
                ? `Reschedule Interview with ${activeInterview.internName || "Intern"}`
                : "Reschedule Interview"}
            </DialogTitle>
            <DialogDescription>
              Select up to 3 preferred time slots for the next few days. The candidate will pick one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {([1, 2, 3] as const).map((slot) => (
              <div key={slot} className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                  <span>Slot {slot}</span>
                  <span className="text-[10px] text-slate-400">Next 3 days</span>
                </label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    className="h-10 text-sm pr-10"
                    value={
                      slot === 1
                        ? rescheduleSlots.slot1
                        : slot === 2
                        ? rescheduleSlots.slot2
                        : rescheduleSlots.slot3
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setRescheduleSlots((prev) =>
                        slot === 1
                          ? { ...prev, slot1: value }
                          : slot === 2
                          ? { ...prev, slot2: value }
                          : { ...prev, slot3: value },
                      );
                    }}
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            ))}

            <div className="space-y-1 text-xs">
              <p className="font-medium text-slate-700">Time Zone</p>
              <p className="text-slate-500">Your account time zone will be shown to the candidate along with the slots.</p>
              <p className="text-[11px] text-amber-600 flex items-start gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5" />
                <span>Timezone is pre-selected and cannot be changed here. Ensure your profile timezone is correct.</span>
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isSendingSlots}
              onClick={handleSubmitReschedule}
            >
              {isSendingSlots ? "Sending..." : "Save & Send New Slots"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
