export type EmployerAuth = {
  id: string;
  companyEmail: string;
  setupCompleted: boolean;
  onboardingCompleted: boolean;
  name?: string;
  companyName?: string;
};

const STORAGE_KEY = "employerAuth";

export function saveEmployerAuth(employer: any) {
  if (!employer || !employer.id) return;
  const payload: EmployerAuth = {
    id: employer.id,
    companyEmail: employer.companyEmail,
    setupCompleted: employer.setupCompleted ?? false,
    onboardingCompleted: employer.onboardingCompleted ?? false,
    name: employer.name,
    companyName: employer.companyName,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }
}

export function getEmployerAuth(): EmployerAuth | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EmployerAuth;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearEmployerAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
