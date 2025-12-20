 
import type { FC } from "react";
import { Mail, Linkedin, IdCard, MapPin, Laptop, Settings2, Phone, BookOpen, Sparkles, Languages } from "lucide-react";

type UserSummary = {
  name?: string;
  phone?: string;
  email?: string;
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
};

type OnboardingExperience = {
  company?: string;
  role?: string;
  location?: string;
  period?: string;
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

interface ProfileResumeProps {
  user: UserSummary;
  onboarding: OnboardingData | null;
}

const ProfileResume: FC<ProfileResumeProps> = ({ user, onboarding }) => {
  const fullName = user?.name || "";
  const title = onboarding?.extraData?.academics?.degree || "";

  const city = onboarding?.city || "";
  const state = onboarding?.state || "";
  const pin = onboarding?.pinCode || "";
  const addressLine = [city, state, pin].filter(Boolean).join(", ");

  const phone = user?.phone || "";
  const email = user?.email || "";

  const skills = onboarding?.skills ?? [];
  const languages = onboarding?.extraData?.languages ?? [];
  const academics = onboarding?.extraData?.academics;
  const experiences = (onboarding?.experienceJson as OnboardingExperience[] | undefined) ?? [];

  const summary = onboarding?.previewSummary || onboarding?.bio || "";
  const locationTypes = onboarding?.locationTypes ?? [];
  const preferredLocations = onboarding?.preferredLocations ?? [];
  const hasLaptop = onboarding?.hasLaptop;
  const extracurricular = onboarding?.extraData?.extracurricular ?? [];

  const displayNameLines = fullName
    ? fullName.split(" ")
    : ["",""].filter(Boolean);

  const displayLanguages = languages.map((l) => l.language).filter(Boolean);

  return (
    <div className="w-full flex justify-center bg-muted/40 py-8 px-4">
      <div className="w-full max-w-5xl bg-white shadow-md flex overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-1/3 bg-neutral-100 border-r border-neutral-200 flex flex-col">
          {/* Photo */}
          <div className="bg-neutral-900 px-8 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-neutral-700" />
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-400">Profile</div>
          </div>

          <div className="flex-1 px-8 py-8 space-y-8 text-sm text-neutral-800">
            {/* Links */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold tracking-[0.25em] text-neutral-500 uppercase">
                Links
              </h3>
              <div className="h-px bg-neutral-300" />
              <div className="space-y-2 text-[13px] leading-relaxed break-all">
                {onboarding?.linkedinUrl && (
                  <div className="flex items-start gap-2">
                    <Linkedin className="h-3.5 w-3.5 mt-[2px] text-neutral-500" />
                    <div>
                      <span className="font-semibold">LinkedIn:</span>
                      <br />
                      {onboarding.linkedinUrl}
                    </div>
                  </div>
                )}
                {email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-3.5 w-3.5 mt-[2px] text-neutral-500" />
                    <div>
                      <span className="font-semibold">Email:</span>
                      <br />
                      {email}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* IDs */}
            {(onboarding?.aadhaarNumber || onboarding?.panNumber) && (
              <section className="space-y-3">
                <h3 className="text-xs font-semibold tracking-[0.25em] text-neutral-500 uppercase">
                  IDs
                </h3>
                <div className="h-px bg-neutral-300" />
                <div className="space-y-1 text-[13px] leading-relaxed">
                  {onboarding?.aadhaarNumber && (
                    <div className="flex items-center gap-2">
                      <IdCard className="h-3.5 w-3.5 text-neutral-500" />
                      <span>Aadhaar: {onboarding.aadhaarNumber}</span>
                    </div>
                  )}
                  {onboarding?.panNumber && (
                    <div className="flex items-center gap-2">
                      <IdCard className="h-3.5 w-3.5 text-neutral-500" />
                      <span>PAN: {onboarding.panNumber}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Preferences */}
            {(locationTypes.length > 0 || preferredLocations.length > 0 || hasLaptop !== undefined) && (
              <section className="space-y-3">
                <h3 className="text-xs font-semibold tracking-[0.25em] text-neutral-500 uppercase">
                  Preferences
                </h3>
                <div className="h-px bg-neutral-300" />
                <div className="space-y-2 text-[13px] leading-relaxed">
                  {locationTypes.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Settings2 className="h-3.5 w-3.5 mt-[2px] text-neutral-500" />
                      <div>
                        <span className="font-semibold">Work Modes:</span>
                        <br />
                        {locationTypes.join(", ")}
                      </div>
                    </div>
                  )}
                  {preferredLocations.length > 0 && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 mt-[2px] text-neutral-500" />
                      <div>
                        <span className="font-semibold">Preferred Locations:</span>
                        <br />
                        {preferredLocations.join(", ")}
                      </div>
                    </div>
                  )}
                  {hasLaptop !== undefined && (
                    <div className="flex items-center gap-2">
                      <Laptop className="h-3.5 w-3.5 text-neutral-500" />
                      <span>
                        <span className="font-semibold">Has Laptop:</span> {hasLaptop ? "Yes" : "No"}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="w-2/3 px-10 py-10 space-y-10">
          {/* Header */}
          <header className="flex justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-[0.25em] uppercase leading-tight">
                {displayNameLines[0] || ""}
                {displayNameLines[1] && (
                  <>
                    <br />
                    {displayNameLines.slice(1).join(" ")}
                  </>
                )}
              </h1>
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
                {experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6"
                  >
                    <div className="space-y-1">
                      {exp.company && <div className="font-semibold">{exp.company}</div>}
                      {exp.location && (
                        <div className="text-neutral-600">{exp.location}</div>
                      )}
                      {exp.period && (
                        <div className="text-neutral-500 text-xs">{exp.period}</div>
                      )}
                    </div>
                    <div className="space-y-1">
                      {exp.role && <div className="font-semibold">{exp.role}</div>}
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                          {exp.bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
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

            <div className="grid grid-cols-3 gap-6 text-[13px] text-neutral-800">
              {(displayLanguages.length > 0 ? displayLanguages : []).map((lang) => (
                <div key={lang}>{lang.toUpperCase()}</div>
              ))}
            </div>
          </section>

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
                    return <div key={index}>• {item}</div>;
                  }
                  if (item && typeof item === "object") {
                    const anyItem = item as { title?: string; description?: string };
                    return (
                      <div key={index} className="space-y-0.5">
                        {anyItem.title && (
                          <div className="font-semibold">{anyItem.title}</div>
                        )}
                        {anyItem.description && <div>{anyItem.description}</div>}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfileResume;

