import { useState } from "react";
import { AdminLayout } from "@/pages/admin/admin-layout";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Briefcase,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Filter,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";

// Key Platform Metrics
const platformMetrics = {
  totalUsers: 1248,
  activeUsers: 892,
  totalCompanies: 156,
  activeProjects: 342,
  completedInternships: 567,
  pendingApplications: 89,
  totalRevenue: 2850000,
  monthlyGrowth: 12.5,
};

// Monthly Trends Data
const monthlyTrendsData = [
  { month: "Jan", users: 820, companies: 98, internships: 245, revenue: 180000 },
  { month: "Feb", users: 890, companies: 108, internships: 278, revenue: 210000 },
  { month: "Mar", users: 950, companies: 118, internships: 295, revenue: 240000 },
  { month: "Apr", users: 1020, companies: 125, internships: 310, revenue: 265000 },
  { month: "May", users: 1080, companies: 135, internships: 328, revenue: 290000 },
  { month: "Jun", users: 1150, companies: 142, internships: 342, revenue: 320000 },
  { month: "Jul", users: 1180, companies: 148, internships: 358, revenue: 345000 },
  { month: "Aug", users: 1210, companies: 152, internships: 375, revenue: 380000 },
  { month: "Sep", users: 1230, companies: 154, internships: 390, revenue: 410000 },
  { month: "Oct", users: 1240, companies: 155, internships: 410, revenue: 440000 },
  { month: "Nov", users: 1245, companies: 156, internships: 425, revenue: 475000 },
  { month: "Dec", users: 1248, companies: 156, internships: 440, revenue: 520000 },
];

// Weekly Activity Data
const weeklyActivityData = [
  { day: "Mon", signups: 45, applications: 120, interviews: 28 },
  { day: "Tue", signups: 52, applications: 145, interviews: 35 },
  { day: "Wed", signups: 48, applications: 132, interviews: 42 },
  { day: "Thu", signups: 58, applications: 158, interviews: 38 },
  { day: "Fri", signups: 62, applications: 165, interviews: 45 },
  { day: "Sat", signups: 28, applications: 85, interviews: 12 },
  { day: "Sun", signups: 22, applications: 72, interviews: 8 },
];

// Conversion Funnel Data
const conversionFunnelData = [
  { stage: "Signups", value: 1248, percentage: 100 },
  { stage: "Profile Complete", value: 980, percentage: 78.5 },
  { stage: "Applied", value: 620, percentage: 49.7 },
  { stage: "Interviewed", value: 310, percentage: 24.8 },
  { stage: "Selected", value: 156, percentage: 12.5 },
  { stage: "Completed", value: 98, percentage: 7.9 },
];

// Industry Distribution
const industryDistributionData = [
  { name: "IT & Software", value: 45, color: "hsl(152, 61%, 40%)" },
  { name: "Finance", value: 18, color: "hsl(217, 91%, 60%)" },
  { name: "Healthcare", value: 12, color: "hsl(43, 96%, 56%)" },
  { name: "E-commerce", value: 10, color: "hsl(262, 83%, 58%)" },
  { name: "Manufacturing", value: 8, color: "hsl(0, 72%, 51%)" },
  { name: "Others", value: 7, color: "hsl(200, 20%, 60%)" },
];

// Skill Demand Data
const skillDemandData = [
  { skill: "React.js", demand: 85 },
  { skill: "Python", demand: 78 },
  { skill: "Data Analysis", demand: 72 },
  { skill: "Node.js", demand: 68 },
  { skill: "UI/UX Design", demand: 65 },
  { skill: "Machine Learning", demand: 58 },
  { skill: "AWS", demand: 52 },
  { skill: "Java", demand: 48 },
];

// Top Performing Companies
const topCompanies = [
  { name: "Neoprene Tech", projects: 12, hires: 28, rating: 4.8, status: "active" },
  { name: "Code Raft India", projects: 9, hires: 22, rating: 4.6, status: "active" },
  { name: "DataTech Solutions", projects: 8, hires: 18, rating: 4.5, status: "active" },
  { name: "StartupXYZ", projects: 6, hires: 15, rating: 4.4, status: "active" },
  { name: "AI Labs", projects: 5, hires: 12, rating: 4.3, status: "inactive" },
];

