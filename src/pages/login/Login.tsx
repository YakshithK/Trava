import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import VoiceHelp from "@/components/VoiceHelp";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { supabase } from "@/config/supabase";
import VoiceHelpDiv from "@/components/VoiceHelpDiv";
import { handleSubmit } from "./functions";

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
    voiceHelp: "Welcome to the login page. Please enter your email and password to access your account.",
  },
};

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const text = onboardingTexts.en;

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
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="p-6 rounded-3xl shadow-md">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e, setIsLoading, setError, email, password, navigate);
            }} 
            className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xl">
                {text.emailLabel}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={text.emailPlaceholder}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xl">
                {text.passwordLabel}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={text.passwordPlaceholder}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
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
                    Signing in...
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

export default Login;
