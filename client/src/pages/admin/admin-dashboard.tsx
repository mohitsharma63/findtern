import { useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/pages/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, TooltipProps, XAxis, YAxis } from "recharts";


export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Static data
  const stats = {
    totalUsers: 1248,
    activeInternships: 342,
    pendingApplications: 89,
    completedInterviews: 567,
  };

  const users = [
    {
      id: 1,
      name: "Somil Jangid",
      email: "somil@example.com",
      status: "active",
      role: "Student",
      joined: "2024-01-15",
      applications: 5,
    },
    {
      id: 2,
      name: "John Doe",
      email: "john@example.com",
      status: "active",
      role: "Student",
      joined: "2024-02-20",
      applications: 3,
    },
    {
      id: 3,
      name: "Jane Smith",
      email: "jane@example.com",
      status: "inactive",
      role: "Student",
      joined: "2024-03-10",
      applications: 1,
    },
  ];

  const internships = [
    {
      id: 1,
      title: "Frontend Developer Intern",
      company: "Tech Corp",
      status: "active",
      applications: 45,
      posted: "2024-12-01",
    },
    {
      id: 2,
      title: "Backend Developer Intern",
      company: "Dev Solutions",
      status: "active",
      applications: 32,
      posted: "2024-12-05",
    },
    {
      id: 3,
      title: "Data Science Intern",
      company: "AI Labs",
      status: "pending",
      applications: 18,
      posted: "2024-12-10",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const applicationsTrendData = [
    { month: "Jul", applications: 120, interviews: 45 },
    { month: "Aug", applications: 160, interviews: 60 },
    { month: "Sep", applications: 210, interviews: 80 },
    { month: "Oct", applications: 190, interviews: 78 },
    { month: "Nov", applications: 230, interviews: 95 },
    { month: "Dec", applications: 260, interviews: 110 },
  ];

  const funnelData = [
    { stage: "Signups", value: 1248 },
    { stage: "Profile Complete", value: 980 },
    { stage: "Applied", value: 620 },
    { stage: "Interviewed", value: 210 },
    { stage: "Selected", value: 74 },
  ];

  const trendConfig: ChartConfig = {
    applications: {
      label: "Applications",
      color: "hsl(152, 61%, 40%)",
    },
    interviews: {
      label: "Interviews",
      color: "hsl(217, 91%, 60%)",
    },
  };

  const funnelConfig: ChartConfig = {
    value: {
      label: "Students",
      color: "hsl(43, 96%, 56%)",
    },
  };

  return (
    <AdminLayout
      title="Dashboard"
      description="Monitor key metrics across interns, companies, and projects."
    >
      <div className="py-2 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Internships</p>
                <p className="text-2xl font-bold mt-1">{stats.activeInternships}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Applications</p>
                <p className="text-2xl font-bold mt-1">{stats.pendingApplications}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Interviews</p>
                <p className="text-2xl font-bold mt-1">{stats.completedInterviews}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics row */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr),minmax(0,1.3fr)]">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Applications vs Interviews
                </p>
                <p className="text-xs text-muted-foreground">
                  Last 6 months
                </p>
              </div>
            </div>
            <div className="mt-4 h-64">
              <ChartContainer config={trendConfig}>
                <ResponsiveContainer>
                  <LineChart data={applicationsTrendData}>
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(v) => `${v}`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      stroke="var(--color-applications)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="interviews"
                      stroke="var(--color-interviews)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Intern Conversion Funnel
                </p>
                <p className="text-xs text-muted-foreground">
                  From signup to selection
                </p>
              </div>
            </div>
            <div className="mt-4 h-64">
              <ChartContainer config={funnelConfig}>
                <ResponsiveContainer>
                  <BarChart data={funnelData} layout="vertical" margin={{ left: 60 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="stage"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={90}
                    />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                      fill="var(--color-value)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </Card>
        </div>

        {/* Users Management */}
        <Card>
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Button
                style={{ backgroundColor: '#0E6049' }}
                onClick={() => setLocation("/admin/users")}
              >
                View All
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === "active" ? "default" : "secondary"}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.applications}</TableCell>
                    <TableCell>{user.joined}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Internships Management */}
        <Card>
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Internship Management</h2>
              <Button
                style={{ backgroundColor: '#0E6049' }}
                onClick={() => setLocation("/admin/internships")}
              >
                View All
              </Button>
            </div>
          </div>
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internships.map((internship) => (
                  <TableRow key={internship.id}>
                    <TableCell className="font-medium">{internship.title}</TableCell>
                    <TableCell>{internship.company}</TableCell>
                    <TableCell>
                      <Badge
                        variant={internship.status === "active" ? "default" : "secondary"}
                      >
                        {internship.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{internship.applications}</TableCell>
                    <TableCell>{internship.posted}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
