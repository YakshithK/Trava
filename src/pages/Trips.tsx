import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plane, Upload, Edit } from "lucide-react";
import { useTranslation } from "react-i18next";

const TripSelection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          <h1 className="mb-2">{t('tripSelection.title')}</h1>
          <p className="text-gray-600">{t('tripSelection.subtitle')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            className="p-6 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleSelection('ticket')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('tripSelection.uploadTicket.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('tripSelection.uploadTicket.description')}
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleSelection('boarding-pass')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('tripSelection.uploadBoardingPass.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('tripSelection.uploadBoardingPass.description')}
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleSelection('manual')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Edit className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('tripSelection.manualEntry.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('tripSelection.manualEntry.description')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TripSelection;
