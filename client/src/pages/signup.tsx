import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
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
import { insertUserSchema, type InsertUser, countryCodes } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";

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
    if (metCount <= 4) return { level: 3, label: "Good", color: "bg-primary/70" };
    return { level: 4, label: "Strong", color: "bg-primary" };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2" data-testid="password-strength-indicator">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-colors ${level <= strength.level ? strength.color : "bg-muted"
                }`}
              data-testid={`strength-bar-${level}`}
            />
          ))}
        </div>
        {strength.label && (
          <span
            className={`text-xs font-medium ${strength.level <= 1
              ? "text-destructive"
              : strength.level === 2
                ? "text-yellow-600 dark:text-yellow-500"
                : "text-primary"
              }`}
            data-testid="text-strength-label"
          >
            {strength.label}
          </span>
        )}
      </div>

      {/* Requirements list */}
      <div className="grid grid-cols-1 gap-1">
        {requirements.map((req, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 text-xs"
            data-testid={`requirement-${index}`}
          >
            {req.met ? (
              <Check className="w-3.5 h-3.5 text-primary" />
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

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      countryCode: "+91",
      phoneNumber: "",
      password: "",
      role: "intern",
      agreedToTerms: false,
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      // Store user ID for onboarding
      console.log("Signup response:", data);
      if (data.user?.id) {
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userEmail", data.user.email);
        console.log("Stored userId:", data.user.id);
        console.log("Stored userEmail:", data.user.email);
      } else {
        console.error("User ID not found in response:", data);
        // If user.id is not present, show error
        toast({
          title: "Warning",
          description: "User created but ID not returned. Please contact support.",
          variant: "destructive",
        });
        return;
      }
    
      form.reset();
      setLocation("/onboarding-loading");
    },
    onError: (error: Error) => {
      console.error("Signup error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertUser) => {
    signupMutation.mutate(data);
  };

  const handleGoogleSignup = () => {
    toast({
      title: "Google Sign-in",
      description: "Google authentication would be integrated here.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-3 py-6 md:py-10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left decorative shapes */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-20 left-10 w-8 h-8 border-2 border-primary/20 rounded-lg transform rotate-12" />
        <div className="absolute top-40 left-20 w-4 h-4 bg-primary/30 rounded-full" />

        {/* Top right decorative shapes */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute top-32 right-20 w-6 h-6 border-2 border-primary/20 rounded-full" />

        {/* Bottom decorative shapes */}
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-32 w-12 h-12 bg-primary/10 rounded-full" />
        <div className="absolute bottom-20 left-32 w-16 h-16 border-2 border-primary/10 rounded-full" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <Card className="w-full max-w-md md:max-w-lg p-5 md:p-7 relative z-10 border border-card-border/80 shadow-xl rounded-2xl bg-card/95 backdrop-blur">
        {/* Logo */}
        <div className="flex justify-center mb-4" data-testid="logo-container">
          <img
            src={findternLogo}
            alt="Findtern - Internship Simplified"
            className="h-12 md:h-14 w-auto object-contain"
            data-testid="img-logo"
          />
        </div>

        {/* Tagline chip */}
        <div className="flex justify-center mb-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            For students & freshers looking for internships
          </span>
        </div>

        {/* Heading */}
        <h1
          className="text-xl md:text-2xl font-semibold text-center text-foreground mb-1.5"
          data-testid="text-hero-heading"
        >
          Sign up to find work you love
        </h1>
        <p className="text-xs md:text-[14px] text-center text-muted-foreground mb-5">
          One profile to discover internships that match your skills, college schedule, and the career you actually want to build.
        </p>

        {/* Google Sign-in Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 mb-3 text-sm md:text-[15px] font-medium border-button-outline hover:bg-secondary/60 rounded-full"
          onClick={handleGoogleSignup}
          data-testid="button-google-signup"
        >
          <SiGoogle className="w-5 h-5 mr-2" />
          Continue with Google
        </Button>
        <p className="text-[11px] text-center text-muted-foreground mb-4">
          Use your primary personal email – this will be your main login and communication ID.
        </p>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-card text-muted-foreground font-medium">OR</span>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3.5">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      First Name<span className="text-destructive ml-0.5">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="First Name"
                        className="h-11 rounded-lg text-sm"
                        data-testid="input-first-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Last Name<span className="text-destructive ml-0.5">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Last Name"
                        className="h-11 rounded-lg text-sm"
                        data-testid="input-last-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email and Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Email<span className="text-destructive ml-0.5">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        className="h-11 rounded-lg text-sm"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Phone Number<span className="text-destructive ml-0.5">*</span>
                </FormLabel>
                <div className="flex gap-2.5">
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-[96px] h-11 rounded-lg text-xs md:text-sm" data-testid="select-country-code">
                            <SelectValue placeholder="Code" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countryCodes.map((country) => (
                            <SelectItem
                              key={country.code}
                              value={country.code}
                              data-testid={`option-country-code-${country.country.toLowerCase()}`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="text-sm">{country.country}</span>
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
                          className="flex-1 h-11 rounded-lg text-sm"
                          data-testid="input-phone-number"
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
                  <FormLabel className="text-sm font-medium text-foreground">
                    Password<span className="text-destructive ml-0.5">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="h-11 pr-11 rounded-lg text-sm"
                        data-testid="input-password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-1.5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-terms"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-xs md:text-sm font-normal text-foreground cursor-pointer">
                      I agree to the{" "}
                      <a
                        href="#"
                        className="text-primary font-medium underline underline-offset-2 hover:text-primary/80 transition-colors"
                        onClick={(e) => e.preventDefault()}
                        data-testid="link-terms"
                      >
                        Terms & Conditions and Privacy Policy
                      </a>
                      <span className="text-destructive ml-0.5">*</span>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 mt-4 text-sm md:text-[15px] font-semibold rounded-full"
              style={{ backgroundColor: '#0E6049' }}
              disabled={signupMutation.isPending}
              data-testid="button-create-account"
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
        <p className="text-center text-sm text-muted-foreground mt-6" data-testid="text-login-prompt">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline underline-offset-2 transition-colors"
            data-testid="link-login"
          >
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
