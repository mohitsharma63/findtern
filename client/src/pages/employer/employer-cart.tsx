import { useEffect, useState } from "react";
import { 
  Bell, 
  MapPin,
  Star,
  ChevronDown,
  X,
  ShoppingCart,
  MessageSquare,
  Building2,
  Check,
  Trash2,
  User,
  ArrowLeft,
  CreditCard,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  GraduationCap,
  Sparkles,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { getEmployerAuth } from "@/lib/employerAuth";
import { EmployerHeader } from "@/components/employer/EmployerHeader";

// Types
interface CartCandidate {
  id: string;
  initials: string;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  findternScore: number;
  skills: string[];
  matchedSkills: string[];
  aiRatings: {
    communication: number;
    coding: number;
    aptitude: number;
    interview: number;
  };
  experience: string;
  education: string;
  availability: string;
  expectedStipend: string;
  projectName: string;
}

export default function EmployerCartPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [cartItems, setCartItems] = useState<CartCandidate[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCandidate, setDeletingCandidate] = useState<CartCandidate | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState<CartCandidate | null>(null);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);
  const [isBulkHireDialogOpen, setIsBulkHireDialogOpen] = useState(false);
  const [meetingSlots, setMeetingSlots] = useState<{ slot1: string; slot2: string; slot3: string }>({
    slot1: "",
    slot2: "",
    slot3: "",
  });
  const [isSendingSlots, setIsSendingSlots] = useState(false);
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
  const [isSendingProposal, setIsSendingProposal] = useState(false);

  // Load cart dynamically from localStorage + /api/interns
  useEffect(() => {
    (async () => {
      try {
        const storedIdsRaw = window.localStorage.getItem("employerCartIds");
        const storedIds: string[] = storedIdsRaw ? JSON.parse(storedIdsRaw) : [];
        if (storedIds.length === 0) {
          setCartItems([]);
          setSelectedItems([]);
          return;
        }

        const res = await fetch("/api/interns");
        const json = await res.json();
        const list = (json?.interns || []) as any[];

        const mapped: CartCandidate[] = list
          .map((item) => {
            const onboarding = item.onboarding ?? {};
            const user = item.user ?? {};

            const rawSkills = Array.isArray(onboarding.skills) ? onboarding.skills : [];
            const skills: string[] = rawSkills
              .map((s: any) =>
                typeof s === "string"
                  ? s
                  : typeof s?.name === "string"
                  ? s.name
                  : "",
              )
              .filter((s: string) => s.trim().length > 0);

            const id = user.id ?? onboarding.userId ?? onboarding.id ?? "";
            const first = user.firstName ?? "";
            const last = user.lastName ?? "";
            const fullName = `${first} ${last}`.trim();
            const initials = (fullName || "Intern")
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p: string) => p[0]?.toUpperCase() ?? "")
              .join("") || "IN";

            const location = [onboarding.city, onboarding.state].filter(Boolean).join(", ");

            return {
              id,
              initials,
              name: fullName || "Intern",
              fullName: fullName || "Intern",
              email: user.email ?? "",
              phone: user.phoneNumber ?? "",
              location,
              findternScore: onboarding.extraData?.findternScore ?? 0,
              skills,
              matchedSkills: skills,
              aiRatings: {
                communication: onboarding.extraData?.ratings?.communication ?? 0,
                coding: onboarding.extraData?.ratings?.coding ?? 0,
                aptitude: onboarding.extraData?.ratings?.aptitude ?? 0,
                interview: onboarding.extraData?.ratings?.interview ?? 0,
              },
              experience: onboarding.extraData?.experienceSummary ?? "",
              education: onboarding.extraData?.educationSummary ?? "",
              availability: onboarding.extraData?.availability ?? "",
              expectedStipend: onboarding.extraData?.expectedStipend ?? "",
              projectName: "",
            } as CartCandidate;
          })
          .filter((c) => storedIds.includes(c.id));

        setCartItems(mapped);
        setSelectedItems(mapped.map((c) => c.id));
      } catch (error) {
        console.error("Failed to load cart", error);
      }
    })();
  }, []);

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(c => c.id));
    }
  };

  const openDeleteDialog = (candidate: CartCandidate) => {
    setDeletingCandidate(candidate);
    setIsDeleteDialogOpen(true);
  };

  const handleRemoveFromCart = () => {
    if (!deletingCandidate) return;
    
    setCartItems(prev => {
      const updated = prev.filter(c => c.id !== deletingCandidate.id);

      // Persist updated cart ids to localStorage so removed items don't reappear on reload
      try {
        const remainingIds = updated.map(c => c.id);
        window.localStorage.setItem("employerCartIds", JSON.stringify(remainingIds));
      } catch (error) {
        console.error("Failed to update employerCartIds in localStorage", error);
      }

      return updated;
    });

    setSelectedItems(prev => prev.filter(id => id !== deletingCandidate.id));
    setIsDeleteDialogOpen(false);
    setDeletingCandidate(null);
    
    toast({
      title: "Removed from cart",
      description: "The candidate has been removed from your cart.",
    });
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No candidates selected",
        description: "Please select at least one candidate to proceed.",
        variant: "destructive",
      });
      return;
    }
    setIsBulkHireDialogOpen(true);
  };

  const selectedCandidates = cartItems.filter(c => selectedItems.includes(c.id));

  const openFirstSelectedForMeeting = () => {
    if (selectedCandidates.length === 0) return;
    const candidate = selectedCandidates[0];
    setActiveCandidate(candidate);
    setIsMeetingDialogOpen(true);
  };

  const openFirstSelectedForProposal = () => {
    if (selectedCandidates.length === 0) return;
    const candidate = selectedCandidates[0];
    setActiveCandidate(candidate);
    setIsProposalDialogOpen(true);
  };

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
    const monthly = Number(proposalMonthlyAmount || "0");
    if (!monthly || monthly <= 0) return "";
    const total = monthly * proposalMonths;
    if (!Number.isFinite(total) || total <= 0) return "";
    return String(total);
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      <EmployerHeader active="cart" />

      <div className="container max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Your Cart</h1>
              <p className="text-slate-500 text-sm">
                {cartItems.length} candidate{cartItems.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Empty State */
          <Card className="p-12 text-center border-0 shadow-lg rounded-3xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Start browsing candidates and add them to your cart to begin the hiring process.
            </p>
            <Button 
              onClick={() => setLocation("/employer/dashboard")}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-8"
            >
              Browse Candidates
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All Header */}
              <Card className="p-4 border-0 shadow-md rounded-2xl bg-white">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={selectedItems.length === cartItems.length}
                      onCheckedChange={toggleSelectAll}
                      className="border-emerald-300 data-[state=checked]:bg-emerald-600"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Select All ({cartItems.length})
                    </span>
                  </label>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                    {selectedItems.length} selected
                  </Badge>
                </div>
              </Card>

              {/* Candidate Cards */}
              {cartItems.map((candidate) => (
                <Card 
                  key={candidate.id} 
                  className={`p-5 border-2 shadow-lg rounded-2xl bg-white transition-all ${
                    selectedItems.includes(candidate.id) 
                      ? "border-emerald-300 shadow-emerald-100" 
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedItems.includes(candidate.id)}
                        onCheckedChange={() => toggleSelectItem(candidate.id)}
                        className="border-emerald-300 data-[state=checked]:bg-emerald-600"
                      />
                    </div>

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl font-bold text-white">
                        {candidate.initials}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">{candidate.initials}</h3>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-400" />
                            {candidate.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Schedule & Invite actions */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setActiveCandidate(candidate);
                              setIsMeetingDialogOpen(true);
                            }}
                            className="h-9 w-9 rounded-full bg-emerald-900 text-white hover:bg-emerald-800 shadow-sm"
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setActiveCandidate(candidate);
                              setIsProposalDialogOpen(true);
                            }}
                            className="h-9 w-9 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Badge className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Score: {candidate.findternScore}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(candidate)}
                            className="h-8 w-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Contact Info removed to hide email and phone as per requirements */}

                      {/* Skills */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.skills.slice(0, 5).map((skill, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                candidate.matchedSkills.includes(skill)
                                  ? "bg-amber-50 border-amber-300 text-amber-700"
                                  : "bg-slate-50 border-slate-200 text-slate-600"
                              }`}
                            >
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full bg-slate-50 border-slate-200 text-slate-500">
                              +{candidate.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                          {candidate.experience}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                          {candidate.education}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-purple-500" />
                          {candidate.availability}
                        </span>
                      </div>

                      {/* Project Tag */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400">
                          Project: <span className="text-emerald-600 font-medium">{candidate.projectName}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 border-0 shadow-xl rounded-3xl bg-white sticky top-24">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Selected Candidates</span>
                    <span className="font-semibold text-slate-800">{selectedItems.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total in Cart</span>
                    <span className="text-slate-800">{cartItems.length}</span>
                  </div>
                  <Separator />
                  
                  {/* Selected Candidates Preview - names removed, counts are already shown above */}
                </div>

                {/* Info Box */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-emerald-800 mb-1">What happens next?</p>
                      <p className="text-emerald-700 text-xs">
                        After checkout, our team will reach out to confirm details and connect you with the selected candidates.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0 || isCheckingOut}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 font-semibold"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Proceed to Hire ({selectedItems.length})
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-slate-400 mt-3">
                  By proceeding, you agree to our hiring terms
                </p>

                {/* Back Link */}
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/employer/dashboard")}
                  className="w-full mt-4 text-slate-600 hover:text-emerald-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Browsing
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Book Meeting Dialog */}
      <Dialog open={isMeetingDialogOpen} onOpenChange={(open) => {
        setIsMeetingDialogOpen(open);
        if (!open) {
          setActiveCandidate(null);
          setMeetingSlots({ slot1: "", slot2: "", slot3: "" });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeCandidate ? `Book Meeting with ${activeCandidate.name}` : "Book Meeting"}
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
                        ? meetingSlots.slot1
                        : slot === 2
                        ? meetingSlots.slot2
                        : meetingSlots.slot3
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setMeetingSlots((prev) =>
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
              onClick={async () => {
                if (!meetingSlots.slot1 || !meetingSlots.slot2 || !meetingSlots.slot3) {
                  toast({
                    title: "Add all 3 slots",
                    description: "Please select all three meeting slots before sending.",
                    variant: "destructive",
                  });
                  return;
                }

                if (!activeCandidate) {
                  toast({
                    title: "No candidate selected",
                    description: "Please select a candidate to book a meeting with.",
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

                  const slots = [meetingSlots.slot1, meetingSlots.slot2, meetingSlots.slot3];

                  const res = await fetch(`/api/employer/${employerId}/interviews`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      internId: activeCandidate.id,
                      projectId: null,
                      // TODO: once employer profile supports timezone, send that instead of hardcoding
                      timezone: "Asia/Kolkata",
                      slots,
                    }),
                  });

                  if (!res.ok) {
                    const errJson = await res.json().catch(() => null);
                    const message = errJson?.message || "Failed to create interview slots";
                    throw new Error(message);
                  }

                  toast({
                    title: "Slots sent",
                    description: `Your meeting slots have been shared with ${activeCandidate.name}.`,
                  });

                  setIsMeetingDialogOpen(false);
                  setActiveCandidate(null);
                  setMeetingSlots({ slot1: "", slot2: "", slot3: "" });
                } catch (error: any) {
                  console.error("Create interview error", error);
                  toast({
                    title: "Could not send slots",
                    description: error?.message || "Something went wrong while creating interview slots.",
                    variant: "destructive",
                  });
                } finally {
                  setIsSendingSlots(false);
                }
              }}
            >
              {isSendingSlots ? "Sending..." : "Save & Send Slots"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Proceed to Hire Dialog */}
      <Dialog open={isBulkHireDialogOpen} onOpenChange={(open) => setIsBulkHireDialogOpen(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Proceed to Hire ({selectedItems.length} candidate{selectedItems.length !== 1 ? "s" : ""})</DialogTitle>
            <DialogDescription>
              Choose how you want to move forward with the selected candidates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Option 1: Direct hiring */}
            <Card className="p-4 border border-emerald-200/70 bg-emerald-50/60 rounded-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Direct Hiring (Send Proposals Now)</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Use this when you are confident about the candidates and want to send the final hiring proposal without a prior interview.
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-2">
                    You can still tweak details for each candidate using the green paper-plane icon on their card.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    if (selectedCandidates.length === 0) {
                      toast({
                        title: "No candidates selected",
                        description: "Please select at least one candidate to send proposals.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setIsBulkHireDialogOpen(false);
                    openFirstSelectedForProposal();
                  }}
                >
                  Continue with Direct Proposals
                </Button>
              </div>
            </Card>

            {/* Option 2: Interview first, then hire */}
            <Card className="p-4 border border-slate-200 rounded-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Interview First, Then Send Offer</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Use this when you want to schedule interviews before sending a formal proposal. Ideal for shortlisted candidates where you still need an interaction.
                  </p>
                  <p className="text-[11px] text-slate-600 mt-2">
                    Schedule interviews using the dark green calendar icon on each candidate card, then send proposals from the paper-plane icon after interviews.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (selectedCandidates.length === 0) {
                      toast({
                        title: "No candidates selected",
                        description: "Please select at least one candidate to schedule interviews.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setIsBulkHireDialogOpen(false);
                    openFirstSelectedForMeeting();
                  }}
                >
                  Continue to Schedule Interviews
                </Button>
              </div>
            </Card>

            <p className="text-[11px] text-slate-500 mt-1">
              Tip: You can mix both flows – interview only a few candidates and send direct proposals to those you already know you want to hire.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Hiring Proposal Dialog */}
      <Dialog open={isProposalDialogOpen} onOpenChange={(open) => {
        setIsProposalDialogOpen(open);
        if (!open) {
          setActiveCandidate(null);
          setProposalRoleTitle("");
          setProposalJD("");
          setProposalMode("remote");
          setProposalStartDate("");
          setProposalDuration("1m");
          setProposalShiftFrom("09:00");
          setProposalShiftTo("18:00");
          setProposalTimezone("Asia/Kolkata");
          setProposalLaptop("candidate");
          setProposalMonthlyHours("160");
          setProposalMonthlyAmount("");
        }
      }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeCandidate ? `Send Hiring Proposal to ${activeCandidate.name}` : "Send Hiring Proposal"}
            </DialogTitle>
            <DialogDescription>
              Share the final internship offer details. The candidate can accept and join directly.
            </DialogDescription>
          </DialogHeader>

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

          <DialogFooter className="mt-4 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex-1">
              You can either send this proposal directly (without interview) or share it after the interview is completed.
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isSendingProposal}
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
                if (!activeCandidate) {
                  toast({
                    title: "No candidate selected",
                    description: "Please select a candidate to send proposal.",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  setIsSendingProposal(true);

                  const auth = getEmployerAuth();
                  const employerId = auth?.id as string | undefined;

                  if (!employerId) {
                    toast({
                      title: "Employer not found",
                      description: "Please log in again as employer to send proposals.",
                      variant: "destructive",
                    });
                    return;
                  }

                  const projectsRes = await fetch(`/api/employer/${employerId}/projects`);
                  if (!projectsRes.ok) {
                    throw new Error("Failed to load employer projects");
                  }
                  const projectsJson = await projectsRes.json();
                  const projectsList = (projectsJson?.projects ?? []) as any[];
                  const firstProject = projectsList[0];

                  if (!firstProject?.id) {
                    toast({
                      title: "No project found",
                      description: "Please complete employer onboarding and create a project first.",
                      variant: "destructive",
                    });
                    return;
                  }

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
                  };

                  const res = await fetch(`/api/employer/${employerId}/proposals`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      internId: activeCandidate.id,
                      projectId: firstProject.id,
                      flowType: "direct",
                      offerDetails,
                      aiRatings: {
                        communication: activeCandidate.aiRatings.communication,
                        coding: activeCandidate.aiRatings.coding,
                        aptitude: activeCandidate.aiRatings.aptitude,
                        overall: activeCandidate.aiRatings.interview,
                      },
                      skills: activeCandidate.skills,
                    }),
                  });

                  if (!res.ok) {
                    const errJson = await res.json().catch(() => null);
                    const message = errJson?.message || "Failed to send proposal";
                    throw new Error(message);
                  }

                  toast({
                    title: "Proposal sent",
                    description: `Your hiring proposal has been sent to ${activeCandidate.name}.`,
                  });

                  const removedId = activeCandidate.id;
                  setCartItems((prev) => prev.filter((c) => c.id !== removedId));
                  setSelectedItems((prev) => prev.filter((id) => id !== removedId));
                  try {
                    const storedIdsRaw = window.localStorage.getItem("employerCartIds");
                    const storedIds: string[] = storedIdsRaw ? JSON.parse(storedIdsRaw) : [];
                    const nextIds = storedIds.filter((id) => id !== removedId);
                    window.localStorage.setItem("employerCartIds", JSON.stringify(nextIds));
                  } catch (error) {
                    console.error("Failed to update employerCartIds after sending proposal", error);
                  }

                  setIsProposalDialogOpen(false);
                  setActiveCandidate(null);
                  setProposalRoleTitle("");
                  setProposalJD("");
                  setProposalMode("remote");
                  setProposalStartDate("");
                  setProposalDuration("1m");
                  setProposalShiftFrom("09:00");
                  setProposalShiftTo("18:00");
                  setProposalTimezone("Asia/Kolkata");
                  setProposalLaptop("candidate");
                  setProposalMonthlyHours("160");
                  setProposalMonthlyAmount("");
                } catch (error: any) {
                  console.error("Send proposal error", error);
                  toast({
                    title: "Failed to send proposal",
                    description: error?.message || "Something went wrong while sending proposal.",
                    variant: "destructive",
                  });
                } finally {
                  setIsSendingProposal(false);
                }
              }}
            >
              {isSendingProposal ? "Sending..." : "Send Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Remove from Cart
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this candidate from your cart? You can add them back later from the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingCandidate(null);
              }}
              className="rounded-lg"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFromCart}
              className="rounded-lg bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

