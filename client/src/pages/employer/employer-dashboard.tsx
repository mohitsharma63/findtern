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
  RotateCcw,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import findternLogo from "@assets/logo.jpg";
import { EmployerHeader } from "@/components/employer/EmployerHeader";
import skillsData from "@/data/skills.json";

const TIMEZONES: { id: string; label: string; disabled?: boolean }[] = [
  { id: "group-utc", label: "🌍 UTC / Global", disabled: true },
  { id: "UTC", label: "UTC 🌐" },
  { id: "Etc/UTC", label: "Etc/UTC 🌐" },
  { id: "Etc/GMT", label: "Etc/GMT 🌐" },

  { id: "group-asia", label: "🇮🇳 Asia", disabled: true },
  { id: "Asia/Kolkata", label: "Asia/Kolkata 🇮🇳" },
  { id: "Asia/Karachi", label: "Asia/Karachi 🇵🇰" },
  { id: "Asia/Dhaka", label: "Asia/Dhaka 🇧🇩" },
  { id: "Asia/Kathmandu", label: "Asia/Kathmandu 🇳🇵" },
  { id: "Asia/Colombo", label: "Asia/Colombo 🇱🇰" },
  { id: "Asia/Dubai", label: "Asia/Dubai 🇦🇪" },
  { id: "Asia/Muscat", label: "Asia/Muscat 🇴🇲" },
  { id: "Asia/Riyadh", label: "Asia/Riyadh 🇸🇦" },
  { id: "Asia/Qatar", label: "Asia/Qatar 🇶🇦" },
  { id: "Asia/Kuwait", label: "Asia/Kuwait 🇰🇼" },
  { id: "Asia/Tehran", label: "Asia/Tehran 🇮🇷" },
  { id: "Asia/Baghdad", label: "Asia/Baghdad 🇮🇶" },
  { id: "Asia/Jerusalem", label: "Asia/Jerusalem 🇮🇱" },
  { id: "Asia/Amman", label: "Asia/Amman 🇯🇴" },
  { id: "Asia/Beirut", label: "Asia/Beirut 🇱🇧" },
  { id: "Asia/Damascus", label: "Asia/Damascus 🇸🇾" },
  { id: "Asia/Istanbul", label: "Asia/Istanbul 🇹🇷" },
  { id: "Asia/Tbilisi", label: "Asia/Tbilisi 🇬🇪" },
  { id: "Asia/Yerevan", label: "Asia/Yerevan 🇦🇲" },
  { id: "Asia/Baku", label: "Asia/Baku 🇦🇿" },
  { id: "Asia/Kabul", label: "Asia/Kabul 🇦🇫" },
  { id: "Asia/Tashkent", label: "Asia/Tashkent 🇺🇿" },
  { id: "Asia/Almaty", label: "Asia/Almaty 🇰🇿" },
  { id: "Asia/Tokyo", label: "Asia/Tokyo 🇯🇵" },
  { id: "Asia/Seoul", label: "Asia/Seoul 🇰🇷" },
  { id: "Asia/Shanghai", label: "Asia/Shanghai 🇨🇳" },
  { id: "Asia/Hong_Kong", label: "Asia/Hong_Kong 🇭🇰" },
  { id: "Asia/Taipei", label: "Asia/Taipei 🇹🇼" },
  { id: "Asia/Singapore", label: "Asia/Singapore 🇸🇬" },
  { id: "Asia/Kuala_Lumpur", label: "Asia/Kuala_Lumpur 🇲🇾" },
  { id: "Asia/Jakarta", label: "Asia/Jakarta 🇮🇩" },
  { id: "Asia/Bangkok", label: "Asia/Bangkok 🇹🇭" },
  { id: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh 🇻🇳" },
  { id: "Asia/Manila", label: "Asia/Manila 🇵🇭" },

  { id: "group-europe", label: "🇪🇺 Europe", disabled: true },
  { id: "Europe/London", label: "Europe/London 🇬🇧" },
  { id: "Europe/Paris", label: "Europe/Paris 🇫🇷" },
  { id: "Europe/Berlin", label: "Europe/Berlin 🇩🇪" },
  { id: "Europe/Rome", label: "Europe/Rome 🇮🇹" },
  { id: "Europe/Madrid", label: "Europe/Madrid 🇪🇸" },
  { id: "Europe/Amsterdam", label: "Europe/Amsterdam 🇳🇱" },
  { id: "Europe/Brussels", label: "Europe/Brussels 🇧🇪" },
  { id: "Europe/Vienna", label: "Europe/Vienna 🇦🇹" },
  { id: "Europe/Zurich", label: "Europe/Zurich 🇨🇭" },
  { id: "Europe/Stockholm", label: "Europe/Stockholm 🇸🇪" },
  { id: "Europe/Oslo", label: "Europe/Oslo 🇳🇴" },
  { id: "Europe/Copenhagen", label: "Europe/Copenhagen 🇩🇰" },
  { id: "Europe/Helsinki", label: "Europe/Helsinki 🇫🇮" },
  { id: "Europe/Warsaw", label: "Europe/Warsaw 🇵🇱" },
  { id: "Europe/Prague", label: "Europe/Prague 🇨🇿" },
  { id: "Europe/Budapest", label: "Europe/Budapest 🇭🇺" },
  { id: "Europe/Athens", label: "Europe/Athens 🇬🇷" },
  { id: "Europe/Bucharest", label: "Europe/Bucharest 🇷🇴" },
  { id: "Europe/Sofia", label: "Europe/Sofia 🇧🇬" },
  { id: "Europe/Kiev", label: "Europe/Kiev 🇺🇦" },
  { id: "Europe/Moscow", label: "Europe/Moscow 🇷🇺" },
  { id: "Europe/Lisbon", label: "Europe/Lisbon 🇵🇹" },
  { id: "Europe/Dublin", label: "Europe/Dublin 🇮🇪" },
  { id: "Europe/Reykjavik", label: "Europe/Reykjavik 🇮🇸" },

  { id: "group-america", label: "🇺🇸 America", disabled: true },
  { id: "America/New_York", label: "America/New_York 🇺🇸" },
  { id: "America/Chicago", label: "America/Chicago 🇺🇸" },
  { id: "America/Denver", label: "America/Denver 🇺🇸" },
  { id: "America/Los_Angeles", label: "America/Los_Angeles 🇺🇸" },
  { id: "America/Phoenix", label: "America/Phoenix 🇺🇸" },
  { id: "America/Anchorage", label: "America/Anchorage 🇺🇸" },
  { id: "America/Toronto", label: "America/Toronto 🇨🇦" },
  { id: "America/Vancouver", label: "America/Vancouver 🇨🇦" },
  { id: "America/Mexico_City", label: "America/Mexico_City 🇲🇽" },
  { id: "America/Bogota", label: "America/Bogota 🇨🇴" },
  { id: "America/Lima", label: "America/Lima 🇵🇪" },
  { id: "America/Santiago", label: "America/Santiago 🇨🇱" },
  { id: "America/Argentina/Buenos_Aires", label: "America/Argentina/Buenos_Aires 🇦🇷" },
  { id: "America/Sao_Paulo", label: "America/Sao_Paulo 🇧🇷" },
  { id: "America/Havana", label: "America/Havana 🇨🇺" },
  { id: "America/Panama", label: "America/Panama 🇵🇦" },
  { id: "America/Jamaica", label: "America/Jamaica 🇯🇲" },

  { id: "group-aus", label: "🇦🇺 Australia & Pacific", disabled: true },
  { id: "Australia/Sydney", label: "Australia/Sydney 🇦🇺" },
  { id: "Australia/Melbourne", label: "Australia/Melbourne 🇦🇺" },
  { id: "Australia/Brisbane", label: "Australia/Brisbane 🇦🇺" },
  { id: "Australia/Perth", label: "Australia/Perth 🇦🇺" },
  { id: "Australia/Adelaide", label: "Australia/Adelaide 🇦🇺" },
  { id: "Australia/Darwin", label: "Australia/Darwin 🇦🇺" },
  { id: "Pacific/Auckland", label: "Pacific/Auckland 🇳🇿" },
  { id: "Pacific/Fiji", label: "Pacific/Fiji 🇫🇯" },
  { id: "Pacific/Guam", label: "Pacific/Guam 🇬🇺" },
  { id: "Pacific/Honolulu", label: "Pacific/Honolulu 🇺🇸" },

  { id: "group-africa", label: "🌍 Africa", disabled: true },
  { id: "Africa/Cairo", label: "Africa/Cairo 🇪🇬" },
  { id: "Africa/Johannesburg", label: "Africa/Johannesburg 🇿🇦" },
  { id: "Africa/Nairobi", label: "Africa/Nairobi 🇰🇪" },
  { id: "Africa/Lagos", label: "Africa/Lagos 🇳🇬" },
  { id: "Africa/Accra", label: "Africa/Accra 🇬🇭" },
  { id: "Africa/Casablanca", label: "Africa/Casablanca 🇲🇦" },
  { id: "Africa/Algiers", label: "Africa/Algiers 🇩🇿" },
  { id: "Africa/Tunis", label: "Africa/Tunis 🇹🇳" },
];

// Types
interface Project {
  id: string;
  name: string;
  skills: string[];
  scopeOfWork?: string;
  fullTimeOffer?: boolean;
  locationType?: string | null;
  pincode?: string | null;
  city?: string | null;
  timezone?: string | null;
  status?: string | null;
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
  preferredLocations: string[];
  languages: string[];
  aiRatings: {
    communication: number;
    coding: number;
    aptitude: number;
    interview: number;
  };
  hasProfile: boolean;
  isAdded: boolean;
  hasLaptop: boolean;
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [projectScope, setProjectScope] = useState("");
  const [projectFullTimeOffer, setProjectFullTimeOffer] = useState(false);
  const [projectLocationType, setProjectLocationType] = useState<string>("");
  const [projectPincode, setProjectPincode] = useState("");
  const [projectCity, setProjectCity] = useState("");
  const [projectTimezone, setProjectTimezone] = useState("Asia/Kolkata");
  const [projectStatus, setProjectStatus] = useState("active");
  const [projectSkillsInput, setProjectSkillsInput] = useState("");
  const [projectStep, setProjectStep] = useState(1); // 1: Name, 2: Skills, 3: Scope, 4: Location
  const [isLoading, setIsLoading] = useState(false);
  const [projectSkillSearch, setProjectSkillSearch] = useState("");
  const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false);

  const projectSkillList = useMemo(
    () =>
      projectSkillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    [projectSkillsInput],
  );

  const projectFilteredSkillOptions = useMemo(() => {
    const lowerSelected = projectSkillList.map((s) => s.toLowerCase());
    const pool = (skillsData as string[]).filter(
      (s) => !lowerSelected.includes(s.toLowerCase()),
    );
    if (!projectSkillSearch.trim()) return pool.slice(0, 10);
    const q = projectSkillSearch.toLowerCase();
    return pool.filter((s) => s.toLowerCase().includes(q)).slice(0, 10);
  }, [projectSkillList, projectSkillSearch]);
  
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
  const [skillsBackup, setSkillsBackup] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [languageOptions, setLanguageOptions] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const selectedSkillsLowerSet = useMemo(
    () => new Set(selectedSkills.map((s) => s.toLowerCase())),
    [selectedSkills],
  );

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
            scopeOfWork: p.scopeOfWork ?? "",
            fullTimeOffer: p.fullTimeOffer ?? false,
            locationType: p.locationType ?? null,
            pincode: p.pincode ?? null,
            city: p.city ?? null,
            timezone: p.timezone ?? null,
            status: p.status ?? "active",
          } as Project;
        });

        setProjects(list);
        if (list.length > 0) {
          setSelectedProject(list[0]);
          setSelectedSkills(list[0].skills);
          setSkillsBackup(list[0].skills);
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [setLocation]);

  useEffect(() => {
    if (selectedSkills.length > 0) {
      setSkillsBackup(selectedSkills);
    }
  }, [selectedSkills]);

  // Load intern candidates dynamically from backend
  useEffect(() => {
    (async () => {
      try {
        const response = await apiRequest("GET", "/api/interns");
        const json = await response.json();
        const list = (json?.interns || []) as any[];
        const citySet = new Set<string>();
        const languageSet = new Set<string>();

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
          const preferredLocationsRaw = Array.isArray(onboarding.preferredLocations)
            ? onboarding.preferredLocations
            : [];
          const preferredLocations: string[] = preferredLocationsRaw
            .map((loc: any) => (typeof loc === "string" ? loc.trim() : ""))
            .filter((loc: string) => loc.length > 0);

          const locationCity = onboarding.city?.trim();
          const locationState = onboarding.state?.trim();
          const locationParts = [locationCity, locationState].filter(Boolean).join(", ");

          // languages from extraData.languages (array of strings or objects)
          const extra = onboarding.extraData ?? {};
          const rawLanguages = Array.isArray(extra.languages) ? extra.languages : [];
          const languages: string[] = rawLanguages
            .map((lang: any) => {
              if (typeof lang === "string") return lang.trim();
              if (!lang || typeof lang !== "object") return "";
              const name = (lang.language ?? lang.name ?? "").toString();
              const level = (lang.level ?? "").toString();
              return [name, level].filter(Boolean).join(" - ");
            })
            .filter((v: string) => v.length > 0);

          // collect unique cities for location filter from both preferredLocations and city field
          if (locationCity) {
            citySet.add(locationCity);
          }
          preferredLocations.forEach((loc) => citySet.add(loc));

          languages.forEach((lang) => languageSet.add(lang));
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
            preferredLocations,
            languages,
            aiRatings: {
              communication: onboarding.extraData?.ratings?.communication ?? 0,
              coding: onboarding.extraData?.ratings?.coding ?? 0,
              aptitude: onboarding.extraData?.ratings?.aptitude ?? 0,
              interview: onboarding.extraData?.ratings?.interview ?? 0,
            },
            hasProfile: !!documents?.profilePhotoName,
            isAdded: false,
            hasLaptop: onboarding.hasLaptop === true,
          };
        });

        // apply existing cart state from localStorage so added items are marked
        const storedCartRaw = window.localStorage.getItem("employerCartIds");
        const storedCart: string[] = storedCartRaw ? JSON.parse(storedCartRaw) : [];

        setCart(storedCart);
        setCartCount(storedCart.length);

        const finalCandidates = mapped.map((c) =>
          storedCart.includes(c.id)
            ? { ...c, isAdded: true }
            : c,
        );

        setCandidates(finalCandidates);

        // build sorted, unique list of cities and languages for filters
        const uniqueCities = Array.from(citySet).sort((a, b) => a.localeCompare(b));
        setLocationOptions(uniqueCities);
        const uniqueLanguages = Array.from(languageSet).sort((a, b) => a.localeCompare(b));
        setLanguageOptions(uniqueLanguages);
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
      const skills = projectSkillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const response = await apiRequest("POST", `/api/employer/${authEmployerId}/projects`, {
        projectName: newProjectNameTrimmed,
        skills,
        scopeOfWork: projectScope || undefined,
        fullTimeOffer: projectFullTimeOffer,
        locationType: projectLocationType || undefined,
        pincode: projectPincode || undefined,
        city: projectCity || undefined,
        timezone: projectTimezone || undefined,
        status: projectStatus || undefined,
      });
      const json = await response.json();
      const createdId = json?.project?.id ?? Date.now().toString();

      const created: Project = {
        id: createdId,
        name: newProjectNameTrimmed,
        skills,
        scopeOfWork: projectScope,
        fullTimeOffer: projectFullTimeOffer,
        locationType: projectLocationType,
        pincode: projectPincode,
        city: projectCity,
        timezone: projectTimezone,
        status: projectStatus,
      };

      setProjects(prev => [...prev, created]);
      setSelectedProject(created);
      setSelectedSkills(skills);
      setNewProjectName("");
      setProjectScope("");
      setProjectFullTimeOffer(false);
      setProjectLocationType("");
      setProjectPincode("");
      setProjectCity("");
      setProjectTimezone("Asia/Kolkata");
      setProjectStatus("active");
      setProjectSkillsInput("");
      setProjectSkillSearch("");
      setProjectStep(1);
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
      const skills = projectSkillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await apiRequest("PUT", `/api/projects/${editingProject.id}`, {
        projectName: newProjectName.trim(),
        skills,
        scopeOfWork: projectScope || undefined,
        fullTimeOffer: projectFullTimeOffer,
        locationType: projectLocationType || undefined,
        pincode: projectPincode || undefined,
        city: projectCity || undefined,
        timezone: projectTimezone || undefined,
        status: projectStatus || undefined,
      });

      const updatedProject: Project = {
        ...editingProject,
        name: newProjectName.trim(),
        skills,
        scopeOfWork: projectScope,
        fullTimeOffer: projectFullTimeOffer,
        locationType: projectLocationType,
        pincode: projectPincode,
        city: projectCity,
        timezone: projectTimezone,
        status: projectStatus,
      };

      setProjects(prev =>
        prev.map(p => (p.id === editingProject.id ? updatedProject : p)),
      );
      
      if (selectedProject && selectedProject.id === editingProject.id) {
        setSelectedProject(updatedProject);
        setSelectedSkills(skills);
      }
      
      setNewProjectName("");
      setProjectScope("");
      setProjectFullTimeOffer(false);
      setProjectLocationType("");
      setProjectPincode("");
      setProjectCity("");
      setProjectTimezone("Asia/Kolkata");
      setProjectStatus("active");
      setProjectSkillsInput("");
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
      if (selectedProject && selectedProject.id === editingProject.id && remainingProjects.length > 0) {
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
    setProjectScope(project.scopeOfWork ?? "");
    setProjectFullTimeOffer(!!project.fullTimeOffer);
    setProjectLocationType(project.locationType ?? "");
    setProjectPincode(project.pincode ?? "");
    setProjectCity(project.city ?? "");
    setProjectTimezone(project.timezone ?? "Asia/Kolkata");
    setProjectStatus(project.status ?? "active");
    setProjectSkillsInput((project.skills || []).join(", "));
    setProjectStep(1);
    setIsEditMode(true);
    setIsCreateDialogOpen(true);
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
        c.skills.some((skill) => selectedSkillsLowerSet.has(skill.toLowerCase())),
      );
    }

    if (selectedCity) {
      const cityLower = selectedCity.toLowerCase();
      list = list.filter((c) => {
        const fromLocation = c.location.toLowerCase().includes(cityLower);
        const fromPreferred = c.preferredLocations.some((loc) =>
          loc.toLowerCase() === cityLower,
        );
        return fromLocation || fromPreferred;
      });
    }

    if (hasLaptop) {
      list = list.filter((c) => c.hasLaptop === true);
    }

    if (selectedLanguages.length > 0) {
      list = list.filter((c) =>
        c.languages.some((lang) => selectedLanguages.includes(lang)),
      );
    }

    if (minRating > 0) {
      list = list.filter((c) => c.aiRatings.interview >= minRating);
    }

    if (selectedSkills.length > 0) {
      list.sort((a, b) => {
        const aMatchCount = a.skills.reduce((acc, s) => {
          return acc + (selectedSkillsLowerSet.has(s.toLowerCase()) ? 1 : 0);
        }, 0);
        const bMatchCount = b.skills.reduce((acc, s) => {
          return acc + (selectedSkillsLowerSet.has(s.toLowerCase()) ? 1 : 0);
        }, 0);

        if (bMatchCount !== aMatchCount) return bMatchCount - aMatchCount;
        if ((b.findternScore ?? 0) !== (a.findternScore ?? 0)) {
          return (b.findternScore ?? 0) - (a.findternScore ?? 0);
        }
        return (a.name ?? "").localeCompare(b.name ?? "");
      });
    }

    return list;
  }, [candidates, filterBySkills, selectedSkills, selectedSkillsLowerSet, selectedCity, hasLaptop, selectedLanguages, minRating]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCity) count++;
    if (!includeRemote) count++;
    if (hasLaptop) count++;
    if (filterBySkills && selectedSkills.length > 0) count++;
    if (selectedLanguages.length > 0) count++;
    if (minRating > 0) count++;
    return count;
  }, [selectedCity, includeRemote, hasLaptop, filterBySkills, selectedSkills, selectedLanguages, minRating]);

  const clearAllFilters = () => {
    setSelectedCity(null);
    setIncludeRemote(true);
    setHasLaptop(false);
    setFilterBySkills(true);
    setSelectedSkills([]);
    setSelectedLanguages([]);
    setMinRating(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      <EmployerHeader active="dashboard" />

      <div className="flex">
        {/* Left Sidebar - Filters */}
        <aside className="w-72 min-h-[calc(100vh-64px)] border-r bg-white/70 backdrop-blur p-4 hidden lg:block">
          {/* Filters header with active count */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Candidate Filters
            </h2>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} • Clear
              </button>
            )}
          </div>

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
                  setProjectScope("");
                  setProjectFullTimeOffer(false);
                  setProjectLocationType("");
                  setProjectPincode("");
                  setProjectCity("");
                  setProjectTimezone("Asia/Kolkata");
                  setProjectStatus("active");
                  setProjectSkillsInput("");
                  setProjectSkillSearch("");
                  setProjectStep(1);
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
                  <Select
                    value={selectedCity ?? "__all"}
                    onValueChange={(value) => {
                      if (value === "__all") {
                        setSelectedCity(null);
                      } else {
                        setSelectedCity(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-9 text-sm rounded-lg border-slate-200">
                      <SelectValue placeholder="Select cities..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">All locations</SelectItem>
                      {locationOptions.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
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
                <AccordionContent className="pb-3 space-y-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox 
                      checked={filterBySkills} 
                      onCheckedChange={(checked) => setFilterBySkills(checked as boolean)}
                      className="border-emerald-300 data-[state=checked]:bg-emerald-600"
                    />
                    <span className="text-slate-600">Filter candidates using selected skills</span>
                  </label>

                  {/* Language filter */}
                  {languageOptions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-600">Languages</p>
                      <div className="flex flex-wrap gap-1.5">
                        {languageOptions.slice(0, 12).map((lang) => {
                          const active = selectedLanguages.includes(lang);
                          return (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => {
                                setSelectedLanguages((prev) =>
                                  prev.includes(lang)
                                    ? prev.filter((l) => l !== lang)
                                    : [...prev, lang],
                                );
                              }}
                              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                                active
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {lang}
                            </button>
                          );
                        })}
                      </div>
                      {selectedLanguages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedLanguages([])}
                          className="text-[11px] text-emerald-700 hover:underline"
                        >
                          Clear language filter
                        </button>
                      )}
                    </div>
                  )}
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
              <div className="relative w-full md:w-64 flex flex-col items-end gap-2">
                {selectedSkills.length === 0 && skillsBackup.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSkills(skillsBackup);
                      setSkillSearch("");
                      setIsSkillDropdownOpen(false);
                    }}
                    className="h-9 px-3 rounded-xl border-slate-200"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore skills
                  </Button>
                )}
                <div className="relative w-full">
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
                              selectedSkillsLowerSet.has(skill.toLowerCase())
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
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

      {/* Create / Edit Project Dialog (wizard) */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setProjectStep(1);
            setProjectSkillSearch("");
            setIsEditMode(false);
            setEditingProject(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-emerald-600" />
              {isEditMode ? "Edit Project" : "Create New Project"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update project details and internship requirements."
                : "Define project details and internship requirements."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-6 text-xs font-medium text-slate-500">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={
                      "flex h-7 w-7 items-center justify-center rounded-full border text-xs " +
                      (projectStep === step
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : step < projectStep
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-400 border-slate-200")
                    }
                  >
                    {step}
                  </div>
                  <span
                    className={
                      projectStep === step
                        ? "text-emerald-700"
                        : step < projectStep
                        ? "text-slate-700"
                        : "text-slate-400"
                    }
                  >
                    {step === 1 && "Project Name"}
                    {step === 2 && "Skills"}
                    {step === 3 && "Scope of Work"}
                    {step === 4 && "Location"}
                  </span>
                </div>
              ))}
            </div>

            {/* Step content */}
            {projectStep === 1 && (
              <div className="mx-auto max-w-lg text-center space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Enter Your Project Name</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the name of the project you need resources for. You can always add more projects later.
                  </p>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-xs font-medium text-slate-600">Project Name *</label>
                  <Input
                    placeholder="e.g. Mobile App Development"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                  />
                </div>
              </div>
            )}

            {projectStep === 2 && (
              <div className="mx-auto max-w-xl space-y-5">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-semibold text-slate-800">What are the main skills required for this project?</h3>
                  <p className="text-xs text-slate-500">Select skills (up to 7). For best results, add at least 4 skills in order of importance.</p>
                </div>

                <div className="space-y-3 bg-slate-50/80 rounded-2xl border border-slate-100 p-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Select skills</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search and select skills..."
                        value={projectSkillSearch}
                        onChange={(e) => setProjectSkillSearch(e.target.value)}
                        className="h-10 pl-9 rounded-xl border-slate-200 focus:border-emerald-400"
                      />
                      {projectSkillSearch && projectFilteredSkillOptions.length > 0 && (
                        <div className="absolute z-50 mt-2 w-full max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg text-left text-sm">
                          {projectFilteredSkillOptions.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-emerald-50"
                              onClick={() => {
                                if (!projectSkillList.includes(skill)) {
                                  const next = [...projectSkillList, skill];
                                  setProjectSkillsInput(next.join(", "));
                                }
                                setProjectSkillSearch("");
                              }}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      For the best results, add at least 4 skills.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {projectSkillList.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="px-3 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => {
                            const next = projectSkillList.filter((s) => s !== skill);
                            setProjectSkillsInput(next.join(", "));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-[1.5fr_auto] gap-3 items-center">
                    <Input
                      placeholder="Enter custom skill"
                      value={projectSkillSearch}
                      onChange={(e) => setProjectSkillSearch(e.target.value)}
                      className="h-10 rounded-xl border-slate-200 focus:border-emerald-400"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold flex items-center gap-1.5"
                      onClick={() => {
                        const value = projectSkillSearch.trim();
                        if (!value) return;
                        if (!projectSkillList.includes(value)) {
                          const next = [...projectSkillList, value];
                          setProjectSkillsInput(next.join(", "));
                        }
                        setProjectSkillSearch("");
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Skill
                    </Button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Start typing and we'll suggest matching skills. Click a suggestion to auto-fill, then add it.
                  </p>
                </div>
              </div>
            )}

            {projectStep === 3 && (
              <div className="mx-auto max-w-xl space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-800">Next, estimate the scope of your work</h3>
                  <p className="text-xs text-slate-500">Choose the approximate duration for this internship project.</p>
                </div>

                <div className="space-y-2">
                  {[{
                    id: "short",
                    label: "Short-Term: 30–60 days",
                  },
                  {
                    id: "medium",
                    label: "Medium-Term: 60–90 days",
                  },
                  {
                    id: "long",
                    label: "Long-Term: 90+ days",
                  },
                  {
                    id: "not_sure",
                    label: "Not sure",
                  }].map((opt) => {
                    const selected = projectScope === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setProjectScope(opt.id)}
                        className={`w-full rounded-xl border px-4 py-3 flex items-center justify-between text-left text-sm transition-colors ${
                          selected
                            ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span
                          className={`h-4 w-4 rounded-full border ${
                            selected
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-slate-300 bg-white"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600">Additional details (optional)</label>
                  <Textarea
                    placeholder="Add any notes about working hours, milestones or expectations..."
                    value={projectScope && !["short", "medium", "long", "not_sure"].includes(projectScope) ? projectScope : ""}
                    onChange={(e) => setProjectScope(e.target.value)}
                    className="min-h-[90px] rounded-xl border-slate-200 focus:border-emerald-400"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <Checkbox
                    checked={projectFullTimeOffer}
                    onCheckedChange={(val) => setProjectFullTimeOffer(!!val)}
                    className="border-emerald-400 data-[state=checked]:bg-emerald-600"
                  />
                  <div className="text-xs text-slate-600">
                    Would you consider offering a <span className="font-semibold text-emerald-700">full-time position</span> to the interns after this internship?
                  </div>
                </div>
              </div>
            )}

            {projectStep === 4 && (
              <div className="mx-auto max-w-xl space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-800">Internship Location</h3>
                  <p className="text-xs text-slate-500">Choose how interns will work with your team.</p>
                </div>

                <div className="space-y-2">
                  {["onsite", "hybrid", "remote"].map((mode) => {
                    const selected = projectLocationType === mode;
                    const label = mode === "onsite" ? "Onsite" : mode === "hybrid" ? "Hybrid" : "Remote";
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setProjectLocationType(mode)}
                        className={`w-full rounded-xl border px-4 py-3 flex items-center justify-between text-left text-sm transition-colors ${
                          selected
                            ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
                        }`}
                      >
                        <span>{label}</span>
                        <span
                          className={`h-4 w-4 rounded-full border ${
                            selected
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-slate-300 bg-white"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {(projectLocationType === "onsite" || projectLocationType === "hybrid") && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">City & pincode</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="City (e.g. Jaipur)"
                        value={projectCity}
                        onChange={(e) => setProjectCity(e.target.value)}
                        className="h-10 rounded-xl border-slate-200 focus:border-emerald-400"
                      />
                      <Input
                        placeholder="Pincode (e.g. 302001)"
                        value={projectPincode}
                        onChange={(e) => setProjectPincode(e.target.value)}
                        className="h-10 rounded-xl border-slate-200 focus:border-emerald-400"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Select your timezone</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search timezone..."
                      value={projectTimezone}
                      onChange={(e) => {
                        setProjectTimezone(e.target.value);
                        setIsTimezoneDropdownOpen(true);
                      }}
                      onFocus={() => setIsTimezoneDropdownOpen(true)}
                      className="h-10 pl-9 rounded-xl border-slate-200 focus:border-emerald-400"
                    />
                    {isTimezoneDropdownOpen && (
                      <div className="absolute z-50 mt-2 w-full max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg text-left text-sm">
                        {TIMEZONES.filter((tz) => {
                          const q = projectTimezone.toLowerCase();
                          if (!q) return true;
                          return (
                            tz.id.toLowerCase().includes(q) ||
                            tz.label.toLowerCase().includes(q)
                          );
                        }).map((tz) =>
                          tz.disabled ? (
                            <div
                              key={tz.id}
                              className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 bg-slate-50"
                            >
                              {tz.label}
                            </div>
                          ) : (
                            <button
                              key={tz.id}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-emerald-50"
                              onClick={() => {
                                setProjectTimezone(tz.id);
                                setIsTimezoneDropdownOpen(false);
                              }}
                            >
                              {tz.label}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    This timezone will be used for scheduling and communication. Candidates may be in different time zones.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Status</label>
                  <Select
                    value={projectStatus}
                    onValueChange={setProjectStatus}
                  >
                    <SelectTrigger className="h-10 rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setProjectStep(1);
                setIsEditMode(false);
                setEditingProject(null);
              }}
              className="rounded-lg"
            >
              Cancel
            </Button>
            {projectStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setProjectStep((prev) => Math.max(1, prev - 1))}
                className="rounded-lg"
              >
                Back
              </Button>
            )}
            {projectStep < 4 && (
              <Button
                type="button"
                onClick={() => setProjectStep((prev) => Math.min(4, prev + 1))}
                disabled={
                  (projectStep === 1 && !newProjectName.trim()) ||
                  (projectStep === 2 && projectSkillList.length < 4) ||
                  (projectStep === 3 && !projectScope.trim())
                }
                className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                Continue
              </Button>
            )}
            {projectStep === 4 && (
              <Button
                onClick={isEditMode ? handleEditProject : handleCreateProject}
                disabled={isLoading || !newProjectName.trim()}
                className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {isEditMode ? "Save Changes" : "Create Project"}
                  </>
                )}
              </Button>
            )}
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
