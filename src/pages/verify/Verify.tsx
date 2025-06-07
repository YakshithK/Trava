import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/config/supabase";
import { handleResendVerification } from "./functions";

const Verify = () => {
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onboardingData = JSON.parse(localStorage.getItem("onboardingData")|| "{}")

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          className="text-saath-gray"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </header>
      <main className="page-container">
        <div className="mb-8 text-center">
          <h1 className="mb-2">Verify Your Email</h1>
          <p className="text-muted-foreground">
            We've sent you a verification email. Please check your inbox and click the verification link to continue.
          </p>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <Card className="p-6 rounded-3xl shadow-md">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Check Your Email</h2>
              <p className="text-muted-foreground">
                We've sent a verification link to your email address. Please check your inbox and spam folder.
              </p>
            </div>
            <div className="w-full space-y-4">
              <Button
                onClick={() => handleResendVerification(setIsResending, setError, setSuccess, onboardingData)}
                className="w-full large-button bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full large-button"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Verify;
