import { Airport } from "../types"
import Papa from "papaparse"

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