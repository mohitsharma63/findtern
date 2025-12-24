import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Loader2,
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  Globe,
  Users,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  CreditCard,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { companySizes } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { getEmployerAuth, saveEmployerAuth } from "@/lib/employerAuth";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";
import cityStatePincode from "@/data/cityStatePincode.json";

// Company Setup Schema
const companySetupSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  websiteUrl: z
    .string()
    .url("Please enter a valid URL")
    .refine((val) => val.startsWith("http://") || val.startsWith("https://"), {
      message: "Website URL must start with http:// or https://",
    }),
  companyEmail: z.string().email("Please enter a valid email"),
  companySize: z.string().min(1, "Please select company size"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  primaryContactName: z.string().min(2, "Name is required"),
  primaryContactRole: z.string().min(2, "Role is required"),
  secondaryContactName: z.string().optional(),
  secondaryContactEmail: z.string().email().optional().or(z.literal("")),
  secondaryContactPhone: z.string().optional(),
  secondaryContactRole: z.string().optional(),
  bankName: z
    .string()
    .min(2, "Bank name is required")
    .regex(/^[A-Za-z .&()'-]+$/, "Enter a valid bank name"),
  accountNumber: z
    .string()
    .regex(/^\d{9,18}$/, "Enter a valid account number (9-18 digits)"),
  accountHolderName: z
    .string()
    .min(3, "Account holder name is required")
    .regex(/^[A-Za-z .]+$/, "Enter a valid account holder name"),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code (e.g. HDFC0XXXXXX)"),
  swiftCode: z.string().optional(),
  gstNumber: z
    .string()
    .regex(
      /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/,
      "Enter a valid GST number (15 characters)",
    ),
});

type CompanySetupForm = z.infer<typeof companySetupSchema>;

export default function CompanySetupPage() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const auth = getEmployerAuth();

  const form = useForm<CompanySetupForm>({
    resolver: zodResolver(companySetupSchema),
    defaultValues: {
      companyName: auth?.companyName ?? "",
      websiteUrl: "",
      companyEmail: auth?.companyEmail ?? "",
      companySize: "",
      city: "",
      state: "",
      primaryContactName: auth?.name ?? "",
      primaryContactRole: "",
      country: "",
      secondaryContactName: "",
      secondaryContactEmail: "",
      secondaryContactPhone: "",
      secondaryContactRole: "",
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      swiftCode: "",
      gstNumber: "",
    },
  });

  const countryValue = form.watch("country");
  const isIndia = (countryValue || "").trim().toLowerCase() === "india";
  const indianCities = Object.keys(cityStatePincode as Record<string, any>).sort();

  const handleSubmit = async (data: CompanySetupForm) => {
    setIsSaving(true);
    try {
      const auth = getEmployerAuth();
      if (!auth) {
        setLocation("/employer/login");
        return;
      }

      const payload = {
        companyName: data.companyName,
        websiteUrl: data.websiteUrl,
        companyEmail: data.companyEmail,
        companySize: data.companySize,
        city: data.city,
        state: data.state,
        country: data.country,
        primaryContactName: data.primaryContactName,
        primaryContactRole: data.primaryContactRole,
        secondaryContactName: data.secondaryContactName,
        secondaryContactEmail: data.secondaryContactEmail,
        secondaryContactPhone: data.secondaryContactPhone,
        secondaryContactRole: data.secondaryContactRole,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountHolderName: data.accountHolderName,
        ifscCode: data.ifscCode,
        swiftCode: data.swiftCode,
        gstNumber: data.gstNumber,
      };

      const response = await apiRequest("PUT", `/api/employer/${auth.id}/setup`, payload);
      const json = await response.json();

      if (json?.employer) {
        saveEmployerAuth(json.employer);
      }
      
      toast({
        title: "Company profile saved!",
        description: "Great! Now let's create your first project.",
      });
      
      // Navigate to onboarding
      setLocation("/employer/onboarding");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save company profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <img src={findternLogo} alt="Findtern" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-emerald-700">FINDTERN</span>
              <span className="text-xs text-slate-400 ml-1.5">INTERNSHIP SIMPLIFIED</span>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="hidden xs:flex items-center text-sm">
            <div className="flex items-center gap-3 rounded-full bg-slate-100 px-3 py-1.5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[13px] font-semibold">
                  1
                </div>
                <span className="hidden sm:inline text-emerald-800 font-medium whitespace-nowrap">Company Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[13px] font-semibold">
                  2
                </div>
                <span className="hidden sm:inline text-slate-400 whitespace-nowrap">Create Project</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tl from-emerald-300/10 to-cyan-300/10 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 relative">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Welcome to Findtern!
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            Complete Your Company Profile
          </h1>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-2xl shadow-emerald-900/5 rounded-3xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Company Profile</h2>
                <p className="text-emerald-100 text-sm">Tell us about your organization</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                {/* Company Details Section */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-emerald-700 mb-4">
                    <Building2 className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Company Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            Company Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                placeholder="Enter company name"
                                className="h-12 pl-10 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="websiteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            Website URL <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                placeholder="https://example.com"
                                className="h-12 pl-10 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="companyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            Company Email <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                type="email"
                                placeholder="contact@company.com"
                                className="h-12 pl-10 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                                {...field}
                                disabled
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="companySize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            Company Size <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-slate-400" />
                                  <SelectValue placeholder="Select company size" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companySizes.map((size) => (
                                <SelectItem key={size.value} value={size.value}>
                                  {size.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>
                  </div>
       

                {/* Address Section */}
                <div className="space-y-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-emerald-700 mb-4">
                    <MapPin className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Office Location</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            Country <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter country"
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
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            City <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            {isIndia ? (
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  const entry = (cityStatePincode as Record<string, any>)[value];
                                  if (entry?.state) {
                                    const stateName = String(entry.state).replace(/_/g, " ");
                                    form.setValue("state", stateName, { shouldValidate: true });
                                  }
                                }}
                              >
                                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <SelectValue placeholder="Select city" />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  {indianCities.map((city) => (
                                    <SelectItem key={city} value={city}>
                                      {city.replace(/_/g, " ")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                  placeholder="Enter city"
                                  className="h-12 pl-10 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                                  {...field}
                                />
                              </div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            State <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            {isIndia ? (
                              <Input
                                {...field}
                                value={field.value}
                                readOnly
                                className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-700"
                                placeholder="State auto-selected from city"
                              />
                            ) : (
                              <Input
                                placeholder="Enter state"
                                className="h-12 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                                {...field}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                  </div>
                </div>

                {/* Primary Contact Section */}
                <div className="space-y-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-emerald-700 mb-4">
                    <User className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Primary Contact Person</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormField
                      control={form.control}
                      name="primaryContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            Full Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                placeholder="Enter your name"
                                className="h-12 pl-10 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="primaryContactRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            Your Role / Position <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. HR Manager, Founder"
                              className="h-12 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Secondary Contact Section */}
                <div className="space-y-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-emerald-700 mb-4">
                    <User className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Secondary Contact Person</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="secondaryContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                placeholder="Enter secondary contact name"
                                className="h-12 pl-10 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="secondaryContactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                type="email"
                                placeholder="Enter secondary contact email"
                                className="h-12 pl-10 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="secondaryContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                placeholder="Enter phone number"
                                className="h-12 pl-10 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="secondaryContactRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Designation / Position</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. HR Manager, Founder"
                              className="h-12 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Billing Details Section */}
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-emerald-700 mb-4">
                    <CreditCard className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Billing Details</h3>
                  </div>
                  <div className="rounded-2xl bg-white/90 shadow-md shadow-emerald-900/5 border border-slate-100 px-5 md:px-6 py-5 md:py-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Bank Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter bank name"
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
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Account Number <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter account number"
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
                        name="accountHolderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Account Holder Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter account holder name"
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
                        name="ifscCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              IFSC Code <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter IFSC code"
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
                        name="swiftCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">SWIFT Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter SWIFT code"
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
                        name="gstNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              GST Number <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter GST number"
                                className="h-12 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-800 mb-1">What's Next?</h4>
                      <p className="text-sm text-emerald-700">
                        After saving your company profile, you'll create your first project to start finding the perfect interns for your team.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-14 px-12 text-base font-semibold rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-600/20 transition-all"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        Save & Continue
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </Card>

        {/* Bottom Note */}
        <p className="text-center text-sm text-slate-400 mt-6">
          You can update your company profile later from settings
        </p>
      </div>
    </div>
  );
}