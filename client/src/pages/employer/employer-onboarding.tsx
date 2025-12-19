import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Check, 
  ChevronRight, 
  MapPin, 
  Briefcase, 
  Target, 
  Loader2,
  Plus,
  X,
  LogOut,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { scopeOfWorkOptions, timezones } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { getEmployerAuth, saveEmployerAuth } from "@/lib/employerAuth";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";
import skillsData from "@/data/skills.json";

// Step schemas
const projectNameSchema = z.object({
  projectName: z.string().min(2, "Project name must be at least 2 characters"),
});

const skillsSchema = z.object({
  skills: z.array(z.string()).min(1, "Select at least one skill").max(7, "Maximum 7 skills allowed"),
});

const scopeSchema = z.object({
  scopeOfWork: z.string().min(1, "Please select scope of work"),
  fullTimeOffer: z.boolean().default(false),
});

const locationSchema = z.object({
  locationType: z.enum(["onsite", "hybrid", "remote"]),
  // Separate city and state text fields (pincode removed from UI)
  city: z.string().optional(),
  state: z.string().optional(),
  // Timezone will be required in the form
  timezone: z.string().min(1, "Please select a timezone"),
});

type StepData = {
  projectName: string;
  skills: string[];
  scopeOfWork: string;
  fullTimeOffer: boolean;
  locationType: "onsite" | "hybrid" | "remote";
  pincode: string;
  city: string;
   state: string;
  timezone: string;
};

const steps = [
  { id: 1, title: "Project Name", icon: Briefcase },
  { id: 2, title: "Skills", icon: Target },
  { id: 3, title: "Scope of Work", icon: Target },
  { id: 4, title: "Location", icon: MapPin },
];

