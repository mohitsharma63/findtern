import { useState, useMemo, useEffect } from "react";
import { 
  Bell, 
  Search,
  MapPin,
  Star,
  Filter,
  ChevronDown,
  Plus,
  X,
  ShoppingCart,
  MessageSquare,
  Building2,
  Check,
  Edit,
  Laptop,
  Users,
  HelpCircle,
  CheckCircle,
  User,
  Trash2,
  Loader2,
  FolderPlus,
  ExternalLink,
  Shield,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { getEmployerAuth } from "@/lib/employerAuth";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";
import skillsData from "@/data/skills.json";

// Types
interface Project {
  id: string;
  name: string;
  skills: string[];
}

const initialProjects: Project[] = [];

type Candidate = {
  id: string;
  initials: string;
  name: string;
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
  hasProfile: boolean;
  isAdded: boolean;
};

export default function EmployerDashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Projects state
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [authEmployerId, setAuthEmployerId] = useState<string | null>(null);
  
  // Project dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [includeRemote, setIncludeRemote] = useState(true);
  const [hasLaptop, setHasLaptop] = useState(false);
  const [filterBySkills, setFilterBySkills] = useState(true);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);

  useEffect(() => {
    const auth = getEmployerAuth();
    if (!auth) {
      setLocation("/employer/login");
      return;
    }
    setAuthEmployerId(auth.id);

    (async () => {
      try {
        const response = await apiRequest("GET", `/api/employer/${auth.id}/projects`);
        const json = await response.json();
        const list: Project[] = (json?.projects || []).map((p: any) => {
          const rawSkills = Array.isArray(p.skills) ? p.skills : [];
          const skills: string[] = rawSkills
            .map((s: any) =>
              typeof s === "string"
                ? s
                : typeof s?.name === "string"
                ? s.name
                : "",
            )
            .filter((s: string) => s.trim().length > 0);

          return {
            id: p.id,
            name: p.projectName,
            skills,
          } as Project;
        });

        setProjects(list);
        if (list.length > 0) {
          setSelectedProject(list[0]);
          setSelectedSkills(list[0].skills);
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [setLocation]);

  // Load intern candidates dynamically from backend
  useEffect(() => {
    (async () => {
      try {
        const response = await apiRequest("GET", "/api/interns");
        const json = await response.json();
        const list = (json?.interns || []) as any[];
        const mapped: Candidate[] = list.map((item) => {
          const onboarding = item.onboarding ?? {};
          const user = item.user ?? {};
          const documents = item.documents ?? null;

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
          const locationParts = [onboarding.city, onboarding.state].filter(Boolean).join(", ");
          const userFirst = user.firstName ?? "";
          const userLast = user.lastName ?? "";
          const fullFromUser = `${userFirst} ${userLast}`.trim();
          const name = fullFromUser || onboarding.extraData?.fullName || onboarding.extraData?.name || "Intern";
          const initials = (name || "I")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((p: string) => p[0]?.toUpperCase() ?? "")
            .join("") || "IN";

          return {
            // use user id as stable identifier across dashboard + profile routes
            id: user.id ?? onboarding.userId ?? onboarding.id ?? "",
            initials,
            name,
            location: locationParts || "",
            findternScore: onboarding.extraData?.findternScore ?? 0,
            skills,
            matchedSkills: skills, // for now treat all skills as matched
            aiRatings: {
              communication: onboarding.extraData?.ratings?.communication ?? 0,
              coding: onboarding.extraData?.ratings?.coding ?? 0,
              aptitude: onboarding.extraData?.ratings?.aptitude ?? 0,
              interview: onboarding.extraData?.ratings?.interview ?? 0,
            },
            hasProfile: !!documents?.profilePhotoName,
            isAdded: false,
          };
        });

        // apply existing cart state from localStorage so added items are marked
        const storedCartRaw = window.localStorage.getItem("employerCartIds");
        const storedCart: string[] = storedCartRaw ? JSON.parse(storedCartRaw) : [];

        setCart(storedCart);
        setCartCount(storedCart.length);

        setCandidates(
          mapped.map((c) =>
            storedCart.includes(c.id)
              ? { ...c, isAdded: true }
              : c,
          ),
        );
      } catch (error) {
        console.error("Failed to load interns", error);
      }
    })();
  }, []);

  // Initialize compare list from localStorage so compare page can read it
  useEffect(() => {
    try {
      const storedCompareRaw = window.localStorage.getItem("employerCompareIds");
      const storedCompare: string[] = storedCompareRaw ? JSON.parse(storedCompareRaw) : [];
      if (Array.isArray(storedCompare) && storedCompare.length > 0) {
        setCompareList(storedCompare);
      }
    } catch (error) {
      console.error("Failed to load compare list from localStorage", error);
    }
  }, []);

  // Project CRUD handlers
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    if (!authEmployerId) return;
    setIsLoading(true);
    try {
      const newProjectNameTrimmed = newProjectName.trim();

      const response = await apiRequest("POST", `/api/employer/${authEmployerId}/projects`, {
        projectName: newProjectNameTrimmed,
        skills: [],
      });
      const json = await response.json();
      const createdId = json?.project?.id ?? Date.now().toString();

      const created: Project = { id: createdId, name: newProjectNameTrimmed, skills: [] };

      setProjects(prev => [...prev, created]);
      setSelectedProject(created);
      setSelectedSkills([]);
      setNewProjectName("");
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Project created",
        description: `"${newProjectNameTrimmed}" has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (candidateId: string) => {
    setCart((prev) => {
      if (prev.includes(candidateId)) return prev;
      const updated = [...prev, candidateId];
      setCartCount(updated.length);

      // persist to localStorage so cart page and future visits see it
      window.localStorage.setItem("employerCartIds", JSON.stringify(updated));

      toast({
        title: "Candidate added",
        description: "Intern has been added to your cart.",
      });
      return updated;
    });

    // Visually mark candidate as added so button is disabled
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? { ...c, isAdded: true }
          : c,
      ),
    );
  };

  const handleEditProject = async () => {
    if (!editingProject || !newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    if (!authEmployerId || !editingProject) return;
    setIsLoading(true);
    try {
      await apiRequest("PUT", `/api/projects/${editingProject.id}`, {
        projectName: newProjectName.trim(),
      });

      setProjects(prev =>
        prev.map(p => (p.id === editingProject.id ? { ...p, name: newProjectName.trim() } : p)),
      );
      
      if (selectedProject.id === editingProject.id) {
        setSelectedProject({ ...editingProject, name: newProjectName.trim() });
      }
      
      setNewProjectName("");
      setEditingProject(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Project updated",
        description: `Project has been renamed to "${newProjectName.trim()}"`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!editingProject) return;
    setIsLoading(true);
    try {
      const remainingProjects = projects.filter(p => p.id !== editingProject.id);
      await apiRequest("DELETE", `/api/projects/${editingProject.id}`);
      setProjects(remainingProjects);
      
      // If deleted project was selected, select the first available
      if (selectedProject.id === editingProject.id && remainingProjects.length > 0) {
        setSelectedProject(remainingProjects[0]);
      }
      
      setEditingProject(null);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Project deleted",
        description: `"${editingProject.name}" has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (project: Project) => {
    setEditingProject(project);
    setIsDeleteDialogOpen(true);
  };

  const toggleCompare = (candidateId: string) => {
    setCompareList(prev => {
      let next: string[];
      if (prev.includes(candidateId)) {
        next = prev.filter(id => id !== candidateId);
      } else {
        if (prev.length >= 5) {
          toast({
            title: "Compare limit reached",
            description: "You can compare up to 5 profiles at a time.",
          });
          return prev;
        }
        next = [...prev, candidateId];
      }

      try {
        window.localStorage.setItem("employerCompareIds", JSON.stringify(next));
      } catch (error) {
        console.error("Failed to persist compare list to localStorage", error);
      }

      return next;
    });
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const filteredSkillOptions = useMemo(() => {
    const lowerSelected = selectedSkills.map((s) => s.toLowerCase());
    const pool = (skillsData as string[]).filter(
      (s) => !lowerSelected.includes(s.toLowerCase()),
    );
    if (!skillSearch.trim()) return pool.slice(0, 20);
    const q = skillSearch.toLowerCase();
    return pool.filter((s) => s.toLowerCase().includes(q)).slice(0, 20);
  }, [skillSearch, selectedSkills]);

  const filteredCandidates = useMemo(() => {
    let list = [...candidates];

    if (filterBySkills && selectedSkills.length > 0) {
      list = list.filter((c) =>
        c.skills.some((skill) => selectedSkills.includes(skill)),
      );
    }

    if (minRating > 0) {
      list = list.filter((c) => c.aiRatings.interview >= minRating);
    }

    return list;
  }, [candidates, filterBySkills, selectedSkills, minRating]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      {/* Header */}
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
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
              <Check className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              onClick={() => setLocation("/proposals")}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              onClick={() => setLocation("/employer/account")}
            >
              <Building2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 relative"
              onClick={() => setLocation("/employer/cart")}
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <Bell className="w-4 h-4" />
            </Button>

            {/* Company account dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-2 rounded-lg gap-1">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                    N
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 text-xs font-medium text-slate-500">Company Account</div>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setLocation("/employer/profile")}
                >
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Company Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <span>Change Password (static)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setLocation("/employer/account")}
                >
                  <ShoppingCart className="w-4 h-4 text-slate-700" />
                  <span>Orders (static)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setLocation("/employer/account")}
                >
                  <HelpCircle className="w-4 h-4 text-slate-600" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600">
                  <Trash2 className="w-4 h-4" />
                  <span>Deactivate Account (static)</span>
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

      <div className="flex">
        {/* Left Sidebar - Filters */}
        <aside className="w-72 min-h-[calc(100vh-64px)] border-r bg-white/70 backdrop-blur p-4 hidden lg:block">
          {/* Projects Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Projects</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => {
                  setNewProjectName("");
                  setIsCreateDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>
            
            {/* Project Dropdown with Edit Icons */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-10 justify-between rounded-lg border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">
                      {selectedProject ? selectedProject.name : "No project selected"}
                    </span>
                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {projects.map((project) => (
                  <DropdownMenuItem 
                    key={project.id}
                    className="flex items-center justify-between cursor-pointer group p-0"
                  >
                    <button
                      className={`flex-1 flex items-center gap-2 px-3 py-2 text-left ${
                        selectedProject && selectedProject.id === project.id ? "bg-emerald-50" : ""
                      }`}
                      onClick={() => {
                        setSelectedProject(project);
                        setSelectedSkills(project.skills);
                      }}
                    >
                      {selectedProject && selectedProject.id === project.id && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                      <span className={selectedProject && selectedProject.id === project.id ? "font-medium text-emerald-700" : ""}>
                        {project.name}
                      </span>
                    </button>
                    <div className="flex items-center gap-1 pr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-100 hover:text-emerald-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(project);
                        }}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(project);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </DropdownMenuItem>
                ))}
                
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Candidate Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <Filter className="w-4 h-4" />
              <h3 className="text-sm font-semibold">Candidate Filters</h3>
            </div>

            <Accordion type="multiple" defaultValue={["location", "device", "skills", "ratings"]} className="space-y-2">
              {/* Location Filter */}
              <AccordionItem value="location" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-medium text-slate-700 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    Location
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3 space-y-3">
                  <Select>
                    <SelectTrigger className="w-full h-9 text-sm rounded-lg border-slate-200">
                      <SelectValue placeholder="Select cities..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jaipur">Jaipur</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                    </SelectContent>
                  </Select>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox 
                      checked={includeRemote} 
                      onCheckedChange={(checked) => setIncludeRemote(checked as boolean)}
                      className="border-emerald-300 data-[state=checked]:bg-emerald-600"
                    />
                    <span className="text-slate-600">Include Remote Candidates</span>
                  </label>
                </AccordionContent>
              </AccordionItem>

              {/* Device Filter */}
              <AccordionItem value="device" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-medium text-slate-700 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-emerald-500" />
                    Device
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox 
                      checked={hasLaptop} 
                      onCheckedChange={(checked) => setHasLaptop(checked as boolean)}
                      className="border-slate-300"
                    />
                    <span className="text-slate-600">Has Laptop</span>
                  </label>
                </AccordionContent>
              </AccordionItem>

              {/* Skills Filter */}
              <AccordionItem value="skills" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-medium text-slate-700 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Skills Filter
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox 
                      checked={filterBySkills} 
                      onCheckedChange={(checked) => setFilterBySkills(checked as boolean)}
                      className="border-emerald-300 data-[state=checked]:bg-emerald-600"
                    />
                    <span className="text-slate-600">Filter candidates using selected skills</span>
                  </label>
                </AccordionContent>
              </AccordionItem>

              {/* Ratings Filter */}
              <AccordionItem value="ratings" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-medium text-slate-700 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Ratings
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3 space-y-3">
                  <div className="text-xs text-slate-500">Minimum AI Interview Score</div>
                  <Slider 
                    value={[minRating]} 
                    onValueChange={(val) => setMinRating(val[0])}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm font-medium text-emerald-600">{minRating}/10</div>
                </AccordionContent>
              </AccordionItem>

              {/* Sorting */}
              <AccordionItem value="sorting" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-medium text-slate-700 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    Sorting
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <Select defaultValue="score">
                    <SelectTrigger className="w-full h-9 text-sm rounded-lg border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">Findtern Score</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="skills">Skills Match</SelectItem>
                    </SelectContent>
                  </Select>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {/* Skills Header */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Select Required Skills</h2>
            <div className="flex flex-wrap items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
              {/* Selected skill chips */}
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[220px]">
                {selectedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full hover:bg-emerald-100"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Skill search + dropdown */}
              <div className="relative w-full md:w-64">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search & add skills..."
                    value={skillSearch}
                    onChange={(e) => {
                      setSkillSearch(e.target.value);
                      setIsSkillDropdownOpen(true);
                    }}
                    onFocus={() => setIsSkillDropdownOpen(true)}
                    className="pl-8 h-9 text-sm rounded-xl border-slate-200"
                  />
                </div>
                {isSkillDropdownOpen && (skillSearch || filteredSkillOptions.length > 0) && (
                  <div className="absolute z-40 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                    {filteredSkillOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          setSelectedSkills((prev) =>
                            prev.includes(skill) ? prev : [...prev, skill],
                          );
                          setSkillSearch("");
                          setIsSkillDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 first:rounded-t-xl last:rounded-b-xl"
                      >
                        {skill}
                      </button>
                    ))}
                    {filteredSkillOptions.length === 0 && (
                      <div className="px-3 py-2 text-xs text-slate-500">
                        No skills found. Try another keyword.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-emerald-600 font-semibold">● {filteredCandidates.length} candidates found</span>
            </div>
            {compareList.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setLocation("/employer/compare")}
                className="h-9 px-5 rounded-full border-amber-300 bg-gradient-to-r from-amber-200 to-amber-100 text-amber-800 hover:from-amber-300 hover:to-amber-200 shadow-sm flex items-center gap-2 text-sm font-semibold"
              >
                <Users className="w-4 h-4" />
                <span>Compare Profiles ({compareList.length})</span>
              </Button>
            )}
          </div>

          {/* Candidates List */}
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <Card 
                key={candidate.id} 
                className="p-5 border-0 shadow-lg shadow-slate-900/5 rounded-2xl bg-white hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold ${
                      candidate.hasProfile 
                        ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" 
                        : "bg-slate-200 text-slate-500"
                    }`}>
                      {candidate.hasProfile ? (
                        <span>{candidate.initials}</span>
                      ) : (
                        <User className="w-8 h-8" />
                      )}
                    </div>
                    {candidate.hasProfile && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                        <span className="text-[10px]">👤</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">{candidate.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          {candidate.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="inline-flex flex-col items-end gap-0.5">
                          <span className="text-[10px] uppercase tracking-wide text-emerald-700/80">
                            Findtern score
                          </span>
                          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-3 py-1 shadow-sm">
                            <span className="text-xs font-semibold">{candidate.findternScore.toFixed(1)}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant={compareList.includes(candidate.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleCompare(candidate.id)}
                          className={`h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                            compareList.includes(candidate.id)
                              ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                              : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {compareList.includes(candidate.id) ? "In compare" : "Add to compare"}
                          </span>
                        </Button>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.skills.slice(0, 7).map((skill, idx) => (
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
                      </div>
                    </div>

                    {/* AI Interview Ratings */}
                    <div className="flex items-center gap-4 mb-3">
                      <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        AI Interview Ratings
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          Communication: {candidate.aiRatings.communication}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          Coding: {candidate.aiRatings.coding}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          Aptitude: {candidate.aiRatings.aptitude}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-violet-400" />
                          AI Interview: {candidate.aiRatings.interview}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {candidate.isAdded ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1.5 rounded-full font-medium">
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Added
                        </Badge>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-4 rounded-full text-emerald-700 hover:bg-emerald-50"
                        onClick={() => setLocation(`/employer/intern/${candidate.id}`)}
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        View Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-4 rounded-full border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={candidate.isAdded}
                        onClick={() => handleAddToCart(candidate.id)}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                        {candidate.isAdded ? "Added" : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>

      {/* Help Button */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
      >
        <HelpCircle className="w-5 h-5" />
      </Button>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-emerald-600" />
              Create New Project
            </DialogTitle>
            <DialogDescription>
              Enter a name for your new project. You can add skills and requirements later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={isLoading || !newProjectName.trim()}
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-emerald-600" />
              Edit Project
            </DialogTitle>
            <DialogDescription>
              Update the project name below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
              onKeyPress={(e) => e.key === 'Enter' && handleEditProject()}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingProject(null);
                setNewProjectName("");
              }}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditProject}
              disabled={isLoading || !newProjectName.trim()}
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<span className="font-semibold text-slate-700">{editingProject?.name}</span>"? 
              This action cannot be undone. All candidates and settings associated with this project will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setEditingProject(null);
              }}
              className="rounded-lg"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isLoading}
              className="rounded-lg bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
