import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload, Camera, FileText } from "lucide-react";
import VoiceHelpDiv from "@/components/VoiceHelpDiv";
import { handleCameraCapture, handleContinue, handleFileUpload } from "@/features/trip_posting/index";
import { useTranslation } from "react-i18next";

export const FileUpload = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEdgeDone, setIsEdgeDone] = useState(false);
  const [edgeResponse, setEdgeResponse] = useState<any>(null);
  const { t } = useTranslation();

  const isTicket = page === 'ticket';
  const type = isTicket ? 'ticket' : 'boardingPass';

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-saath-saffron border-t-transparent"></div>
      </div>
    );
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
          <h1 className="mb-2">{t(`fileUpload.${type}.title`)}</h1>
          <p className="text-gray-600">{t(`fileUpload.${type}.subtitle`)}</p>
        </div>

        <Card className="bg-card p-6 rounded-3xl shadow-md border">
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <label htmlFor="file-upload">
                <Button
                  variant="outline"
                  className="h-14 text-lg w-full"
                  asChild
                >
                  <span className="cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="h-5 w-5" />
                    {t(`fileUpload.${type}.uploadFromDevice`)}
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, setUploadedFile)}
                className="hidden"
              />

              <Button
                variant="outline"
                className="h-14 text-lg"
                onClick={handleCameraCapture}
              >
                <Camera className="mr-2 h-5 w-5" />
                {t(`fileUpload.${type}.takePhoto`)}
              </Button>
            </div>

            {uploadedFile && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t(`fileUpload.${type}.uploadedFile`)} {uploadedFile.name}
                </p>
              </div>
            )}

            {isEdgeDone && (
              <Button
                className="w-full h-14 text-lg bg-saath-saffron hover:bg-saath-saffron/90 text-black"
                onClick={() => handleContinue(uploadedFile, setLoading, setIsEdgeDone, setEdgeResponse, navigate, edgeResponse)}
              >
                {t(`fileUpload.${type}.continue`)}
              </Button>
            )}
          </div>
        </Card>

        <VoiceHelpDiv text={t(`fileUpload.${type}.voiceHelp`)} />
      </main>
    </div>
  );
};
