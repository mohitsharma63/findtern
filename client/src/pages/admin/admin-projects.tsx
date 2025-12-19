import { AdminLayout } from "@/pages/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Project = {
  id: number;
  title: string;
  location: string;
  scope: string;
  locationType: string;
  fullTime: boolean;
  active: boolean;
  createdAt: string;
};

const mockProjects: Project[] = [
  {
    id: 1,
    title: "MAA",
    location: "Varanasi, Uttar Pradesh",
    scope: "Not Sure",
    locationType: "Onsite",
    fullTime: true,
    active: true,
    createdAt: "11/10/2025, 11:29:59 pm",
  },
];

export default function AdminProjectsPage() {
  return (
    <AdminLayout
      title="Projects"
      description="View and filter all projects created by companies."
    >
      <Card className="border-none shadow-sm">
        <div className="flex flex-col gap-4 border-b px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              All Projects
            </h2>
          </div>
          <div className="w-full max-w-xs">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto px-4 py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Location Type</TableHead>
                <TableHead>Full-Time</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    {project.title}
                  </TableCell>
                  <TableCell>{project.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full">
                      {project.scope}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full">
                      {project.locationType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="rounded-full border-emerald-500 bg-emerald-50 text-emerald-700"
                    >
                      {project.fullTime ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-[#0E6049]">
                      {project.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{project.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </AdminLayout>
  );
}


