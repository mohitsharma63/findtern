import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Building2, Sparkles } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { saveEmployerAuth } from "@/lib/employerAuth";
import findternLogo from "@assets/logo.jpg";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function EmployerLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/employer/login", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      const employer = data?.employer;
      if (employer) {
        saveEmployerAuth(employer);
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      if (!employer?.setupCompleted) {
        setLocation("/employer/setup");
        return;
      }
      if (!employer?.onboardingCompleted) {
        setLocation("/employer/onboarding");
        return;
      }
      setLocation("/employer/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Google Sign-in",
      description: "Google authentication would be integrated here.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 flex items-center justify-center px-3 py-6 md:py-10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-emerald-300/10 to-cyan-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-gradient-to-r from-teal-200/20 to-emerald-200/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="absolute top-20 right-[20%] w-4 h-4 bg-emerald-400/40 rounded-full" />
        <div className="absolute top-40 left-[15%] w-6 h-6 border-2 border-emerald-300/40 rounded-lg transform rotate-45" />
        <div className="absolute bottom-32 left-[25%] w-3 h-3 bg-teal-400/50 rounded-full" />
        <div className="absolute top-1/3 right-[10%] w-8 h-8 border-2 border-teal-300/30 rounded-full" />
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <Card className="w-full max-w-md p-6 md:p-8 relative z-10 border-0 shadow-2xl shadow-emerald-900/5 rounded-3xl bg-white/80 backdrop-blur-xl">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img 
                src={findternLogo} 
                alt="Findtern" 
                className="h-14 w-auto object-contain"
              />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <Building2 className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Employer Portal</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-500">
            Login to access your employer dashboard
          </p>
        </div>

        {/* Google Sign-in */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 mb-4 text-sm font-medium border-slate-200 hover:bg-slate-50 hover:border-emerald-200 rounded-xl transition-all duration-200"
          onClick={handleGoogleLogin}
        >
          <SiGoogle className="w-5 h-5 mr-2.5" />
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-400 font-medium">OR</span>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="h-12 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Password
                    </FormLabel>
                    <a href="#" className="text-xs text-emerald-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-12 pr-11 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-emerald-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal text-slate-600 cursor-pointer">
                    Remember me
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 mt-4 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 transition-all duration-200"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        {/* Register Link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link href="/employer/signup" className="text-emerald-600 font-semibold hover:underline underline-offset-2">
            Create Account
          </Link>
        </p>
      </Card>
    </div>
  );
}

