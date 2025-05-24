
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingState = ({ message = "Loading...", fullScreen = false }: LoadingStateProps) => {
  const containerClass = fullScreen 
    ? "min-h-screen flex items-center justify-center p-6" 
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground text-center">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingState;
