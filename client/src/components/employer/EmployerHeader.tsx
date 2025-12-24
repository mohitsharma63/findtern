import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation } from "wouter";
import {
  Check,
  MessageSquare,
  Building2,
  ShoppingCart,
  Bell,
  ChevronDown,
  Calendar,
  HelpCircle,
  Shield,
  Trash2,
  LogOut,
  User,
} from "lucide-react";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getEmployerAuth } from "@/lib/employerAuth";

type EmployerHeaderActive = "dashboard" | "proposals" | "schedule" | "cart" | "alerts" | "none";

interface EmployerHeaderProps {
  active: EmployerHeaderActive;
}

export function EmployerHeader({ active }: EmployerHeaderProps) {
  const [, setLocation] = useLocation();

  const auth = getEmployerAuth();
  const companyName = auth?.companyName ?? "";
  const companyInitial = (companyName || auth?.companyEmail || "N").charAt(0).toUpperCase();

  const isActive = (key: EmployerHeaderActive) => active === key;

  const primaryClasses =
    "h-11 rounded-none flex flex-col items-center justify-center gap-0.5 border-b-2 border-x-0 border-t-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <img src={findternLogo} alt="Findtern" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-emerald-700">FINDTERN</span>
            <span className="text-xs text-slate-400 ml-1.5">INTERNSHIP SIMPLIFIED</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${primaryClasses} w-14 ${
                  isActive("dashboard")
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                }`}
                onClick={() => setLocation("/employer/dashboard")}
              >
                <Check className="w-4 h-4" />
                <span className="text-[10px] font-medium leading-none">Dashboard</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Dashboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${primaryClasses} w-16 ${
                  isActive("proposals")
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                }`}
                onClick={() => setLocation("/employer/proposals")}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px] font-medium leading-none">Proposals</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Hiring Proposals</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${primaryClasses} w-16 ${
                  isActive("schedule")
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                }`}
                onClick={() => setLocation("/employer/shedule")}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[10px] font-medium leading-none">Schedule</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Interview Schedule</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${primaryClasses} w-14 ${
                  isActive("cart")
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                } relative`}
                onClick={() => setLocation("/employer/cart")}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-[10px] font-medium leading-none mt-0.5">Cart</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Cart</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${primaryClasses} w-14 ${
                  isActive("alerts")
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="text-[10px] font-medium leading-none">Alerts</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Notifications</TooltipContent>
          </Tooltip>

          {/* Company account dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2 rounded-lg gap-1">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                  {companyInitial}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 text-xs font-medium text-slate-500">Company Account</div>
               <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setLocation("/employer/account")}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  const employerId = auth?.id;
                  if (!employerId) {
                    setLocation("/employer/login");
                    return;
                  }
                  window.location.href = `/api/google/oauth/start?employerId=${encodeURIComponent(
                    employerId,
                  )}`;
                }}
              >
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Connect Google Calendar</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setLocation("/employer/profile")}
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Company Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setLocation("/employer/account/change-password")}
              >
                <Shield className="w-4 h-4 text-slate-600" />
                <span>Change Password</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <ShoppingCart className="w-4 h-4 text-slate-700" />
                <span>Orders (static)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setLocation("/employer/shedule")}
              >
                <HelpCircle className="w-4 h-4 text-slate-600" />
                <span>Help &amp; Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                onClick={() => setLocation("/employer/account/deactivate")}
              >
                <Trash2 className="w-4 h-4" />
                <span>Deactivate Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setLocation("/employer/login")}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
