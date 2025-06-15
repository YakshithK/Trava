import { Airline } from "../types";
import Papa from "papaparse"

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