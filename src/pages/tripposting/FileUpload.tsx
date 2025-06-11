import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload, Camera, FileText } from "lucide-react";
import Tesseract from 'tesseract.js';
import VoiceHelpDiv from "@/components/VoiceHelpDiv";
import { supabase } from "@/config/supabase";

const documentTexts = {
  en: {
    ticketTitle: "Upload Your Ticket",
    boardingPassTitle: "Upload Your Boarding Pass",
    subtitle: "Take a photo or upload from your device",
    uploadFromDevice: "Upload from Device (Image Only!)",
    takePhoto: "Take Photo",
    uploadedFile: "File uploaded:",
    continue: "Continue",
    back: "Back",
    ticketVoiceHelp: "Upload your flight ticket by taking a photo or selecting a file from your device. The system will automatically extract your flight information.",
    boardingPassVoiceHelp: "Upload your boarding pass by taking a photo or selecting a file from your device. The system will automatically extract your flight information.",
  },
};

export const FileUpload = () => {

  const { page } = useParams();

  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEdgeDone, setIsEdgeDone] = useState(false);
  const [edgeResponse, setEdgeResponse] = useState<any>(null);
  const text = documentTexts.en;

  const isTicket = page === 'ticket';
  const title = isTicket ? text.ticketTitle : text.boardingPassTitle;
  const voiceHelp = isTicket ? text.ticketVoiceHelp : text.boardingPassVoiceHelp;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleCameraCapture = () => {
    console.log("Camera capture would be implemented here");
  };

const handleContinue = async () => {

    if (!uploadedFile) {
      alert("Please upload a file first.");
      return;
    }

    setLoading(true);
    setIsEdgeDone(false);

    try {
      const formData = new FormData();
      formData.append("image", uploadedFile);

      const response = await fetch("https://kqrvuazjzcnlysbrndmq.supabase.co/functions/v1/parse-flight-info", {
        method: "POST",
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxcnZ1YXpqemNubHlzYnJuZG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4OTM4MTksImV4cCI6MjA2MjQ2OTgxOX0.Q8ZwRfb3mxIkFHZT2gPUR5KsANNvXi1v1Cjnm3YFW9U`,
        },
        body: formData,
      });

      const result = await response.json();

      setEdgeResponse(result);
      setIsEdgeDone(true);
    } catch (error) {
      console.error("Error calling edge function:", error);
      setEdgeResponse({ error: "Something went wrong." });
    } finally {
      localStorage.setItem("tripData", JSON.stringify({
        from: edgeResponse.from_airport,
        to: edgeResponse.to_airport,
        airline: edgeResponse.airline,
        flightNumber: edgeResponse.flight_number,
        date: edgeResponse.date,
      }))
      navigate("/trip-posting/new");
    }

  }  

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
          <h1 className="mb-2">{title}</h1>
          <p className="text-gray-600">{text.subtitle}</p>
        </div>

        <Card className="bg-card p-6 rounded-3xl shadow-md border">
          <div className="space-y-6">
            {!uploadedFile ? (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                  <div className="mb-4">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-600 mb-6">
                    {isTicket ? "Upload your flight ticket" : "Upload your boarding pass"}
                  </p>
                  
                  <div className="space-y-3">
                    <label htmlFor="file-upload">
                      <Button
                        variant="outline"
                        className="w-full h-14 text-lg rounded-xl border-2"
                        asChild
                      >
                        <span className="cursor-pointer flex items-center justify-center gap-2">
                          <Upload className="h-5 w-5" />
                          {text.uploadFromDevice}
                        </span>
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <Button
                      variant="outline"
                      className="w-full h-14 text-lg rounded-xl border-2"
                      onClick={handleCameraCapture}
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      {text.takePhoto}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <FileText className="h-16 w-16 text-saath-saffron mx-auto" />
                </div>
                <p className="text-gray-600 mb-2">{text.uploadedFile}</p>
                <p className="font-semibold text-lg mb-6">{uploadedFile.name}</p>
                
                <Button
                  onClick={handleContinue}
                  className="w-full large-button bg-saath-saffron hover:bg-saath-saffron/90 text-black"
                >
                  {text.continue}
                </Button>
              </div>
            )}
          </div>
        </Card>

        <VoiceHelpDiv text={voiceHelp} />
      </main>
    </div>
  );
};
