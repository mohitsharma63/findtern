import { AdminLayout } from "@/pages/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

type Company = {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  studentCount: number;
  createdAt: string;
  status: "Active" | "Inactive";
};

const mockCompanies: Company[] = [
  {
    id: 1,
    name: "Neoprene",
    contactPerson: "Ram",
    email: "neoprene@example.com",
    phone: "2221222",
    studentCount: 0,
    createdAt: "2025-12-17",
    status: "Active",
  },
];

export default function AdminCompaniesPage() {
  const [, setLocation] = useLocation();
  return (
    <AdminLayout
      title="Companies"
      description="Manage companies, view their details, and see associated interns."
    >
      <Card className="border-none shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <p className="text-sm font-medium text-muted-foreground">
            Company List
          </p>
        </div>
        <div className="overflow-x-auto px-4 py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Person Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Student Count</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCompanies.map((company, index) => (
                <TableRow key={company.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.contactPerson}</TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>{company.phone}</TableCell>
                  <TableCell>{company.studentCount}</TableCell>
                  <TableCell>{company.createdAt}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLocation(`/admin/companies/${company.id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-[#0E6049]">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </AdminLayout>
  );
}


