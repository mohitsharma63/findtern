import { AdminLayout } from "@/pages/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Briefcase, Users } from "lucide-react";

const mockCompanyDetail = {
  id: 1,
  name: "Neoprene",
  contactPerson: "Ram",
  email: "neoprene@example.com",
  phone: "2221222",
  createdAt: "17 Dec 2025",
  verified: true,
  students: 0,
};

const mockCompanyDocuments = [
  { name: "GST Certificate", status: "Approved", updatedAt: "17 Dec 2025" },
  { name: "PAN Card", status: "Pending", updatedAt: "—" },
  { name: "Company Registration", status: "Not Uploaded", updatedAt: "—" },
];

const mockProjects = [
  {
    title: "MAA",
    location: "Varanasi, Uttar Pradesh",
    type: "Onsite",
    fullTime: "Yes",
    active: "Active",
    createdAt: "11 Oct 2025",
  },
];

const mockCompanyInterns = [
  { name: "Prakhar Srivastava", role: "Frontend Intern", status: "Active" },
  { name: "Somil Jangid", role: "Backend Intern", status: "Interview Stage" },
];

const mockCompanyActivity = [
  { date: "18 Dec 2025", action: "New project created: MAA" },
  { date: "17 Dec 2025", action: "Company verified by admin" },
  { date: "17 Dec 2025", action: "Company account created" },
];

export default function AdminCompanyDetailPage() {
  return (
    <AdminLayout
      title="Company"
      description="Complete record of a company's documents, projects, and interns."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr),minmax(0,1.1fr)]">
        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{mockCompanyDetail.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Contact: {mockCompanyDetail.contactPerson}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Created: {mockCompanyDetail.createdAt}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-emerald-500 bg-emerald-50 text-emerald-700"
                >
                  {mockCompanyDetail.verified ? "Verified" : "Not Verified"}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-300 bg-slate-50 text-slate-700"
                >
                  Students: {mockCompanyDetail.students}
                </Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p>{mockCompanyDetail.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p>{mockCompanyDetail.phone}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Quick Actions
          </p>
          <Button className="w-full bg-[#0E6049] hover:bg-[#0b4b3a]">
            Verify / Unverify Company
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Briefcase className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            View Associated Interns
          </Button>
        </Card>
      </div>

      <Card className="mt-4">
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="mx-6 mt-4 flex w-fit flex-wrap bg-muted">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="interns">Interns</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="px-6 pb-6 pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCompanyDocuments.map((doc) => (
                  <TableRow key={doc.name}>
                    <TableCell className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{doc.name}</span>
                    </TableCell>
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
          </TabsContent>

          <TabsContent value="projects" className="px-6 pb-6 pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Full-Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProjects.map((project) => (
                  <TableRow key={project.title}>
                    <TableCell>{project.title}</TableCell>
                    <TableCell>{project.location}</TableCell>
                    <TableCell>{project.type}</TableCell>
                    <TableCell>{project.fullTime}</TableCell>
                    <TableCell>
                      <Badge className="bg-[#0E6049]">{project.active}</Badge>
                    </TableCell>
                    <TableCell>{project.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="interns" className="px-6 pb-6 pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCompanyInterns.map((intern) => (
                  <TableRow key={intern.name}>
                    <TableCell>{intern.name}</TableCell>
                    <TableCell>{intern.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-500 bg-emerald-50 text-emerald-700">
                        {intern.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="activity" className="px-6 pb-6 pt-4">
            <ul className="space-y-2 text-sm">
              {mockCompanyActivity.map((item) => (
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


