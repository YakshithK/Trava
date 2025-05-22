import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import VoiceHelp from "@/components/VoiceHelp";
import { ArrowLeft, Camera, User } from "lucide-react";
import { supabase } from "@/config/supabase";
import { sub } from "date-fns";

const onboardingTexts = {
  en: {
    title: "Login to your account",
    subtitle: "Thank you for joining us",
    emailLabel: "Email",
    emailPlaceholder: "Enter your email",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    continue: "Continue",
    back: "Back",
    voiceHelp: "Welcome to the profile creation page. Please enter your full name, age, preferred language, and contact number. You can also upload a profile photo. Click Continue when you're done.",
  },
};

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const text = onboardingTexts.en;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    console.log("User data:", data);
    
    if (error) {
      console.error("Error signing up:", error);
      return;
    }

    navigate("/trip-posting");
  };

  return (
    <div className="min-h-screen bg-saath-cream">
      <header className="p-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          className="text-saath-gray"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </header>

      <main className="page-container">
        <div className="mb-8 text-center">
          <h1 className="mb-2">{text.title}</h1>
          <p className="text-gray-600">{text.subtitle}</p>
        </div>

        <Card className="bg-white p-6 rounded-3xl shadow-md border-none">
          <form onSubmit={handleSubmit} className="space-y-6">

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
                placeholder={text.passwordPlaceholder}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full large-button bg-saath-green hover:bg-saath-green/90 text-black"
              >
                {text.continue}
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

export default Login;
