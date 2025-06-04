import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface NoConnection {
  text: string;
}

export const NoConnection = ({text}: NoConnection) => (

    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background/50 to-white/80">
        <Card className="text-center p-12 max-w-lg mx-auto shadow-xl border-0 glass-effect backdrop-blur-md">
            <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">{text}</h3>
            <p className="text-muted-foreground text-lg">Choose a connection from the sidebar to start messaging</p>
            </div>
            <div className="text-sm text-muted-foreground">
            Your conversations will appear here once you select a connection
            </div>
        </Card>
    </div>
)
