import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import VoiceHelp from "@/components/VoiceHelp";

const welcomeTexts = {
  en: {
    title: "Welcome to Trava",
    subtitle: "Find a travel companion for your international journey",
    login: "Log In",
    create: "Create Account",
    voiceHelp: "Welcome to Trava - your companion for international travel. Here you can find travel partners for your journey. Click on Login if you already have an account, or Create Account to get started.",
  },
};

const Welcome = () => {
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en");
  const text = welcomeTexts[language];

  return (
    <div className="min-h-screen bg-saath-cream flex flex-col">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Trava</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative">
        <Card className="w-full max-w-md p-6 bg-white rounded-3xl shadow-lg border-none animate-fade-in">
          <div className="mb-8">
            <img
              src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
              alt="Elderly people traveling"
              className="w-full h-48 object-cover rounded-2xl mb-6"
            />
            <h2 className="text-center mb-2">{text.title}</h2>
            <p className="text-center text-gray-600 mb-6">{text.subtitle}</p>
          </div>

          <div className="space-y-4">
            <Button
              asChild
              className="large-button w-full bg-saath-saffron hover:bg-saath-saffron/90 text-black"
            >
              <Link to="/login">{text.login}</Link>
            </Button>
            <Button
              asChild
              className="large-button w-full bg-saath-green hover:bg-saath-green/90 text-black"
            >
              <Link to="/onboarding">{text.create}</Link>
            </Button>
          </div>
        </Card>

        <div className="mt-6">
          <VoiceHelp text={text.voiceHelp} language={language} />
        </div>
      </main>
    </div>
  );
};

export default Welcome;
