
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, Users, MessageSquare, Mail } from "lucide-react";

const quickActions = [
  {
    name: "Post Trip",
    path: "/trip-posting",
    icon: PlusCircle,
    description: "Create a new trip",
    color: "bg-trava-emerald hover:bg-trava-forest",
  },
  {
    name: "View Matches",
    path: "/matches",
    icon: Users,
    description: "See your matches",
    color: "bg-trava-mint hover:bg-trava-emerald",
  },
  {
    name: "Messages",
    path: "/chat",
    icon: MessageSquare,
    description: "Chat with matches",
    color: "bg-trava-lime hover:bg-trava-mint",
  },
  {
    name: "Requests",
    path: "/requests",
    icon: Mail,
    description: "View trip requests",
    color: "bg-trava-dark-green hover:bg-trava-forest",
  },
];

export const QuickNav = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {quickActions.map((action) => (
        <Card key={action.path} className="p-0 overflow-hidden hover:shadow-lg transition-all duration-200">
          <Button
            asChild
            variant="ghost"
            className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-transparent"
          >
            <Link to={action.path}>
              <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center text-white transition-colors`}>
                <action.icon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{action.name}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          </Button>
        </Card>
      ))}
    </div>
  );
};
