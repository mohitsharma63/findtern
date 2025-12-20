import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLocation, useRoute } from "wouter";
import { MapPin, ArrowLeft, Laptop, Globe } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type InternProfile = {
  id: string;
  initials: string;
  name: string;
  location: string;
  experience?: string;
  education?: string;
  availability?: string;
  stipend?: string;
  bio?: string;
  skills: string[];
  academics?: {
    college?: string;
    degree?: string;
    year?: string;
    cgpa?: string;
  };
  experienceItems: string[];
  preferences: {
    locationTypes: string[];
    preferredLocations: string[];
    hasLaptop: boolean;
  };
  languages: string[];
  profilePhotoName?: string | null;
};

export default function EmployerInternDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/employer/intern/:id");
  const internId = params?.id;
  const [loading, setLoading] = useState(true);
  const [intern, setIntern] = useState<InternProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!internId) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest("GET", "/api/interns");
        const json = await response.json();
        const list = (json?.interns || []) as any[];

        const match = list.find((item) => {
          const onboarding = item.onboarding ?? {};
          const user = item.user ?? {};
          const id = user.id ?? onboarding.userId ?? onboarding.id ?? "";
          return id === internId;
        });

        if (!match) {
          setIntern(null);
          return;
        }

        const onboarding = match.onboarding ?? {};
        const user = match.user ?? {};
        const documents = match.documents ?? {};

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

        const extra = onboarding.extraData ?? {};

        const profile: InternProfile = {
          id: internId,
          initials,
          name,
          location: locationParts || "",
          experience: extra.experience,
          education: extra.education,
          availability: extra.availability,
          stipend: extra.stipend,
          bio: extra.bio,
          skills,
          academics: {
            college: extra.academics?.college,
            degree: extra.academics?.degree,
            year: extra.academics?.year,
            cgpa: extra.academics?.cgpa,
          },
          experienceItems: Array.isArray(extra.experienceItems)
            ? extra.experienceItems
            : [],
          preferences: {
            locationTypes: Array.isArray(extra.locationTypes)
              ? extra.locationTypes
              : [],
            preferredLocations: Array.isArray(extra.preferredLocations)
              ? extra.preferredLocations
              : [],
            hasLaptop: !!extra.hasLaptop,
          },
          languages: Array.isArray(extra.languages)
            ? extra.languages
                .map((lang: any) => {
                  if (typeof lang === "string") return lang;
                  if (!lang || typeof lang !== "object") return "";

                  const name = lang.language ?? "";
                  const level = lang.level ?? "";
                  const read = lang.read ? "Read" : "";
                  const write = lang.write ? "Write" : "";
                  const speak = lang.speak ? "Speak" : "";

                  const modes = [read, write, speak].filter(Boolean).join("/");
                  const parts = [name, level].filter(Boolean).join(" (");

                  if (!name && !level && !modes) return "";

                  let label = name || level;
                  if (level && name) {
                    label = `${name} (${level})`;
                  }

                  if (modes) {
                    label = `${label} [${modes}]`;
                  }

                  return label;
                })
                .filter((v: string) => v && v.trim().length > 0)
            : [],
          profilePhotoName: documents.profilePhotoName ?? null,
        };

        setIntern(profile);
      } catch (error) {
        console.error("Failed to load intern detail", error);
        setIntern(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [internId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <p className="text-lg font-semibold">Loading intern profile...</p>
        </Card>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <p className="text-lg font-semibold">Intern profile not found</p>
          <Button onClick={() => setLocation("/employer/dashboard")}>Back to candidates</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-slate-600"
            onClick={() => setLocation("/employer/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Summary header */}
        <Card className="p-6 md:p-8 rounded-2xl shadow-sm bg-white">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-16 h-16">
              <Avatar className="w-16 h-16 rounded-2xl">
                {intern.profilePhotoName ? (
                  <AvatarImage
                    src={`/uploads/${intern.profilePhotoName}`}
                    alt={intern.name}
                  />
                ) : null}
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-2xl font-bold">
                  {intern.initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-2xl font-semibold text-slate-900">{intern.name}</h1>
              <p className="flex items-center gap-1 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-red-400" />
                {intern.location}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {intern.experience && (
                  <Badge variant="outline" className="border-slate-200 bg-slate-50">
                    {intern.experience}
                  </Badge>
                )}
                {intern.education && (
                  <Badge variant="outline" className="border-slate-200 bg-slate-50">
                    {intern.education}
                  </Badge>
                )}
                {intern.availability && (
                  <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                    Availability: {intern.availability}
                  </Badge>
                )}
                {intern.stipend && (
                  <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                    Expected stipend: {intern.stipend}
                  </Badge>
                )}
              </div>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed max-w-2xl">
                {intern.bio || "No summary added yet."}
              </p>
            </div>
          </div>
        </Card>

        {/* Main profile sections */}
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1.1fr] gap-4 md:gap-6">
          <div className="space-y-4 md:space-y-6">
            {/* Skills */}
            <Card className="p-4 md:p-5 bg-white/90 rounded-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm md:text-base font-semibold text-slate-900">Skills & Tools</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {intern.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-xs px-2.5 py-1 rounded-full border-slate-200 bg-slate-50 text-slate-700"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Academics */}
            <Card className="p-4 md:p-5 bg-white/90 rounded-2xl">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Academics</h2>
              {intern.academics && (
                <>
                  <p className="text-sm font-medium text-slate-800">{intern.academics.degree}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{intern.academics.college}</p>
                </>
              )}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                {intern.academics?.year && (
                  <Badge variant="outline" className="border-slate-200 bg-slate-50">
                    {intern.academics.year}
                  </Badge>
                )}
                {intern.academics?.cgpa && (
                  <Badge variant="outline" className="border-slate-200 bg-slate-50">
                    CGPA: {intern.academics.cgpa}
                  </Badge>
                )}
              </div>
            </Card>

            {/* Experience */}
            <Card className="p-4 md:p-5 bg-white/90 rounded-2xl">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Experience & Projects</h2>
              <ul className="mt-1 space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                {intern.experienceItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Right column: preferences / languages */}
          <div className="space-y-4 md:space-y-6">
            {/* Location & work preferences */}
            <Card className="p-4 md:p-5 bg-white/90 rounded-2xl">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-3">Location & Work Preferences</h2>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 mt-0.5 text-emerald-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Preferred work mode</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {intern.preferences.locationTypes.map((type) => (
                        <Badge
                          key={type}
                          variant="outline"
                          className="text-xs px-2 py-1 rounded-full border-slate-200 bg-slate-50"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {intern.preferences.preferredLocations.length > 0 && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-red-400" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Preferred locations</p>
                      <p className="mt-1 text-sm text-slate-700">
                        {intern.preferences.preferredLocations.join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <Laptop className="w-4 h-4 mt-0.5 text-emerald-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Device</p>
                    <p className="mt-1 text-sm text-slate-700">
                      {intern.preferences.hasLaptop ? "Has personal laptop" : "Needs system support"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Languages */}
            <Card className="p-4 md:p-5 bg-white/90 rounded-2xl">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Languages</h2>
              {intern.languages.length > 0 ? (
                <ul className="space-y-1 text-sm text-slate-700">
                  {intern.languages.map((lang) => (
                    <li key={lang}>{lang}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">Languages not specified.</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