export default function EmployerOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<StepData>({
    projectName: "",
    skills: [],
    scopeOfWork: "",
    fullTimeOffer: false,
    locationType: "remote",
    pincode: "",
    city: "",
    state: "",
    timezone: "",
  });
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleNext = (stepData: Partial<StepData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit({ ...formData, ...stepData });
    }
  };

  const handleSubmit = async (data: StepData) => {
    setIsLoading(true);
    try {
      const auth = getEmployerAuth();
      if (!auth) {
        setLocation("/employer/login");
        return;
      }

      const payload = {
        projectName: data.projectName,
        skills: data.skills,
        scopeOfWork: data.scopeOfWork,
        fullTimeOffer: data.fullTimeOffer,
        locationType: data.locationType,
        pincode: data.pincode,
        city: data.city,
        timezone: data.timezone,
      };

      const response = await apiRequest("PUT", `/api/employer/${auth.id}/onboarding`, payload);
      const json = await response.json();

      if (json?.employer) {
        saveEmployerAuth(json.employer);
      }
      toast({
        title: "Project created successfully!",
        description: "Your project is now live. Start exploring candidates.",
      });
      setLocation("/employer/dashboard");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <img src={findternLogo} alt="Findtern" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-emerald-700">FINDTERN</span>
              <span className="text-xs text-slate-400 ml-1.5">INTERNSHIP SIMPLIFIED</span>
            </div>
          </div>
          <Button variant="ghost" className="text-slate-600 hover:text-slate-900 gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="py-6 border-b bg-white/50">
        <div className="container px-4 md:px-8">
          <div className="flex items-center justify-center gap-0 md:gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep > step.id
                        ? "bg-emerald-600 text-white"
                        : currentStep === step.id
                        ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${
                    currentStep >= step.id ? "text-emerald-700" : "text-slate-400"
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 md:w-24 h-0.5 mx-2 transition-all duration-300 ${
                    currentStep > step.id ? "bg-emerald-500" : "bg-slate-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-xl mx-auto">
          {currentStep === 1 && (
            <Step1ProjectName 
              defaultValue={formData.projectName} 
              onNext={(data) => handleNext(data)} 
            />
          )}
          {currentStep === 2 && (
            <Step2Skills 
              defaultValue={formData.skills} 
              onNext={(data) => handleNext(data)} 
            />
          )}
          {currentStep === 3 && (
            <Step3Scope 
              defaultValue={{ scopeOfWork: formData.scopeOfWork, fullTimeOffer: formData.fullTimeOffer }} 
              onNext={(data) => handleNext(data)} 
            />
          )}
          {currentStep === 4 && (
            <Step4Location 
              defaultValue={{ 
                locationType: formData.locationType, 
                pincode: formData.pincode, 
                city: formData.city,
                state: formData.state,
                timezone: formData.timezone 
              }} 
              onNext={(data) => handleNext(data)}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Step 1: Project Name
function Step1ProjectName({ defaultValue, onNext }: { defaultValue: string; onNext: (data: { projectName: string }) => void }) {
  const form = useForm({
    resolver: zodResolver(projectNameSchema),
    defaultValues: { projectName: defaultValue },
  });

  return (
    <Card className="p-8 md:p-10 border-0 shadow-xl shadow-emerald-900/5 rounded-3xl bg-white">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
          Enter Your Project Name
        </h2>
        <p className="text-slate-500">
          Enter the name of the project you need resources for. You can always add more projects later in the dashboard if you're hiring for multiple projects.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">
                  Project Name<span className="text-red-500 ml-0.5">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Mobile App Development"
                    className="h-12 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </Form>
    </Card>
  );
}

// Step 2: Skills
function Step2Skills({ defaultValue, onNext }: { defaultValue: string[]; onNext: (data: { skills: string[] }) => void }) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(defaultValue);
  const [searchQuery, setSearchQuery] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomDropdownOpen, setIsCustomDropdownOpen] = useState(false);

  const selectedLower = useMemo(
    () => selectedSkills.map((s) => s.toLowerCase()),
    [selectedSkills],
  );

  const filteredSkills = useMemo(() => {
    const base = skillsData.filter(
      (skill) => !selectedLower.includes(skill.toLowerCase()),
    );
    if (!searchQuery) return base.slice(0, 20);
    return base
      .filter((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, 10);
  }, [searchQuery, selectedLower]);

  const addSkill = useCallback((skill: string) => {
    const normalized = skill.trim();
    const lower = normalized.toLowerCase();
    if (
      normalized &&
      selectedSkills.length < 7 &&
      !selectedSkills.some((s) => s.toLowerCase() === lower)
    ) {
      setSelectedSkills((prev) => [...prev, normalized]);
      setSearchQuery("");
      setIsDropdownOpen(false);
    }
  }, [selectedSkills]);

  const removeSkill = useCallback((skill: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  }, []);

  const addCustomSkill = () => {
    const value = customSkill.trim();
    const lower = value.toLowerCase();
    if (
      value &&
      selectedSkills.length < 7 &&
      !selectedSkills.some((s) => s.toLowerCase() === lower)
    ) {
      setSelectedSkills((prev) => [...prev, value]);
      setCustomSkill("");
      setIsCustomDropdownOpen(false);
    }
  };

  const handleSubmit = () => {
    if (selectedSkills.length >= 4) {
      onNext({ skills: selectedSkills });
    }
  };

  return (
    <Card className="p-8 md:p-10 border-0 shadow-xl shadow-emerald-900/5 rounded-3xl bg-white">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
          What are the main skills required for your work?
        </h2>
      </div>

      <div className="space-y-6">
        {/* Skills Search with Selected Tags Inside Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Select Skills (up to 7)
          </label>
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 min-h-[3rem]">
              {selectedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-2.5 py-1 text-xs md:text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1.5 text-emerald-600 hover:text-emerald-800 flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
              <div className="relative flex-1 min-w-[140px]">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={selectedSkills.length === 0 ? "Search and select skills..." : "Add more skills"}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="pl-7 h-8 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm bg-transparent"
                />
              </div>
            </div>
            {isDropdownOpen && (searchQuery || filteredSkills.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50">
                {filteredSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-emerald-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    {skill}
                  </button>
                ))}
                {filteredSkills.length === 0 && searchQuery && (
                  <div className="px-4 py-3 text-sm text-slate-500">
                    No skills found. Add it as custom skill below.
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            For the best results, add at least 4 skills in order of importance.
          </p>
        </div>

        {/* Custom Skill */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Enter custom skill"
                value={customSkill}
                onChange={(e) => {
                  setCustomSkill(e.target.value);
                  setIsCustomDropdownOpen(true);
                }}
                className="w-full h-11 rounded-xl border-slate-200"
                onFocus={() => setIsCustomDropdownOpen(!!customSkill)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
              />
              {isCustomDropdownOpen && customSkill.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto z-40">
                  {skillsData
                    .filter((skill) =>
                      skill.toLowerCase().includes(customSkill.toLowerCase()),
                    )
                    .slice(0, 8)
                    .map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          setCustomSkill(skill);
                          setIsCustomDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-emerald-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        {skill}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addCustomSkill}
              className="h-11 px-6 rounded-xl border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
              disabled={selectedSkills.length >= 7}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Skill
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Start typing and we'll suggest matching skills. Click a suggestion to auto-fill, then add it.
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={selectedSkills.length < 4}
          className="w-full h-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {selectedSkills.length < 4 ? "Add at least 4 skills" : "Save & Continue"}
        </Button>
      </div>
    </Card>
  );
}

// Step 3: Scope of Work
function Step3Scope({ defaultValue, onNext }: { 
  defaultValue: { scopeOfWork: string; fullTimeOffer: boolean }; 
  onNext: (data: { scopeOfWork: string; fullTimeOffer: boolean }) => void 
}) {
  const form = useForm({
    resolver: zodResolver(scopeSchema),
    defaultValues: defaultValue,
  });

  const selectedScope = form.watch("scopeOfWork");

  return (
    <Card className="p-8 md:p-10 border-0 shadow-xl shadow-emerald-900/5 rounded-3xl bg-white">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
          Next, estimate the scope of your work
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          <FormField
            control={form.control}
            name="scopeOfWork"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-slate-700">
                  Scope of Work <span className="text-slate-400 font-normal">(Select one)</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="space-y-3 mt-3"
                  >
                    {scopeOfWorkOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          field.value === option.value
                            ? "border-emerald-500 bg-emerald-50/50"
                            : "border-slate-200 hover:border-emerald-200"
                        }`}
                      >
                        <RadioGroupItem value={option.value} className="text-emerald-600" />
                        <span className="font-medium text-slate-700">{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullTimeOffer"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-200 transition-colors">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-emerald-300 data-[state=checked]:bg-emerald-600"
                  />
                </FormControl>
                <FormLabel className="text-sm font-medium text-slate-700 cursor-pointer m-0">
                  Would you consider offering a <span className="text-emerald-600 font-semibold">full-time position</span> to the interns after their internship?
                </FormLabel>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={!selectedScope}
            className="w-full h-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20"
          >
            Save & Continue
          </Button>
        </form>
      </Form>
    </Card>
  );
}

// Step 4: Location
function Step4Location({ defaultValue, onNext, isLoading }: { 
  defaultValue: { locationType: "onsite" | "hybrid" | "remote"; pincode: string; city: string; state: string; timezone: string }; 
  onNext: (data: { locationType: "onsite" | "hybrid" | "remote"; pincode: string; city: string; state: string; timezone: string }) => void;
  isLoading: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: defaultValue,
  });

  const locationType = form.watch("locationType");
  const timezoneValue = form.watch("timezone");
  const [timezoneSearch, setTimezoneSearch] = useState("");

  const filteredTimezones = useMemo(() => {
    if (!timezoneSearch.trim()) return timezones;
    const q = timezoneSearch.toLowerCase();
    return timezones.filter(
      (tz) =>
        tz.value.toLowerCase().includes(q) ||
        tz.label.toLowerCase().includes(q),
    );
  }, [timezoneSearch]);

  const getTimezoneFlag = (tz: string): string => {
    // Specific country flags
    const map: Record<string, string> = {
      "Asia/Kolkata": "🇮🇳",
      "Europe/London": "🇬🇧",
      "Europe/Paris": "🇫🇷",
      "Europe/Berlin": "🇩🇪",
      "America/New_York": "🇺🇸",
      "America/Chicago": "🇺🇸",
      "America/Denver": "🇺🇸",
      "America/Los_Angeles": "🇺🇸",
      "Australia/Sydney": "🇦🇺",
      "Pacific/Auckland": "🇳🇿",
      "Asia/Tokyo": "🇯🇵",
      "Asia/Seoul": "🇰🇷",
      "Asia/Shanghai": "🇨🇳",
      "Asia/Hong_Kong": "🇭🇰",
      "Asia/Singapore": "🇸🇬",
      "Asia/Dubai": "🇦🇪",
      "Africa/Cairo": "🇪🇬",
      "Africa/Johannesburg": "🇿🇦",
    };

    if (map[tz]) return map[tz];

    if (tz.startsWith("Asia/")) return "🌏";
    if (tz.startsWith("Europe/")) return "🌍";
    if (tz.startsWith("America/")) return "🌎";
    if (tz.startsWith("Africa/")) return "🌍";
    if (tz.startsWith("Australia/") || tz.startsWith("Pacific/")) return "🌏";
    if (tz.startsWith("Etc/") || tz === "UTC") return "🕒";
    return "";
  };

  return (
    <Card className="p-8 md:p-10 border-0 shadow-xl shadow-emerald-900/5 rounded-3xl bg-white">
      <div className="mb-8">
        <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Internship Details</p>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="w-7 h-7 text-rose-500" />
          Internship Location <span className="text-slate-400 font-normal text-lg">(Choose one)</span>
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          <FormField
            control={form.control}
            name="locationType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="space-y-3"
                  >
                    {[
                      { value: "onsite", label: "Onsite" },
                      { value: "hybrid", label: "Hybrid" },
                      { value: "remote", label: "Remote" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          field.value === option.value
                            ? "border-emerald-500 bg-emerald-50/50"
                            : "border-slate-200 hover:border-emerald-200"
                        }`}
                      >
                        <RadioGroupItem value={option.value} className="text-emerald-600" />
                        <span className="font-medium text-slate-700">{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City / State text when onsite or hybrid */}
          {(locationType === "onsite" || locationType === "hybrid") && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter city"
                          className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter state"
                          className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Select Your Timezone
                  </FormLabel>
                  {/* Search input for timezones */}
                  <div className="mb-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search timezone..."
                        value={timezoneSearch}
                        onChange={(e) => setTimezoneSearch(e.target.value)}
                        className="pl-9 h-10 rounded-xl border-slate-200"
                      />
                    </div>
                  </div>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredTimezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          <span className="flex items-center gap-2">
                            <span>{getTimezoneFlag(tz.value)}</span>
                            <span>{tz.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <p className="mt-1 text-xs text-slate-500">
                    This timezone will be used for scheduling and communication. Candidates may
                    still be located in different time zones.
                  </p>
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !timezoneValue}
            className="w-full h-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Project...
              </>
            ) : (
              "Save & Continue"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}

