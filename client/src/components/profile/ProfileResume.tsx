import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, FileText, Calendar } from "lucide-react";

type Props = {
  user: any;
  onboarding: any;
};

export default function ProfileResume({ user, onboarding }: Props) {
  const name = user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Candidate";
  const email = user?.email || user?.email || "";
  const phone = user?.phone || "";
  const location = user?.location || onboarding?.city ? `${onboarding?.city || ""}${onboarding?.state ? ", " + onboarding.state : ""}` : "";

  const skills = onboarding?.skills || user?.skills || [];
  const education = onboarding?.extraData?.academics;
  const experience = onboarding?.experienceJson || [];
  const languages = onboarding?.extraData?.languages || user?.languages || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
      <aside>
        <Card className="p-6 sticky top-6">
          <div className="flex flex-col items-center gap-4">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#0E6049] to-[#0E6049]/80 flex items-center justify-center text-white text-3xl font-extrabold shadow-md">
              {name.split(" ").map((n: string) => n?.[0] ?? "").join("").toUpperCase()}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-semibold">{name}</h1>
              {education?.degree && <p className="text-sm text-muted-foreground mt-1">{education.degree} • {education.institution}</p>}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3 text-sm">
            <div>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Contact</h3>
              <div className="mt-2 space-y-2">
                {phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>{phone}</span>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{email}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Button onClick={() => window.print()} className="w-full bg-[#0E6049] hover:bg-[#0b4b3a]">
                <FileText className="mr-2 h-4 w-4" />
                Print / Save as PDF
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills listed</p>}
              {skills.map((s: any, idx: number) => (
                <Badge key={s.id || idx} className="px-2 py-1 bg-muted/20">{s.name}</Badge>
              ))}
            </div>
          </div>
        </Card>
      </aside>

      <main>
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Summary</h2>
            <p className="mt-2 text-sm text-muted-foreground">{onboarding?.previewSummary || onboarding?.bio || "No summary available."}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold">Education</h2>
            {education ? (
              <div className="mt-3 text-sm space-y-1">
                <div className="font-medium">{education.degree} — {education.specialization || ""}</div>
                <div className="text-muted-foreground">{education.institution} — {education.startYear} — {education.endYear}</div>
                <div className="text-sm text-muted-foreground">Score: {education.score}{education.scoreType ? ` ${education.scoreType}` : ""}</div>
                {education.professionalCourses && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Professional Courses: </span>
                    <span>{education.professionalCourses}</span>
                  </div>
                )}
                {education.certificationCourses && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Certification Courses: </span>
                    <span>{education.certificationCourses}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">No education details.</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold">Experience</h2>
            {experience.length === 0 && <p className="text-sm text-muted-foreground mt-2">No experience listed.</p>}
            <ul className="mt-3 space-y-3">
              {experience.map((e: any, i: number) => (
                <li key={i} className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{e.role || e.title || "Role"}</div>
                    <div className="text-sm text-muted-foreground">{e.period || e.date || ""}</div>
                  </div>
                  {e.company && <div className="text-sm text-muted-foreground">{e.company}</div>}
                  {e.description && <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold">Languages & Activities</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Languages</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {languages.length === 0 && <li>No languages listed.</li>}
                  {languages.map((l: any, idx: number) => (
                    <li key={idx}>{l.name} — {l.level}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium">Extracurricular</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {(onboarding?.extraData?.extracurricular || []).length === 0 && <li>No activities listed.</li>}
                  {(onboarding?.extraData?.extracurricular || []).map((a: any, idx: number) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
