import { useState, useCallback, useEffect, useMemo, useRef, type ChangeEvent } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import skillsData from "@/data/skills.json";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, UploadCloud, PlayCircle, ZoomIn, ZoomOut, RotateCw, X, FileText, Trash2, Plus, Loader2, MapPin, Laptop, Globe, Pencil } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import Cropper from "react-easy-crop";
import * as faceapi from "face-api.js";
import { countryCodes } from "@shared/schema";
import cityStatePincode from "@/data/cityStatePincode.json";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";

const steps = [
  "About Me",
  "Academics",
  "Experience",
  "Skills",
  "Languages",
  "Extra Curricular",
  "Location Preferences",
  "Profile Preview",
] as const;

type AboutMeForm = {
  firstName: string;
  lastName: string;
  phoneCountryCode: string;
  phone: string;
  emergencyCountryCode: string;
  emergencyPhone: string;
  email: string;
  linkedinUrl: string;
  location: string;
  bio: string;
  state: string;
  city: string;
  aadhaarNumber: string;
  panNumber: string;
  profilePhoto?: File | null;
  introVideo?: File | null;
  aadhaarImage?: File | null;
  panImage?: File | null;
};

type AboutMeErrors = Partial<
  Record<keyof Omit<AboutMeForm, "profilePhoto" | "introVideo" | "aadhaarImage" | "panImage"> | "profileMedia" | "aadhaarImage" | "panImage", string>
>;

