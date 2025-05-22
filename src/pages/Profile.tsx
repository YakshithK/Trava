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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/config/supabase";

const profileFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  phoneNumber: z.string(),
  age: z.string(),
  language: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      age: "",
      language: "",
    },
  });

  const [photoData, setPhotoData] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: userStats, error } = await supabase
        .from("users")
        .select("name, age, language, contact_number, photo")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error.message);
        return;
      }

      form.reset({
        name: userStats.name || "",
        phoneNumber: userStats.contact_number || "",
        age: userStats.age ? String(userStats.age) : "",
        language: userStats.language || "",
      });

      setPhotoData(userStats.photo || null);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("users")
        .update({
          name: data.name,
          contact_number: data.phoneNumber,
          age: Number(data.age),
          language: data.language,
          photo: photoData,
        })
        .eq("id", user.id);

      if (error) throw new Error(error.message);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    
    <div className="p-6 space-y-6">
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
                  className="w-24 h-24 rounded-full object-cover"
                />
              )}
              <Input type="file" accept="image/*" onChange={handlePhotoChange} />
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" {...form.register("phoneNumber")} />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" {...form.register("age")} />
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Input id="language" {...form.register("language")} />
            </div>

            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
