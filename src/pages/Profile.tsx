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
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Users, DollarSign } from "lucide-react";
import { validatePhoneNumber } from "@/lib/validation";
import { fetchData, formatPhoneNumber, handleForgotPassword, handlePhotoChange, onSubmit, getReferralStats, profileFormSchema, ProfileFormValues } from "@/features/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  // const [totalReferrals, setTotalReferrals] = useState<any>(null)
  // const [pendingReferrals, setPendingReferrals] = useState<any>(null)
  // const [successfulReferrals, setSuccessfulReferrals] = useState<any>(null)

  const { t } = useTranslation();

  useEffect(() => {
    fetchData(
      setIsLoading,
      setError,
      setUser,
      form,
      setPhotoData
    );
  }, []);

  if (isLoading && !form.watch("name")) { 
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">
                {t('profile.loading')}
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

      {/* Referral Stats Cards - Commented out for now
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalReferrals || 0}</p>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{successfulReferrals || 0}</p>
                <p className="text-sm text-muted-foreground">Successful Signups</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">{pendingReferrals || 0}</p>
                <p className="text-sm text-muted-foreground">Pending Signups</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      */}

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.title')}</CardTitle>
          <CardDescription>{t('profile.subtitle')}</CardDescription>
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
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage src={photoData || ""} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-100 text-2xl font-semibold">
                  {form.watch("name")?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e, setError, setPhotoData)}
                className="w-auto"
              />
              <p className="text-xs text-muted-foreground">{t('profile.photoUpload.maxSize')}</p>
            </div>

            <div>
              <Label htmlFor="name">{t('profile.name')}</Label>
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
              <Label htmlFor="password">{t('profile.password')}</Label>
              <div
                onClick={() => handleForgotPassword(setIsLoading, setError, setSuccess, user)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <span className="text-muted-foreground">
                  {t('profile.resetPassword')}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="phoneNumber">{t('profile.phoneNumber')}</Label>
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
                placeholder={t('profile.phonePlaceholder')}
              />
              {phoneError && (
                <p className="text-sm text-red-500 mt-1">{phoneError}</p>
              )}
            </div>

            <div>
              <Label htmlFor="age">{t('profile.age')}</Label>
              <Input
                id="age"
                type="number"
                {...form.register("age", {
                  min: { value: 0, message: t('profile.validation.age.min') },
                  max: { value: 120, message: t('profile.validation.age.max') },
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
              <Label>{t('profile.referralCode')}</Label>
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
                      title: t('profile.copied.title'),
                      description: t('profile.copied.description'),
                    });
                  }}
                >
                  {t('profile.copy')}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-saath-saffron hover:bg-saath-saffron/90 text-black"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
