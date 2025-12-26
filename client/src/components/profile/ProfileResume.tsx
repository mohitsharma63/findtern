import { useEffect, useState, type FC } from "react";
import { Mail, Linkedin, IdCard, MapPin, Laptop, Phone, BookOpen, Sparkles, Languages, Pencil } from "lucide-react";
import findternLogo from "@assets/logo.jpg";

type User = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  countryCode?: string | null;
  phoneNumber?: string | null;
  role?: string | null;
};

type OnboardingSkill = { id: string; name: string; rating?: number };

type OnboardingLanguage = {
  id: string;
  language: string;
  level?: string;
  read?: string;
  write?: string;
  speak?: string;
};

type OnboardingAcademics = {
  level?: string;
  score?: string;
  degree?: string;
  status?: string;
  endYear?: string;
  scoreType?: string;
  startYear?: string;
  institution?: string;
  specialization?: string;
  professionalCourses?: {
    id?: string;
    courseType?: string;
    title?: string;
    level?: string;
    status?: string;
    institution?: string;
    scoreType?: string;
    score?: string;
    issueDate?: string;
    startDate?: string;
    endDate?: string;
    duration?: string;
    certificateUploads?: { name: string; type: string; size: number }[];
  }[];
  certifications?: {
    id?: string;
    certificateName?: string;
    institution?: string;
    scoreType?: string;
    score?: string;
    issueDate?: string;
    duration?: string;
    certificateUploads?: { name: string; type: string; size: number }[];
  }[];
};

type OnboardingExperience = {
  id?: string;
  company?: string;
  role?: string;
  location?: string;
  period?: string;
  from?: string;
  to?: string;
  description?: string;
  bullets?: string[];
};

type OnboardingData = {
  linkedinUrl?: string | null;
  pinCode?: string | null;
  state?: string | null;
  city?: string | null;
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  experienceJson?: OnboardingExperience[];
  skills?: OnboardingSkill[];
  bio?: string | null;
  previewSummary?: string | null;
  locationTypes?: string[];
  preferredLocations?: string[];
  hasLaptop?: boolean;
  extraData?: {
    academics?: OnboardingAcademics;
    languages?: OnboardingLanguage[];
    extracurricular?: unknown[];
  };
};

type MediaKey = "profilePhoto" | "introVideo" | "aadhaarImage" | "panImage";

const openOnboardingMediaDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("findternOnboarding", 1);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("media")) {
        db.createObjectStore("media", { keyPath: "key" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const loadMediaFromDb = async (key: MediaKey): Promise<File | null> => {
  try {
    const db = await openOnboardingMediaDb();
    const record = await new Promise<any | null>((resolve, reject) => {
      const tx = db.transaction("media", "readonly");
      const store = tx.objectStore("media");
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result ?? null);
      };
      req.onerror = () => reject(req.error);
    });

    db.close();

    const blob = record?.blob;
    if (!(blob instanceof Blob)) return null;

    return new File([blob], record?.name || key, {
      type: record?.type || blob.type || "application/octet-stream",
      lastModified: record?.lastModified || Date.now(),
    });
  } catch {
    return null;
  }
};

interface ProfileResumeProps {
  user: User | null;
  onboarding?: OnboardingData;
}

const ProfileResume: FC<ProfileResumeProps> = ({
  user,
  onboarding,
}) => {
  const fullName = `${(user?.firstName ?? "").trim()} ${(user?.lastName ?? "").trim()}`.trim();
  const title = onboarding?.extraData?.academics?.degree || "";

  const city = onboarding?.city || "";
  const state = onboarding?.state || "";
  const pin = onboarding?.pinCode || "";
  const addressLine = [city, state, pin].filter(Boolean).join(", ");

  const phone = [user?.countryCode, user?.phoneNumber].filter(Boolean).join(" ").trim();
  const email = (user?.email ?? "").trim();

  const skills = onboarding?.skills ?? [];
  const languages = onboarding?.extraData?.languages ?? [];
  const academics = onboarding?.extraData?.academics;
  const experiences = (onboarding?.experienceJson as OnboardingExperience[] | undefined) ?? [];

  const summary = onboarding?.previewSummary || onboarding?.bio || "";
  const locationTypes = onboarding?.locationTypes ?? [];
  const preferredLocations = onboarding?.preferredLocations ?? [];
  const hasLaptop = onboarding?.hasLaptop;
  const extracurricular = onboarding?.extraData?.extracurricular ?? [];

  const linkedinUrl = (onboarding?.linkedinUrl ?? "").trim();

  const maskedAadhaar = (() => {
    const raw = (onboarding?.aadhaarNumber ?? "").replace(/\s+/g, "");
    if (!raw) return "";
    const last4 = raw.slice(-4);
    return `XXXX-XXXX-${last4}`;
  })();

  const maskedPan = (() => {
    const raw = (onboarding?.panNumber ?? "").trim();
    if (!raw) return "";
    if (raw.length <= 4) return raw;
    return `${raw.slice(0, 2)}XXXXX${raw.slice(-2)}`;
  })();

  const headline = summary
    ? summary.split("\n")[0].slice(0, 120)
    : title
      ? title
      : "Student · Looking for internships";

  const displayNameLines = fullName
    ? fullName.split(" ")
    : ["", ""].filter(Boolean);

  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [introVideoUrl, setIntroVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let lastProfileUrl: string | null = null;
    let lastIntroUrl: string | null = null;

    (async () => {
      const [profileFile, introFile] = await Promise.all([
        loadMediaFromDb("profilePhoto"),
        loadMediaFromDb("introVideo"),
      ]);
      if (!active) return;

      if (profileFile) {
        const url = URL.createObjectURL(profileFile);
        lastProfileUrl = url;
        setProfilePhotoUrl(url);
      } else {
        setProfilePhotoUrl(null);
      }

      if (introFile) {
        const url = URL.createObjectURL(introFile);
        lastIntroUrl = url;
        setIntroVideoUrl(url);
      } else {
        setIntroVideoUrl(null);
      }
    })();

    return () => {
      active = false;
      if (lastProfileUrl) URL.revokeObjectURL(lastProfileUrl);
      if (lastIntroUrl) URL.revokeObjectURL(lastIntroUrl);
    };
  }, []);

  return (
    <div className="w-full flex justify-center bg-muted/40 py-8 px-4">
      <div className="w-full max-w-5xl">
        <div className="rounded-2xl bg-white shadow-md overflow-hidden border border-neutral-200">
          <div
            className={`relative w-full bg-black ${introVideoUrl ? "aspect-[16/9]" : "h-48 md:h-64"}`}
          >
            {introVideoUrl ? (
              <video
                src={introVideoUrl}
                className="absolute inset-0 h-full w-full object-contain"
                muted
                playsInline
                controls
              />
            ) : (
              <img
                src={findternLogo}
                alt="Findtern - Internship Simplified"
                className="absolute inset-0 h-full w-full object-contain p-6"
              />
            )}

            <div className="absolute -bottom-12 left-6">
              <div className="h-28 w-28 rounded-full border-4 border-white bg-neutral-200 flex items-center justify-center overflow-hidden">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={fullName || "Profile photo"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-neutral-600 text-xs font-medium">
                    {(fullName || "Photo").slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

      
          <div className="border-t border-neutral-200 px-10 py-10 space-y-10">
          {/* Header */}
          <header className="flex justify-between gap-8">
            <div className="space-y-2">
              <h4 className="text-4xl font-semibold tracking-[0.25em] uppercase leading-tight">
                {displayNameLines[0] || ""}
                {displayNameLines[1] && (
                  <>
                    <br />
                    {displayNameLines.slice(1).join(" ")}
                  </>
                )}
              </h4>
              {title && (
                <div className="text-sm tracking-[0.3em] uppercase text-neutral-500 truncate max-w-xs">
                  {title}
                </div>
              )}
            </div>
            <div className="text-[13px] leading-relaxed text-neutral-700 space-y-1 text-right max-w-xs">
              {addressLine && (
                <div className="flex items-start gap-2 justify-end">
                  <span className="text-neutral-500 mt-[2px]">
                    <MapPin className="h-3.5 w-3.5 inline" />
                  </span>
                  <span>{addressLine}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-neutral-500">
                    <Phone className="h-3.5 w-3.5 inline" />
                  </span>
                  <span>{phone}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-neutral-500">
                    <Mail className="h-3.5 w-3.5 inline" />
                  </span>
                  <span>{email}</span>
                </div>
              )}
              {linkedinUrl && (
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-neutral-500">
                    <Linkedin className="h-3.5 w-3.5 inline" />
                  </span>
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-[#0E6049] hover:underline"
                  >
                    {linkedinUrl}
                  </a>
                </div>
              )}
            </div>
          </header>

          {/* Summary / Bio */}
          {summary && (
            <section className="space-y-3 text-[13px] text-neutral-800">
              <div className="flex items-center gap-4">
                <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-600">
                  Summary
                </h2>
                <div className="flex-1 h-px bg-neutral-300" />
              </div>
              <p className="leading-relaxed whitespace-pre-line">{summary}</p>
            </section>
          )}

          {/* Work Experience */}
          {experiences.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-600">
                  Work Experience
                </h2>
                <div className="flex-1 h-px bg-neutral-300" />
              </div>

              <div className="space-y-6 text-[13px] text-neutral-800">
                {experiences.map((exp, idx) => {
                  const period = exp.period || [exp.from, exp.to].filter(Boolean).join(" - ");
                  const bullets =
                    Array.isArray(exp.bullets) && exp.bullets.length > 0
                      ? exp.bullets
                      : exp.description
                        ? [exp.description]
                        : [];

                  return (
                  <div
                    key={exp.id || idx}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6"
                  >
                    <div className="space-y-1">
                      {exp.company && <div className="font-semibold">{exp.company}</div>}
                      {exp.location && (
                        <div className="text-neutral-600">{exp.location}</div>
                      )}
                      {period && <div className="text-neutral-500 text-xs">{period}</div>}
                    </div>
                    <div className="space-y-1">
                      {exp.role && <div className="font-semibold">{exp.role}</div>}
                      {bullets.length > 0 && (
                        <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                          {bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Education */}
          {academics && (
            <section className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-neutral-500" />
                  <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-600">
                    Education
                  </h2>
                </div>
                <div className="flex-1 h-px bg-neutral-300" />
              </div>

              <div className="text-[13px] text-neutral-800">
                <div className="grid grid-cols-[minmax(0,1.4fr)_auto_minmax(0,2fr)] gap-6 items-start">
                  {/* Left side: institution / location / year */}
                  <div className="space-y-1 text-right pr-2">
                    {academics.institution && (
                      <div className="font-semibold uppercase tracking-wide">
                        {academics.institution}
                      </div>
                    )}
                    {city && <div className="text-neutral-600">{city}</div>}
                    {academics.endYear && (
                      <div className="text-neutral-500 text-xs">{academics.endYear}</div>
                    )}
                  </div>

                  {/* Center timeline line + dot */}
                  <div className="flex flex-col items-center h-full">
                    <div className="w-px flex-1 bg-neutral-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                    <div className="w-px flex-1 bg-neutral-300" />
                  </div>

                  {/* Right side: degree / details */}
                  <div className="space-y-1 pl-2">
                    {(academics.degree || academics.level) && (
                      <div className="font-semibold">
                        {academics.degree || academics.level}
                      </div>
                    )}
                    <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                      {academics.status && <li>Status: {academics.status}</li>}
                      {academics.startYear && <li>Start Year: {academics.startYear}</li>}
                      {academics.score && academics.scoreType && (
                        <li>
                          Score: {academics.score} ({academics.scoreType})
                        </li>
                      )}
                      {academics.specialization && academics.specialization.trim() !== "" && (
                        <li>Specialization: {academics.specialization}</li>
                      )}
                    </ul>
                  </div>
                </div>

                {Array.isArray(academics.professionalCourses) && academics.professionalCourses.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-600">
                        Professional Courses
                      </h3>
                      <div className="flex-1 h-px bg-neutral-300" />
                    </div>

                    <div className="space-y-4 text-[13px] text-neutral-800">
                      {academics.professionalCourses.map((c, idx) => {
                        const title = (c.title ?? "").trim();
                        const inst = (c.institution ?? "").trim();
                        const status = (c.status ?? "").trim();
                        const issueDate = (c.issueDate ?? "").trim();
                        const endDate = (c.endDate ?? "").trim();
                        const duration = (c.duration ?? "").trim();
                        const score = (c.score ?? "").trim();
                        const scoreType = (c.scoreType ?? "").trim();
                        const uploadsCount = Array.isArray(c.certificateUploads) ? c.certificateUploads.length : 0;

                        if (!title && !inst && !status && !issueDate && !endDate && !duration && !score) return null;

                        return (
                          <div
                            key={c.id || `${title}-${idx}`}
                            className="grid grid-cols-[minmax(0,1.4fr)_auto_minmax(0,2fr)] gap-6 items-start"
                          >
                            <div className="space-y-1 text-right pr-2">
                              <div className="font-semibold uppercase tracking-wide">
                                {inst || "INSTITUTION"}
                              </div>
                              {issueDate && <div className="text-neutral-500 text-xs">Issued: {issueDate}</div>}
                              {endDate && <div className="text-neutral-500 text-xs">End: {endDate}</div>}
                            </div>

                            <div className="flex flex-col items-center h-full">
                              <div className="w-px flex-1 bg-neutral-300" />
                              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                              <div className="w-px flex-1 bg-neutral-300" />
                            </div>

                            <div className="space-y-1 pl-2">
                              <div className="font-semibold">{title || "Course"}</div>
                              <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                                {status && <li>Status: {status}</li>}
                                {duration && <li>Duration: {duration}</li>}
                                {score && <li>Grades: {score}{scoreType ? ` (${scoreType})` : ""}</li>}
                                {uploadsCount > 0 && <li>Certificate uploaded: {uploadsCount} file(s)</li>}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {Array.isArray(academics.certifications) && academics.certifications.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-600">
                        Certifications
                      </h3>
                      <div className="flex-1 h-px bg-neutral-300" />
                    </div>

                    <div className="space-y-4 text-[13px] text-neutral-800">
                      {academics.certifications.map((cert, idx) => {
                        const name = (cert.certificateName ?? "").trim();
                        const inst = (cert.institution ?? "").trim();
                        const issueDate = (cert.issueDate ?? "").trim();
                        const duration = (cert.duration ?? "").trim();
                        const score = (cert.score ?? "").trim();
                        const scoreType = (cert.scoreType ?? "").trim();
                        const uploadsCount = Array.isArray(cert.certificateUploads) ? cert.certificateUploads.length : 0;

                        if (!name && !inst && !issueDate && !duration && !score) return null;

                        return (
                          <div
                            key={cert.id || `${name}-${idx}`}
                            className="grid grid-cols-[minmax(0,1.4fr)_auto_minmax(0,2fr)] gap-6 items-start"
                          >
                            <div className="space-y-1 text-right pr-2">
                              <div className="font-semibold uppercase tracking-wide">
                                {inst || "INSTITUTION"}
                              </div>
                              {issueDate && <div className="text-neutral-500 text-xs">Issued: {issueDate}</div>}
                            </div>

                            <div className="flex flex-col items-center h-full">
                              <div className="w-px flex-1 bg-neutral-300" />
                              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                              <div className="w-px flex-1 bg-neutral-300" />
                            </div>

                            <div className="space-y-1 pl-2">
                              <div className="font-semibold">{name || "Certification"}</div>
                              <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                                {duration && <li>Duration: {duration}</li>}
                                {score && <li>Grades: {score}{scoreType ? ` (${scoreType})` : ""}</li>}
                                {uploadsCount > 0 && <li>Certificate uploaded: {uploadsCount} file(s)</li>}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Preferred Locations timeline */}
          {preferredLocations.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                  <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-600">
                    Preferred Locations
                  </h2>
                </div>
                <div className="flex-1 h-px bg-neutral-300" />
              </div>

              <div className="text-[13px] text-neutral-800 space-y-4">
                {preferredLocations.map((loc, index) => (
                  <div
                    key={`${loc}-${index}`}
                    className="grid grid-cols-[minmax(0,1.4fr)_auto_minmax(0,2fr)] gap-6 items-start"
                  >
                    {/* Left city name */}
                    <div className="text-right pr-2">
                      <div className="font-medium">{loc}</div>
                    </div>

                    {/* Center line + dot (timeline) */}
                    <div className="flex flex-col items-center h-full">
                      <div className="w-px flex-1 bg-neutral-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                      <div className="w-px flex-1 bg-neutral-300" />
                    </div>

                    {/* Right label */}
                    <div className="pl-2 text-neutral-700">
                      <div className="font-semibold">Preferred Location</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(locationTypes.length > 0 || typeof hasLaptop === "boolean") && (
            <section className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Laptop className="h-3.5 w-3.5 text-neutral-500" />
                  <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-600">
                    Preferences
                  </h2>
                </div>
                <div className="flex-1 h-px bg-neutral-300" />
              </div>

              <div className="text-[13px] text-neutral-800 space-y-1">
                {locationTypes.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">
                      <MapPin className="h-3.5 w-3.5 inline" />
                    </span>
                    <span>Location Types: {locationTypes.join(", ")}</span>
                  </div>
                )}
                {typeof hasLaptop === "boolean" && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">
                      <Laptop className="h-3.5 w-3.5 inline" />
                    </span>
                    <span>Laptop: {hasLaptop ? "Yes" : "No"}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Skills */}
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
                <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-600">
                  Skills
                </h2>
              </div>
              <div className="flex-1 h-px bg-neutral-300" />
            </div>

            <div className="space-y-3 text-[13px] text-neutral-800">
              {(skills.length > 0 ? skills : []).map((s) => {
                const rating = s.rating ?? 0;
                const safeRating = Math.max(0, Math.min(5, rating));
                const widthPercent = `${(safeRating / 5) * 100}%`;

                return (
                  <div key={s.id} className="flex items-center gap-4">
                    <div className="w-32 shrink-0 truncate font-medium">{s.name}</div>
                    <div className="flex-1 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                      <div
                        className="h-full bg-neutral-800"
                        style={{ width: widthPercent }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Languages */}
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Languages className="h-3.5 w-3.5 text-neutral-500" />
                <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-600">
                  Languages
                </h2>
              </div>
              <div className="flex-1 h-px bg-neutral-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px] text-neutral-800">
              {(languages.length > 0 ? languages : []).map((lang) => {
                const flags = [
                  lang.read === "yes" ? "Read" : "",
                  lang.write === "yes" ? "Write" : "",
                  lang.speak === "yes" ? "Speak" : "",
                ].filter(Boolean);

                return (
                  <div key={lang.id} className="space-y-0.5">
                    <div className="font-semibold">
                      {(lang.language || "").toUpperCase()}
                      {lang.level ? <span className="font-normal text-neutral-600"> · {lang.level}</span> : null}
                    </div>
                    {flags.length > 0 ? (
                      <div className="text-neutral-600">{flags.join(" / ")}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          {(maskedAadhaar || maskedPan) && (
            <section className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <IdCard className="h-3.5 w-3.5 text-neutral-500" />
                  <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-600">
                    Identification
                  </h2>
                </div>
                <div className="flex-1 h-px bg-neutral-300" />
              </div>

              <div className="text-[13px] text-neutral-800 space-y-1">
                {maskedAadhaar && <div>Aadhaar: {maskedAadhaar}</div>}
                {maskedPan && <div>PAN: {maskedPan}</div>}
              </div>
            </section>
          )}

          {/* Extracurricular */}
          {Array.isArray(extracurricular) && extracurricular.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-600">
                  Extracurricular
                </h2>
                <div className="flex-1 h-px bg-neutral-300" />
              </div>

              <div className="text-[13px] text-neutral-800 space-y-1">
                {extracurricular.map((item, index) => {
                  if (typeof item === "string") {
                    return <div key={index}>{item}</div>;
                  }

                  if (item && typeof item === "object") {
                    const anyItem = item as { activity?: string; level?: string };
                    const activity = (anyItem.activity ?? "").trim();
                    const level = (anyItem.level ?? "").trim();
                    if (!activity && !level) return null;

                    return (
                      <div key={index} className="space-y-0.5">
                        <div className="font-semibold">{activity || "Activity"}</div>
                        {level ? <div className="text-neutral-600">Level: {level}</div> : null}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </section>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileResume;