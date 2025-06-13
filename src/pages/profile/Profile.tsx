
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
import { AlertTriangle, Users, DollarSign } from "lucide-react";
import { validatePhoneNumber } from "@/lib/validation";
import { profileFormSchema, ProfileFormValues } from "./types";
import { fetchData, formatPhoneNumber, handleForgotPassword, handlePhotoChange, onSubmit } from "./functions";
import { set } from "date-fns";

export default function Profile() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      age: "",
      code: "",
    },
  });

  const [photoData, setPhotoData] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Hard-coded referral stats
  const referralStats = {
    totalReferrals: 12,
    totalEarnings: 240.00,
    pendingEarnings: 60.00,
    successfulReferrals: 8
  };

  useEffect(() => {
    fetchData(setIsLoading, setError, setUser, form, setPhotoData);
  }, []);

  if (isLoading && !form.watch("name")) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">
                Loading your profile...
              </span>
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

      {/* Referral Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{referralStats.successfulReferrals}</p>
                <p className="text-sm text-muted-foreground">Successful Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">${referralStats.totalEarnings.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">${referralStats.pendingEarnings.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Pending Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((data) =>
              onSubmit(
                data,
                setIsLoading,
                setError,
                setSuccess,
                photoData,
                phoneError,
                toast
              )
            )}
            className="space-y-4"
          >
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
                onChange={(e) => handlePhotoChange(e, setError, setPhotoData)}
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
              <div
                onClick={() => handleForgotPassword(setIsLoading, setError, setSuccess, user)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <span className="text-muted-foreground">
                  Click here to reset password
                </span>
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
                  },
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
                  max: { value: 120, message: "Age must be less than 120" },
                })}
                disabled={isLoading}
              />
              {form.formState.errors.age && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.age.message}
                </p>
              )}
            </div>

            <div>
              <Label>Referral Code</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  {...form.register("code")}
                  readOnly
                  className="bg-muted"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/onboarding?ref=${form.getValues("code")}`);
                    toast({
                      title: "Copied!",
                      description: "Referral code copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
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
