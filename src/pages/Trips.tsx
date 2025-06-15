
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plane, Upload, Edit } from "lucide-react";
import VoiceHelpDiv from "@/components/VoiceHelpDiv";

const tripSelectionTexts = {
  en: {
    title: "Post Your Trip",
    subtitle: "How would you like to create your trip?",
    uploadTicket: "Upload Ticket",
    uploadTicketDesc: "Scan or upload your flight ticket",
    uploadBoardingPass: "Upload Boarding Pass",
    uploadBoardingPassDesc: "Scan or upload your boarding pass",
    manualEntry: "Manual Entry",
    manualEntryDesc: "Enter trip details manually",
    back: "Back",
    voiceHelp: "Choose how you want to post your trip. You can upload your ticket, boarding pass, or enter details manually. Uploading documents will automatically fill in your trip information.",
  },
};

const TripSelection = () => {
  const navigate = useNavigate();
  const text = tripSelectionTexts.en;

  const handleSelection = (type: 'ticket' | 'boarding-pass' | 'manual') => {
    if (type === 'manual') {
      navigate('/trip-posting/new');
    } else {
      navigate(`/trip-posting/${type}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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

        <div className="space-y-4">
          <Card 
            className="bg-card p-6 rounded-3xl shadow-md border cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSelection('ticket')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-saath-saffron/10 rounded-2xl">
                <Upload className="h-8 w-8 text-saath-saffron" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">{text.uploadTicket}</h3>
                <p className="text-gray-600">{text.uploadTicketDesc}</p>
              </div>
            </div>
          </Card>

          <Card 
            className="bg-card p-6 rounded-3xl shadow-md border cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSelection('boarding-pass')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-saath-saffron/10 rounded-2xl">
                <Plane className="h-8 w-8 text-saath-saffron" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">{text.uploadBoardingPass}</h3>
                <p className="text-gray-600">{text.uploadBoardingPassDesc}</p>
              </div>
            </div>
          </Card>

          <Card 
            className="bg-card p-6 rounded-3xl shadow-md border cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSelection('manual')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-saath-saffron/10 rounded-2xl">
                <Edit className="h-8 w-8 text-saath-saffron" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">{text.manualEntry}</h3>
                <p className="text-gray-600">{text.manualEntryDesc}</p>
              </div>
            </div>
          </Card>
        </div>

        <VoiceHelpDiv text={text.voiceHelp} />
      </main>
    </div>
  );
};

export default TripSelection;
