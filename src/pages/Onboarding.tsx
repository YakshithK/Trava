import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import VoiceHelp from "@/components/VoiceHelp";
import { ArrowLeft, Camera, User } from "lucide-react";
import { supabase } from "@/config/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";

const onboardingTexts = {
  en: {
    title: "Create Your Profile",
    subtitle: "Tell us about yourself",
    nameLabel: "Full Name",
    namePlaceholder: "Enter your full name",
    ageLabel: "Age",
    agePlaceholder: "Enter your age",
    languageLabel: "Preferred Language",
    phoneLabel: "Contact Number",
    phonePlaceholder: "Enter your phone number",
    emailLabel: "Email",
    emailPlaceholder: "Enter your email",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    photoLabel: "Profile Photo",
    photoButton: "Take Photo or Upload",
    continue: "Continue",
    back: "Back",
    voiceHelp: "Welcome to the profile creation page. Please enter your full name, age, preferred language, and contact number. You can also upload a profile photo. Click Continue when you're done.",
  },
};

const Onboarding = () => {
  const navigate = useNavigate();


  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const text = onboardingTexts.en;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setPhotoPreview(event.target.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // First, sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error("Error signing up:", signUpError);
        setError("Failed to create account. Please try again.");
        return;
      }

      if (!data.user) {
        console.error("No user data received after signup");
        setError("Failed to create account. Please try again.");
        return;
      }

      // Then, insert the user data into the users table
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        name,
        age: parseInt(age),
        contact_number: contactNumber,
        email,
        photo: photoPreview,
      });

      if (insertError) {
        console.error("Error inserting user data:", insertError);
        setError("Failed to save profile information. Please try again.");
        return;
      }

      // If everything is successful, navigate to verify page
      navigate("/verify");
    } catch (error) {
      console.error("Unexpected error during signup:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-saath-cream">
      <header className="p-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          className="text-saath-gray"
          onClick={() => navigate(-1)}
          disabled={isLoading}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </header>

      <main className="page-container">
        <div className="mb-8 text-center">
          <h1 className="mb-2">{text.title}</h1>
          <p className="text-gray-600">{text.subtitle}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-white p-6 rounded-3xl shadow-md border-none">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xl">
                {text.nameLabel}
              </Label>
              <Input
                id="name"
                placeholder={text.namePlaceholder}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-xl">
                {text.ageLabel}
              </Label>
              <Input 
                id="age"
                type="number"
                placeholder={text.agePlaceholder}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                required
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language-preference" className="text-xl">
                {text.languageLabel}
              </Label>
              <div className="mt-2">
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xl">
                {text.phoneLabel}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={text.phonePlaceholder}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                required
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xl">
                {text.emailLabel}
              </Label>
              <Input
                id="name"
                placeholder={text.emailPlaceholder}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xl">
                {text.passwordLabel}
              </Label>
              <Input
                id="name"
                type="password"
                placeholder={text.passwordPlaceholder}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo" className="text-xl">
                {text.photoLabel}
              </Label>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="w-full h-full rounded-full object-cover border-4 border-saath-saffron"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-saath-light-gray">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex items-center gap-2 bg-saath-saffron hover:bg-saath-saffron/90 text-black rounded-full px-6 py-3"
                >
                  <Camera className="h-5 w-5" />
                  <span>{text.photoButton}</span>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full large-button bg-saath-green hover:bg-saath-green/90 text-black"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  text.continue
                )}
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-6 flex justify-center">
          <VoiceHelp text={text.voiceHelp} />
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