// Top Interns
const topInterns = [
  { name: "Somil Jangid", applications: 8, interviews: 6, offers: 3, status: "placed" },
  { name: "Priya Sharma", applications: 7, interviews: 5, offers: 2, status: "placed" },
  { name: "Rahul Kumar", applications: 6, interviews: 4, offers: 2, status: "interviewing" },
  { name: "Anita Singh", applications: 5, interviews: 4, offers: 1, status: "placed" },
  { name: "John Doe", applications: 5, interviews: 3, offers: 1, status: "interviewing" },
];

// Geographic Distribution
const geographicData = [
  { city: "Bangalore", users: 320, percentage: 25.6 },
  { city: "Mumbai", users: 245, percentage: 19.6 },
  { city: "Delhi NCR", users: 198, percentage: 15.9 },
  { city: "Hyderabad", users: 156, percentage: 12.5 },
  { city: "Pune", users: 142, percentage: 11.4 },
  { city: "Chennai", users: 98, percentage: 7.9 },
  { city: "Others", users: 89, percentage: 7.1 },
];

// Application Status Distribution
const applicationStatusData = [
  { name: "Applied", value: 320, color: "hsl(217, 91%, 60%)" },
  { name: "Under Review", value: 180, color: "hsl(43, 96%, 56%)" },
  { name: "Interviewed", value: 120, color: "hsl(262, 83%, 58%)" },
  { name: "Selected", value: 85, color: "hsl(152, 61%, 40%)" },
  { name: "Rejected", value: 95, color: "hsl(0, 72%, 51%)" },
];

// Chart Configs
const trendsConfig: ChartConfig = {
  users: { label: "Users", color: "hsl(152, 61%, 40%)" },
  companies: { label: "Companies", color: "hsl(217, 91%, 60%)" },
  internships: { label: "Internships", color: "hsl(43, 96%, 56%)" },
};

const weeklyConfig: ChartConfig = {
  signups: { label: "Signups", color: "hsl(152, 61%, 40%)" },
  applications: { label: "Applications", color: "hsl(217, 91%, 60%)" },
  interviews: { label: "Interviews", color: "hsl(262, 83%, 58%)" },
};

const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "hsl(152, 61%, 40%)" },
};

