export const handleContinue = async (uploadedFile: File,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setIsEdgeDone: React.Dispatch<React.SetStateAction<boolean>>,
    setEdgeResponse: React.Dispatch<React.SetStateAction<any>>,
    navigate: (path: string) => void,
    edgeResponse: any
    ) => {
  
      if (!uploadedFile) {
        alert("Please upload a file first.");
        return;
      }
  
      setLoading(true);
      setIsEdgeDone(false);
  
      let result: any = null;
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
  
        result = await response.json();
  
        setEdgeResponse(result);
        setIsEdgeDone(true);
      } catch (error) {
        console.error("Error calling edge function:", error);
        setEdgeResponse({ error: "Something went wrong." });
      } finally {
        if (result) {
          localStorage.setItem("tripData", JSON.stringify({
            from: result.from_airport,
            to: result.to_airport,
            airline: result.airline,
            flightNumber: result.flight_number,
            date: result.date,
          }));
        }
        setLoading(false);
        navigate("/trip-posting/new");
      }
  
    }