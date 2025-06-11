
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

interface VoiceHelpProps {
  text: string;
  language?: 'en' | 'hi' | 'te';
}

const VoiceHelp = ({ text, language = 'en' }: VoiceHelpProps) => {
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language based on prop
      switch (language) {
        case 'hi':
          utterance.lang = 'hi-IN';
          break;
        case 'te':
          utterance.lang = 'te-IN';
          break;
        default:
          utterance.lang = 'en-IN';
      }

      utterance.rate = 0.9; // Slightly slower for better clarity
      utterance.pitch = 1;
      
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Button 
      onClick={speak} 
      variant="outline" 
      size="lg" 
      className={`rounded-full text-lg flex items-center gap-2 border-2 ${speaking ? 'bg-saath-saffron text-black border-saath-saffron' : 'bg-white text-saath-gray border-saath-saffron'}`}
    >
      <Volume2 className={`h-5 w-5 ${speaking ? 'animate-pulse' : ''}`} />
      {speaking ? "Speaking..." : "Voice Help"}
    </Button>
  );
};

export default VoiceHelp;
