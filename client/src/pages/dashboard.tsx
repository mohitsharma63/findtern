import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  Lock,
  HelpCircle,
  Video,
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import ProfileResume from "@/components/profile/ProfileResume";
import { CandidateHeader } from "@/components/CandidateHeader";

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
  // Dynamic user + onboarding data
  const queryClient = useQueryClient();
  const storedUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const storedUserEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;

  const { data: onboardingResp } = useQuery<any>({
    queryKey: ["/api/onboarding", storedUserId],
    enabled: !!storedUserId,
    queryFn: async () => {
      if (!storedUserId) return null;
      const res = await fetch(`/api/onboarding/${storedUserId}`);
      if (!res.ok) throw new Error("Failed to fetch onboarding data");
      return res.json();
    },
  });

  const { data: userByEmailResp } = useQuery<any>({
    queryKey: ["/api/auth/user/by-email", storedUserEmail ? encodeURIComponent(storedUserEmail) : ""],
    enabled: !storedUserId && !!storedUserEmail,
    queryFn: async ({ queryKey }) => {
      const url = queryKey.join("/");
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user by email");
      return res.json();
    },
  });

  useEffect(() => {
    const recoveredUserId = userByEmailResp?.user?.id;
    if (!storedUserId && recoveredUserId) {
      localStorage.setItem("userId", recoveredUserId);
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] });
    }
  }, [queryClient, storedUserId, userByEmailResp?.user?.id]);

  const user = onboardingResp?.user || userByEmailResp?.user || null;
  const onboarding = onboardingResp?.onboarding || null;
  const documents = onboardingResp?.intern_document || null;

  const userName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const userInitials = (userName || "").split(" ").filter(Boolean).map((n) => n[0] ?? "").join("").toUpperCase();

  const documentRows: { label: string; name?: string | null; type?: string | null; size?: number | null }[] = [
    {
      label: "Profile photo",
      name: documents?.profilePhotoName,
      type: documents?.profilePhotoType,
      size: documents?.profilePhotoSize,
    },
    {
      label: "Intro video",
      name: documents?.introVideoName,
      type: documents?.introVideoType,
      size: documents?.introVideoSize,
    },
    {
      label: "Aadhaar",
      name: documents?.aadhaarImageName,
      type: documents?.aadhaarImageType,
      size: documents?.aadhaarImageSize,
    },
    {
      label: "PAN",
      name: documents?.panImageName,
      type: documents?.panImageType,
      size: documents?.panImageSize,
    },
  ];

  const hasAnyDocuments = documentRows.some((r) => !!r.name);

  return (
    <div className="min-h-screen bg-background">
      <CandidateHeader
        showAiInterviewButton
        showViewDocuments
        userInitials={userInitials || "U"}
        openToWork={openToWork}
        onOpenToWorkChange={setOpenToWork}
      />

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
        <div className="space-y-6">
          <ProfileResume user={user} onboarding={onboarding} />

          <Card className="p-6" id="documents">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Documents</div>
                <div className="text-xs text-muted-foreground">
                  These are the documents uploaded by you.
                </div>
              </div>
              <Button
                variant="outline"
                className="h-9 text-xs"
                onClick={() => setLocation("/onboarding?edit=1")}
              >
                Update
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {!hasAnyDocuments && (
                <div className="text-sm text-muted-foreground">
                  No documents uploaded yet.
                </div>
              )}

              {hasAnyDocuments && (
                <div className="space-y-2">
                  {documentRows
                    .filter((r) => !!r.name)
                    .map((r) => (
                      <div
                        key={r.label}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-card/40 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground">{r.label}</div>
                          <div className="text-xs text-muted-foreground truncate" title={r.name ?? ""}>
                            {r.name}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0 text-right">
                          {typeof r.size === "number" ? `${Math.round(r.size / 1024)} KB` : ""}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </Card>
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