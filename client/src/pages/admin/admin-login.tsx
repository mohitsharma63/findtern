import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GraduationCap, Lock, Mail } from "lucide-react";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate admin login
    setTimeout(() => {
      if (email === "admin@findtern.com" && password === "admin123") {
        setLocation("/admin/dashboard");
      } else {
        setError("Invalid admin credentials");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0E6049]/10 via-background to-background p-4">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-xl">
        <div className="flex flex-col items-center gap-4">
          <img src={findternLogo} alt="Findtern" className="h-12 w-auto" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0E6049]">Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Access the admin dashboard
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@findtern.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11"
            style={{ backgroundColor: '#0E6049' }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <button
            onClick={() => setLocation("/login")}
            className="text-[#0E6049] hover:underline"
          >
            Back to User Login
          </button>
        </div>
      </Card>
    </div>
  );
}
