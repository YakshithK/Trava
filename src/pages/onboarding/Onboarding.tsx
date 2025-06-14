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
import { validateEmail, validatePhoneNumber,  validatePassword, validateConfirmPassword} from "@/lib/validation";
import VoiceHelpDiv from "@/components/VoiceHelpDiv";
import { formatPhoneNumber, handleFileChange, handleSubmit } from "./functions";
import { PhotoUpload } from "./PhotoUpload";
import { Password } from "./Password";
import { ConfirmPassword } from "./ConfirmPassword";

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

  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const text = onboardingTexts.en;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const refCode = params.get('ref')
    if (refCode) {
      localStorage.setItem("referral_code", refCode)
      async function insertRef() {
        const {data, error: referrerError} = await supabase
          .from("users")
          .select("id")
          .eq("code", refCode)
          .single()

        const {error: insertError} = await supabase
          .from("referral_clicks").insert({
            referrer_id: data.id,
            created_at: new Date().toISOString()
          })
        }
        insertRef()
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
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
          <p className="text-muted-foreground">{text.subtitle}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="p-6 rounded-3xl shadow-md">
          <form onSubmit={(e) => handleSubmit(
            e,
            setIsLoading,
            setError,
            email,
            contactNumber,
            password,
            confirmPassword,
            name,
            age,
            photoFile,
            setEmailError,
            setPhoneError,
            setPasswordError,
            setConfirmPasswordError,
            navigate
          )} className="space-y-6">
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
              <Label htmlFor="phone" className="text-xl">
                {text.phoneLabel}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={text.phonePlaceholder}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                value={contactNumber}
                onChange={(e) => {
                  setContactNumber(formatPhoneNumber(e.target.value));
                  setPhoneError(validatePhoneNumber(e.target.value));
                }}
              />
              {phoneError && (
                <p className="text-sm text-red-500 mt-1">{phoneError}</p>
              )}
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
                onChange={(e) => {
                  const newEmail = e.target.value
                  setEmail(newEmail)
                  setEmailError(validateEmail(newEmail))
                }}
                onBlur={(e) => {
                  setEmailError(validateEmail(e.target.value))
                }}
              />
              {emailError && (
                <p className="text-sm text-red-500 mt-1">{emailError}</p>
              )}
            </div>

            <Password text={text}
              password={password}
              setPassword={setPassword}
              setPasswordError={setPasswordError}
              confirmPassword={confirmPassword}
              passwordError={passwordError}
              setConfirmPasswordError={setConfirmPasswordError}
            />

            <ConfirmPassword
              password={password}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              setConfirmPasswordError={setConfirmPasswordError}
              confirmPasswordError={confirmPasswordError}
              />
            <div className="space-y-2">
              <Label htmlFor="photo" className="text-xl">
                {text.photoLabel}
              </Label>
              <PhotoUpload text={text} 
              handleFileChange={(e) => handleFileChange(e, setPhotoPreview, setPhotoFile)} 
              photoPreview={photoPreview} 
              setPhotoPreview={setPhotoPreview} 
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full large-button bg-primary hover:bg-primary/90 text-primary-foreground"
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

        <VoiceHelpDiv text={text.voiceHelp} />
      </main>
    </div>
  );
};

export default Onboarding;
