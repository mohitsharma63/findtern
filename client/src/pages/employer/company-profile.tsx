import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Bell, 
  Save, 
  Loader2,
  Building2,
  CreditCard,
  ChevronDown,
  ShoppingCart,
  MessageSquare,
  CheckCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { companySizes } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import findternLogo from "@assets/IMG-20251119-WA0003_1765959112655.jpg";

// Basic Info Schema
const basicInfoSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  websiteUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  companyEmail: z.string().email("Please enter a valid email"),
  companySize: z.string().min(1, "Please select company size"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  primaryContactName: z.string().min(2, "Name is required"),
  primaryContactRole: z.string().min(2, "Role is required"),
  escalationContactName: z.string().optional(),
  escalationContactEmail: z.string().email().optional().or(z.literal("")),
  escalationContactPhone: z.string().optional(),
  escalationContactRole: z.string().optional(),
});

// Billing Schema
const billingSchema = z.object({
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(8, "Account number is required"),
  accountHolderName: z.string().min(2, "Account holder name is required"),
  ifscCode: z.string().min(11, "IFSC code must be 11 characters").max(11),
  swiftCode: z.string().optional(),
  gstNumber: z.string().min(15, "GST number must be 15 characters").max(15),
});

export default function CompanyProfilePage() {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Sample projects for dropdown
  const projects = [
    { id: "1", name: "test 1" },
    { id: "2", name: "Mobile App" },
    { id: "3", name: "Web Platform" },
  ];
  const [selectedProject, setSelectedProject] = useState(projects[0]);

  const basicForm = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      companyName: "neograma",
      websiteUrl: "",
      companyEmail: "aditya5040@neograma.com",
      companySize: "",
      city: "",
      state: "",
      primaryContactName: "ram",
      primaryContactRole: "",
      escalationContactName: "",
      escalationContactEmail: "",
      escalationContactPhone: "",
      escalationContactRole: "",
    },
  });

  const billingForm = useForm({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      swiftCode: "",
      gstNumber: "",
    },
  });

  const handleBasicInfoSave = async (data: z.infer<typeof basicInfoSchema>) => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Profile updated",
        description: "Your company information has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBillingSave = async (data: z.infer<typeof billingSchema>) => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Billing updated",
        description: "Your billing information has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <img src={findternLogo} alt="Findtern" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-emerald-700">FINDTERN</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Project Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 px-3 rounded-lg border-slate-200 gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline">{selectedProject.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {projects.map((project) => (
                  <DropdownMenuItem 
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="cursor-pointer"
                  >
                    {selectedProject.id === project.id && (
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                    )}
                    {project.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Action buttons */}
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
              <Building2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 relative">
              <ShoppingCart className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">1</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <Bell className="w-4 h-4" />
            </Button>

            {/* Profile Avatar */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
              N
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container px-4 md:px-8 py-8 max-w-4xl mx-auto">
        <Card className="border-0 shadow-xl shadow-emerald-900/5 rounded-3xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-5">
            <h1 className="text-xl font-bold text-white">Company Profile</h1>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-100 px-8">
              <TabsList className="h-14 bg-transparent gap-8 p-0">
                <TabsTrigger 
                  value="basic" 
                  className="h-14 px-0 border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  className="h-14 px-0 border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
                >
                  Billing
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="p-8 mt-0">
              <Form {...basicForm}>
                <form onSubmit={basicForm.handleSubmit(handleBasicInfoSave)} className="space-y-8">
                  {/* Company Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Company Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={basicForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              Company Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={basicForm.control}
                        name="websiteUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              Website URL <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Website URL"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={basicForm.control}
                        name="companyEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              Company Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-11 rounded-xl border-slate-200 bg-slate-50"
                                disabled
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={basicForm.control}
                        name="companySize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              Size of Company <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                  <SelectValue placeholder="Select size" />
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
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={basicForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              City <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter City"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={basicForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              State <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter State"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* First Point of Contact Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">First Point of Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={basicForm.control}
                        name="primaryContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              Full Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={basicForm.control}
                        name="primaryContactRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              Position / Role <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Position / Role"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Escalation Contact Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Escalation Contact <span className="text-emerald-600 font-normal">(Second Contact)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={basicForm.control}
                        name="escalationContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Name"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={basicForm.control}
                        name="escalationContactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Email"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={basicForm.control}
                        name="escalationContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Phone"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={basicForm.control}
                        name="escalationContactRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              Position / <span className="text-red-500">Role</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Position / Role"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-center pt-4">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="h-12 px-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="p-8 mt-0">
              <Form {...billingForm}>
                <form onSubmit={billingForm.handleSubmit(handleBillingSave)} className="space-y-8">
                  {/* Billing & Payment Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Billing & Payment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={billingForm.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              Bank Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Bank Name"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={billingForm.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              Account Number <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Account Number"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={billingForm.control}
                        name="accountHolderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              Account Holder Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Account Holder Name"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={billingForm.control}
                        name="ifscCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              IFSC Code <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter IFSC Code"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={billingForm.control}
                        name="swiftCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">SWIFT Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter SWIFT Code"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={billingForm.control}
                        name="gstNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600">
                              GST Number <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter GST Number"
                                className="h-11 rounded-xl border-slate-200 focus:border-emerald-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-center pt-4">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="h-12 px-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

