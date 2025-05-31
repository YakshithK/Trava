import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Function to read and parse CSV
function readCSV(filePath) {
  const csv = fs.readFileSync(filePath, 'utf-8');
  return Papa.parse(csv, { header: true }).data;
}

// Function to write CSV
function writeCSV(data, filePath) {
  const csv = Papa.unparse(data);
  fs.writeFileSync(filePath, csv);
}

// Main airports to keep
const mainAirports = [
  'JFK', 'LAX', 'ORD', 'DFW', 'SFO', 'ATL', 'LHR', 'CDG', 'FRA', 'AMS',
  'DXB', 'SIN', 'HKG', 'NRT', 'ICN', 'DEL', 'BOM', 'MAA', 'BLR', 'HYD',
  'BKK', 'KUL', 'SYD', 'MEL', 'AKL', 'YVR', 'YYZ', 'YUL', 'ZRH', 'MAD',
  'FCO', 'MUC', 'CPH', 'HEL', 'ARN', 'OSL', 'VIE', 'WAW', 'PRG', 'BUD',
  'IST', 'DOH', 'AUH', 'RUH', 'JED', 'CAI', 'JNB', 'CPT', 'GRU', 'EZE'
];

// Main airlines to keep
const mainAirlines = [
  'AA', 'DL', 'UA', 'BA', 'LH', 'AF', 'KL', 'TK', 'SQ', 'EK',
  'QR', 'EY', 'CX', 'QF', 'AC', 'JL', 'NH', 'KE', 'OZ', 'TG',
  'AI', 'ET', 'SA', 'SU', 'MU', 'CZ', 'CA', 'HU', 'MF', '3U'
];

// Process airports
console.log('Processing airports...');
const airports = readCSV('public/data/airports.csv');
const filteredAirports = airports.filter(airport => 
  mainAirports.includes(airport.iata_code) && 
  airport.type.includes('airport')
);
console.log(`Found ${filteredAirports.length} airports`);
writeCSV(filteredAirports, 'public/data/airports-short.csv');

// Process airlines
console.log('Processing airlines...');
const airlines = readCSV('public/data/airlines.csv');
console.log('First few airlines:', airlines.slice(0, 3));
console.log('Airline columns:', Object.keys(airlines[0] || {}));

// Create a simple airlines list with just the major airlines
const simpleAirlines = [
  { code: 'AA', name: 'American Airlines' },
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'BA', name: 'British Airways' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'AF', name: 'Air France' },
  { code: 'KL', name: 'KLM Royal Dutch Airlines' },
  { code: 'TK', name: 'Turkish Airlines' },
  { code: 'SQ', name: 'Singapore Airlines' },
  { code: 'EK', name: 'Emirates' },
  { code: 'QR', name: 'Qatar Airways' },
  { code: 'EY', name: 'Etihad Airways' },
  { code: 'CX', name: 'Cathay Pacific' },
  { code: 'QF', name: 'Qantas' },
  { code: 'AC', name: 'Air Canada' },
  { code: 'JL', name: 'Japan Airlines' },
  { code: 'NH', name: 'All Nippon Airways' },
  { code: 'KE', name: 'Korean Air' },
  { code: 'OZ', name: 'Asiana Airlines' },
  { code: 'TG', name: 'Thai Airways' },
  { code: 'AI', name: 'Air India' },
  { code: 'ET', name: 'Ethiopian Airlines' },
  { code: 'SA', name: 'South African Airways' },
  { code: 'SU', name: 'Aeroflot' },
  { code: 'MU', name: 'China Eastern Airlines' },
  { code: 'CZ', name: 'China Southern Airlines' },
  { code: 'CA', name: 'Air China' },
  { code: 'HU', name: 'Hainan Airlines' },
  { code: 'MF', name: 'Xiamen Airlines' },
  { code: '3U', name: 'Sichuan Airlines' }
];

writeCSV(simpleAirlines, 'public/data/airlines-short.csv');
console.log(`Created airlines-short.csv with ${simpleAirlines.length} airlines`);

console.log('CSV files have been shortened successfully!'); 