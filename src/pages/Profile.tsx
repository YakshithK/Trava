"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/config/supabase";
import { AlertTriangle } from "lucide-react";
import { validatePhoneNumber } from "@/lib/validation";

const profileFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  phoneNumber: z.string(),
  age: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      age: "",
    },
  });

  const [photoData, setPhotoData] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const formatPhoneNumber = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
  
    // Check if the number has more than 10 digits (i.e., has a country code)
    if (digitsOnly.length > 10) {
      const countryCode = digitsOnly.slice(0, digitsOnly.length - 10);
      const areaCode = digitsOnly.slice(-10, -7);
      const prefix = digitsOnly.slice(-7, -4);
      const lineNumber = digitsOnly.slice(-4);
      return `+${countryCode} (${areaCode}) ${prefix}-${lineNumber}`;
    }
  
    // Fallback: assume US-style local number if exactly 10 digits
    const match = digitsOnly.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  
    // If none of the above match, return original
    return phone;
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching user profile data...");
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No authenticated user found. Please log in again.");
        console.error("No authenticated user found");
        return;
      }
      setUser(user)
      const { data: userStats, error } = await supabase
        .from("users")
        .select("name, age, contact_number, photo")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error.message);
        setError(`Failed to load profile data: ${error.message}`);
        return;
      }

      console.log("User profile data loaded successfully");
      
      form.reset({
        name: userStats.name || "",
        phoneNumber: userStats.contact_number || "",
        age: userStats.age ? String(userStats.age) : "",
      });

      setPhotoData(userStats.photo || null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An unexpected error occurred while loading your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const {error} = await supabase.auth.resetPasswordForEmail(user.email);

      if (error) {
        setError(`Failed to senpassword reset emailL ${error.message}`);
      } else {
        setSuccess(`Password reset email sent to to ${user.email}. Please check your inbox.`);
      }
    } catch (err: any) {
      setError(`Unexpected error: ${err.message || "Please try again. "}`);
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo size must be less than 5MB");
      e.target.value = ''; // Clear the file input
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file (JPEG, PNG, etc.)");
      e.target.value = ''; // Clear the file input
      return;
    }

    // Check image dimensions
    const img = new Image();
    img.onload = () => {
      if (img.width > 2000 || img.height > 2000) {
        setError("Image dimensions should not exceed 2000x2000 pixels");
        e.target.value = ''; // Clear the file input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(reader.result as string);
        setError(null);
      };
      reader.onerror = () => {
        setError("Failed to read the image file");
        e.target.value = ''; // Clear the file input
      };
      reader.readAsDataURL(file);
    };
    img.onerror = () => {
      setError("Failed to load image. Please try another file.");
      e.target.value = ''; // Clear the file input
    };
    img.src = URL.createObjectURL(file);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    // Check for any validation errors before proceeding
    if (phoneError) {
      setError("Please fix the phone number format before saving");
      return;
    }

    // Validate age
    const ageNum = Number(data.age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setError("Please enter a valid age between 0 and 120");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log("Updating user profile...", data);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No authenticated user found. Please log in again.");
        console.error("No authenticated user found during update");
        return;
      }

      const { error } = await supabase
        .from("users")
        .update({
          name: data.name,
          contact_number: data.phoneNumber,
          age: Number(data.age),
          photo: photoData,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error.message);
        setError(`Failed to update profile: ${error.message}`);
        return;
      }

      console.log("Profile updated successfully");
      setSuccess("Your profile has been updated successfully!");
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Unexpected error during profile update:", error);
      setError(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
      
      toast({
        title: "Update failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !form.watch("name")) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading your profile...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              {photoData && (
                <img
                  src={photoData}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
                />
              )}
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoChange}
                className="w-auto"
              />
              <p className="text-xs text-muted-foreground">Max size: 5MB</p>
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                {...form.register("name")}
                disabled={isLoading}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div onClick={handleForgotPassword} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <span className="text-muted-foreground">Click here to reset password</span>
              </div>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber" 
                {...form.register("phoneNumber", {
                  onChange: (e) => {
                    const formattedNumber = formatPhoneNumber(e.target.value);
                    e.target.value = formattedNumber;
                    setPhoneError(validatePhoneNumber(formattedNumber));
                  }
                })}
                disabled={isLoading}
                placeholder="(123) 456-7890"
              />
              {phoneError && (
                <p className="text-sm text-red-500 mt-1">{phoneError}</p>
              )} 
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input 
                id="age" 
                type="number" 
                {...form.register("age", {
                  min: { value: 0, message: "Age must be at least 0" },
                  max: { value: 120, message: "Age must be less than 120" }
                })}
                disabled={isLoading}
              />
              {form.formState.errors.age && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.age.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
