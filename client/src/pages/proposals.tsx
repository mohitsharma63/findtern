import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  FileText,
  Calendar,
  Lock,
  UserMinus,
  LogOut,
  GraduationCap,
  Check,
  X,
  MapPin,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";

export default function ProposalsPage() {
  const [, setLocation] = useLocation();
  const [openToWork, setOpenToWork] = useState(false);

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
              <Calendar className="h-4 w-4 mr-2" />
              My Interview
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0E6049] to-[#0E6049]/80 flex items-center justify-center text-white text-xs font-semibold">
                    SJ
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center gap-3 cursor-pointer">
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
                <DropdownMenuItem className="flex items-center gap-3 cursor-pointer">
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

      <div className="container px-4 md:px-6 py-8">
        <h1 className="text-2xl font-bold text-[#0E6049] mb-2">Internship Proposals</h1>
        <p className="text-sm text-muted-foreground mb-6">
          This is a static preview. In production, all your active internship proposals will be listed here.
        </p>

        {/* Static proposal card */}
        <Card className="max-w-xl border border-emerald-50 shadow-sm rounded-2xl p-4 md:p-5 flex flex-col gap-3">
          {/* Header: company + meta */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-semibold text-slate-900">sonu</p>
              </div>
              <p className="flex items-center gap-1 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                Jaipur, Rajasthan · Onsite
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-100">
                  Medium-Term
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 border border-amber-100">
                  Stipend: ₹12,000 / month
                </span>
              </div>
            </div>

            {/* Chat icon button */}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shrink-0"
              onClick={() => setLocation("/proposals/1")}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>

          {/* Rating row */}
          <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs">
            <p className="mb-1 flex items-center gap-1 font-semibold text-slate-800">
              <Sparkles className="w-3 h-3 text-amber-400" />
              AI Interview Ratings
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700">
              <span className="flex items-center justify-between">
                <span>Communication</span>
                <span className="font-semibold text-emerald-700">8</span>
              </span>
              <span className="flex items-center justify-between">
                <span>Coding</span>
                <span className="font-semibold text-emerald-700">8</span>
              </span>
              <span className="flex items-center justify-between">
                <span>Aptitude</span>
                <span className="font-semibold text-emerald-700">8</span>
              </span>
              <span className="flex items-center justify-between">
                <span>Overall Interview</span>
                <span className="font-semibold text-emerald-700">8</span>
              </span>
            </div>
          </div>

          {/* Skills */}
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-800">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {["Angular Integration", "TensorFlow Advanced Concepts", "Go Scalability", "JavaScript Monitoring"].map(
                (skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-700"
                  >
                    {skill}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <Button
              className="flex-1 rounded-full h-9 text-xs font-medium"
              style={{ backgroundColor: "#0E6049" }}
              onClick={() => setLocation("/proposals/1")}
            >
              View Proposal
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
