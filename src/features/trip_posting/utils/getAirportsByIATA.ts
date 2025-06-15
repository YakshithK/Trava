import { commonAirportAddresses } from '../data/commonAirports';

export const getAirportAddressByIATA = (iataCode: string): string | null => {
  return commonAirportAddresses[iataCode.toUpperCase()] || null;
};
