import { useState } from "react";
import { useLocation } from "wouter";
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
  const userData = {
    name: "Somil Jangid",
    phone: "6378001067",
    email: "xiroh72319@fftube.com",
    location: "Jaipur, Rajasthan",
    skills: [
      "SEO Security",
      "Flask Security",
      "Agile Testing",
      "NLP Integration",
      "Rust Automation",
      "Django Debugging",
      "Node.js Security",
    ],
    languages: [
      { name: "Hindi", level: "Native" },
      { name: "English", level: "Professional" },
    ],
    workExperience: {
      role: "operation intern",
      company: "nmbmnb",
      organization: "Findtern",
      period: "Dec 2025 - Present (Internship)",
    },
    education: {
      degree: "Master of Pharmacy (M.Pharm.)",
      institution: "mn",
      period: "2022 - 2024",
      level: "Post Graduation",
      status: "Completed",
      score: "67%",
    },
    additionalDetails: {
      laptop: "Yes",
      preferredLocations: "Remote",
    },
  };

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
                    {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
          {/* Left Sidebar - Profile Summary */}
          <div className="space-y-6">
            <Card className="bg-foreground text-foreground-foreground p-6 space-y-6">
              {/* Profile Photo & Name */}
              <div className="flex flex-col items-center gap-4">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#0E6049] to-[#0E6049]/80 flex items-center justify-center text-white text-2xl font-bold">
                  {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">{userData.name}</h2>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">CONTACT</h3>
                <div className="space-y-2 text-sm text-white/90">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{userData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{userData.location}</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/20" />

              {/* Skills */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">SKILLS</h3>
                <ul className="space-y-1.5 text-sm text-white/90">
                  {userData.skills.map((skill, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator className="bg-white/20" />

              {/* Languages */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">LANGUAGES</h3>
                <ul className="space-y-1.5 text-sm text-white/90">
                  {userData.languages.map((lang, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                      <span>{lang.name} ({lang.level})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Right Content Area */}
          <div className="space-y-6">
            {/* Logo in top right */}
            <div className="flex justify-end">
              <div className="flex items-center gap-2">
                <img src={findternLogo} alt="Findtern" className="h-6 w-auto" />
                <span className="text-sm font-semibold text-[#0E6049]">FINDTERN</span>
              </div>
            </div>

            {/* AI Interview - Skill Ratings Section */}
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">SKILL RATINGS</h3>
                <p className="text-sm text-muted-foreground">
                  These skill ratings are generated from the AI interview and will be revealed once the interview is completed.
                </p>
              </div>

              {aiInterviewData.status === "pending" ? (
                <div className="py-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Complete your AI interview to see your skill ratings
                  </p>
                  <Button
                    className="mt-4"
                    style={{ backgroundColor: '#0E6049' }}
                    onClick={() => setLocation("/interviews")}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Start AI Interview
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {skillRatings.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{item.skill}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              className={`h-2 w-2 rounded-full ${
                                star <= item.rating ? 'bg-[#0E6049]' : 'bg-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-[#0E6049] w-8 text-right">
                          {item.rating}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Work Experience */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">WORK EXPERIENCE</h3>
              <div className="space-y-2">
                <div className="font-medium">{userData.workExperience.role}</div>
                <div className="text-sm text-muted-foreground">{userData.workExperience.company}</div>
                <div className="text-sm text-muted-foreground">
                  {userData.workExperience.organization} | {userData.workExperience.period}
                </div>
              </div>
            </Card>

            {/* Education */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">EDUCATION</h3>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Highest Qualification</h4>
                <div className="space-y-2">
                  <div className="font-medium">{userData.education.degree}</div>
                  <div className="text-sm text-muted-foreground">
                    {userData.education.institution} | {userData.education.period}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Level: {userData.education.level} | Status: {userData.education.status} | Score: {userData.education.score}
                  </div>
                </div>
              </div>
            </Card>

            {/* Additional Details */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">ADDITIONAL DETAILS</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Laptop: </span>
                  <span className="text-muted-foreground">{userData.additionalDetails.laptop}</span>
                </div>
                <div>
                  <span className="font-medium">Preferred Locations: </span>
                  <span className="text-muted-foreground">{userData.additionalDetails.preferredLocations}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
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
