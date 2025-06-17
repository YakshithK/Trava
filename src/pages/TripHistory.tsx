import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  status: "completed" | "cancelled" | "ongoing";
  matches_count: number;
}

const TripHistory = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");

  const { data: trips, isLoading } = useQuery({
    queryKey: ["tripHistory", activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("departure_date", { ascending: false });

      if (error) throw error;
      return data as Trip[];
    },
  });

  const filteredTrips = trips?.filter((trip) => {
    if (activeTab === "all") return true;
    return trip.status === activeTab;
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t("tripHistory.title")}</h1>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t("tripHistory.tabs.all")}</TabsTrigger>
          <TabsTrigger value="completed">{t("tripHistory.tabs.completed")}</TabsTrigger>
          <TabsTrigger value="ongoing">{t("tripHistory.tabs.ongoing")}</TabsTrigger>
          <TabsTrigger value="cancelled">{t("tripHistory.tabs.cancelled")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTrips?.map((trip) => (
                <Card key={trip.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>{trip.origin} → {trip.destination}</span>
                      <span className={`text-sm ${
                        trip.status === "completed" ? "text-green-500" :
                        trip.status === "cancelled" ? "text-red-500" :
                        "text-blue-500"
                      }`}>
                        {trip.status}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(trip.departure_date), "PPP")}
                      {trip.return_date && ` - ${format(new Date(trip.return_date), "PPP")}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t("tripHistory.matches", { count: trip.matches_count })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TripHistory; 