const skillConfig: ChartConfig = {
  demand: { label: "Demand %", color: "hsl(152, 61%, 40%)" },
};

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState("last-12-months");
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLayout
      title="Analytics & Reports"
      description="Comprehensive analytics dashboard for platform performance insights."
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Calendar className="h-4 w-4 mr-2 shrink-0" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="last-12-months">Last 12 Months</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Filter className="mr-1.5 h-4 w-4" />
              <span className="hidden xs:inline">Filters</span>
            </Button>
            <Button size="sm" className="flex-1 sm:flex-none bg-[#0E6049] hover:bg-[#0b4b3a]">
              <Download className="mr-1.5 h-4 w-4" />
              <span className="hidden xs:inline">Export</span>
              <span className="xs:hidden">Export</span>
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Users</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1">{platformMetrics.totalUsers.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-emerald-500 flex items-center mt-0.5 sm:mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +{platformMetrics.monthlyGrowth}%
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Companies</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1">{platformMetrics.totalCompanies}</p>
                <p className="text-[10px] sm:text-xs text-emerald-500 flex items-center mt-0.5 sm:mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +8 new
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Projects</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1">{platformMetrics.activeProjects}</p>
                <p className="text-[10px] sm:text-xs text-emerald-500 flex items-center mt-0.5 sm:mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +15%
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Revenue</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1">{formatCurrency(platformMetrics.totalRevenue)}</p>
                <p className="text-[10px] sm:text-xs text-emerald-500 flex items-center mt-0.5 sm:mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +22%
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="bg-muted/50 w-max sm:w-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2.5 sm:px-3">Overview</TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm px-2.5 sm:px-3">Users</TabsTrigger>
              <TabsTrigger value="companies" className="text-xs sm:text-sm px-2.5 sm:px-3">Companies</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs sm:text-sm px-2.5 sm:px-3">Performance</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Growth Trends */}
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#0E6049]">Platform Growth Trends</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Users, Companies & Internships</p>
                  </div>
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-[#0E6049]" />
                </div>
                <div className="h-48 sm:h-56 md:h-72">
                  <ChartContainer config={trendsConfig}>
                    <ResponsiveContainer>
                      <LineChart data={monthlyTrendsData}>
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="companies" stroke="var(--color-companies)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="internships" stroke="var(--color-internships)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#0E6049]">Revenue Growth</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Monthly revenue trend</p>
                  </div>
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#0E6049]" />
                </div>
                <div className="h-48 sm:h-56 md:h-72">
                  <ChartContainer config={revenueConfig}>
                    <ResponsiveContainer>
                      <AreaChart data={monthlyTrendsData}>
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(152, 61%, 40%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(152, 61%, 40%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#revenueGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </Card>
            </div>

            {/* Weekly Activity & Conversion Funnel */}
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#0E6049]">Weekly Activity</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Signups, Applications & Interviews</p>
                  </div>
                </div>
                <div className="h-48 sm:h-56 md:h-64">
                  <ChartContainer config={weeklyConfig}>
                    <ResponsiveContainer>
                      <BarChart data={weeklyActivityData}>
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="signups" radius={[4, 4, 0, 0]} fill="var(--color-signups)" />
                        <Bar dataKey="applications" radius={[4, 4, 0, 0]} fill="var(--color-applications)" />
                        <Bar dataKey="interviews" radius={[4, 4, 0, 0]} fill="var(--color-interviews)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#0E6049]">Conversion Funnel</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">User journey stages</p>
                  </div>
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-[#0E6049]" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {conversionFunnelData.map((item, index) => (
                    <div key={item.stage} className="space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground truncate mr-2">{item.stage}</span>
                        <span className="font-medium whitespace-nowrap">{item.value.toLocaleString()} ({item.percentage}%)</span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Industry & Skills */}
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#0E6049]">Industry Distribution</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Companies by industry</p>
                  </div>
                </div>
                <div className="h-40 sm:h-52 md:h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={industryDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {industryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2">
                  {industryDistributionData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#0E6049]">Top Skills in Demand</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Most requested skills</p>
                  </div>
                </div>
                <div className="h-48 sm:h-56 md:h-64">
                  <ChartContainer config={skillConfig}>
                    <ResponsiveContainer>
                      <BarChart data={skillDemandData} layout="vertical" margin={{ left: 50 }}>
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="skill" type="category" tickLine={false} axisLine={false} width={60} tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="demand" radius={[0, 4, 4, 0]} fill="var(--color-demand)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* User Analytics Tab */}
          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Active Users</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1 sm:mt-2 text-emerald-600">{platformMetrics.activeUsers}</p>
                  <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{((platformMetrics.activeUsers / platformMetrics.totalUsers) * 100).toFixed(1)}%</p>
                </div>
              </Card>
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Avg. Apps/User</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1 sm:mt-2 text-blue-600">4.2</p>
                  <p className="text-[9px] sm:text-xs text-emerald-500 mt-0.5 sm:mt-1">+0.5</p>
                </div>
              </Card>
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Placement</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1 sm:mt-2 text-purple-600">12.5%</p>
                  <p className="text-[9px] sm:text-xs text-emerald-500 mt-0.5 sm:mt-1">+2.3%</p>
                </div>
              </Card>
            </div>

            {/* Geographic Distribution */}
            <Card className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#0E6049]">Geographic Distribution</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Users by city</p>
                </div>
              </div>
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">City</TableHead>
                      <TableHead className="text-xs">Users</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Progress</TableHead>
                      <TableHead className="text-xs">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {geographicData.map((item) => (
                      <TableRow key={item.city}>
                        <TableCell className="font-medium text-xs sm:text-sm py-2">{item.city}</TableCell>
                        <TableCell className="text-xs sm:text-sm py-2">{item.users.toLocaleString()}</TableCell>
                        <TableCell className="hidden sm:table-cell py-2">
                          <div className="w-16 sm:w-20 h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-emerald-500 text-xs flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                            {item.percentage}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Top Interns */}
            <Card className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#0E6049]">Top Performing Interns</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Based on applications and offers</p>
                </div>
              </div>
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Apps</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Int.</TableHead>
                      <TableHead className="text-xs">Offers</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topInterns.map((intern) => (
                      <TableRow key={intern.name}>
                        <TableCell className="font-medium text-xs sm:text-sm py-2 max-w-[100px] truncate">{intern.name}</TableCell>
                        <TableCell className="text-xs sm:text-sm py-2">{intern.applications}</TableCell>
                        <TableCell className="text-xs sm:text-sm py-2 hidden sm:table-cell">{intern.interviews}</TableCell>
                        <TableCell className="text-xs sm:text-sm py-2">{intern.offers}</TableCell>
                        <TableCell className="py-2">
                          <Badge
                            className={`text-[10px] sm:text-xs px-1.5 sm:px-2 ${
                              intern.status === "placed"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
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
          </TabsContent>

          {/* Company Analytics Tab */}
          <TabsContent value="companies" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Companies</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1 sm:mt-2">{platformMetrics.totalCompanies}</p>
                  <p className="text-[9px] sm:text-xs text-emerald-500 mt-0.5 sm:mt-1">+8</p>
                </div>
              </Card>
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Projects/Co.</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1 sm:mt-2 text-blue-600">2.2</p>
                  <p className="text-[9px] sm:text-xs text-emerald-500 mt-0.5 sm:mt-1">+0.3</p>
                </div>
              </Card>
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Hires/Co.</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1 sm:mt-2 text-purple-600">3.6</p>
                  <p className="text-[9px] sm:text-xs text-emerald-500 mt-0.5 sm:mt-1">+0.8</p>
                </div>
              </Card>
            </div>

            {/* Top Companies */}
            <Card className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#0E6049]">Top Performing Companies</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Based on projects and hires</p>
                </div>
              </div>
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Company</TableHead>
                      <TableHead className="text-xs">Proj.</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Hires</TableHead>
                      <TableHead className="text-xs">Rating</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCompanies.map((company) => (
                      <TableRow key={company.name}>
                        <TableCell className="font-medium text-xs sm:text-sm py-2 max-w-[100px] truncate">{company.name}</TableCell>
                        <TableCell className="text-xs sm:text-sm py-2">{company.projects}</TableCell>
                        <TableCell className="text-xs sm:text-sm py-2 hidden sm:table-cell">{company.hires}</TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-0.5 text-xs sm:text-sm">
                            <span className="text-yellow-500">★</span>
                            {company.rating}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            className={`text-[10px] sm:text-xs px-1.5 sm:px-2 ${
                              company.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {company.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Application Status Distribution */}
            <Card className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#0E6049]">Application Status Distribution</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Current applications by status</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-5 md:gap-4">
                {applicationStatusData.map((item) => (
                  <div key={item.name} className="text-center p-2 sm:p-3 md:p-4 rounded-lg bg-muted/50">
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full mx-auto flex items-center justify-center mb-1 sm:mb-2"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      {item.name === "Applied" && <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" style={{ color: item.color }} />}
                      {item.name === "Under Review" && <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" style={{ color: item.color }} />}
                      {item.name === "Interviewed" && <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" style={{ color: item.color }} />}
                      {item.name === "Selected" && <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" style={{ color: item.color }} />}
                      {item.name === "Rejected" && <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" style={{ color: item.color }} />}
                    </div>
                    <p className="text-base sm:text-lg md:text-2xl font-bold">{item.value}</p>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground truncate">{item.name}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4">
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">Success</p>
                    <p className="text-sm sm:text-base md:text-xl font-bold">78.5%</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">Hire Time</p>
                    <p className="text-sm sm:text-base md:text-xl font-bold">12d</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">Interview</p>
                    <p className="text-sm sm:text-base md:text-xl font-bold">35.2%</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">Growth</p>
                    <p className="text-sm sm:text-base md:text-xl font-bold">+{platformMetrics.monthlyGrowth}%</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Performance Summary */}
            <Card className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#0E6049]">Key Performance Indicators</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Platform health metrics</p>
                </div>
              </div>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-muted-foreground truncate mr-2">User Retention</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-muted rounded-full">
                      <div className="h-full w-[85%] bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-muted-foreground truncate mr-2">Profile Completion</span>
                      <span className="font-medium">72%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-muted rounded-full">
                      <div className="h-full w-[72%] bg-blue-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-muted-foreground truncate mr-2">Application Success</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-muted rounded-full">
                      <div className="h-full w-[45%] bg-purple-500 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-muted-foreground truncate mr-2">Company Satisfaction</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-muted rounded-full">
                      <div className="h-full w-[92%] bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-muted-foreground truncate mr-2">Intern Satisfaction</span>
                      <span className="font-medium">88%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-muted rounded-full">
                      <div className="h-full w-[88%] bg-blue-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-muted-foreground truncate mr-2">Platform Uptime</span>
                      <span className="font-medium">99.9%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-muted rounded-full">
                      <div className="h-full w-[99.9%] bg-yellow-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
