
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageSelectorProps {
  onChange?: (language: string) => void;
  defaultLanguage?: string;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
];

const LanguageSelector = ({ onChange, defaultLanguage = "en" }: LanguageSelectorProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    languages.find((lang) => lang.code === defaultLanguage) || languages[0]
  );

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    if (onChange) {
      onChange(language.code);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-2 border-saath-saffron bg-white text-xl py-3 px-6 rounded-full w-full md:w-auto justify-between"
        >
          <span>{selectedLanguage.nativeName}</span>
          <ChevronDown className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="bg-white w-[200px] p-2 rounded-2xl shadow-lg">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className={`flex items-center justify-between p-3 text-lg rounded-xl cursor-pointer ${
              selectedLanguage.code === language.code
                ? "bg-saath-light-green text-saath-gray"
                : "hover:bg-saath-light-gray"
            }`}
            onClick={() => handleLanguageChange(language)}
          >
            <span>
              {language.nativeName} ({language.name})
            </span>
            {selectedLanguage.code === language.code && (
              <Check className="h-5 w-5" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
