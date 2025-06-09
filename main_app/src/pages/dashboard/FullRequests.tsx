import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { formatDate } from "./functions";
import { Button } from "@/components/ui/button";
import { Request } from "./types";

interface FullRequestProps {
  requests: Request[]
}

export const FullRequests = ({requests}: FullRequestProps) => (
    <div className="grid gap-4 md:grid-cols-2">
    {requests.map((request) => (
        <Card key={request.id}>
        <CardHeader>
            <CardTitle>{request.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{request.from} to {request.to}</span>
            </CardDescription>
            <CardDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(request.date)}</span>
            </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between gap-2">
            <Button variant="outline" className="w-full">Decline</Button>
            <Button className="w-full">Accept</Button>
        </CardFooter>
        </Card>
    ))}
    </div>
)