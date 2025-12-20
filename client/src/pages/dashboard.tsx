import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  MapPin,
  Bell,
  GraduationCap,
  FileText,
  Calendar,
  Lock,
  UserMinus,
  LogOut,
  HelpCircle,
  Calendar as CalendarIcon,
  Video,
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";
import ProfileResume from "@/components/profile/ProfileResume";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [openToWork, setOpenToWork] = useState(false);

  // Static data for AI Interview
  const aiInterviewData = {
    status: "pending",
    message: "We've received your request and will share the interview link with you shortly.",
  };

  // Static skill ratings (will be revealed after interview)
  const skillRatings = [
    { skill: "SEO Security", rating: 4 },
    { skill: "Flask Security", rating: 3 },
    { skill: "Agile Testing", rating: 5 },
    { skill: "NLP Integration", rating: 4 },
    { skill: "Rust Automation", rating: 3 },
    { skill: "Django Debugging", rating: 4 },
    { skill: "Node.js Security", rating: 5 },
  ];

  // Static user data
  // Dynamic user + onboarding data
  const queryClient = useQueryClient();
  const storedUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const storedUserEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;

  const { data: onboardingResp } = useQuery({
    queryKey: ["/api/onboarding", storedUserId],
    enabled: !!storedUserId,
    queryFn: async () => {
      if (!storedUserId) return null;
      const res = await fetch(`/api/onboarding/${storedUserId}`);
      if (!res.ok) throw new Error("Failed to fetch onboarding data");
      return res.json();
    },
  });

  const { data: userByEmailResp } = useQuery({
    queryKey: ["/api/auth/user/by-email", storedUserEmail ? encodeURIComponent(storedUserEmail) : ""],
    enabled: !storedUserId && !!storedUserEmail,
    queryFn: async ({ queryKey }) => {
      const url = queryKey.join("/");
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user by email");
      return res.json();
    },
    onSuccess(data) {
      if (data?.user?.id) {
        localStorage.setItem("userId", data.user.id);
        queryClient.invalidateQueries(["/api/onboarding"]);
      }
    },
  });

  const userData = (onboardingResp && onboardingResp.onboarding?.extraData?.user) || userByEmailResp?.user || {
    name: "",
    phone: "",
    email: storedUserEmail || "",
    location: "",
    skills: [],
    languages: [],
    workExperience: { role: "", company: "", organization: "", period: "" },
    education: {},
    additionalDetails: {},
  };

  const onboarding = onboardingResp?.onboarding || null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <img src={findternLogo} alt="Findtern" className="h-8 w-auto" />
            <span className="text-lg font-semibold text-[#0E6049]">FINDTERN</span>
            <span className="text-sm text-muted-foreground">INTERNSHIP SIMPLIFIED</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="hidden md:flex h-9 text-xs"
              onClick={() => setLocation("/interviews")}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              AI Interview
            </Button>
            <Button
              className="h-9 text-xs"
              style={{ backgroundColor: '#0E6049' }}
              onClick={() => setLocation("/proposals")}
            >
              <FileText className="h-4 w-4 mr-2" />
              My Proposal
            </Button>
            {/* <Button
              variant="outline"
              className="hidden md:flex h-9 text-xs"
              onClick={() => setLocation("/opportunities")}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Opportunities
            </Button> */}
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0E6049] to-[#0E6049]/80 flex items-center justify-center text-white text-xs font-semibold">
                      {(userData.name || "").split(' ').map(n => n?.[0] ?? '').join('').toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation('/edit-profile')}>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <UserMinus className="h-4 w-4 text-white" />
                  </div>
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <span>Resume Download</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <span>Open to Work</span>
                  </div>
                  <Switch checked={openToWork} onCheckedChange={setOpenToWork} />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation('/settings')}>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  <span>Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-3 cursor-pointer text-destructive focus:text-destructive">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <UserMinus className="h-4 w-4 text-white" />
                  </div>
                  <span>Deactivate Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                    <LogOut className="h-4 w-4 text-white" />
                  </div>
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </header>

        {/* AI Interview Notification Banner */}
        {aiInterviewData.status === "pending" && (
          <div className="bg-muted/50 border-b px-4 py-3">
            <div className="container flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-[#0E6049]" />
              <span>{aiInterviewData.message}</span>
            </div>
          </div>
        )}

        <div className="container px-4 md:px-6 py-6">
          <ProfileResume user={userData} onboarding={onboarding} />
        </div>

        {/* Help Button */}
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
          style={{ backgroundColor: '#0E6049' }}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    );
  }
