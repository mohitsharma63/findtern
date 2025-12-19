import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Video,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";

export default function InterviewsPage() {
  const [, setLocation] = useLocation();
  const [openToWork, setOpenToWork] = useState(false);

  // Static interview data
  const interviews = [
    {
      id: 1,
      company: "wafflebite",
      contact: "somil",
      location: "jaipur, Rajasthan",
    },
    {
      id: 2,
      company: "somil",
      scope: "Long-Term",
      location: "Remote",
      fullTimePossible: "No",
      status: "rescheduled",
      message: "New date requested. Please wait for updated timings.",
    },
    {
      id: 3,
      company: "TISHA",
      scope: "Short-Term",
      location: "Remote",
      fullTimePossible: "No",
      status: "scheduled",
      date: "12/16/2025, 12:00:00 AM",
      meetingLink: "https://meet.example.com/abc123",
    },
  ];

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
              className="h-9 text-xs"
              style={{ backgroundColor: '#0E6049' }}
              onClick={() => setLocation("/proposals")}
            >
              <FileText className="h-4 w-4 mr-2" />
              My Proposal
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
        <h1 className="text-2xl font-bold text-[#0E6049] mb-6">My Interviews</h1>

        <div className="space-y-4">
          {interviews.map((interview, index) => (
            <div key={interview.id}>
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{interview.company}</h3>
                    {interview.contact && (
                      <p className="text-sm text-muted-foreground">Contact: {interview.contact}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {interview.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{interview.location}</span>
                        </div>
                      )}
                      {interview.scope && (
                        <span>Scope: {interview.scope}</span>
                      )}
                      {interview.fullTimePossible && (
                        <span>Full-time Possible: {interview.fullTimePossible}</span>
                      )}
                    </div>
                  </div>

                  {/* Status Messages */}
                  {interview.status === "rescheduled" && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm text-yellow-800 dark:text-yellow-200">
                          {interview.message}
                        </span>
                      </div>
                    </div>
                  )}

                  {interview.status === "scheduled" && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Scheduled Interview
                          </span>
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300 pl-6">
                          <div>Date: {interview.date}</div>
                          <div className="mt-1">
                            <Button
                              variant="link"
                              className="h-auto p-0 text-blue-600 dark:text-blue-400 hover:underline"
                              onClick={() => window.open(interview.meetingLink, '_blank')}
                            >
                              <Video className="h-4 w-4 mr-1 inline" />
                              Join Meeting
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              {index < interviews.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
