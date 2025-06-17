
import { Calendar, MapPin, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import { useTranslation } from "react-i18next";

interface TimelineProps {
  trips: any[];
}

export const Timeline = ({ trips }: TimelineProps) => {
  const { t } = useTranslation();
  const isLocked = trips.length < 3;
  const sortedTrips = [...trips].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (isLocked) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-lg">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Timeline Locked</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Post {3 - trips.length} more trip{3 - trips.length === 1 ? '' : 's'} to unlock your travel timeline
              </p>
              <Button asChild size="sm" className="mt-2">
                <Link to="/trip-posting">Post a Trip</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Blurred preview content */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Travel Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 opacity-30">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                {i < 3 && <div className="w-0.5 h-12 bg-border mt-2"></div>}
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-muted rounded w-48"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Travel Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedTrips.map((trip, index) => (
          <div key={trip.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              {index < sortedTrips.length - 1 && (
                <div className="w-0.5 h-12 bg-border mt-2"></div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{trip.from} → {trip.to}</h4>
                <Badge variant="outline">{trip.language}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(trip.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{trip.airline}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
