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