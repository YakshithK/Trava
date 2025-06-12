import { supabase } from "@/config/supabase";
import Papa from "papaparse"
import { Airline, Airport } from "./types";
import React from "react";

export const fetchData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching session:", error);
      }
    };

export const fetchAirports = async (setAirportList: React.Dispatch<React.SetStateAction<Airport[]>>) => {
      fetch("/data/airports-short.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setAirportList(results.data)
          }
        })
      })
    }

export const fetchAirlines = async (setAirlineList: React.Dispatch<React.SetStateAction<Airline[]>>) => {
      fetch("/data/airlines-short.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const airlines = results.data.map((airline: any) => ({
              code: airline.code,
              name: airline.name
            }));
            setAirlineList(airlines);
          }
        })
      })
    }

export const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>,
  setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

export const handleCameraCapture = () => {
    console.log("Camera capture would be implemented here");
  };

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