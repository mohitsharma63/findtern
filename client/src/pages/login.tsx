import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Link } from "wouter";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Google Sign-in",
      description: "Google authentication would be integrated here.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-20 left-10 w-8 h-8 border-2 border-primary/20 rounded-lg transform rotate-12" />
        <div className="absolute top-40 left-20 w-4 h-4 bg-primary/30 rounded-full" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute top-32 right-20 w-6 h-6 border-2 border-primary/20 rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-32 w-12 h-12 bg-primary/10 rounded-full" />
        <div className="absolute bottom-20 left-32 w-16 h-16 border-2 border-primary/10 rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <Card className="w-full max-w-md p-6 md:p-8 relative z-10 border-card-border shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6" data-testid="logo-container">
          <img 
            src={findternLogo} 
            alt="Findtern - Internship Simplified" 
            className="h-12 md:h-14 w-auto object-contain"
            data-testid="img-logo"
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-semibold text-center text-foreground mb-2" data-testid="text-hero-heading">
          Welcome back
        </h1>
        <p className="text-center text-muted-foreground mb-8" data-testid="text-subheading">
          Sign in to continue your journey
        </p>

        {/* Google Sign-in Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 mb-6"
          onClick={handleGoogleLogin}
          data-testid="button-google-login"
        >
          <SiGoogle className="w-5 h-5 mr-2" />
          Continue with Google
        </Button>

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
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
                      placeholder="Enter your email"
                      className="h-12"
                      data-testid="input-email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-foreground">
                      Password<span className="text-destructive ml-0.5">*</span>
                    </FormLabel>
                    <a
                      href="#"
                      className="text-sm text-primary font-medium hover:underline underline-offset-2 transition-colors"
                      onClick={(e) => e.preventDefault()}
                      data-testid="link-forgot-password"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-12 pr-12"
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 mt-6 text-base font-medium"
              style={{ backgroundColor: '#0E6049' }}
              disabled={loginMutation.isPending}
              data-testid="button-login"
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

        {/* Sign Up Link */}
        <p className="text-center text-sm text-muted-foreground mt-6" data-testid="text-signup-prompt">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-primary font-medium hover:underline underline-offset-2 transition-colors"
            data-testid="link-signup"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
