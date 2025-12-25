import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Bell, Calendar as CalendarIcon, FileText, LayoutDashboard, Lock, LogOut, UserMinus } from "lucide-react";
import findternLogo from "@assets/logo.jpg";

interface CandidateHeaderProps {
  showAiInterviewButton?: boolean;
  showViewDocuments?: boolean;
  userInitials?: string;
  openToWork?: boolean;
  onOpenToWorkChange?: (value: boolean) => void;
}

export function CandidateHeader({
  showAiInterviewButton = true,
  showViewDocuments = false,
  userInitials,
  openToWork,
  onOpenToWorkChange,
}: CandidateHeaderProps) {
  const [, setLocation] = useLocation();

  const [internalOpenToWork, setInternalOpenToWork] = useState(false);
  const effectiveOpenToWork = openToWork ?? internalOpenToWork;
  const setEffectiveOpenToWork = (value: boolean) => {
    if (onOpenToWorkChange) {
      onOpenToWorkChange(value);
      return;
    }
    setInternalOpenToWork(value);
  };

  const fallbackInitials = useMemo(() => {
    if (typeof window === "undefined") return "U";
    const email = window.localStorage.getItem("userEmail") || "";
    const ch = (email.trim().charAt(0) || "U").toUpperCase();
    return ch;
  }, []);

  const initials = (userInitials && userInitials.trim()) ? userInitials : fallbackInitials;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <img src={findternLogo} alt="Findtern" className="h-8 w-auto" />

          <span className="text-lg font-semibold text-[#0E6049]">FINDTERN</span>
          <span className="text-sm text-muted-foreground">INTERNSHIP SIMPLIFIED</span>
        </div>

        <div className="flex items-center gap-3">
          {showAiInterviewButton && (
            <Button
              variant="outline"
              className="hidden md:flex h-9 text-xs"
              onClick={() => setLocation("/interviews")}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              AI Interview
            </Button>
          )}

          <Button
            className="h-9 text-xs"
            style={{ backgroundColor: "#0E6049" }}
            onClick={() => setLocation("/proposals")}
          >
            <FileText className="h-4 w-4 mr-2" />
            My Proposal
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0E6049] to-[#0E6049]/80 flex items-center justify-center text-white text-xs font-semibold">
                  {initials}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setLocation("/dashboard")}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <LayoutDashboard className="h-4 w-4 text-white" />
                </div>
                <span>Dashboard</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setLocation("/onboarding?edit=1")}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <UserMinus className="h-4 w-4 text-white" />
                </div>
                <span>Edit Profile</span>
              </DropdownMenuItem>

              {showViewDocuments && (
                <DropdownMenuItem
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setLocation("/dashboard/documents")}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <span>View Documents</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <CalendarIcon className="h-4 w-4 text-white" />
                  </div>
                  <span>Open to Work</span>
                </div>
                <Switch checked={effectiveOpenToWork} onCheckedChange={setEffectiveOpenToWork} />
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setLocation("/settings?view=change-password")}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <span>Change Password</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

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
  );
}