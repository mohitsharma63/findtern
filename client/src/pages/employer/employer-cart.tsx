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
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";

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
    
    setCartItems(prev => prev.filter(c => c.id !== deletingCandidate.id));
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

    setIsCheckingOut(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Request submitted!",
        description: `Your hiring request for ${selectedItems.length} candidate(s) has been submitted.`,
      });
      
      // Clear selected items from cart
      setCartItems(prev => prev.filter(c => !selectedItems.includes(c.id)));
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const selectedCandidates = cartItems.filter(c => selectedItems.includes(c.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-lg"
              onClick={() => setLocation("/employer/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src={findternLogo} alt="Findtern" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-emerald-700">FINDTERN</span>
                <span className="text-xs text-slate-400 ml-1.5">INTERNSHIP SIMPLIFIED</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
              <Building2 className="w-4 h-4" />
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

