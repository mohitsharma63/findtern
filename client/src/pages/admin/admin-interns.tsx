import { useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/pages/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Link2, Star } from "lucide-react";

type Intern = {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  companyCount: number;
  status: "Active" | "Inactive";
  approvalStatus: "Pending" | "Approved" | "Rejected";
};

const mockInterns: Intern[] = [
  {
    id: 1,
    name: "Prakhar Srivastava",
    email: "prakhar@example.com",
    phone: "9999999999",
    createdAt: "2025-09-16",
    companyCount: 6,
    status: "Active",
    approvalStatus: "Pending",
  },
  {
    id: 2,
    name: "xxxx Srivastava",
    email: "xxxx@example.com",
    phone: "-",
    createdAt: "2025-10-31",
    companyCount: 3,
    status: "Active",
    approvalStatus: "Approved",
  },
];

export default function AdminInternsPage() {
  const [search, setSearch] = useState("");
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [openLinksModal, setOpenLinksModal] = useState(false);
  const [openRatingsModal, setOpenRatingsModal] = useState(false);
  const [interns, setInterns] = useState<Intern[]>(mockInterns);
  const [, setLocation] = useLocation();

  const filtered = interns.filter((intern) =>
    intern.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprovalChange = (
    id: number,
    nextStatus: Intern["approvalStatus"]
  ) => {
    setInterns((prev) =>
      prev.map((intern) =>
        intern.id === id ? { ...intern, approvalStatus: nextStatus } : intern
      )
    );
  };

  return (
    <AdminLayout
      title="Interns"
      description="Review intern applications, update ratings, and manage interview links."
    >
      <Card className="border-none shadow-sm">
        <div className="flex flex-col gap-4 border-b px-6 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-muted-foreground">Intern List</p>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search intern..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="overflow-x-auto px-4 py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company Count</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((intern, index) => (
                <TableRow key={intern.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{intern.name}</TableCell>
                  <TableCell>{intern.email}</TableCell>
                  <TableCell>{intern.phone}</TableCell>
                  <TableCell>{intern.companyCount}</TableCell>
                  <TableCell>{intern.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          intern.approvalStatus === "Approved"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : intern.approvalStatus === "Rejected"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-amber-400 bg-amber-50 text-amber-700"
                        }
                      >
                        {intern.approvalStatus}
                      </Badge>
                      {intern.approvalStatus !== "Approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                          onClick={() =>
                            handleApprovalChange(intern.id, "Approved")
                          }
                        >
                          Approve
                        </Button>
                      )}
                      {intern.approvalStatus !== "Rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-700 hover:bg-red-50"
                          onClick={() =>
                            handleApprovalChange(intern.id, "Rejected")
                          }
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={() => setLocation(`/admin/interns/${intern.id}`)}
                    >
                      View Details
                    </Button>
                    <Badge
                      className="cursor-pointer bg-[#0E6049]"
                      onClick={() => {
                        setSelectedIntern(intern);
                        setOpenLinksModal(true);
                      }}
                    >
                      Interview Link
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      onClick={() => {
                        setSelectedIntern(intern);
                        setOpenRatingsModal(true);
                      }}
                    >
                      Rating
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-emerald-500 bg-emerald-50 text-emerald-700"
                    >
                      {intern.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Interview Links Modal */}
      <Dialog
        open={openLinksModal}
        onOpenChange={(open) => {
          setOpenLinksModal(open);
          if (!open) setSelectedIntern(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Interview Links</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Interview Link" />
            <Input placeholder="Feedback Link" />
            <Input placeholder="Recording Link" />
            <Button className="mt-2 w-full bg-[#0E6049] hover:bg-[#0b4b3a]">
              <Link2 className="mr-2 h-4 w-4" />
              Save Links
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ratings Modal */}
      <Dialog
        open={openRatingsModal}
        onOpenChange={(open) => {
          setOpenRatingsModal(open);
          if (!open) setSelectedIntern(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Skill Ratings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Communication Skill Rating" />
            <Input placeholder="Academic Skill Rating" />
            <Input placeholder="AI Interview Skill Rating" />
            <Input placeholder="Profile Overall Skill Rating" />
            <Input placeholder="Aptitude Skill Rating" />
            <Input placeholder="Coding Skill Rating" />
            <Button className="mt-2 w-full bg-[#0E6049] hover:bg-[#0b4b3a]">
              <Star className="mr-2 h-4 w-4" />
              Save Ratings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}