type LocationPreferencesState = {
  locationTypes: string[];
  preferredLocations: string[];
  hasLaptop: string;
};

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const [activeStep, setActiveStep] = useState<number>(0);
  const isEditMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("edit") === "1";
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [aboutMe, setAboutMe] = useState<AboutMeForm>({
    firstName: "",
    lastName: "",
    phoneCountryCode: "+91",
    phone: "",
    emergencyCountryCode: "+91",
    emergencyPhone: "",
    email: "",
    linkedinUrl: "",
    location: "",
    bio: "",
    state: "",
    city: "",
    aadhaarNumber: "",
    panNumber: "",
    profilePhoto: null,
    introVideo: null,
    aadhaarImage: null,
    panImage: null,
  });
  const [aboutMeErrors, setAboutMeErrors] = useState<AboutMeErrors>({});
  const [showPaymentBanner, setShowPaymentBanner] = useState<boolean>(true);
  const [academicsComplete, setAcademicsComplete] = useState(false);
  const [experienceComplete, setExperienceComplete] = useState(true); // Step 2 is optional (can skip)
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [skillsStepComplete, setSkillsStepComplete] = useState(false);
  const [locationPrefs, setLocationPrefs] = useState<LocationPreferencesState>({
    locationTypes: [],
    preferredLocations: [],
    hasLaptop: "",
  });
  const [languagesComplete, setLanguagesComplete] = useState(false);
  const [locationPrefsComplete, setLocationPrefsComplete] = useState(false);
  const [academicsData, setAcademicsData] = useState<any>(null);
  const [experienceData, setExperienceData] = useState<any[]>([]);
  const [languagesData, setLanguagesData] = useState<any[]>([]);
  const [extracurricularData, setExtracurricularData] = useState<any[]>([]);
  const { toast } = useToast();

  const openOnboardingMediaDb = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("findternOnboarding", 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("media")) {
          db.createObjectStore("media", { keyPath: "key" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, []);

  const saveMediaToDb = useCallback(
    async (
      key: "profilePhoto" | "introVideo" | "aadhaarImage" | "panImage",
      file: File
    ) => {
      const db = await openOnboardingMediaDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("media", "readwrite");
        const store = tx.objectStore("media");
        store.put({
          key,
          blob: file,
          name: file.name,
          type: file.type,
          lastModified: file.lastModified,
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      db.close();
    },
    [openOnboardingMediaDb]
  );

  const removeMediaFromDb = useCallback(
    async (key: "profilePhoto" | "introVideo" | "aadhaarImage" | "panImage") => {
      const db = await openOnboardingMediaDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("media", "readwrite");
        tx.objectStore("media").delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      db.close();
    },
    [openOnboardingMediaDb]
  );

  const loadMediaFromDb = useCallback(
    async (key: "profilePhoto" | "introVideo" | "aadhaarImage" | "panImage") => {
      const db = await openOnboardingMediaDb();
      const record = await new Promise<any | null>((resolve, reject) => {
        const tx = db.transaction("media", "readonly");
        const request = tx.objectStore("media").get(key);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => reject(request.error);
      });
      db.close();

      if (!record?.blob) return null;
      const blob: Blob = record.blob;
      return new File([blob], record.name || key, {
        type: record.type || blob.type || "application/octet-stream",
        lastModified: record.lastModified || Date.now(),
      });
    },
    [openOnboardingMediaDb]
  );

  useEffect(() => {
    const raw = localStorage.getItem("onboardingDraft");
    if (!raw) {
      setDraftHydrated(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as {
        aboutMe?: Partial<AboutMeForm>;
        academicsData?: any;
        experienceData?: any[];
        skills?: SkillEntry[];
        locationPrefs?: LocationPreferencesState;
        languagesData?: any[];
        extracurricularData?: any[];
        academicsComplete?: boolean;
        experienceComplete?: boolean;
        skillsStepComplete?: boolean;
        languagesComplete?: boolean;
        locationPrefsComplete?: boolean;
      };

      if (parsed.aboutMe) {
        setAboutMe((prev) => ({
          ...prev,
          ...parsed.aboutMe,
          profilePhoto: prev.profilePhoto ?? null,
          introVideo: prev.introVideo ?? null,
          aadhaarImage: prev.aadhaarImage ?? null,
          panImage: prev.panImage ?? null,
        }));
      }
      if (parsed.academicsData !== undefined) setAcademicsData(parsed.academicsData);
      if (parsed.experienceData) setExperienceData(parsed.experienceData);
      if (parsed.skills) setSkills(parsed.skills);
      if (parsed.locationPrefs) setLocationPrefs(parsed.locationPrefs);
      if (parsed.languagesData) setLanguagesData(parsed.languagesData);
      if (parsed.extracurricularData) setExtracurricularData(parsed.extracurricularData);

      if (typeof parsed.academicsComplete === "boolean") setAcademicsComplete(parsed.academicsComplete);
      if (typeof parsed.experienceComplete === "boolean") setExperienceComplete(parsed.experienceComplete);
      if (typeof parsed.skillsStepComplete === "boolean") setSkillsStepComplete(parsed.skillsStepComplete);
      if (typeof parsed.languagesComplete === "boolean") setLanguagesComplete(parsed.languagesComplete);
      if (typeof parsed.locationPrefsComplete === "boolean") setLocationPrefsComplete(parsed.locationPrefsComplete);
    } catch {
      localStorage.removeItem("onboardingDraft");
    } finally {
      setDraftHydrated(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [profilePhoto, introVideo, aadhaarImage, panImage] = await Promise.all([
          loadMediaFromDb("profilePhoto"),
          loadMediaFromDb("introVideo"),
          loadMediaFromDb("aadhaarImage"),
          loadMediaFromDb("panImage"),
        ]);

        if (!isMounted) return;

        setAboutMe((prev) => ({
          ...prev,
          profilePhoto: prev.profilePhoto ?? profilePhoto,
          introVideo: prev.introVideo ?? introVideo,
          aadhaarImage: prev.aadhaarImage ?? aadhaarImage,
          panImage: prev.panImage ?? panImage,
        }));
      } catch {
        // ignore
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [loadMediaFromDb]);

  useEffect(() => {
    if (!draftHydrated) return;
    const { profilePhoto, introVideo, aadhaarImage, panImage, ...aboutMeDraft } = aboutMe;
    const draft = {
      aboutMe: aboutMeDraft,
      academicsData,
      experienceData,
      skills,
      locationPrefs,
      languagesData,
      extracurricularData,
      academicsComplete,
      experienceComplete,
      skillsStepComplete,
      languagesComplete,
      locationPrefsComplete,
    };
    localStorage.setItem("onboardingDraft", JSON.stringify(draft));
  }, [
    draftHydrated,
    aboutMe,
    academicsData,
    experienceData,
    skills,
    locationPrefs,
    languagesData,
    extracurricularData,
    academicsComplete,
    experienceComplete,
    skillsStepComplete,
    languagesComplete,
    locationPrefsComplete,
  ]);

  useEffect(() => {
    const raw = localStorage.getItem("onboardingActiveStep");
    if (!raw) return;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const next = Math.max(0, Math.min(steps.length - 1, Math.floor(parsed)));
    setActiveStep(next);
  }, []);

  useEffect(() => {
    localStorage.setItem("onboardingActiveStep", String(activeStep));
  }, [activeStep]);

  useEffect(() => {
    let cancelled = false;

    const hydrateFromUser = (user: any) => {
      if (!user) return;

      setAboutMe((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || "",
        lastName: prev.lastName || user.lastName || "",
        email: prev.email || user.email || "",
        phoneCountryCode: prev.phoneCountryCode || user.countryCode || "+91",
        phone: prev.phone || user.phoneNumber || "",
      }));
    };

    const hydrateFromOnboarding = (onboarding: any) => {
      if (!onboarding) return;

      setAboutMe((prev) => ({
        ...prev,
        linkedinUrl: prev.linkedinUrl || onboarding.linkedinUrl || "",
        bio: prev.bio || onboarding.bio || onboarding.previewSummary || "",
        state: prev.state || onboarding.state || "",
        city: prev.city || onboarding.city || "",
        aadhaarNumber: prev.aadhaarNumber || onboarding.aadhaarNumber || "",
        panNumber: prev.panNumber || onboarding.panNumber || "",
      }));

      setAcademicsData((prev) => (prev ?? onboarding?.extraData?.academics ?? null));

      setExperienceData((prev) => {
        if (Array.isArray(prev) && prev.length > 0) return prev;
        return Array.isArray(onboarding.experienceJson) ? onboarding.experienceJson : [];
      });

      setSkills((prev) => {
        if (Array.isArray(prev) && prev.length > 0) return prev;
        return Array.isArray(onboarding.skills) ? onboarding.skills : [];
      });

      setLanguagesData((prev) => {
        if (Array.isArray(prev) && prev.length > 0) return prev;
        const langs = onboarding?.extraData?.languages;
        return Array.isArray(langs) ? langs : [];
      });

      setExtracurricularData((prev) => {
        if (Array.isArray(prev) && prev.length > 0) return prev;
        const extra = onboarding?.extraData?.extracurricular;
        return Array.isArray(extra) ? extra : [];
      });

      setLocationPrefs((prev) => {
        const hasExisting =
          (Array.isArray(prev.locationTypes) && prev.locationTypes.length > 0) ||
          (Array.isArray(prev.preferredLocations) && prev.preferredLocations.length > 0) ||
          !!prev.hasLaptop;
        if (hasExisting) return prev;

        return {
          locationTypes: Array.isArray(onboarding.locationTypes) ? onboarding.locationTypes : [],
          preferredLocations: Array.isArray(onboarding.preferredLocations) ? onboarding.preferredLocations : [],
          hasLaptop: typeof onboarding.hasLaptop === "boolean" ? (onboarding.hasLaptop ? "yes" : "no") : "",
        };
      });

      if (onboarding?.extraData?.academics) setAcademicsComplete(true);
      if (Array.isArray(onboarding?.skills) && onboarding.skills.length > 0) setSkillsStepComplete(true);
      if (Array.isArray(onboarding?.extraData?.languages) && onboarding.extraData.languages.length > 0) setLanguagesComplete(true);

      const locTypes = Array.isArray(onboarding?.locationTypes) ? onboarding.locationTypes : [];
      const prefLocs = Array.isArray(onboarding?.preferredLocations) ? onboarding.preferredLocations : [];
      const hasLaptopStr = typeof onboarding?.hasLaptop === "boolean" ? (onboarding.hasLaptop ? "yes" : "no") : "";
      if (locTypes.length > 0 || prefLocs.length > 0 || hasLaptopStr) setLocationPrefsComplete(true);
    };

    (async () => {
      try {
        const userId = localStorage.getItem("userId");
        const userEmail = localStorage.getItem("userEmail");

        if (userId) {
          try {
            const res = await apiRequest("GET", `/api/onboarding/${encodeURIComponent(userId)}`);
            const data = await res.json();
            if (cancelled) return;
            hydrateFromUser(data?.user);
            if (isEditMode) hydrateFromOnboarding(data?.onboarding);
            return;
          } catch (err) {
            console.log("Unable to hydrate user from /api/onboarding/:userId, falling back to email.", err);
          }
        }

        if (userEmail) {
          const res = await apiRequest(
            "GET",
            `/api/auth/user/by-email/${encodeURIComponent(userEmail)}`,
          );
          const data = await res.json();
          if (cancelled) return;
          hydrateFromUser(data?.user);
        }
      } catch (err) {
        console.log("Unable to hydrate user details for onboarding.", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const signupFirstName = localStorage.getItem("signupFirstName") || "";
    const signupLastName = localStorage.getItem("signupLastName") || "";
    const signupCountryCode = localStorage.getItem("signupCountryCode") || "+91";
    const signupPhoneNumber = localStorage.getItem("signupPhoneNumber") || "";
    const userEmail = localStorage.getItem("userEmail") || "";

    setAboutMe((prev) => ({
      ...prev,
      firstName: prev.firstName || signupFirstName,
      lastName: prev.lastName || signupLastName,
      phoneCountryCode: prev.phoneCountryCode || signupCountryCode,
      phone: prev.phone || signupPhoneNumber,
      email: prev.email || userEmail,
    }));
  }, []);

  const handleAboutMeChange = (field: keyof AboutMeForm, value: string | File | null) => {
    setAboutMe((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (
      field === "profilePhoto" ||
      field === "introVideo" ||
      field === "aadhaarImage" ||
      field === "panImage"
    ) {
      const key = field;
      const fileValue = value instanceof File ? value : null;
      if (fileValue) {
        saveMediaToDb(key, fileValue).catch(() => {
          // ignore
        });
      } else {
        removeMediaFromDb(key).catch(() => {
          // ignore
        });
      }
    }

    // Clear error as user types/changes media
    if (field in aboutMeErrors) {
      setAboutMeErrors((prev) => {
        const updated = { ...prev };
        delete (updated as Record<string, string>)[field as string];
        return updated;
      });
    }
    if ((field === "profilePhoto" || field === "introVideo") && aboutMeErrors.profileMedia) {
      setAboutMeErrors((prev) => {
        const updated = { ...prev };
        delete (updated as Record<string, string>)["profileMedia"];
        return updated;
      });
    }
    if (field === "aadhaarImage" && aboutMeErrors.aadhaarImage) {
      setAboutMeErrors((prev) => {
        const updated = { ...prev };
        delete (updated as Record<string, string>)["aadhaarImage"];
        return updated;
      });
    }
    if (field === "panImage" && aboutMeErrors.panImage) {
      setAboutMeErrors((prev) => {
        const updated = { ...prev };
        delete (updated as Record<string, string>)["panImage"];
        return updated;
      });
    }
  };

  const validateAboutMe = (): boolean => {
    const errors: AboutMeErrors = {};

    if (!aboutMe.firstName.trim()) errors.firstName = "First name is required";
    if (!aboutMe.lastName.trim()) errors.lastName = "Last name is required";

    if (!aboutMe.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (aboutMe.phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Enter a valid phone number";
    }

    if (aboutMe.emergencyPhone.trim()) {
      if (aboutMe.emergencyPhone.replace(/\D/g, "").length < 10) {
        errors.emergencyPhone = "Enter a valid emergency contact number";
      }
    }

    if (!aboutMe.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(aboutMe.email)) {
      errors.email = "Enter a valid email address";
    }

    if (aboutMe.linkedinUrl.trim()) {
      const urlPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i;
      if (!urlPattern.test(aboutMe.linkedinUrl.trim())) {
        errors.linkedinUrl = "Enter a valid LinkedIn profile URL";
      }
    }

    if (!aboutMe.state.trim()) {
      errors.state = "State is required";
    }

    if (!aboutMe.city.trim()) {
      errors.city = "City is required";
    }

    const aadhaarDigits = aboutMe.aadhaarNumber.replace(/\D/g, "");
    if (!aadhaarDigits) {
      errors.aadhaarNumber = "Aadhaar number is required";
    } else if (!/^\d{12}$/.test(aadhaarDigits)) {
      errors.aadhaarNumber = "Aadhaar number must be 12 digits";
    }

    const panValue = aboutMe.panNumber.trim().toUpperCase();
    if (!panValue) {
      errors.panNumber = "PAN number is required";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panValue)) {
      errors.panNumber = "PAN format should be like ABCDE1234F";
    }

    if (!aboutMe.profilePhoto) {
      errors.profileMedia = "Add a profile photo so companies can recognise you faster";
    }

    // Aadhaar is optional, no validation needed

    if (!aboutMe.panImage) {
      errors.panImage = "Upload your PAN image";
    }

    setAboutMeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateExperience = (experiences: any[]): boolean => {
    // Experience step is optional - can be skipped
    // If user has started filling any experience, all fields in that experience must be filled
    if (experiences.length === 0) return true; // Empty is valid (skip)

    // If any experience has any field filled, all fields must be filled
    return experiences.every((exp) => {
      const hasAnyField = exp.company || exp.role || exp.from || exp.to || exp.description;
      if (!hasAnyField) return true; // Empty experience is valid
      // If any field is filled, all must be filled
      return exp.company && exp.role && exp.from && exp.to && exp.description;
    });
  };

  const goNext = () => {
    // Validate step 0 (About Me) when clicking next
    if (activeStep === 0) {
      const ok = validateAboutMe();
      if (!ok) return;
    }
    // Step 1 (Academics) - require main fields
    if (activeStep === 1 && !academicsComplete) {
      return;
    }
    // Step 2 (Experience) - validate if any experience is started
    if (activeStep === 2 && !experienceComplete) {
      return;
    }
    // Step 3 (Skills) - require at least one skill
    if (activeStep === 3 && !skillsStepComplete) {
      return;
    }

    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const skipStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/60 px-3 md:px-6 py-4 md:py-6">
      {/* Top navigation with logo */}
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 pb-4 md:pb-6">
        <div className="flex items-center gap-3">
          <img
            src={findternLogo}
            alt="Findtern - Internship Simplified"
            className="h-8 md:h-9 w-auto object-contain"
          />
          <span className="hidden text-xs md:inline-flex text-muted-foreground">
            Help us understand you better so we can match you to the right internships.
          </span>
        </div>
        <Badge variant="outline" className="hidden md:inline-flex text-[11px] font-medium">
          Step {activeStep + 1} of {steps.length}
        </Badge>
      </header>

      {/* Payment status banner */}
      {showPaymentBanner && (
        <div className="mx-auto mb-3 md:mb-4 max-w-5xl">
          <div className="flex items-center justify-between gap-3 rounded-md bg-destructive/10 px-3 py-2 text-[11px] md:rounded-none md:px-4 md:py-3 md:text-sm">
            <p className="font-medium text-destructive">
              Your account is not live. Please complete your payment.
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                className="h-7 rounded-full bg-destructive px-3 text-xs text-destructive-foreground hover:bg-destructive/90 md:h-8 md:px-4 md:text-sm"
              >
                Pay Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="mx-auto mb-4 md:mb-6 flex max-w-5xl flex-col gap-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto rounded-full bg-card/80 px-3 py-2 shadow-sm">
          {steps.map((label, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;

            return (
              <button
                key={label}
                type="button"
                className={`flex min-w-[80px] flex-1 items-center gap-2 rounded-full px-2 py-1.5 text-xs md:text-[13px] transition-colors ${isActive
                  ? "text-white"
                  : isCompleted
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                  }`}
                style={isActive ? { backgroundColor: '#0E6049' } : {}}
                onClick={() => {
                  // Allow going back freely, but prevent skipping ahead beyond current step
                  if (index <= activeStep) setActiveStep(index);
                }}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/40 bg-white/10 text-[11px]">
                  {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span className="truncate text-left">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-5xl">
        <Card className="border border-card-border/80 bg-card/95 shadow-xl rounded-2xl p-4 md:p-6">
          {activeStep === 0 && (
            <StepAboutMe
              form={aboutMe}
              errors={aboutMeErrors}
              onChange={handleAboutMeChange}
            />
          )}
          {activeStep === 1 && (
            <StepAcademics
              initialData={academicsData}
              onValidityChange={setAcademicsComplete}
              onDataChange={setAcademicsData}
            />
          )}
          {activeStep === 2 && (
            <StepExperience
              initialData={experienceData}
              onValidityChange={setExperienceComplete}
              onDataChange={setExperienceData}
            />
          )}
          {activeStep === 3 && (
            <StepSkills
              skills={skills}
              onSkillsChange={(nextSkills, complete) => {
                setSkills(nextSkills);
                setSkillsStepComplete(complete);
              }}
            />
          )}
          {activeStep === 4 && (
            <StepLanguages
              initialData={languagesData}
              onValidityChange={setLanguagesComplete}
              onDataChange={setLanguagesData}
            />
          )}
          {activeStep === 5 && (
            <StepExtraCurricular initialData={extracurricularData} onDataChange={setExtracurricularData} />
          )}
          {activeStep === 6 && (
            <StepLocationPreferences
              state={locationPrefs}
              onChange={setLocationPrefs}
              onValidityChange={setLocationPrefsComplete}
            />
          )}
          {activeStep === 7 && (
            <StepProfilePreview
              aboutMe={aboutMe}
              academicsData={academicsData}
              experienceData={experienceData}
              skills={skills}
              languagesData={languagesData}
              extracurricularData={extracurricularData}
              locationPrefs={locationPrefs}
            />
          )}

          {/* Navigation buttons */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              className="text-xs md:text-sm"
              disabled={activeStep === 0}
              onClick={goBack}
            >
              Back
            </Button>
            <div className="flex items-center gap-3">
              {activeStep === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  className="px-6 text-xs md:text-sm rounded-full"
                  onClick={skipStep}
                >
                  Skip
                </Button>
              )}
              {activeStep < steps.length - 1 && (
                <Button
                  type="button"
                  className="px-6 text-xs md:text-sm rounded-full"
                  style={{ backgroundColor: '#0E6049' }}
                  disabled={
                    (activeStep === 1 && !academicsComplete) ||
                    (activeStep === 2 && !experienceComplete) ||
                    (activeStep === 3 && !skillsStepComplete) ||
                    (activeStep === 4 && !languagesComplete) ||
                    (activeStep === 6 && !locationPrefsComplete)
                  }
                  onClick={goNext}
                >
                  Save & Continue
                </Button>
              )}
              {activeStep === steps.length - 1 && (
                <FinishOnboardingButton
                  aboutMe={aboutMe}
                  academicsData={academicsData}
                  experienceData={experienceData}
                  skills={skills}
                  languagesData={languagesData}
                  extracurricularData={extracurricularData}
                  locationPrefs={locationPrefs}
                  isEditMode={isEditMode}
                  onSuccess={() => setLocation("/dashboard")}
                />
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 md:mb-6">
      <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">{title}</h2>
      {subtitle && <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function StepAboutMe({
  form,
  errors,
  onChange,
}: {
  form: AboutMeForm;
  errors: AboutMeErrors;
  onChange: (field: keyof AboutMeForm, value: string | File | null) => void;
}) {
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [profileMediaError, setProfileMediaError] = useState<string | null>(null);
  const [faceModelsLoaded, setFaceModelsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        if (isMounted) {
          setFaceModelsLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load face detection models", error);
        if (isMounted) {
          setFaceModelsLoaded(false);
        }
      }
    };

    loadModels();

    return () => {
      isMounted = false;
    };
  }, []);

  const profilePreview = form.profilePhoto ? URL.createObjectURL(form.profilePhoto) : null;
  const introVideoPreview = form.introVideo ? URL.createObjectURL(form.introVideo) : null;
  const aadhaarPreview = form.aadhaarImage ? URL.createObjectURL(form.aadhaarImage) : null;
  const panPreview = form.panImage ? URL.createObjectURL(form.panImage) : null;

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any, rotation = 0): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/jpeg", 0.95);
    });
  };

  const resizeImage = (blob: Blob, width: number, height: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((resizedBlob) => {
            URL.revokeObjectURL(url);
            if (resizedBlob) resolve(resizedBlob);
          }, "image/jpeg", 0.95);
        }
      };
      img.src = url;
    });
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setProfileMediaError("Please upload a JPG or PNG image");
      return;
    }

    if (file.size > maxSizeBytes) {
      setProfileMediaError("Image must be under 5MB");
      return;
    }

    setProfileMediaError(null);
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setShowCropDialog(true);

    // Allow selecting the same file again
    e.target.value = "";
  };

  const handleCropComplete = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(
        imageToCrop,
        croppedAreaPixels,
        rotation
      );

      // Resize to passport size: 600x600 pixels (2x2 inches at 300 DPI)
      const resizedImage = await resizeImage(croppedImage, 600, 600);

      const file = new File([resizedImage], "profile-photo.jpg", {
        type: "image/jpeg",
      });

      onChange("profilePhoto", file);
      setShowCropDialog(false);
      setImageToCrop(null);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="About Me"
        subtitle="Tell us the basics so we can build your profile for opportunities."
      />

      {/* Media section */}
      <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-4 md:gap-6">
        {/* Photo upload */}
        <div className="space-y-2">
          <label className="text-xs md:text-sm font-medium text-foreground">
            Profile photo (Passport Size)<span className="text-destructive ml-0.5">*</span>
          </label>
          <label
            className={`group flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed px-4 py-3 md:px-5 md:py-4 bg-card/70 hover:bg-primary/5 transition-colors ${errors.profileMedia ? "border-destructive/60" : "border-border/80"
              }`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted overflow-hidden">
              {profilePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilePreview} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <UploadCloud className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-xs md:text-sm font-medium text-foreground">
                {form.profilePhoto ? "Change profile photo" : "Upload passport size photo"}
              </span>
              <span className="text-[11px] md:text-xs text-muted-foreground">
                JPG or PNG, max 5MB. You can crop and adjust to passport size (2x2 inches).
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
          {errors.profileMedia && (
            <p className="text-[11px] text-destructive mt-0.5">{errors.profileMedia}</p>
          )}
          {profileMediaError && !errors.profileMedia && (
            <p className="text-[11px] text-destructive mt-0.5">{profileMediaError}</p>
          )}

          {/* Crop Dialog */}
          <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
            <DialogContent className="max-w-2xl w-[95vw] h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Crop & Adjust Photo (Passport Size - 2x2 inches)</DialogTitle>
              </DialogHeader>
              <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
                {imageToCrop && (
                  <Cropper
                    image={imageToCrop}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                    cropShape="rect"
                    showGrid={true}
                    style={{
                      containerStyle: {
                        width: "100%",
                        height: "100%",
                        position: "relative",
                      },
                    }}
                  />
                )}
              </div>
              <div className="space-y-4 pt-4">
                {/* Zoom Control */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ZoomOut className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="flex-1"
                    />
                    <ZoomIn className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                </div>
                {/* Rotation Control */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RotateCw className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground w-20">Rotation:</span>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {rotation}°
                    </span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCropDialog(false);
                      setImageToCrop(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCropComplete}
                    style={{ backgroundColor: '#0E6049' }}
                  >
                    Save Photo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Intro video section */}
        <div className="space-y-2">
          <label className="text-xs md:text-sm font-medium text-foreground">Intro video (optional)</label>
          <label className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-border/80 px-4 py-3 md:px-5 md:py-4 bg-card/70 hover:bg-primary/5 transition-colors">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              {introVideoPreview ? (
                <video
                  src={introVideoPreview}
                  className="h-full w-full rounded-2xl object-cover"
                  muted
                  playsInline
                />
              ) : (
                <PlayCircle className="h-7 w-7 text-muted-foreground group-hover:text-primary" />
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-xs md:text-sm font-medium text-foreground">
                {form.introVideo ? "Replace intro video" : "Add a short intro video"}
              </span>
              <span className="text-[11px] md:text-xs text-muted-foreground">
                30–60 seconds about yourself, your background and what roles you&apos;re excited about.
              </span>
            </div>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                onChange("introVideo", file);
              }}
            />
          </label>
        </div>
      </div>

      {/* Basic details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs md:text-sm font-medium text-foreground">
            First Name<span className="text-destructive ml-0.5">*</span>
          </label>
          <Input
            placeholder="Enter your first name"
            className={`h-10 md:h-11 rounded-lg text-sm ${errors.firstName ? "border-destructive/70" : ""
              }`}
            value={form.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
          />
          {errors.firstName && (
            <p className="text-[11px] text-destructive mt-0.5">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs md:text-sm font-medium text-foreground">
            Last Name<span className="text-destructive ml-0.5">*</span>
          </label>
          <Input
            placeholder="Enter your last name"
            className={`h-10 md:h-11 rounded-lg text-sm ${errors.lastName ? "border-destructive/70" : ""
              }`}
            value={form.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
          />
          {errors.lastName && (
            <p className="text-[11px] text-destructive mt-0.5">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Phone + Emergency contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs md:text-sm font-medium text-foreground">
            Phone Number<span className="text-destructive ml-0.5">*</span>
          </label>
          <div className="flex gap-2.5">
            <div className="w-[110px]">
              <Select
                value={form.phoneCountryCode}
                onValueChange={(value) => onChange("phoneCountryCode", value)}
              >
                <SelectTrigger className="h-10 md:h-11 rounded-lg text-xs md:text-sm">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.filter((country) => country.code === "+91").map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-1.5">
                        <span className="text-xs md:text-sm">{country.country}</span>
                        <span className="text-muted-foreground text-[11px] md:text-xs">
                          {country.code}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Enter your phone number"
              className={`flex-1 h-10 md:h-11 rounded-lg text-sm ${errors.phone ? "border-destructive/70" : ""
                }`}
              value={form.phone}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "");
                onChange("phone", digitsOnly);
              }}
            />
          </div>
          {errors.phone && <p className="text-[11px] text-destructive mt-0.5">{errors.phone}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs md:text-sm font-medium text-foreground">
            Emergency Contact Number (optional)
          </label>
          <div className="flex gap-2.5">
            <div className="w-[110px]">
              <Select
                value={form.emergencyCountryCode}
                onValueChange={(value) => onChange("emergencyCountryCode", value)}
              >
                <SelectTrigger className="h-10 md:h-11 rounded-lg text-xs md:text-sm">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-1.5">
                        <span className="text-xs md:text-sm">{country.country}</span>
                        <span className="text-muted-foreground text-[11px] md:text-xs">
                          {country.code}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Emergency phone number"
              className={`flex-1 h-10 md:h-11 rounded-lg text-sm ${errors.emergencyPhone ? "border-destructive/70" : ""
                }`}
              value={form.emergencyPhone}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "");
                onChange("emergencyPhone", digitsOnly);
              }}
            />
          </div>
          {errors.emergencyPhone && (
            <p className="text-[11px] text-destructive mt-0.5">{errors.emergencyPhone}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs md:text-sm font-medium text-foreground">
          Email<span className="text-destructive ml-0.5">*</span>
        </label>
        <Input
          placeholder="Personal email"
          className={`h-10 md:h-11 rounded-lg text-sm ${errors.email ? "border-destructive/70" : ""
            }`}
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
        {errors.email && <p className="text-[11px] text-destructive mt-0.5">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs md:text-sm font-medium text-foreground">
          LinkedIn Profile (optional)
        </label>
        <Input
          placeholder="https://www.linkedin.com/in/your-profile"
          className={`h-10 md:h-11 rounded-lg text-sm ${errors.linkedinUrl ? "border-destructive/70" : ""
            }`}
          value={form.linkedinUrl}
          onChange={(e) => onChange("linkedinUrl", e.target.value)}
        />
        {errors.linkedinUrl && (
          <p className="text-[11px] text-destructive mt-0.5">{errors.linkedinUrl}</p>
        )}
      </div>

      {/* City, State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs md:text-sm font-medium text-foreground">
            City<span className="text-destructive ml-0.5">*</span>
          </label>
          <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={`w-full h-10 md:h-11 justify-between rounded-lg text-sm ${errors.city ? "border-destructive/70" : ""}`}
              >
                <span className="truncate text-left">
                  {form.city
                    ? form.city
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (ch) => ch.toUpperCase())
                    : "Select your city"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[360px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search Indian cities..." />
                <CommandList>
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    {Object.entries(
                      cityStatePincode as Record<string, { state: string; pincodes: string[] }>
                    )
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([cityKey, value]) => (
                        <CommandItem
                          key={cityKey}
                          value={cityKey}
                          onSelect={(selectedKey) => {
                            const entry = (cityStatePincode as Record<
                              string,
                              { state: string; pincodes: string[] }
                            >)[selectedKey];
                            if (entry?.state) {
                              onChange("city", selectedKey);
                              onChange("state", entry.state);
                            } else {
                              onChange("city", selectedKey);
                            }
                            setCityPopoverOpen(false);
                          }}
                        >
                          {cityKey
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (ch) => ch.toUpperCase())}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.city && <p className="text-[11px] text-destructive mt-0.5">{errors.city}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs md:text-sm font-medium text-foreground">
            State<span className="text-destructive ml-0.5">*</span>
          </label>
          <Input
            placeholder="Auto-filled from city"
            className={`h-10 md:h-11 rounded-lg text-sm ${errors.state ? "border-destructive/70" : ""
              }`}
            value={form.state}
            disabled
          />
          {errors.state && <p className="text-[11px] text-destructive mt-0.5">{errors.state}</p>}
        </div>
      </div>

      {/* Aadhaar / PAN numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs md:text-sm font-medium text-foreground">
            Aadhaar Number<span className="text-destructive ml-0.5">*</span>
          </label>
          <Input
            placeholder="Enter Aadhaar number"
            className={`h-10 md:h-11 rounded-lg text-sm ${errors.aadhaarNumber ? "border-destructive/70" : ""
              }`}
            value={form.aadhaarNumber}
            maxLength={14}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 12);

              const formatted = digitsOnly
                .match(/.{1,4}/g)
                ?.join(" ")
                .trim() ?? "";

              onChange("aadhaarNumber", formatted);
            }}
          />
          {errors.aadhaarNumber && (
            <p className="text-[11px] text-destructive mt-0.5">{errors.aadhaarNumber}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs md:text-sm font-medium text-foreground">
            PAN Number<span className="text-destructive ml-0.5">*</span>
          </label>
          <Input
            placeholder="Enter PAN number"
            className={`h-10 md:h-11 rounded-lg text-sm ${errors.panNumber ? "border-destructive/70" : ""
              }`}
            value={form.panNumber}
            maxLength={10}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
              onChange("panNumber", cleaned);
            }}
          />
          {errors.panNumber && (
            <p className="text-[11px] text-destructive mt-0.5">{errors.panNumber}</p>
          )}
        </div>
      </div>

    

      {/* Document uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="space-y-2">
          <label className="text-xs md:text-sm font-medium text-foreground">
            Upload Aadhaar (optional)
          </label>
          <label
            className={`group flex cursor-pointer flex-col items-start gap-3 rounded-2xl border border-dashed px-4 py-3 md:px-5 md:py-4 bg-card/70 hover:bg-primary/5 transition-colors ${errors.aadhaarImage ? "border-destructive/60" : "border-border/80"
              }`}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted overflow-hidden">
                {aadhaarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={aadhaarPreview} alt="Aadhaar preview" className="h-full w-full object-cover" />
                ) : (
                  <UploadCloud className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-xs md:text-sm font-medium text-foreground">
                  {form.aadhaarImage ? "Change Aadhaar image" : "Upload Aadhaar image"}
                </span>
                <span className="text-[11px] md:text-xs text-muted-foreground">
                  Clear photo or scan of your Aadhaar card.
                </span>
              </div>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (!file) {
                  onChange("aadhaarImage", null);
                  return;
                }

                const maxSizeBytes = 5 * 1024 * 1024; // 5MB
                const allowedTypes = ["image/jpeg", "image/png"];
                if (!allowedTypes.includes(file.type) || file.size > maxSizeBytes) {
                  // Reject files that are not JPEG/PNG or are too large
                  return;
                }

                onChange("aadhaarImage", file);
              }}
            />
          </label>
          {errors.aadhaarImage && (
            <p className="text-[11px] text-destructive mt-0.5">{errors.aadhaarImage}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs md:text-sm font-medium text-foreground">
            Upload PAN<span className="text-destructive ml-0.5">*</span>
          </label>
          <label
            className={`group flex cursor-pointer flex-col items-start gap-3 rounded-2xl border border-dashed px-4 py-3 md:px-5 md:py-4 bg-card/70 hover:bg-primary/5 transition-colors ${errors.panImage ? "border-destructive/60" : "border-border/80"
              }`}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted overflow-hidden">
                {panPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={panPreview} alt="PAN preview" className="h-full w-full object-cover" />
                ) : (
                  <UploadCloud className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-xs md:text-sm font-medium text-foreground">
                  {form.panImage ? "Change PAN image" : "Upload PAN image"}
                </span>
                <span className="text-[11px] md:text-xs text-muted-foreground">
                  Clear photo or scan of your PAN card.
                </span>
              </div>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (!file) {
                  onChange("panImage", null);
                  return;
                }

                const maxSizeBytes = 5 * 1024 * 1024; // 5MB
                const allowedTypes = ["image/jpeg", "image/png"];
                if (!allowedTypes.includes(file.type) || file.size > maxSizeBytes) {
                  // Reject files that are not JPEG/PNG or are too large
                  return;
                }

                onChange("panImage", file);
              }}
            />
          </label>
          {errors.panImage && <p className="text-[11px] text-destructive mt-0.5">{errors.panImage}</p>}
        </div>
      </div>
        <div className="space-y-1.5">
        <label className="text-xs md:text-sm font-medium text-foreground">Bio (optional)</label>
        <Textarea
          placeholder="Tell us briefly about yourself, your goals, or what kind of work you’d love to do."
          className="min-h-[90px] md:min-h-[110px] rounded-lg text-sm"
          value={form.bio}
          onChange={(e) => onChange("bio", e.target.value)}
        />
      </div>
    </div>
  );
}

function StepAcademics({
  initialData,
  onValidityChange,
  onDataChange,
}: {
  initialData?: any;
  onValidityChange: (valid: boolean) => void;
  onDataChange?: (data: any) => void;
}) {
  const didHydrateFromInitialData = useRef(false);
  const [level, setLevel] = useState<string>("");
  const [degree, setDegree] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [status, setStatus] = useState<string>("Completed");
  const [institution, setInstitution] = useState<string>("");
  const [startYear, setStartYear] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");
  const [scoreType, setScoreType] = useState<"percentage" | "cgpa">("percentage");
  const [score, setScore] = useState<string>("");
  const [marksheetFiles, setMarksheetFiles] = useState<File[]>([]);
  const [marksheetUploads, setMarksheetUploads] = useState<
    {
      name: string;
      type: string;
      size: number;
    }[]
  >([]);
  const [professionalCourses, setProfessionalCourses] = useState<
    {
      id: string;
      courseType: string;
      title: string;
      level: string;
      status: string;
      institution: string;
      scoreType: "percentage" | "cgpa";
      score: string;
      issueDate: string;
      startDate: string;
      endDate: string;
      duration: string;
      certificateUploads: { name: string; type: string; size: number }[];
      endYear: string;
    }[]
  >([]);
  const [certificationCourses, setCertificationCourses] = useState<string>("");
  const [certifications, setCertifications] = useState<
    {
      id: string;
      certificateName: string;
      institution: string;
      scoreType: "percentage" | "cgpa";
      score: string;
      issueDate: string;
      duration: string;
      certificateUploads: { name: string; type: string; size: number }[];
    }[]
  >([]);

  useEffect(() => {
    if (!initialData) return;
    if (didHydrateFromInitialData.current) return;
    didHydrateFromInitialData.current = true;

    setLevel(initialData.level || "");
    setDegree(initialData.degree || "");
    setSpecialization(initialData.specialization || "");
    setStatus(initialData.status || "Completed");
    setInstitution(initialData.institution || "");
    setStartYear(initialData.startYear || "");
    setEndYear(initialData.endYear || "");
    setScoreType(initialData.scoreType || "percentage");
    setScore(initialData.score || "");
    setProfessionalCourses(Array.isArray(initialData.professionalCourses) ? initialData.professionalCourses : []);
    setCertificationCourses(initialData.certificationCourses || "");
    setCertifications(Array.isArray(initialData.certifications) ? initialData.certifications : []);
    setMarksheetUploads(Array.isArray(initialData.marksheetUploads) ? initialData.marksheetUploads : []);
  }, [initialData]);

  // Degree options based on level
  const degreeOptions: Record<string, string[]> = {
    "10th": ["SSC", "Matriculation"],
    "12th": ["HSC", "Intermediate", "Senior Secondary"],
    "diploma": ["Diploma"],
    "bachelors": ["B.Tech", "B.E.", "B.Sc", "B.Com", "B.A.", "BBA", "BCA", "B.Pharm", "Other"],
    "masters": ["M.Tech", "M.E.", "M.Sc", "M.Com", "M.A.", "MBA", "MCA", "M.Pharm", "Other"],
    "phd": ["Ph.D"],
  };

  // Compute validity whenever key fields change
  useEffect(() => {
    const valid =
      !!level &&
      !!degree &&
      !!institution &&
      startYear.length === 4 &&
      (status === "Pursuing" ? true : endYear.length === 4) &&
      !!score;

    onValidityChange(valid);

    if (onDataChange) {
      onDataChange({
        level,
        degree,
        specialization,
        status,
        institution,
        startYear,
        endYear,
        scoreType,
        score,
        marksheetUploads,
        professionalCourses,
        certificationCourses,
        certifications,
      });
    }
  }, [level, degree, specialization, status, institution, startYear, endYear, scoreType, score, marksheetUploads, professionalCourses, certificationCourses, certifications, onValidityChange, onDataChange]);

  const addProfessionalCourse = () => {
    setProfessionalCourses((prev) => [
      ...prev,
      {
        id: `prof-course-${Date.now()}-${Math.random()}`,
        courseType: "",
        title: "",
        level: "",
        status: "Completed",
        institution: "",
        scoreType: "percentage",
        score: "",
        issueDate: "",
        startDate: "",
        endDate: "",
        duration: "",
        certificateUploads: [],
        endYear: "",
      },
    ]);
  };

  const updateProfessionalCourse = (
    id: string,
    field: keyof Omit<{
      id: string;
      courseType: string;
      title: string;
      level: string;
      status: string;
      institution: string;
      scoreType: "percentage" | "cgpa";
      score: string;
      issueDate: string;
      startDate: string;
      endDate: string;
      duration: string;
      certificateUploads: { name: string; type: string; size: number }[];
      endYear: string;
    }, "id">,
    value: string,
  ) => {
    setProfessionalCourses((prev) =>
      prev.map((course) => (course.id === id ? { ...course, [field]: value } : course)),
    );
  };

  const addCertification = () => {
    setCertifications((prev) => [
      ...prev,
      {
        id: `cert-${Date.now()}-${Math.random()}`,
        certificateName: "",
        institution: "",
        scoreType: "percentage",
        score: "",
        issueDate: "",
        duration: "",
        certificateUploads: [],
      },
    ]);
  };

  const updateCertification = (
    id: string,
    field: keyof Omit<{
      id: string;
      certificateName: string;
      institution: string;
      scoreType: "percentage" | "cgpa";
      score: string;
      issueDate: string;
      duration: string;
      certificateUploads: { name: string; type: string; size: number }[];
    }, "id">,
    value: string,
  ) => {
    setCertifications((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const removeCertification = (id: string) => {
    setCertifications((prev) => prev.filter((c) => c.id !== id));
  };

  const removeProfessionalCourse = (id: string) => {
    setProfessionalCourses((prev) => prev.filter((course) => course.id !== id));
  };

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Highest Qualification"
        subtitle=""
      />

      <div className="space-y-1.5">
        <label className="text-xs md:text-sm font-medium text-foreground">
          Level<span className="text-destructive ml-0.5">*</span>
        </label>
        <Select value={level} onValueChange={(value) => {
          setLevel(value);
          setDegree(""); // Reset degree when level changes
        }}>
          <SelectTrigger className="h-10 md:h-11 rounded-lg text-sm">
            <SelectValue placeholder="Select Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10th">10th</SelectItem>
            <SelectItem value="12th">12th</SelectItem>
            <SelectItem value="diploma">Diploma</SelectItem>
            <SelectItem value="bachelors">Bachelor&apos;s</SelectItem>
            <SelectItem value="masters">Master&apos;s</SelectItem>
            <SelectItem value="phd">Ph.D</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs md:text-sm font-medium text-foreground">
          Degree<span className="text-destructive ml-0.5">*</span>
        </label>
        <Select value={degree} onValueChange={setDegree} disabled={!level}>
          <SelectTrigger className="h-10 md:h-11 rounded-lg text-sm">
            <SelectValue placeholder={level ? "Select Degree" : "Select Level first"} />
          </SelectTrigger>
          <SelectContent>
            {level && degreeOptions[level]?.map((deg) => (
              <SelectItem key={deg} value={deg}>{deg}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs md:text-sm font-medium text-foreground">
          Specialization
        </label>
        <Input
          placeholder="Specialization"
          className="h-10 md:h-11 rounded-lg text-sm"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        />
      </div>

      

      <div className="space-y-1.5">
        <label className="text-xs md:text-sm font-medium text-foreground">
          Status<span className="text-destructive ml-0.5">*</span>
        </label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-10 md:h-11 rounded-lg text-sm">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pursuing">Pursuing</SelectItem>
            <SelectItem value="Dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs md:text-sm font-medium text-foreground">
          Institution<span className="text-destructive ml-0.5">*</span>
        </label>
        <Input
          placeholder="Institution Name"
          className="h-10 md:h-11 rounded-lg text-sm"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs md:text-sm font-medium text-foreground">
            Start Year<span className="text-destructive ml-0.5">*</span>
          </label>
          <Input
            placeholder="YYYY"
            className="h-10 md:h-11 rounded-lg text-sm"
            value={startYear}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 4);
              setStartYear(value);
            }}
            maxLength={4}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs md:text-sm font-medium text-foreground">
            End Year{status === "Pursuing" ? "" : <span className="text-destructive ml-0.5">*</span>}
          </label>
          <Input
            placeholder="YYYY"
            className="h-10 md:h-11 rounded-lg text-sm"
            value={endYear}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 4);
              setEndYear(value);
            }}
            maxLength={4}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs md:text-sm font-medium text-foreground">
          Score<span className="text-destructive ml-0.5">*</span>
        </label>
        <div className="space-y-3">
          <RadioGroup
            value={scoreType}
            onValueChange={(value) => setScoreType(value as "percentage" | "cgpa")}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percentage" id="percentage" />
              <Label htmlFor="percentage" className="text-sm font-normal cursor-pointer">
                Percentage
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cgpa" id="cgpa" />
              <Label htmlFor="cgpa" className="text-sm font-normal cursor-pointer">
                CGPA
              </Label>
            </div>
          </RadioGroup>
          <Input
            placeholder={scoreType === "percentage" ? "Percentage" : "CGPA"}
            className="h-10 md:h-11 rounded-lg text-sm"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            type="number"
            step={scoreType === "cgpa" ? "0.01" : "0.1"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs md:text-sm font-medium text-foreground">
          Marksheet
        </label>
        <div className="space-y-3">
          {/* File Upload Button */}
          <label htmlFor="marksheet-upload" className="cursor-pointer">
            <input
              id="marksheet-upload"
              type="file"
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setMarksheetFiles((prev) => [...prev, ...files]);
                setMarksheetUploads((prev) => [
                  ...prev,
                  ...files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
                ]);
                // Reset input to allow selecting same file again
                e.target.value = "";
              }}
            />
            
 

            <Button
              type="button"
              variant="outline"
              className="h-10 md:h-11 rounded-lg text-sm border-2"
              style={{ borderColor: '#0E6049' }}
              onClick={(e) => {
                e.preventDefault();
                const fileInput = document.getElementById("marksheet-upload") as HTMLInputElement;
                fileInput?.click();
              }}
            >
              <UploadCloud className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </label>

          {/* File Previews */}
          {marksheetFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {marksheetFiles.map((file, index) => {
                const isImage = file.type.startsWith("image/");
                const previewUrl = isImage ? URL.createObjectURL(file) : null;

                return (
                  <div
                    key={index}
                    className="relative group rounded-lg border border-border/80 bg-card/70 overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setMarksheetFiles((prev) => prev.filter((_, i) => i !== index));
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                      }}
                      className="absolute top-1 right-1 z-10 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                      aria-label="Remove file"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    {/* Preview */}
                    <div className="aspect-square w-full bg-muted flex items-center justify-center overflow-hidden">
                      {isImage && previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>

                    {/* File Name */}
                    <div className="p-2">
                      <p className="text-[10px] md:text-xs text-foreground truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {marksheetFiles.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No files chosen. You can upload multiple files.
            </p>
          )}
        </div>
      </div>
           <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs md:text-sm font-medium text-foreground">
            Professional Courses (optional)
          </label>
          {professionalCourses.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              Add any additional bootcamps, online programmes or specialised trainings.
            </span>
          )}
        </div>

        {professionalCourses.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/70 bg-card/40 px-4 py-3 flex items-center justify-between">
            <p className="text-[11px] md:text-xs text-muted-foreground mr-3">
              If you have done any professional or industry‑oriented courses, you can add them here.
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-full text-[11px] md:text-xs"
              onClick={addProfessionalCourse}
            >
              Add professional course
            </Button>
          </div>
        )}

        {professionalCourses.length > 0 && (
          <div className="space-y-4">
            {professionalCourses.map((course, index) => (
              <div
                key={course.id}
                className="rounded-xl border border-border/70 bg-card/60 p-4 md:p-5 space-y-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs md:text-sm font-medium text-foreground">
                    Professional Course {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeProfessionalCourse(course.id)}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-foreground">
                      Course type
                    </label>
                    <Select
                      value={course.courseType}
                      onValueChange={(value) => updateProfessionalCourse(course.id, "courseType", value)}
                    >
                      <SelectTrigger className="h-9 md:h-10 rounded-lg text-xs md:text-sm">
                        <SelectValue placeholder="e.g. Bootcamp, Online, Diploma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bootcamp">Bootcamp</SelectItem>
                        <SelectItem value="online">Online course</SelectItem>
                        <SelectItem value="diploma">Diploma / Long‑term"</SelectItem>
                        <SelectItem value="workshop">Workshop / Short‑term</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-foreground">
                      Name of certificate / Course name
                    </label>
                    <Input
                      placeholder="e.g. Web app development"
                      className="h-9 md:h-10 rounded-lg text-xs md:text-sm"
                      value={course.title}
                      onChange={(e) => updateProfessionalCourse(course.id, "title", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-foreground">
                      Level / Stage
                    </label>
                    <Select
                      value={course.level}
                      onValueChange={(value) => updateProfessionalCourse(course.id, "level", value)}
                    >
                      <SelectTrigger className="h-9 md:h-10 rounded-lg text-xs md:text-sm">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="state">State</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-foreground">
                      Status
                    </label>
                    <Select
                      value={course.status}
                      onValueChange={(value) => updateProfessionalCourse(course.id, "status", value)}
                    >
                      <SelectTrigger className="h-9 md:h-10 rounded-lg text-xs md:text-sm">
                        <SelectValue placeholder="Completed / Ongoing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Pursuing">Pursuing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-foreground">
                      End date / Expected end date
                    </label>
                    <Input
                      type="date"
                      className="h-9 md:h-10 rounded-lg text-xs md:text-sm"
                      value={course.endDate || ""}
                      onChange={(e) => {
                        updateProfessionalCourse(course.id, "endDate", e.target.value);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-foreground">
                      Issue date
                    </label>
                    <Input
                      type="date"
                      className="h-9 md:h-10 rounded-lg text-xs md:text-sm"
                      value={course.issueDate || ""}
                      onChange={(e) => updateProfessionalCourse(course.id, "issueDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-foreground">
                      Course duration
                    </label>
                    <Input
                      placeholder="e.g. 3 months"
                      className="h-9 md:h-10 rounded-lg text-xs md:text-sm"
                      value={course.duration || ""}
                      onChange={(e) => updateProfessionalCourse(course.id, "duration", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-foreground">
                      Grades
                    </label>
                    <div className="flex gap-2">
                      <Select
                        value={course.scoreType}
                        onValueChange={(value) => updateProfessionalCourse(course.id, "scoreType", value)}
                      >
                        <SelectTrigger className="h-9 md:h-10 rounded-lg text-xs md:text-sm w-[130px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="cgpa">CGPA</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder={course.scoreType === "cgpa" ? "CGPA" : "%"}
                        className="h-9 md:h-10 rounded-lg text-xs md:text-sm"
                        value={course.score || ""}
                        onChange={(e) => updateProfessionalCourse(course.id, "score", e.target.value)}
                        type="number"
                        step={course.scoreType === "cgpa" ? "0.01" : "0.1"}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] md:text-xs font-medium text-foreground">
                    Upload certificate
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setProfessionalCourses((prev) =>
                          prev.map((p) =>
                            p.id === course.id
                              ? {
                                  ...p,
                                  certificateUploads: [
                                    ...(p.certificateUploads || []),
                                    ...files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
                                  ],
                                }
                              : p,
                          ),
                        );
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 md:h-10 rounded-lg text-xs md:text-sm border-2"
                      style={{ borderColor: "#0E6049" }}
                      onClick={(e) => {
                        e.preventDefault();
                        (e.currentTarget.parentElement?.querySelector("input[type=file]") as HTMLInputElement | null)?.click();
                      }}
                    >
                      <UploadCloud className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </label>
                  {Array.isArray(course.certificateUploads) && course.certificateUploads.length > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      {course.certificateUploads.length} file(s) selected
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] md:text-xs font-medium text-foreground">
                    Institution / Body
                  </label>
                  <Input
                    placeholder="e.g. Apna College, IIT Bombay, Coursera, etc."
                    className="h-9 md:h-10 rounded-lg text-xs md:text-sm"
                    value={course.institution}
                    onChange={(e) => updateProfessionalCourse(course.id, "institution", e.target.value)}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="mt-1 text-[11px] md:text-xs rounded-full"
              onClick={addProfessionalCourse}
            >
              Add another professional course
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <label className="text-xs md:text-sm font-medium text-foreground">
          Certifications (optional)
        </label>
        {certifications.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/70 bg-card/40 px-4 py-3 flex items-center justify-between">
            <p className="text-[11px] md:text-xs text-muted-foreground mr-3">
              Add certificates you have earned (or are pursuing).
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-full text-[11px] md:text-xs"
              onClick={addCertification}
            >
              Add certification
            </Button>
          </div>
        )}

        {certifications.length > 0 && (
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <div
                key={cert.id}
                className="rounded-xl border border-border/70 bg-card/60 p-4 md:p-5 space-y-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs md:text-sm font-medium text-foreground">
                    Certification {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeCertification(cert.id)}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-foreground">
                      Name of certificate
                    </label>
                    <Input
                      placeholder="e.g. AWS Cloud Practitioner"
                      className="h-9 md:h-10 rounded-lg text-xs md:text-sm"
                      value={cert.certificateName}
                      onChange={(e) => updateCertification(cert.id, "certificateName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-foreground">
                      Institution / Body
                    </label>
                    <Input
                      placeholder="e.g. Coursera, Microsoft, IIT Bombay"
                      className="h-9 md:h-10 rounded-lg text-xs md:text-sm"
                      value={cert.institution}
                      onChange={(e) => updateCertification(cert.id, "institution", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-foreground">
                      Issue date
                    </label>
                    <Input
                      type="date"
                      className="h-9 md:h-10 rounded-lg text-xs md:text-sm"
                      value={cert.issueDate}
                      onChange={(e) => updateCertification(cert.id, "issueDate", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-foreground">
                      Course duration
                    </label>
                    <Input
                      placeholder="e.g. 6 months"
                      className="h-9 md:h-10 rounded-lg text-xs md:text-sm"
                      value={cert.duration}
                      onChange={(e) => updateCertification(cert.id, "duration", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-foreground">
                      Grades
                    </label>
                    <div className="flex gap-2">
                      <Select
                        value={cert.scoreType}
                        onValueChange={(value) => updateCertification(cert.id, "scoreType", value)}
                      >
                        <SelectTrigger className="h-9 md:h-10 rounded-lg text-xs md:text-sm w-[130px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="cgpa">CGPA</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder={cert.scoreType === "cgpa" ? "CGPA" : "%"}
                        className="h-9 md:h-10 rounded-lg text-xs md:text-sm"
                        value={cert.score}
                        onChange={(e) => updateCertification(cert.id, "score", e.target.value)}
                        type="number"
                        step={cert.scoreType === "cgpa" ? "0.01" : "0.1"}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] md:text-xs font-medium text-foreground">
                    Upload certificate
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setCertifications((prev) =>
                          prev.map((c) =>
                            c.id === cert.id
                              ? {
                                  ...c,
                                  certificateUploads: [
                                    ...(c.certificateUploads || []),
                                    ...files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
                                  ],
                                }
                              : c,
                          ),
                        );
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 md:h-10 rounded-lg text-xs md:text-sm border-2"
                      style={{ borderColor: "#0E6049" }}
                      onClick={(e) => {
                        e.preventDefault();
                        (e.currentTarget.parentElement?.querySelector("input[type=file]") as HTMLInputElement | null)?.click();
                      }}
                    >
                      <UploadCloud className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </label>
                  {Array.isArray(cert.certificateUploads) && cert.certificateUploads.length > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      {cert.certificateUploads.length} file(s) selected
                    </p>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="mt-1 text-[11px] md:text-xs rounded-full"
              onClick={addCertification}
            >
              Add another certification
            </Button>
          </div>
        )}

       
      </div>
    </div>
  );
}

type ExperienceEntry = {
  id: string;
  company: string;
  role: string;
  from: string;
  to: string;
  description: string;
};

function StepExperience({
  initialData,
  onValidityChange,
  onDataChange,
}: {
  initialData?: ExperienceEntry[];
  onValidityChange: (valid: boolean) => void;
  onDataChange?: (data: ExperienceEntry[]) => void;
}) {
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([
    {
      id: `exp-${Date.now()}`,
      company: "",
      role: "",
      from: "",
      to: "",
      description: "",
    },
  ]);

  const experienceHydratedRef = useRef(false);

  useEffect(() => {
    if (experienceHydratedRef.current) return;
    if (!Array.isArray(initialData) || initialData.length === 0) return;

    experienceHydratedRef.current = true;
    setExperiences(
      initialData.map((exp: any) => {
        const rawPeriod = typeof exp.period === "string" ? exp.period : "";
        const rawFrom = typeof exp.from === "string" ? exp.from : "";
        const rawTo = typeof exp.to === "string" ? exp.to : "";

        const normalizedPeriod = rawPeriod.replace(/\s+/g, " ").trim();
        const [periodFrom, periodTo] = (() => {
          if (!normalizedPeriod) return ["", ""];
          const parts = normalizedPeriod.split("-").map((p) => p.trim()).filter(Boolean);
          if (parts.length === 0) return ["", ""];
          if (parts.length === 1) return [parts[0], ""];
          return [parts[0], parts.slice(1).join(" - ")];
        })();

        const bullets = Array.isArray(exp.bullets) ? exp.bullets.filter((b: any) => typeof b === "string" && b.trim()) : [];
        const rawDescription = typeof exp.description === "string" ? exp.description : "";
        const description = rawDescription || (bullets.length > 0 ? bullets.join("\n") : "");

        return {
          id: exp.id || `exp-${Date.now()}-${Math.random()}`,
          company: typeof exp.company === "string" ? exp.company : "",
          role: typeof exp.role === "string" ? exp.role : "",
          from: rawFrom || periodFrom,
          to: rawTo || periodTo,
          description,
        };
      })
    );
  }, [initialData]);

  useEffect(() => {
    const valid = experiences.every((exp) => {
      const hasAnyField = exp.company || exp.role || exp.from || exp.to || exp.description;
      if (!hasAnyField) return true;
      return exp.company && exp.role && exp.from && exp.to && exp.description;
    });
    onValidityChange(valid);
    if (onDataChange) {
      onDataChange(experiences.filter((exp) => exp.company && exp.role && exp.from && exp.to && exp.description));
    }
  }, [experiences, onValidityChange, onDataChange]);

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: `exp-${Date.now()}-${Math.random()}`,
        company: "",
        role: "",
        from: "",
        to: "",
        description: "",
      },
    ]);
  };

  const removeExperience = (id: string) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((exp) => exp.id !== id));
    }
  };

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: string) => {
    setExperiences(
      experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Experience"
        subtitle="Tell us about any internships, projects or part‑time work you’ve done."
      />

      {experiences.map((experience, index) => (
        <div key={experience.id} className="space-y-5 p-4 md:p-5 rounded-lg border border-border/50 bg-card/50">
          {experiences.length > 1 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">
                Experience {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeExperience(experience.id)}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Remove
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs md:text-sm font-medium text-foreground">Company</label>
              <Input
                placeholder="Enter company name"
                className="h-10 md:h-11 rounded-lg text-sm"
                value={experience.company}
                onChange={(e) => updateExperience(experience.id, "company", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs md:text-sm font-medium text-foreground">Role</label>
              <Input
                placeholder="e.g. Marketing Intern"
                className="h-10 md:h-11 rounded-lg text-sm"
                value={experience.role}
                onChange={(e) => updateExperience(experience.id, "role", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs md:text-sm font-medium text-foreground">From</label>
              <Input
                placeholder="MM/YYYY"
                className="h-10 md:h-11 rounded-lg text-sm"
                value={experience.from}
                onChange={(e) => updateExperience(experience.id, "from", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs md:text-sm font-medium text-foreground">To</label>
              <Input
                placeholder="MM/YYYY or Present"
                className="h-10 md:h-11 rounded-lg text-sm"
                value={experience.to}
                onChange={(e) => updateExperience(experience.id, "to", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-medium text-foreground">About your role</label>
            <Textarea
              placeholder="Describe what you worked on, your responsibilities and what you learnt."
              className="min-h-[90px] md:min-h-[110px] rounded-lg text-sm"
              value={experience.description}
              onChange={(e) => updateExperience(experience.id, "description", e.target.value)}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="mt-2 text-xs md:text-sm rounded-full"
        onClick={addExperience}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add more experience
      </Button>
    </div>
  );
}

type SkillEntry = {
  id: string;
  name: string;
  rating: number;
};

function StepSkills({
  skills,
  onSkillsChange,
}: {
  skills: SkillEntry[];
  onSkillsChange: (nextSkills: SkillEntry[], complete: boolean) => void;
}) {
  const selectedSkills = skills;
  const [open, setOpen] = useState(false);
  const [customSkill, setCustomSkill] = useState("");
  const [dismissedSuggestionFor, setDismissedSuggestionFor] = useState<string | null>(null);
  const allSkills = (skillsData as unknown as string[]).sort();

  const suggestion = useMemo(() => {
    const original = customSkill.trim();
    if (!original) return null;
    if (original.length < 3) return null;
    if (dismissedSuggestionFor === original) return null;

    const normalize = (value: string) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const normalized = normalize(original);
    const selectedLower = new Set(selectedSkills.map((s) => s.name.toLowerCase()));
    if (selectedLower.has(normalized)) return null;

    const levenshtein = (a: string, b: string) => {
      const m = a.length;
      const n = b.length;
      const dp = new Array(n + 1);
      for (let j = 0; j <= n; j++) dp[j] = j;

      for (let i = 1; i <= m; i++) {
        let prev = dp[0];
        dp[0] = i;
        for (let j = 1; j <= n; j++) {
          const tmp = dp[j];
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
          prev = tmp;
        }
      }
      return dp[n];
    };

    const maxDistance = Math.min(4, Math.max(1, Math.floor(normalized.length / 3)));
    let best: { value: string; distance: number } | null = null;

    for (const skill of allSkills) {
      const s = normalize(skill);
      if (selectedLower.has(s)) continue;

      const dist = levenshtein(normalized, s);
      if (dist > maxDistance) continue;

      if (!best || dist < best.distance) {
        best = { value: skill, distance: dist };
        if (dist === 1) break;
      }
    }

    if (!best) return null;
    if (best.value.toLowerCase() === normalized) return null;
    return { original, corrected: best.value };
  }, [allSkills, customSkill, dismissedSuggestionFor, selectedSkills]);

  const addSkill = (skillName: string) => {
    if (selectedSkills.length >= 7) return;
    if (selectedSkills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) return;

    const next = [
      ...selectedSkills,
      {
        id: `skill-${Date.now()}-${Math.random()}`,
        name: skillName,
        rating: 1,
      },
    ];
    onSkillsChange(next, next.length >= 4);
    setOpen(false);
  };

  const removeSkill = (id: string) => {
    const next = selectedSkills.filter((s) => s.id !== id);
    onSkillsChange(next, next.length >= 4);
  };

  const updateRating = (id: string, rating: number) => {
    const next = selectedSkills.map((s) => (s.id === id ? { ...s, rating } : s));
    onSkillsChange(next, next.length >= 4);
  };

  const handleCustomSkill = () => {
    if (customSkill.trim() && selectedSkills.length < 7) {
      addSkill(customSkill.trim());
      setCustomSkill("");
      setDismissedSuggestionFor(null);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Add Skills with Rating"
        subtitle=""
      />

      <div className="space-y-2">
        <label className="text-xs md:text-sm font-medium text-foreground">
          Select Skills (up to 7)
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full min-h-10 md:min-h-11 justify-between rounded-lg text-xs md:text-sm font-normal flex items-center gap-2"
              disabled={selectedSkills.length >= 7}
            >
              <div className="flex flex-1 flex-wrap items-center gap-2 text-left">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted px-2 py-0.5 text-[11px] md:text-xs text-foreground"
                  >
                    {skill.name}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-destructive flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSkill(skill.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedSkills.length < 7 && (
                  <span className="text-muted-foreground whitespace-nowrap">
                    {selectedSkills.length === 0 ? "Search and select skills..." : "Add more skills"}
                  </span>
                )}
              </div>
              <UploadCloud className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search skills..." />
              <CommandList>
                <CommandEmpty>No skill found.</CommandEmpty>
                <CommandGroup>
                  {allSkills.map((skill) => (
                    <CommandItem
                      key={skill}
                      value={skill}
                      onSelect={() => addSkill(skill)}
                      disabled={selectedSkills.some((s) => s.name.toLowerCase() === skill.toLowerCase())}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedSkills.some((s) => s.name.toLowerCase() === skill.toLowerCase())
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {skill}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <p className="text-[11px] text-muted-foreground">
          For the best results, add at least 4 or more skills in order of importance.
        </p>
      </div>

      {/* Custom Skill Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Enter custom skill"
            className="h-10 md:h-11 rounded-lg text-sm"
            value={customSkill}
            onChange={(e) => {
              setCustomSkill(e.target.value);
              setDismissedSuggestionFor(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCustomSkill();
              }
            }}
            disabled={selectedSkills.length >= 7}
          />
          <Button
            type="button"
            variant="outline"
            className="h-10 md:h-11 rounded-lg text-sm"
            onClick={handleCustomSkill}
            disabled={selectedSkills.length >= 7 || !customSkill.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </div>

        {suggestion && (
          <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs">
            <div className="text-foreground">
              These are results for{" "}
              <button
                type="button"
                className="font-semibold text-primary underline underline-offset-2"
                onClick={() => {
                  setCustomSkill(suggestion.corrected);
                }}
              >
                {suggestion.corrected}
              </button>
            </div>
            <div className="text-muted-foreground">
              Search instead for{" "}
              <button
                type="button"
                className="text-primary underline underline-offset-2"
                onClick={() => {
                  setDismissedSuggestionFor(suggestion.original);
                }}
              >
                {suggestion.original}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Skills with Ratings */}
      {selectedSkills.length > 0 && (
        <div className="space-y-4">
          {selectedSkills.map((skill, index) => (
            <div key={skill.id} className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                  <span className="text-sm font-medium text-foreground">{skill.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeSkill(skill.id)}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Remove
                </Button>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Rating</label>
                <Select
                  value={skill.rating.toString()}
                  onValueChange={(value) => updateRating(skill.id, parseInt(value, 10))}
                >
                  <SelectTrigger className="h-10 md:h-11 rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Beginner</SelectItem>
                    <SelectItem value="2">Intermediate</SelectItem>
                    <SelectItem value="3">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Information */}
      <div className="space-y-2 pt-2">
        <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
          <li>The interview will be conducted based on the ratings you provide. Please be honest in your self-assessment to help us evaluate your skills more accurately.</li>
        </ul>

        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 mt-3">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 dark:text-yellow-400 text-base">⚠</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Important Note</p>
              <p className="text-[11px] text-yellow-700 dark:text-yellow-300">
                The self-evaluated skill ratings you provide will directly influence the difficulty level of your AI interview. Giving honest and accurate ratings will ensure you are assessed fairly, helping you achieve a better score and improving your chances of being shortlisted by employers.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

type LanguageEntry = {
  id: string;
  language: string;
  level: string;
  read: string;
  write: string;
  speak: string;
};

function StepLanguages({
  initialData,
  onValidityChange,
  onDataChange,
}: {
  initialData?: any[];
  onValidityChange: (valid: boolean) => void;
  onDataChange?: (data: any[]) => void;
}) {
  const [languages, setLanguages] = useState<LanguageEntry[]>([
    {
      id: `lang-${Date.now()}-hi`,
      language: "hindi",
      level: "native",
      read: "yes",
      write: "yes",
      speak: "yes",
    },
    {
      id: `lang-${Date.now()}-en`,
      language: "english",
      level: "professional",
      read: "yes",
      write: "yes",
      speak: "yes",
    },
  ]);

  const languagesHydratedRef = useRef(false);

  useEffect(() => {
    if (languagesHydratedRef.current) return;
    if (!Array.isArray(initialData) || initialData.length === 0) return;

    languagesHydratedRef.current = true;
    setLanguages(
      initialData.map((lang: any) => ({
        id: lang.id || `lang-${Date.now()}-${Math.random()}`,
        language: lang.language || "",
        level: lang.level || "",
        read: lang.read || "",
        write: lang.write || "",
        speak: lang.speak || "",
      }))
    );
  }, [initialData]);

  const addLanguage = () => {
    setLanguages([
      ...languages,
      {
        id: `lang-${Date.now()}-${Math.random()}`,
        language: "",
        level: "",
        read: "",
        write: "",
        speak: "",
      },
    ]);
  };

  const removeLanguage = (id: string) => {
    if (languages.length > 1) {
      setLanguages(languages.filter((lang) => lang.id !== id));
    }
  };

  const updateLanguage = (id: string, field: keyof LanguageEntry, value: string) => {
    const updated = languages.map((lang) => (lang.id === id ? { ...lang, [field]: value } : lang));
    setLanguages(updated);
  };

  useEffect(() => {
    const complete = languages.filter((lang) => lang.language && lang.level);
    if (onDataChange) {
      onDataChange(complete);
    }
    onValidityChange(complete.length > 0);
  }, [languages, onDataChange, onValidityChange]);

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Languages"
        subtitle="Tell us which languages you’re comfortable with for work and communication."
      />

      <div className="space-y-4">
        {languages.map((language, index) => (
          <div key={language.id} className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-3">
            {languages.length > 1 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm font-medium text-muted-foreground">
                  Language {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeLanguage(language.id)}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Remove
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-medium text-foreground">Language</label>
                <Select
                  value={language.language}
                  onValueChange={(value) => updateLanguage(language.id, "language", value)}
                >
                  <SelectTrigger className="h-10 md:h-11 rounded-lg text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="korean">Korean</SelectItem>
                    <SelectItem value="arabic">Arabic</SelectItem>
                    <SelectItem value="portuguese">Portuguese</SelectItem>
                    <SelectItem value="italian">Italian</SelectItem>
                    <SelectItem value="russian">Russian</SelectItem>
                    <SelectItem value="tamil">Tamil</SelectItem>
                    <SelectItem value="telugu">Telugu</SelectItem>
                    <SelectItem value="marathi">Marathi</SelectItem>
                    <SelectItem value="bengali">Bengali</SelectItem>
                    <SelectItem value="gujarati">Gujarati</SelectItem>
                    <SelectItem value="kannada">Kannada</SelectItem>
                    <SelectItem value="malayalam">Malayalam</SelectItem>
                    <SelectItem value="punjabi">Punjabi</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-medium text-foreground">Level</label>
                <Select
                  value={language.level}
                  onValueChange={(value) => updateLanguage(language.id, "level", value)}
                >
                  <SelectTrigger className="h-10 md:h-11 rounded-lg text-sm">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="native">Native</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {["Read", "Write", "Speak"].map((label) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-xs md:text-sm font-medium text-foreground">{label}</label>
                  <Select
                    value={language[label.toLowerCase() as keyof LanguageEntry] as string}
                    onValueChange={(value) => updateLanguage(language.id, label.toLowerCase() as keyof LanguageEntry, value)}
                  >
                    <SelectTrigger className="h-10 md:h-11 rounded-lg text-sm">
                      <SelectValue placeholder="Yes/No" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-1 text-xs md:text-sm rounded-full"
        onClick={addLanguage}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add language
      </Button>
    </div>
  );
}

type ActivityEntry = {
  id: string;
  activity: string;
  level: string;
};

function StepExtraCurricular({
  initialData,
  onDataChange,
}: {
  initialData?: any[];
  onDataChange?: (data: any[]) => void;
}) {
  const [activities, setActivities] = useState<ActivityEntry[]>([
    {
      id: `activity-${Date.now()}`,
      activity: "",
      level: "",
    },
  ]);

  const activitiesHydratedRef = useRef(false);

  useEffect(() => {
    if (activitiesHydratedRef.current) return;
    if (!Array.isArray(initialData) || initialData.length === 0) return;

    activitiesHydratedRef.current = true;
    setActivities(
      initialData.map((a: any) => ({
        id: a.id || `activity-${Date.now()}-${Math.random()}`,
        activity: a.activity || "",
        level: a.level || "",
      }))
    );
  }, [initialData]);

  const addActivity = () => {
    setActivities([
      ...activities,
      {
        id: `activity-${Date.now()}-${Math.random()}`,
        activity: "",
        level: "",
      },
    ]);
  };

  const removeActivity = (id: string) => {
    if (activities.length > 1) {
      setActivities(activities.filter((act) => act.id !== id));
    }
  };

  const updateActivity = (id: string, field: keyof ActivityEntry, value: string) => {
    const updated = activities.map((act) => {
      if (act.id !== id) return act;
      const next: ActivityEntry = { ...act, [field]: value };
      if (field === "activity" && value && !next.level) {
        next.level = "beginner";
      }
      return next;
    });
    setActivities(updated);
    if (onDataChange) {
      onDataChange(updated.filter((act) => act.activity && act.level));
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Extra‑Curricular Activities"
        subtitle="Activities outside academics that show your interests and leadership."
      />

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-3">
            {activities.length > 1 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm font-medium text-muted-foreground">
                  Activity {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeActivity(activity.id)}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Remove
                </Button>
              </div>
            )}

            <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-medium text-foreground">Activity</label>
                <Input
                  placeholder="e.g. Football, Debate Club, College Fest Team"
                  className="h-10 md:h-11 rounded-lg text-sm"
                  value={activity.activity}
                  onChange={(e) => updateActivity(activity.id, "activity", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-medium text-foreground">Level</label>
                <Select
                  value={activity.level}
                  onValueChange={(value) => updateActivity(activity.id, "level", value)}
                >
                  <SelectTrigger className="h-10 md:h-11 rounded-lg text-sm">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-1 text-xs md:text-sm rounded-full"
        onClick={addActivity}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add activity
      </Button>

      <p className="text-[11px] text-muted-foreground">
        Adding extra‑curriculars is optional but helpful – it highlights your interests, teamwork, and leadership skills
        beyond academics.
      </p>
    </div>
  );
}

function StepLocationPreferences({
  state,
  onChange,
  onValidityChange,
}: {
  state: LocationPreferencesState;
  onChange: (next: LocationPreferencesState) => void;
  onValidityChange: (valid: boolean) => void;
}) {
  const { locationTypes, preferredLocations, hasLaptop } = state;
  const [locationSearch, setLocationSearch] = useState("");

  // Indian cities list
  const indianCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
    "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam",
    "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
    "Rajkot", "Varanasi", "Srinagar", "Amritsar", "Allahabad", "Ranchi", "Howrah", "Jabalpur",
    "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh",
    "Solapur", "Hubli", "Tiruchirappalli", "Mysore", "Tiruppur", "Bareilly", "Aligarh", "Moradabad",
    "Gurgaon", "Noida", "Greater Noida", "Faridabad", "Ghaziabad", "Dhanbad", "Bhubaneswar",
    "Coimbatore", "Kochi", "Dehradun", "Bikaner", "Amravati", "Nellore", "Guntur", "Warangal"
  ];

  const toggleLocationType = (type: string) => {
    const alreadySelected = locationTypes.includes(type);

    // Naye rules ke hisaab se fixed combinations:
    // - Remote click  -> ["remote"]
    // - Hybrid click  -> ["remote", "hybrid"]
    // - Onsite click  -> ["remote", "hybrid", "onsite"]
    // - Agar jo type already selected hai uspe dobara click karein -> sab clear

    if (alreadySelected) {
      onChange({ ...state, locationTypes: [] });
      return;
    }

    if (type === "remote") {
      onChange({ ...state, locationTypes: ["remote"] });
    } else if (type === "hybrid") {
      onChange({ ...state, locationTypes: ["remote", "hybrid"] });
    } else if (type === "onsite") {
      onChange({ ...state, locationTypes: ["remote", "hybrid", "onsite"] });
    }
  };

  const addLocation = (city: string) => {
    if (preferredLocations.length >= 5) return;
    if (!preferredLocations.includes(city)) {
      onChange({ ...state, preferredLocations: [...preferredLocations, city] });
      setLocationSearch("");
    }
  };

  const removeLocation = (city: string) => {
    onChange({
      ...state,
      preferredLocations: preferredLocations.filter((loc) => loc !== city),
    });
  };

  const filteredCities = indianCities.filter((city) =>
    city.toLowerCase().includes(locationSearch.toLowerCase())
  );

  useEffect(() => {
    const validLocationType = locationTypes.length > 0;
    const validLaptop = hasLaptop === "yes" || hasLaptop === "no";
    onValidityChange(validLocationType && validLaptop);
  }, [locationTypes, hasLaptop, onValidityChange]);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Location Preferences"
        subtitle="Help us match you with internships that fit your location preferences and availability."
      />

      <div className="space-y-3">
        <label className="text-xs md:text-sm font-medium text-foreground">
          Internship Location Types<span className="text-destructive ml-0.5">*</span>
          <span className="text-xs text-muted-foreground ml-2">(select at least one)</span>
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={locationTypes.includes("remote")}
              onCheckedChange={() => toggleLocationType("remote")}
            />
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>Remote</span>
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={locationTypes.includes("hybrid")}
              onCheckedChange={() => toggleLocationType("hybrid")}
            />
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Hybrid</span>
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={locationTypes.includes("onsite")}
              onCheckedChange={() => toggleLocationType("onsite")}
            />
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Onsite</span>
            </span>
          </label>
        </div>

      

        {locationTypes.length === 0 && (
          <p className="text-[11px] text-destructive">Please select at least one location type</p>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-xs md:text-sm font-medium text-foreground">
          Preferred Locations
          <span className="text-xs text-muted-foreground ml-2">(up to 5 cities)</span>
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full h-11 justify-between rounded-xl text-sm font-normal border-2 hover:border-[#0E6049]/50 transition-colors"
              disabled={preferredLocations.length >= 5}
            >
              <span className="text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {preferredLocations.length >= 5 ? "Maximum 5 locations selected" : "Search Indian cities..."}
              </span>
              <UploadCloud className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search cities..."
                value={locationSearch}
                onValueChange={setLocationSearch}
              />
              <CommandList>
                <CommandEmpty>No city found.</CommandEmpty>
                <CommandGroup>
                  {filteredCities.map((city) => (
                    <CommandItem
                      key={city}
                      value={city}
                      onSelect={() => addLocation(city)}
                      disabled={preferredLocations.includes(city) || preferredLocations.length >= 5}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          preferredLocations.includes(city) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {city}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {preferredLocations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {preferredLocations.map((city) => (
              <Badge
                key={city}
                variant="secondary"
                className="px-3 py-1.5 text-xs flex items-center gap-1.5 bg-[#0E6049]/10 text-[#0E6049] border border-[#0E6049]/20 hover:bg-[#0E6049]/20 transition-colors"
              >
                <MapPin className="w-3 h-3" />
                {city}
                <button
                  type="button"
                  onClick={() => removeLocation(city)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {preferredLocations.length === 0 && (
          <p className="text-[11px] text-muted-foreground">Select cities where you'd prefer to work</p>
        )}
      </div>

      <div className="space-y-3 p-4 rounded-xl border-2 border-border bg-card/50">
        <label className="text-xs md:text-sm font-medium text-foreground flex items-center gap-2">
          <Laptop className="w-4 h-4" />
          Do you have a laptop?
        </label>
        <RadioGroup
          value={hasLaptop}
          onValueChange={(value) => onChange({ ...state, hasLaptop: value })}
        >
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="laptop-yes" className="border-2" />
              <Label htmlFor="laptop-yes" className="text-sm font-normal cursor-pointer">
                Yes, I have a laptop
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="laptop-no" className="border-2" />
              <Label htmlFor="laptop-no" className="text-sm font-normal cursor-pointer">
                No, I don't have a laptop
              </Label>
            </div>
          </div>
        </RadioGroup>
        {!hasLaptop && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Some remote internships may require you to have your own laptop
          </p>
        )}
      </div>

    </div>
  );
}

function FinishOnboardingButton({
  aboutMe,
  academicsData,
  experienceData,
  skills,
  languagesData,
  extracurricularData,
  locationPrefs,
  onSuccess,
  isEditMode,
}: {
  aboutMe: AboutMeForm;
  academicsData: any;
  experienceData: any[];
  skills: SkillEntry[];
  languagesData: any[];
  extracurricularData: any[];
  locationPrefs: LocationPreferencesState;
  onSuccess: () => void;
  isEditMode: boolean;
}) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      // Get userId from localStorage (set during signup)
      let userId = localStorage.getItem("userId");
      console.log("handleFinish: Initial userId check:", userId);

      // If no userId, try to recover from email
      if (!userId) {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          console.log("Attempting to recover userId from email:", userEmail);
          try {
            const response = await apiRequest("GET", `/api/auth/user/by-email/${encodeURIComponent(userEmail)}`);
            const data = await response.json();
            if (data.user?.id) {
              userId = data.user.id;
              console.log("Successfully recovered userId:", userId);
              localStorage.setItem("userId", userId);
            }
          } catch (err) {
            console.error("Failed to recover userId:", err);
          }
        }
      }

      if (!userId) {
        console.error("UserId not found in localStorage. Available keys:", Object.keys(localStorage));
        toast({
          title: "User not found",
          description: "Please sign up first before completing onboarding. If you just signed up, try refreshing the page.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      console.log("Using userId for onboarding:", userId);

      const onboardingData = {
        userId,
        linkedinUrl: aboutMe.linkedinUrl || null,
        pinCode: null,
        state: aboutMe.state || null,
        city: aboutMe.city || null,
        aadhaarNumber: aboutMe.aadhaarNumber || null,
        panNumber: aboutMe.panNumber || null,
        bio: aboutMe.bio || null,
        experienceJson: experienceData || [],
        skills: skills || [],
        locationTypes: locationPrefs.locationTypes || [],
        preferredLocations: locationPrefs.preferredLocations || [],
        hasLaptop: locationPrefs.hasLaptop === "yes" ? true : locationPrefs.hasLaptop === "no" ? false : null,
        previewSummary: aboutMe.bio || "",
        extraData: {
          academics: academicsData,
          languages: languagesData,
          extracurricular: extracurricularData,
        },
      };

      console.log("Onboarding data to send:", onboardingData);
      console.log("locationTypes type:", typeof onboardingData.locationTypes);
      console.log("locationTypes value:", onboardingData.locationTypes);

      const response = await apiRequest("POST", "/api/onboarding", onboardingData);
      const result = await response.json();

      // Send document metadata to backend (intern_document table)
      if (aboutMe.profilePhoto || aboutMe.introVideo || aboutMe.aadhaarImage || aboutMe.panImage) {
        const documentsPayload = {
          userId,
          profilePhotoName: aboutMe.profilePhoto?.name,
          profilePhotoType: aboutMe.profilePhoto?.type,
          profilePhotoSize: aboutMe.profilePhoto?.size,
          introVideoName: aboutMe.introVideo?.name,
          introVideoType: aboutMe.introVideo?.type,
          introVideoSize: aboutMe.introVideo?.size,
          aadhaarImageName: aboutMe.aadhaarImage?.name,
          aadhaarImageType: aboutMe.aadhaarImage?.type,
          aadhaarImageSize: aboutMe.aadhaarImage?.size,
          panImageName: aboutMe.panImage?.name,
          panImageType: aboutMe.panImage?.type,
          panImageSize: aboutMe.panImage?.size,
        };

        console.log("Document metadata to send:", documentsPayload);

        try {
          const docRes = await apiRequest("POST", "/api/onboarding/documents", documentsPayload);
          const docJson = await docRes.json();
          console.log("Documents metadata saved:", docJson);
        } catch (docErr) {
          console.error("Failed to save documents metadata:", docErr);
        }
      }

      toast({
        title: isEditMode ? "Profile updated!" : "Onboarding completed!",
        description: "Your profile has been saved successfully.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Failed to save onboarding",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      type="button"
      className="px-6 text-xs md:text-sm rounded-full"
      style={{ backgroundColor: '#0E6049' }}
      onClick={handleFinish}
      disabled={isSaving}
    >
      {isSaving ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        isEditMode ? "Save Changes" : "Finish & View Opportunities"
      )}
    </Button>
  );
}

function StepProfilePreview({
  aboutMe,
  academicsData,
  experienceData,
  skills,
  languagesData,
  extracurricularData,
  locationPrefs,
}: {
  aboutMe: AboutMeForm;
  academicsData: any;
  experienceData: any[];
  skills: SkillEntry[];
  languagesData: any[];
  extracurricularData: any[];
  locationPrefs: LocationPreferencesState;
}) {
  const primarySkills = skills.slice(0, 6).map((s) => s.name);
  const locationSummary =
    locationPrefs.preferredLocations.length > 0
      ? locationPrefs.preferredLocations.join(", ")
      : aboutMe.city || "";

  const fullName = `${aboutMe.firstName || ""} ${aboutMe.lastName || ""}`.trim() || "Your Name";
  const contactPhone = aboutMe.phone ? `${aboutMe.phoneCountryCode} ${aboutMe.phone}` : "Phone";
  const contactEmail = aboutMe.email || "Email";
  const contactCity = locationSummary || aboutMe.city || "City";

  const introVideoPreview = aboutMe.introVideo ? URL.createObjectURL(aboutMe.introVideo) : null;

  const headline = aboutMe.bio
    ? aboutMe.bio.split("\n")[0].slice(0, 120)
    : "Student · Looking for internships";

  const locationLine = [aboutMe.city, aboutMe.state].filter(Boolean).join(", ") || contactCity;

  const educationText = academicsData
    ? `${academicsData.degree || ""}${academicsData.institution ? ` from ${academicsData.institution}` : ""}${academicsData.endYear ? ` (${academicsData.endYear})` : ""}`.trim()
    : "Your latest degree, college, graduation year and key academic details will show here.";

  const locationTypesText = locationPrefs.locationTypes.length > 0
    ? locationPrefs.locationTypes.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")
    : "";

  const hasLaptopText = locationPrefs.hasLaptop === "yes" ? "Yes" : locationPrefs.hasLaptop === "no" ? "No" : "";

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Profile Preview"
        subtitle="Here’s how your internship profile will look to companies once you complete onboarding."
      />

      <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.5fr] gap-4 md:gap-6">
        {/* Sidebar summary */}
        <div className="rounded-2xl bg-card/90 border border-card-border/80 text-foreground px-5 py-6 space-y-4">
          <div className="space-y-3">
            <div className="relative -mx-5 -mt-6 mb-2 h-44 rounded-t-2xl">
              <div className="relative h-full overflow-hidden rounded-t-2xl bg-black">
                {introVideoPreview ? (
                  <video
                    src={introVideoPreview}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    controls
                  />
                ) : (
                  <img
                    src={findternLogo}
                    alt="Findtern - Internship Simplified"
                    className="h-full w-full object-contain"
                  />
                )}

                <button
                  type="button"
                  className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm ring-1 ring-black/10"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

              <div className="absolute -bottom-12 left-5">
                {aboutMe.profilePhoto ? (
                  <img
                    src={URL.createObjectURL(aboutMe.profilePhoto)}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-4 border-background bg-background"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-4 border-background bg-background">
                    <span className="text-muted-foreground text-xs">Photo</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-14">
              <div className="">
                <div className="text-lg font-semibold leading-tight">{fullName}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{headline}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{locationLine}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="font-semibold uppercase tracking-[0.18em] text-[11px] mb-1.5">
                Contact
              </div>
              <p className="text-muted-foreground">
                {contactPhone} • {contactEmail}
              </p>
            </div>
            <div>
              <div className="font-semibold uppercase tracking-[0.18em] text-[11px] mb-1.5">
                Skills
              </div>
              <p className="text-muted-foreground">
                {primarySkills.length > 0
                  ? primarySkills.join(" · ")
                  : "A quick list of your key skills and strengths so companies can scan your profile fast."}
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="rounded-2xl bg-card/80 border border-card-border/80 px-5 py-6 space-y-4">
          <div>
            <h3 className="text-sm md:text-base font-semibold mb-1">Summary</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {aboutMe.bio
                ? aboutMe.bio
                : "Once you complete the steps, we’ll generate a clean summary that highlights your education, skills, and interests for recruiters."}
            </p>
          </div>

          <div>
            <h3 className="text-sm md:text-base font-semibold mb-1">Education</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{educationText}</p>
          </div>

          {experienceData && experienceData.length > 0 && (
            <div>
              <h3 className="text-sm md:text-base font-semibold mb-1">Experience</h3>
              <div className="space-y-2">
                {experienceData.map((exp, idx) => (
                  <div key={idx} className="text-xs md:text-sm text-muted-foreground">
                    <span className="font-medium">{exp.role}</span>
                    {exp.company && ` at ${exp.company}`}
                    {exp.from && exp.to && ` (${exp.from} - ${exp.to})`}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm md:text-base font-semibold mb-1">Location & Preferences</h3>
            <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
              {locationTypesText && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Location Types: {locationTypesText}</span>
                </div>
              )}
              {locationPrefs.preferredLocations.length > 0 && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Preferred: {locationPrefs.preferredLocations.join(", ")}</span>
                </div>
              )}
              {hasLaptopText && (
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4" />
                  <span>Laptop: {hasLaptopText}</span>
                </div>
              )}
            </div>
          </div>

          {extracurricularData && extracurricularData.length > 0 && (
            <div>
              <h3 className="text-sm md:text-base font-semibold mb-1">Extra-Curricular Activities</h3>
              <div className="space-y-1">
                {extracurricularData.map((act, idx) => (
                  <div key={idx} className="text-xs md:text-sm text-muted-foreground">
                    {act.activity} {act.level && `(${act.level})`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


