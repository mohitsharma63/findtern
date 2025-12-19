import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, MapPin, Clock, Sparkles, Briefcase, MessageSquare } from "lucide-react";

const mockProposal = {
  id: "1",
  company: "sonu",
  role: "Data Analyst Intern",
  location: "Jaipur, Rajasthan · Onsite",
  duration: "Medium-Term (4-6 months)",
  stipend: "₹12,000 / month",
  status: "Awaiting your response",
  summary:
    "You have received a proposal for a Data Analyst internship role where you will work with dashboards, SQL queries, and business stakeholders.",
  responsibilities: [
    "Build and maintain weekly and monthly performance dashboards",
    "Clean and analyse operations and marketing datasets",
    "Work closely with the founding team to convert data into insights",
  ],
  requirements: [
    "Good understanding of SQL and Excel/Google Sheets",
    "Basic knowledge of any BI tool (Power BI, Tableau, or similar)",
    "Strong communication and curiosity to ask the right questions",
  ],
  aiRatings: {
    communication: 8,
    coding: 8,
    aptitude: 8,
    overall: 8,
  },
  skills: ["SQL", "Excel", "Power BI", "Data Cleaning", "Business Analytics"],
};

export default function ProposalDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/proposals/:id");
  const proposal = mockProposal; // for now ignore id and show single static proposal

  if (!proposal || params?.id !== "1") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <p className="text-lg font-semibold">Proposal not found</p>
          <Button onClick={() => setLocation("/proposals")}>Back to proposals</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/15 to-teal-50/30 px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-slate-600"
            onClick={() => setLocation("/proposals")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Header card */}
        <Card className="p-5 md:p-6 rounded-2xl bg-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-lg">
              {proposal.company[0]?.toUpperCase()}
            </div>
            <div className="flex-1 space-y-1.5">
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
                {proposal.role}
              </h1>
              <p className="text-sm text-slate-700 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-red-400" />
                {proposal.location}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  {proposal.duration}
                </Badge>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  Stipend: {proposal.stipend}
                </Badge>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                  {proposal.status}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
              <p className="text-[11px] text-slate-500">Static design preview</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1.1fr] gap-4 md:gap-6">
          {/* Left column */}
          <div className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-5 rounded-2xl bg-white/95">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm md:text-base font-semibold text-slate-900">Role summary</h2>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{proposal.summary}</p>
            </Card>

            <Card className="p-4 md:p-5 rounded-2xl bg-white/95">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">What you will work on</h2>
              <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                {proposal.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>

            <Card className="p-4 md:p-5 rounded-2xl bg-white/95">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">What the company expects</h2>
              <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                {proposal.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-5 rounded-2xl bg-white/95">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm md:text-base font-semibold text-slate-900">AI interview ratings</h2>
              </div>
              <div className="space-y-1.5 text-sm text-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span>Communication</span>
                  <span className="font-semibold text-emerald-700">{proposal.aiRatings.communication}/10</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Coding</span>
                  <span className="font-semibold text-emerald-700">{proposal.aiRatings.coding}/10</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Aptitude</span>
                  <span className="font-semibold text-emerald-700">{proposal.aiRatings.aptitude}/10</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Overall interview</span>
                  <span className="font-semibold text-emerald-700">{proposal.aiRatings.overall}/10</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-5 rounded-2xl bg-white/95">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Key skills highlighted</h2>
              <div className="flex flex-wrap gap-1.5">
                {proposal.skills.map((skill) => (
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

            <Card className="p-4 md:p-5 rounded-2xl bg-white/95">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <h2 className="text-sm md:text-base font-semibold text-slate-900">Next step</h2>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Respond within 48 hours to keep this proposal active.
                  </p>
                </div>
                <Button className="rounded-full h-9 px-4 text-xs font-medium" style={{ backgroundColor: "#0E6049" }}>
                  Accept (static)
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
