
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import VoiceHelp from "@/components/VoiceHelp";
import LanguageSelector from "@/components/LanguageSelector";
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
  hi: {
    title: "अपने खाते में लॉगिन करें",
    subtitle: "हमसे जुड़ने के लिए धन्यवाद",
    emailLabel: "ईमेल",
    emailPlaceholder: "अपना ईमेल दर्ज करें",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    continue: "जारी रखें",
    back: "वापस",
    voiceHelp: "प्रोफ़ाइल बनाने के पृष्ठ पर आपका स्वागत है। कृपया अपना पूरा नाम, आयु, पसंदीदा भाषा और संपर्क नंबर दर्ज करें। आप प्रोफ़ाइल फोटो भी अपलोड कर सकते हैं। जब आप पूरा कर लें, तो जारी रखें पर क्लिक करें।",
  },
  te: {
    title: "మీ ఖాతాలో లాగిన్ అవ్వండి",
    subtitle: "మాతో చేరడానికి ధన్యవాదాలు",
    emailLabel: "ఇమెయిల్",
    emailPlaceholder: "మీ ఇమెయిల్‌ని నమోదు చేయండి",
    passwordLabel: "పాస్వర్డ్",
    passwordPlaceholder: "మీ పాస్వర్డ్‌ని నమోదు చేయండి",
    continue: "కొనసాగించండి",
    back: "వెనుకకు",
    voiceHelp: "ప్రొఫైల్ సృష్టి పేజీకి స్వాగతం. దయచేసి మీ పూర్తి పేరు, వయస్సు, ప్రాధాన్య భాష మరియు సంప్రదింపు సంఖ్యను నమోదు చేయండి. మీరు ప్రొఫైల్ ఫోటోను కూడా అప్‌లోడ్ చేయవచ్చు. పూర్తయినప్పుడు కొనసాగించండి క్లిక్ చేయండి.",
  }
};

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en");
  const text = onboardingTexts[language];


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
        <LanguageSelector
          onChange={(lang) => setLanguage(lang as "en" | "hi" | "te")}
          defaultLanguage={language}
        />
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
          <VoiceHelp text={text.voiceHelp} language={language} />
        </div>
      </main>
    </div>
  );
};

export default Login;
