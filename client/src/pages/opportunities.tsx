import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Calendar,
  Bell,
  FileText,
  UserMinus,
  Lock,
  LogOut,
  Heart,
  Share2,
  Bookmark,
} from "lucide-react";
import findternLogo from "@assets/logo.jpg";

export default function OpportunitiesPage() {
  const [, setLocation] = useLocation();
  const [openToWork, setOpenToWork] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  const opportunities = [
    {
      id: 1,
      title: "Frontend Developer Intern",
      company: "Tech Corp",
      location: "Remote",
      type: "Full-time",
      duration: "6 months",
      stipend: "₹15,000/month",
      posted: "2 days ago",
      applications: 45,
      description: "We are looking for a passionate Frontend Developer intern...",
      skills: ["React", "TypeScript", "CSS"],
    },
    {
      id: 2,
      title: "Backend Developer Intern",
      company: "Dev Solutions",
      location: "Hybrid",
      type: "Part-time",
      duration: "3 months",
      stipend: "₹12,000/month",
      posted: "5 days ago",
      applications: 32,
      description: "Join our backend team to work on scalable APIs...",
      skills: ["Node.js", "Python", "PostgreSQL"],
    },
    {
      id: 3,
      title: "Data Science Intern",
      company: "AI Labs",
      location: "On-site",
      type: "Full-time",
      duration: "4 months",
      stipend: "₹18,000/month",
      posted: "1 week ago",
      applications: 18,
      description: "Work on machine learning models and data analysis...",
      skills: ["Python", "TensorFlow", "SQL"],
    },
    {
      id: 4,
      title: "UI/UX Designer Intern",
      company: "Design Studio",
      location: "Remote",
      type: "Part-time",
      duration: "3 months",
      stipend: "₹10,000/month",
      posted: "3 days ago",
      applications: 28,
      description: "Create beautiful and intuitive user interfaces...",
      skills: ["Figma", "Adobe XD", "Prototyping"],
    },
  ];

  const toggleSave = (id: number) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    );
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesLocation =
      filterLocation === "all" || opp.location.toLowerCase() === filterLocation.toLowerCase();
    const matchesType =
      filterType === "all" || opp.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
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
                <DropdownMenuItem
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setLocation("/dashboard")}
                >
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Internship Opportunities</h1>
          <p className="text-muted-foreground">
            Discover the perfect internship opportunity for you
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by job title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-full md:w-[180px] h-11">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="on-site">On-site</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px] h-11">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOpportunities.map((opp) => (
            <Card key={opp.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{opp.title}</h3>
                  <p className="text-lg text-muted-foreground mb-2">{opp.company}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {opp.location}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {opp.type}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {opp.duration}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleSave(opp.id)}
                  className={savedJobs.includes(opp.id) ? "text-[#0E6049]" : ""}
                >
                  <Bookmark
                    className={`h-5 w-5 ${savedJobs.includes(opp.id) ? "fill-current" : ""}`}
                  />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {opp.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {opp.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {opp.stipend}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {opp.posted}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Share functionality
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    style={{ backgroundColor: '#0E6049' }}
                    onClick={() => {
                      // Apply functionality
                    }}
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No opportunities found matching your criteria.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
