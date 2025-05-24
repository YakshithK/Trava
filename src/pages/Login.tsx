
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting to sign in user:", email);

      if (!email.trim() || !password.trim()) {
        setError("Please enter both email and password");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log("Sign in response:", { data, error });

      if (error) {
        console.error("Sign in error:", error.message);
        
        // Provide user-friendly error messages
        let userMessage = "Login failed. Please try again.";
        if (error.message.includes("Invalid login credentials")) {
          userMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes("Email not confirmed")) {
          userMessage = "Please check your email and confirm your account before logging in.";
        } else if (error.message.includes("Too many requests")) {
          userMessage = "Too many login attempts. Please wait a few minutes and try again.";
        }
        
        setError(userMessage);
        return;
      }

      if (data.user) {
        console.log("Login successful, redirecting to dashboard");
        navigate("/dashboard");
      } else {
        console.error("No user data received");
        setError("Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Unexpected error during login:", error);
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
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-white p-6 rounded-3xl shadow-md border-none">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full large-button bg-saath-green hover:bg-saath-green/90 text-black"
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

        <div className="mt-6 flex justify-center">
          <VoiceHelp text={text.voiceHelp} />
        </div>
      </main>
    </div>
  );
};

export default Login;
