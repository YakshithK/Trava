import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchRequests, formatDate, getInitials, getStatusColor, handleAcceptRequest, handleCancelRequest, MatchRequest} from "@/features/requesting";
import { notificationsService } from "@/features/notifications";
import { useAuth } from "@/context/authContext";
import { useTranslation } from "react-i18next";

const Requests = () => {
  const [incoming, setIncoming] = useState<MatchRequest[]>([]);
  const [outgoing, setOutgoing] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    fetchRequests(setLoading, setIncoming, setOutgoing);
    
    // Mark request notifications as read when visiting the requests page
    if (user?.id) {
      notificationsService.markRequestNotificationsAsRead(user.id);
    }
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('requests.title')}</h1>
        <p className="text-muted-foreground">
          {t('requests.subtitle')}
        </p> 
      </div>

      <Tabs defaultValue="incoming">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incoming">
            {t('requests.incoming')}
            {incoming.length > 0 && (
              <Badge className="ml-2 bg-amber-500">{incoming.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            {t('requests.outgoing')}
            {outgoing.length > 0 && (
              <Badge className="ml-2">{outgoing.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming" className="mt-6">
          {incoming.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incoming.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.photoUrl} />
                      <AvatarFallback>{getInitials(request.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{request.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{request.age}</span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{request.from} to {request.to}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(request.date)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button variant="outline" className="w-full" onClick={() => handleCancelRequest(request.id, setOutgoing)}>{t('requests.decline')}</Button>
                    <Button className="w-full" onClick={() => handleAcceptRequest(request.from_user, request.to_user, request.id, setIncoming)}>{t('requests.accept')}</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {t('requests.noIncoming')}
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="mt-6">
          {outgoing.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {outgoing.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.photoUrl} />
                      <AvatarFallback>{getInitials(request.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle>{request.name}</CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {t(`requests.status.${request.status}`)}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{request.age}</span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{request.from} to {request.to}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(request.date)}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {request.status === "accepted" ? (
                      <Button asChild className="w-full">
                        <a href={`/chat/${request.id}`}>{t('requests.startChat')}</a>
                      </Button>
                    ) : request.status === "pending" ? (
                      <Button variant="outline" className="w-full" onClick={() => handleCancelRequest(request.id, setOutgoing)}>{t('requests.cancel')}</Button>
                    ) : (
                      <Button variant="outline" className="w-full">{t('requests.remove')}</Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {t('requests.noOutgoing')}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Requests;
