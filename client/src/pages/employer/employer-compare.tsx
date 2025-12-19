import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Users, Sparkles, Star, MapPin, ShoppingCart, ExternalLink } from "lucide-react";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";
import { apiRequest } from "@/lib/queryClient";

type AiRatings = {
  communication: number;
  coding: number;
  aptitude: number;
  interview: number;
};

type CompareCandidate = {
  id: string;
  initials: string;
  title: string;
  location: string;
  findternScore: number;
  matchPercentage: number;
  experience?: string;
  education?: string;
  availability?: string;
  stipend?: string;
  skills: string[];
  topMatchSkills: string[];
  aiRatings: AiRatings;
};

export default function EmployerComparePage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<CompareCandidate[]>([]);

  // Load selected compare ids from localStorage
  useEffect(() => {
    try {
      const storedRaw = window.localStorage.getItem("employerCompareIds");
      const stored: string[] = storedRaw ? JSON.parse(storedRaw) : [];
      setCompareIds(Array.isArray(stored) ? stored.slice(0, 5) : []);
    } catch {
      setCompareIds([]);
    }
  }, []);

  // Fetch interns and map to compare candidates
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest("GET", "/api/interns");
        const json = await response.json();
        const list = (json?.interns || []) as any[];

        const mapped: CompareCandidate[] = list.map((item) => {
          const onboarding = item.onboarding ?? {};
          const user = item.user ?? {};

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
          const title = fullFromUser || onboarding.extraData?.fullName || onboarding.extraData?.name || "Intern";
          const initials = (title || "I")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((p: string) => p[0]?.toUpperCase() ?? "")
            .join("") || "IN";

          const extra = onboarding.extraData ?? {};
          const ratings = extra.ratings ?? {};

          return {
            id: user.id ?? onboarding.userId ?? onboarding.id ?? "",
            initials,
            title,
            location: locationParts || "",
            findternScore: extra.findternScore ?? 0,
            matchPercentage: extra.matchPercentage ?? 0,
            experience: extra.experience,
            education: extra.education,
            availability: extra.availability,
            stipend: extra.stipend,
            skills,
            topMatchSkills: extra.topMatchSkills ?? skills.slice(0, 3),
            aiRatings: {
              communication: ratings.communication ?? 0,
              coding: ratings.coding ?? 0,
              aptitude: ratings.aptitude ?? 0,
              interview: ratings.interview ?? 0,
            },
          };
        });

        setCandidates(mapped);
      } catch (error) {
        console.error("Failed to load interns for compare page", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedCandidates = useMemo(
    () =>
      candidates
        .filter((c) => compareIds.includes(c.id))
        .slice(0, 5),
    [candidates, compareIds],
  );

  const topMatchId = selectedCandidates.length
    ? selectedCandidates.reduce((best, current) =>
        current.matchPercentage > best.matchPercentage ? current : best,
      selectedCandidates[0]).id
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => setLocation("/employer/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src={findternLogo} alt="Findtern" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-emerald-700">FINDTERN</span>
                <span className="text-xs text-slate-400 ml-1.5">INTERNSHIP SIMPLIFIED</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span>Employer</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-700">Compare Profiles</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                Compare Profiles
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 rounded-full text-xs font-semibold">
                  Beta
                </Badge>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Side-by-side view of shortlisted candidates you selected from the dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Area - dynamic side-by-side layout */}
        <Card className="p-4 md:p-6 border-0 shadow-lg rounded-3xl bg-white/90">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>
                {selectedCandidates.length > 0
                  ? `Comparing ${selectedCandidates.length} profile${selectedCandidates.length > 1 ? "s" : ""}`
                  : "No profiles selected for comparison yet"}
              </span>
            </div>
            <Badge variant="outline" className="hidden md:inline-flex rounded-full text-xs px-3 py-1 border-emerald-200 text-emerald-700 bg-emerald-50">
              Up to 5 profiles can be compared in production
            </Badge>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[720px] grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {selectedCandidates.map((candidate) => {
                const isTopMatch = topMatchId && candidate.id === topMatchId;
                return (
                <div
                  key={candidate.id}
                  className={`relative rounded-2xl border bg-gradient-to-b from-slate-50/80 to-white transition-all flex flex-col ${
                    isTopMatch
                      ? "border-emerald-300 shadow-lg shadow-emerald-100 scale-[1.02]"
                      : "border-slate-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  {isTopMatch && (
                    <div className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-semibold text-white shadow-md">
                      <Sparkles className="w-3 h-3" />
                      <span>Top match</span>
                    </div>
                  )}
                  {/* Header */}
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg font-bold text-white">
                        {candidate.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {candidate.title}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-red-400" />
                          {candidate.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                        <Star className="w-3 h-3 text-amber-400" />
                        <span>{candidate.findternScore.toFixed(1)}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                        {candidate.matchPercentage}% role match
                      </p>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 px-4 pt-4 text-xs">
                    <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 px-3 py-2">
                      <p className="text-[11px] text-emerald-700 font-medium">Experience</p>
                      <p className="mt-0.5 text-[11px] text-slate-800">{candidate.experience || "—"}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                      <p className="text-[11px] text-slate-600 font-medium">Education</p>
                      <p className="mt-0.5 text-[11px] text-slate-800">{candidate.education || "—"}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                      <p className="text-[11px] text-slate-600 font-medium">Availability</p>
                      <p className="mt-0.5 text-[11px] text-slate-800">{candidate.availability || "—"}</p>
                    </div>
                    <div className="rounded-xl bg-amber-50/70 border border-amber-100 px-3 py-2">
                      <p className="text-[11px] text-amber-700 font-medium">Expected stipend</p>
                      <p className="mt-0.5 text-[11px] text-slate-800">{candidate.stipend || "—"}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="px-4 pt-4">
                    <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1.5">
                      <Star className="w-3 h-3 text-amber-400" />
                      Skills overview
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {candidate.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 rounded-full border-slate-200 ${
                            candidate.topMatchSkills.includes(skill)
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      {candidate.topMatchSkills.length} strong match skill
                      {candidate.topMatchSkills.length > 1 ? "s" : ""} for this role
                    </p>
                  </div>

                  {/* AI Ratings */}
                  <div className="px-4 pt-4 pb-3 mt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-700 mb-2">
                      AI interview ratings (out of 10)
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5">
                        <span>Communication</span>
                        <span className="font-semibold text-emerald-700">{candidate.aiRatings.communication}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5">
                        <span>Coding</span>
                        <span className="font-semibold text-emerald-700">{candidate.aiRatings.coding}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5">
                        <span>Aptitude</span>
                        <span className="font-semibold text-emerald-700">{candidate.aiRatings.aptitude}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5">
                        <span>Overall interview</span>
                        <span className="font-semibold text-emerald-700">{candidate.aiRatings.interview}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions - static for now */}
                  <div className="px-4 pb-4 pt-2 flex items-center gap-2 border-t border-slate-100 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 rounded-full text-emerald-700 hover:bg-emerald-50 text-[11px] font-medium"
                      onClick={() => setLocation(`/employer/intern/${candidate.id}`)}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-full border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 text-[11px] font-medium"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              );})}
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] md:text-xs text-slate-500 text-center md:text-left">
              This is a static design preview. In the live product, profiles you select from the dashboard will appear
              here automatically.
            </p>
            <Button
              variant="outline"
              className="rounded-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-9 px-4 text-xs md:text-sm"
              onClick={() => setLocation("/employer/dashboard")}
            >
              Back to candidates
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
