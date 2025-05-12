
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
  hi: {
    title: "अपना प्रोफ़ाइल बनाएं",
    subtitle: "हमें अपने बारे में बताएं",
    nameLabel: "पूरा नाम",
    namePlaceholder: "अपना पूरा नाम दर्ज करें",
    ageLabel: "आयु",
    agePlaceholder: "अपनी आयु दर्ज करें",
    languageLabel: "पसंदीदा भाषा",
    phoneLabel: "संपर्क नंबर",
    phonePlaceholder: "अपना फ़ोन नंबर दर्ज करें",
    emailLabel: "ईमेल",
    emailPlaceholder: "अपना ईमेल दर्ज करें",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    photoLabel: "प्रोफ़ाइल फोटो",
    photoButton: "फोटो लें या अपलोड करें",
    continue: "जारी रखें",
    back: "वापस",
    voiceHelp: "प्रोफ़ाइल बनाने के पृष्ठ पर आपका स्वागत है। कृपया अपना पूरा नाम, आयु, पसंदीदा भाषा और संपर्क नंबर दर्ज करें। आप प्रोफ़ाइल फोटो भी अपलोड कर सकते हैं। जब आप पूरा कर लें, तो जारी रखें पर क्लिक करें।",
  },
  te: {
    title: "మీ ప్రొఫైల్‌ని సృష్టించండి",
    subtitle: "మీ గురించి మాకు చెప్పండి",
    nameLabel: "పూర్తి పేరు",
    namePlaceholder: "మీ పూర్తి పేరు నమోదు చేయండి",
    ageLabel: "వయస్సు",
    agePlaceholder: "మీ వయస్సు నమోదు చేయండి",
    languageLabel: "ప్రాధాన్య భాష",
    phoneLabel: "సంప్రదించు నంబర్",
    phonePlaceholder: "మీ ఫోన్ నంబర్‌ని నమోదు చేయండి",
    emailLabel: "ఇమెయిల్",
    emailPlaceholder: "మీ ఇమెయిల్‌ని నమోదు చేయండి",
    passwordLabel: "పాస్వర్డ్",
    passwordPlaceholder: "మీ పాస్వర్డ్‌ని నమోదు చేయండి",
    photoLabel: "ప్రొఫైల్ ఫోటో",
    photoButton: "ఫోటో తీసుకోండి లేదా అప్‌లోడ్ చేయండి",
    continue: "కొనసాగించండి",
    back: "వెనుకకు",
    voiceHelp: "ప్రొఫైల్ సృష్టి పేజీకి స్వాగతం. దయచేసి మీ పూర్తి పేరు, వయస్సు, ప్రాధాన్య భాష మరియు సంప్రదింపు సంఖ్యను నమోదు చేయండి. మీరు ప్రొఫైల్ ఫోటోను కూడా అప్‌లోడ్ చేయవచ్చు. పూర్తయినప్పుడు కొనసాగించండి క్లిక్ చేయండి.",
  }
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
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en");
  const text = onboardingTexts[language];

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
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    await supabase.from("users").insert({
      id: data?.user?.id,
      name,
      age: parseInt(age),
      language,
      contact_number: contactNumber,
      email,
      photo: photoPreview,
    });
    
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
                min="50"
                max="100"
                required
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language-preference" className="text-xl">
                {text.languageLabel}
              </Label>
              <div className="mt-2">
                <LanguageSelector
                  onChange={(lang) => setLanguage(lang as "en" | "hi" | "te")}
                  defaultLanguage={language}
                />
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

export default Onboarding;
