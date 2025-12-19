
import { AdminLayout } from "@/pages/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, Link2, Star } from "lucide-react";

const mockInternDetail = {
  id: 1,
  name: "Prakhar Srivastava",
  email: "prakhar@example.com",
  phone: "+91 9999999999",
  location: "Varanasi, Uttar Pradesh",
  joinedAt: "16 Sep 2025",
  status: "Active",
  verified: "Not Verified",
  approvalStatus: "Pending",
};

const mockDocuments = [
  { name: "Resume", type: "PDF", status: "Approved", updatedAt: "16 Sep 2025" },
  { name: "College ID", type: "Image", status: "Pending", updatedAt: "—" },
  { name: "Offer Letter", type: "PDF", status: "Not Uploaded", updatedAt: "—" },
];

const mockInterviews = [
  {
    round: "Technical Interview",
    date: "20 Oct 2025",
    interviewer: "Senior Engineer",
    rating: "7.5 / 10",
    feedback: "Good problem-solving, needs depth in system design.",
  },
];

const mockApplications = [
  {
    company: "Neoprene",
    project: "Frontend Developer Intern",
    location: "Varanasi (Hybrid)",
    status: "Interview Scheduled",
    appliedAt: "18 Sep 2025",
  },
];

const mockActivity = [
  { date: "21 Oct 2025", action: "Interview feedback submitted" },
  { date: "19 Oct 2025", action: "Interview link generated" },
  { date: "16 Sep 2025", action: "Intern profile created" },
];

export default function AdminInternDetailPage() {
  // For now we ignore route id and show mock intern details.
  return (
    <AdminLayout
      title="Intern Profile"
      description="Deep-dive into all data related to a specific intern."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr),minmax(0,1.1fr)]">
        {/* Summary card */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{mockInternDetail.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mockInternDetail.location}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Joined: {mockInternDetail.joinedAt}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-emerald-500 bg-emerald-50 text-emerald-700">
                  {mockInternDetail.status}
                </Badge>
                <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-700">
                  {mockInternDetail.approvalStatus}
                </Badge>
                <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                  {mockInternDetail.verified}
                </Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p>{mockInternDetail.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p>{mockInternDetail.phone}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="p-6 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Quick Actions
          </p>
          <Button variant="outline" className="w-full justify-start">
            <Link2 className="mr-2 h-4 w-4" />
            Generate / Update Interview Links
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Star className="mr-2 h-4 w-4" />
            Update Skill Ratings
          </Button>
          <Button className="w-full bg-[#0E6049] hover:bg-[#0b4b3a]">
            Approve Intern
          </Button>
        </Card>
      </div>

      {/* Tabbed detail sections */}
      <Card className="mt-4">
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="mx-6 mt-4 flex w-fit flex-wrap bg-muted">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="px-6 pb-6 pt-4">
            <ScrollArea className="max-h-[320px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDocuments.map((doc) => (
                    <TableRow key={doc.name}>
                      <TableCell className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{doc.name}</span>
                      </TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            doc.status === "Approved"
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : doc.status === "Pending"
                              ? "border-amber-400 bg-amber-50 text-amber-700"
                              : "border-slate-300 bg-slate-50 text-slate-700"
                          }
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.updatedAt}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          View / Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="interviews" className="px-6 pb-6 pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Round</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Interviewer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInterviews.map((i) => (
                  <TableRow key={i.round}>
                    <TableCell>{i.round}</TableCell>
                    <TableCell>{i.date}</TableCell>
                    <TableCell>{i.interviewer}</TableCell>
                    <TableCell>{i.rating}</TableCell>
                    <TableCell className="max-w-md text-sm">
                      {i.feedback}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="applications" className="px-6 pb-6 pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockApplications.map((app) => (
                  <TableRow key={app.company + app.project}>
                    <TableCell>{app.company}</TableCell>
                    <TableCell>{app.project}</TableCell>
                    <TableCell>{app.location}</TableCell>
                    <TableCell>
                      <Badge className="bg-[#0E6049]"> {app.status}</Badge>
                    </TableCell>
                    <TableCell>{app.appliedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="activity" className="px-6 pb-6 pt-4">
            <ul className="space-y-2 text-sm">
              {mockActivity.map((item) => (
                <li
                  key={item.date + item.action}
                  className="flex items-start justify-between rounded-md border bg-muted/40 px-3 py-2"
                >
                  <span>{item.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.date}
                  </span>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </Card>
    </AdminLayout>
  );
}


