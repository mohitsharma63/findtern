import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Check, X, Building2, Sparkles } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertEmployerSchema, type InsertEmployer, countryCodes } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import findternLogo from "@assets/logo.jpg";
import { saveEmployerAuth } from "@/lib/employerAuth";

function PasswordStrengthIndicator({ password }: { password: string }) {
  const requirements = useMemo(() => {
    return [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
      { label: "Contains number", met: /[0-9]/.test(password) },
      { label: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
  }, [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter((r) => r.met).length;
    if (metCount === 0) return { level: 0, label: "", color: "" };
    if (metCount <= 2) return { level: 1, label: "Weak", color: "bg-destructive" };
    if (metCount <= 3) return { level: 2, label: "Fair", color: "bg-yellow-500" };
    if (metCount <= 4) return { level: 3, label: "Good", color: "bg-emerald-500" };
    return { level: 4, label: "Strong", color: "bg-emerald-600" };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                level <= strength.level ? strength.color : "bg-muted"
              }`}
            />
          ))}
        </div>
        {strength.label && (
          <span
            className={`text-xs font-medium ${
              strength.level <= 1
                ? "text-destructive"
                : strength.level === 2
                ? "text-yellow-600"
                : "text-emerald-600"
            }`}
          >
            {strength.label}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-1.5 text-xs">
            {req.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EmployerSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<InsertEmployer>({
    resolver: zodResolver(insertEmployerSchema),
    defaultValues: {
      name: "",
      companyName: "",
      companyEmail: "",
      countryCode: "+91",
      phoneNumber: "",
      password: "",
      agreedToTerms: false,
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: InsertEmployer) => {
      const response = await apiRequest("POST", "/api/auth/employer/signup", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      const employer = data?.employer;
      if (employer) {
        saveEmployerAuth(employer);
      }
      toast({
        title: "Account created successfully!",
        description: "Welcome to Findtern. Let's complete your company profile.",
      });
      form.reset();
      setLocation("/employer/setup");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertEmployer) => {
    signupMutation.mutate(data);
  };

  const handleGoogleSignup = () => {
    toast({
      title: "Google Sign-in",
      description: "Google authentication would be integrated here.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 flex items-center justify-center px-3 py-6 md:py-10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating geometric shapes */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-emerald-300/10 to-cyan-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-gradient-to-r from-teal-200/20 to-emerald-200/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Decorative shapes */}
        <div className="absolute top-20 right-[20%] w-4 h-4 bg-emerald-400/40 rounded-full" />
        <div className="absolute top-40 left-[15%] w-6 h-6 border-2 border-emerald-300/40 rounded-lg transform rotate-45" />
        <div className="absolute bottom-32 left-[25%] w-3 h-3 bg-teal-400/50 rounded-full" />
        <div className="absolute top-1/3 right-[10%] w-8 h-8 border-2 border-teal-300/30 rounded-full" />
        <div className="absolute bottom-40 right-[30%] w-5 h-5 bg-emerald-300/40 transform rotate-45" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Diagonal lines accent */}
        <svg className="absolute top-0 right-0 w-64 h-64 text-emerald-200/20" viewBox="0 0 200 200">
          <line x1="0" y1="200" x2="200" y2="0" stroke="currentColor" strokeWidth="1" />
          <line x1="40" y1="200" x2="200" y2="40" stroke="currentColor" strokeWidth="1" />
          <line x1="80" y1="200" x2="200" y2="80" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-64 h-64 text-teal-200/20 transform rotate-180" viewBox="0 0 200 200">
          <line x1="0" y1="200" x2="200" y2="0" stroke="currentColor" strokeWidth="1" />
          <line x1="40" y1="200" x2="200" y2="40" stroke="currentColor" strokeWidth="1" />
          <line x1="80" y1="200" x2="200" y2="80" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <Card className="w-full max-w-md md:max-w-xl p-6 md:p-8 relative z-10 border-0 shadow-2xl shadow-emerald-900/5 rounded-3xl bg-white/80 backdrop-blur-xl">
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

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">For Employers</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            Sign Up to find best interns
          </h1>
          <p className="text-sm text-slate-500">
            Create your account and start hiring talented interns today
          </p>
        </div>

        {/* Google Sign-in */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 mb-4 text-sm font-medium border-slate-200 hover:bg-slate-50 hover:border-emerald-200 rounded-xl transition-all duration-200"
          onClick={handleGoogleSignup}
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
            {/* Name & Company Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Name<span className="text-red-500 ml-0.5">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Name"
                        className="h-11 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Company Name<span className="text-red-500 ml-0.5">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Company Name"
                        className="h-11 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Company Email<span className="text-red-500 ml-0.5">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        className="h-11 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">
                  Phone Number<span className="text-red-500 ml-0.5">*</span>
                </FormLabel>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-24 h-11 rounded-xl border-slate-200">
                            <SelectValue placeholder="Code" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countryCodes.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <span className="flex items-center gap-1.5">
                                <span>{country.country}</span>
                                <span className="text-muted-foreground">{country.code}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Phone Number"
                          className="flex-1 h-11 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                          {...field}
                        />
                      </FormControl>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={() => <FormMessage />}
                />
              </FormItem>
            </div>

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Password<span className="text-red-500 ml-0.5">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="h-11 pr-11 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
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
                  <PasswordStrengthIndicator password={field.value} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms Checkbox */}
            <FormField
              control={form.control}
              name="agreedToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-emerald-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal text-slate-600 cursor-pointer">
                      I agree to the{" "}
                      <a href="#" className="text-emerald-600 font-medium underline underline-offset-2 hover:text-emerald-700">
                        Terms & Conditions and Privacy Policy
                      </a>
                      <span className="text-red-500 ml-0.5">*</span>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 mt-4 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 transition-all duration-200"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>

        {/* Login Link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/employer/login" className="text-emerald-600 font-semibold hover:underline underline-offset-2">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}

