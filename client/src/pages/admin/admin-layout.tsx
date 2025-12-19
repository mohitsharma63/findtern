import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import {
  BarChart3,
  Building2,
  FolderKanban,
  LayoutDashboard,
  UserCircle2,
  LogOut,
  Settings,
  Sparkles,
  Users,
  Receipt,
} from "lucide-react";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";
import { ReactNode } from "react";

type AdminLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Users", icon: UserCircle2, href: "/admin/users" },
  { label: "Skills", icon: Sparkles, href: "/admin/skills" },
  { label: "Interns", icon: Users, href: "/admin/interns" },
  { label: "Companies", icon: Building2, href: "/admin/companies" },
  { label: "Projects", icon: FolderKanban, href: "/admin/projects" },
  { label: "Transactions", icon: Receipt, href: "/admin/transactions" },
  { label: "Analytics", icon: BarChart3, href: "/admin/reports" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export function AdminLayout({ title, description, children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    setLocation("/admin/login");
  };

  return (
    <SidebarProvider defaultOpen={true} className="bg-background">
      {/* Light sidebar so text is always clearly visible */}
      <Sidebar className="border-r bg-white text-slate-900" collapsible="offcanvas">
        <SidebarHeader className="flex items-center gap-3 border-b px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 shadow-sm shrink-0">
            <img src={findternLogo} alt="Findtern" className="h-7 w-7 rounded-md object-cover" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-700 whitespace-nowrap">
              Findtern Panel
            </span>
            <Badge
              variant="secondary"
              className="mt-1 h-5 w-fit rounded-full bg-emerald-100 px-2 text-[11px] font-semibold text-emerald-800"
            >
              Admin
            </Badge>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 pt-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => setLocation(item.href)}
                        className={`text-[13px] font-medium transition-all duration-150
                          ${
                            isActive
                              ? "bg-emerald-50 text-emerald-900 shadow-sm"
                              : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"
                          }`}
                      >
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md border text-[13px]
                            ${
                              isActive
                                ? "border-emerald-500 bg-emerald-100 text-emerald-900"
                                : "border-slate-200 bg-slate-50 text-slate-500"
                            }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t bg-slate-50 px-3 py-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 rounded-lg bg-white text-xs font-medium text-slate-700 hover:bg-slate-100"
            onClick={handleLogout}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-50 text-red-500">
              <LogOut className="h-3.5 w-3.5" />
            </span>
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-background/90 px-4 backdrop-blur md:px-6">
          <div className="flex flex-1 items-center gap-3">
            <SidebarTrigger className="h-8 w-8 shrink-0 md:hidden" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold tracking-tight text-[#0E6049]">
                {title}
              </h1>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {description}
                </p>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-muted/30">
          <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </div>
        <Separator className="mt-auto opacity-0" />
      </SidebarInset>
    </SidebarProvider>
  );
}


