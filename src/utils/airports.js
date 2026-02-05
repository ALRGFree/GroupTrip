/**
 * Airport codes database for autocomplete
 * Contains major international airports with their codes, names, cities, and timezones
 */

export const airports = [
  // United States
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'USA', timezone: 'America/New_York' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles' },
  { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA', timezone: 'America/Chicago' },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA', timezone: 'America/Chicago' },
  { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'USA', timezone: 'America/Denver' },
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', timezone: 'America/New_York' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA', timezone: 'America/Los_Angeles' },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA', timezone: 'America/Los_Angeles' },
  { code: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', country: 'USA', timezone: 'America/Los_Angeles' },
  { code: 'MCO', name: 'Orlando International', city: 'Orlando', country: 'USA', timezone: 'America/New_York' },
  { code: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'USA', timezone: 'America/New_York' },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', timezone: 'America/New_York' },
  { code: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix', country: 'USA', timezone: 'America/Phoenix' },
  { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'USA', timezone: 'America/Chicago' },
  { code: 'BOS', name: 'Boston Logan International', city: 'Boston', country: 'USA', timezone: 'America/New_York' },
  { code: 'MSP', name: 'Minneapolis-Saint Paul International', city: 'Minneapolis', country: 'USA', timezone: 'America/Chicago' },
  { code: 'DTW', name: 'Detroit Metropolitan', city: 'Detroit', country: 'USA', timezone: 'America/Detroit' },
  { code: 'PHL', name: 'Philadelphia International', city: 'Philadelphia', country: 'USA', timezone: 'America/New_York' },
  { code: 'LGA', name: 'LaGuardia', city: 'New York', country: 'USA', timezone: 'America/New_York' },
  { code: 'BWI', name: 'Baltimore/Washington International', city: 'Baltimore', country: 'USA', timezone: 'America/New_York' },
  { code: 'SLC', name: 'Salt Lake City International', city: 'Salt Lake City', country: 'USA', timezone: 'America/Denver' },
  { code: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington D.C.', country: 'USA', timezone: 'America/New_York' },
  { code: 'IAD', name: 'Washington Dulles International', city: 'Washington D.C.', country: 'USA', timezone: 'America/New_York' },
  { code: 'SAN', name: 'San Diego International', city: 'San Diego', country: 'USA', timezone: 'America/Los_Angeles' },
  { code: 'TPA', name: 'Tampa International', city: 'Tampa', country: 'USA', timezone: 'America/New_York' },
  { code: 'PDX', name: 'Portland International', city: 'Portland', country: 'USA', timezone: 'America/Los_Angeles' },
  { code: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu', country: 'USA', timezone: 'Pacific/Honolulu' },
  { code: 'AUS', name: 'Austin-Bergstrom International', city: 'Austin', country: 'USA', timezone: 'America/Chicago' },
  { code: 'MSY', name: 'Louis Armstrong New Orleans International', city: 'New Orleans', country: 'USA', timezone: 'America/Chicago' },
  { code: 'RDU', name: 'Raleigh-Durham International', city: 'Raleigh', country: 'USA', timezone: 'America/New_York' },
  { code: 'SJC', name: 'San Jose International', city: 'San Jose', country: 'USA', timezone: 'America/Los_Angeles' },
  { code: 'OAK', name: 'Oakland International', city: 'Oakland', country: 'USA', timezone: 'America/Los_Angeles' },
  { code: 'SMF', name: 'Sacramento International', city: 'Sacramento', country: 'USA', timezone: 'America/Los_Angeles' },
  { code: 'CLE', name: 'Cleveland Hopkins International', city: 'Cleveland', country: 'USA', timezone: 'America/New_York' },
  { code: 'PIT', name: 'Pittsburgh International', city: 'Pittsburgh', country: 'USA', timezone: 'America/New_York' },
  { code: 'IND', name: 'Indianapolis International', city: 'Indianapolis', country: 'USA', timezone: 'America/Indiana/Indianapolis' },
  { code: 'CMH', name: 'John Glenn Columbus International', city: 'Columbus', country: 'USA', timezone: 'America/New_York' },
  { code: 'MCI', name: 'Kansas City International', city: 'Kansas City', country: 'USA', timezone: 'America/Chicago' },
  { code: 'STL', name: 'St. Louis Lambert International', city: 'St. Louis', country: 'USA', timezone: 'America/Chicago' },
  { code: 'BNA', name: 'Nashville International', city: 'Nashville', country: 'USA', timezone: 'America/Chicago' },

  // Canada
  { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada', timezone: 'America/Toronto' },
  { code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver' },
  { code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International', city: 'Montreal', country: 'Canada', timezone: 'America/Montreal' },
  { code: 'YYC', name: 'Calgary International', city: 'Calgary', country: 'Canada', timezone: 'America/Edmonton' },
  { code: 'YEG', name: 'Edmonton International', city: 'Edmonton', country: 'Canada', timezone: 'America/Edmonton' },
  { code: 'YOW', name: 'Ottawa Macdonald-Cartier International', city: 'Ottawa', country: 'Canada', timezone: 'America/Toronto' },

  // Europe
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', timezone: 'Europe/London' },
  { code: 'LGW', name: 'London Gatwick', city: 'London', country: 'UK', timezone: 'Europe/London' },
  { code: 'STN', name: 'London Stansted', city: 'London', country: 'UK', timezone: 'Europe/London' },
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
  { code: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam' },
  { code: 'FRA', name: 'Frankfurt am Main', city: 'Frankfurt', country: 'Germany', timezone: 'Europe/Berlin' },
  { code: 'MUC', name: 'Munich', city: 'Munich', country: 'Germany', timezone: 'Europe/Berlin' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain', timezone: 'Europe/Madrid' },
  { code: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain', timezone: 'Europe/Madrid' },
  { code: 'FCO', name: 'Leonardo da Vinci-Fiumicino', city: 'Rome', country: 'Italy', timezone: 'Europe/Rome' },
  { code: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'Italy', timezone: 'Europe/Rome' },
  { code: 'ZRH', name: 'Zurich', city: 'Zurich', country: 'Switzerland', timezone: 'Europe/Zurich' },
  { code: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'Austria', timezone: 'Europe/Vienna' },
  { code: 'DUB', name: 'Dublin', city: 'Dublin', country: 'Ireland', timezone: 'Europe/Dublin' },
  { code: 'CPH', name: 'Copenhagen', city: 'Copenhagen', country: 'Denmark', timezone: 'Europe/Copenhagen' },
  { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway', timezone: 'Europe/Oslo' },
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden', timezone: 'Europe/Stockholm' },
  { code: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland', timezone: 'Europe/Helsinki' },
  { code: 'LIS', name: 'Lisbon Portela', city: 'Lisbon', country: 'Portugal', timezone: 'Europe/Lisbon' },
  { code: 'ATH', name: 'Athens International', city: 'Athens', country: 'Greece', timezone: 'Europe/Athens' },
  { code: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul' },
  { code: 'PRG', name: 'Václav Havel Prague', city: 'Prague', country: 'Czech Republic', timezone: 'Europe/Prague' },
  { code: 'WAW', name: 'Warsaw Chopin', city: 'Warsaw', country: 'Poland', timezone: 'Europe/Warsaw' },
  { code: 'BRU', name: 'Brussels', city: 'Brussels', country: 'Belgium', timezone: 'Europe/Brussels' },
  { code: 'EDI', name: 'Edinburgh', city: 'Edinburgh', country: 'UK', timezone: 'Europe/London' },
  { code: 'MAN', name: 'Manchester', city: 'Manchester', country: 'UK', timezone: 'Europe/London' },

  // Asia
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai' },
  { code: 'PKX', name: 'Beijing Daxing International', city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai' },
  { code: 'PVG', name: 'Shanghai Pudong International', city: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore' },
  { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul' },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok' },
  { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia', timezone: 'Asia/Kuala_Lumpur' },
  { code: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi', country: 'India', timezone: 'Asia/Kolkata' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata' },
  { code: 'TPE', name: 'Taiwan Taoyuan International', city: 'Taipei', country: 'Taiwan', timezone: 'Asia/Taipei' },
  { code: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines', timezone: 'Asia/Manila' },
  { code: 'CGK', name: 'Soekarno-Hatta International', city: 'Jakarta', country: 'Indonesia', timezone: 'Asia/Jakarta' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai' },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', timezone: 'Asia/Qatar' },
  { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE', timezone: 'Asia/Dubai' },

  // Oceania
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
  { code: 'MEL', name: 'Melbourne', city: 'Melbourne', country: 'Australia', timezone: 'Australia/Melbourne' },
  { code: 'BNE', name: 'Brisbane', city: 'Brisbane', country: 'Australia', timezone: 'Australia/Brisbane' },
  { code: 'PER', name: 'Perth', city: 'Perth', country: 'Australia', timezone: 'Australia/Perth' },
  { code: 'AKL', name: 'Auckland', city: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland' },
  { code: 'WLG', name: 'Wellington', city: 'Wellington', country: 'New Zealand', timezone: 'Pacific/Auckland' },

  // Central & South America
  { code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City' },
  { code: 'CUN', name: 'Cancún International', city: 'Cancún', country: 'Mexico', timezone: 'America/Cancun' },
  { code: 'GDL', name: 'Guadalajara International', city: 'Guadalajara', country: 'Mexico', timezone: 'America/Mexico_City' },
  { code: 'GRU', name: 'São Paulo-Guarulhos International', city: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo' },
  { code: 'GIG', name: 'Rio de Janeiro-Galeão International', city: 'Rio de Janeiro', country: 'Brazil', timezone: 'America/Sao_Paulo' },
  { code: 'EZE', name: 'Ministro Pistarini International', city: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires' },
  { code: 'SCL', name: 'Arturo Merino Benítez International', city: 'Santiago', country: 'Chile', timezone: 'America/Santiago' },
  { code: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colombia', timezone: 'America/Bogota' },
  { code: 'LIM', name: 'Jorge Chávez International', city: 'Lima', country: 'Peru', timezone: 'America/Lima' },
  { code: 'PTY', name: 'Tocumen International', city: 'Panama City', country: 'Panama', timezone: 'America/Panama' },
  { code: 'SJO', name: 'Juan Santamaría International', city: 'San José', country: 'Costa Rica', timezone: 'America/Costa_Rica' },

  // Caribbean
  { code: 'SJU', name: 'Luis Muñoz Marín International', city: 'San Juan', country: 'Puerto Rico', timezone: 'America/Puerto_Rico' },
  { code: 'NAS', name: 'Lynden Pindling International', city: 'Nassau', country: 'Bahamas', timezone: 'America/Nassau' },
  { code: 'MBJ', name: 'Sangster International', city: 'Montego Bay', country: 'Jamaica', timezone: 'America/Jamaica' },
  { code: 'PUJ', name: 'Punta Cana International', city: 'Punta Cana', country: 'Dominican Republic', timezone: 'America/Santo_Domingo' },
  { code: 'AUA', name: 'Queen Beatrix International', city: 'Oranjestad', country: 'Aruba', timezone: 'America/Aruba' },

  // Africa
  { code: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa', timezone: 'Africa/Johannesburg' },
  { code: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa', timezone: 'Africa/Johannesburg' },
  { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo' },
  { code: 'NBO', name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya', timezone: 'Africa/Nairobi' },
  { code: 'ADD', name: 'Addis Ababa Bole International', city: 'Addis Ababa', country: 'Ethiopia', timezone: 'Africa/Addis_Ababa' },
  { code: 'CMN', name: 'Mohammed V International', city: 'Casablanca', country: 'Morocco', timezone: 'Africa/Casablanca' },
  { code: 'LOS', name: 'Murtala Muhammed International', city: 'Lagos', country: 'Nigeria', timezone: 'Africa/Lagos' },
];

/**
 * Search airports by code, name, or city
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 * @returns {Array} Matching airports
 */
export function searchAirports(query, limit = 10) {
  if (!query || query.length < 1) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  // First, exact code match
  const exactMatch = airports.filter(
    airport => airport.code.toLowerCase() === normalizedQuery
  );

  if (exactMatch.length > 0) {
    return exactMatch.slice(0, limit);
  }

  // Then, starts with code
  const codeStartsWith = airports.filter(
    airport => airport.code.toLowerCase().startsWith(normalizedQuery)
  );

  // Then, city or name contains
  const cityOrNameContains = airports.filter(
    airport =>
      airport.city.toLowerCase().includes(normalizedQuery) ||
      airport.name.toLowerCase().includes(normalizedQuery)
  );

  // Combine results, removing duplicates
  const combined = [...codeStartsWith];
  cityOrNameContains.forEach(airport => {
    if (!combined.find(a => a.code === airport.code)) {
      combined.push(airport);
    }
  });

  return combined.slice(0, limit);
}

/**
 * Get airport by code
 * @param {string} code - Airport code (e.g., 'JFK')
 * @returns {Object|null} Airport object or null
 */
export function getAirportByCode(code) {
  if (!code) return null;
  return airports.find(
    airport => airport.code.toLowerCase() === code.toLowerCase()
  ) || null;
}

/**
 * Format airport for display
 * @param {Object} airport - Airport object
 * @returns {string} Formatted string
 */
export function formatAirport(airport) {
  if (!airport) return '';
  return `${airport.code} - ${airport.city}, ${airport.country}`;
}

/**
 * Get timezone for airport code
 * @param {string} code - Airport code
 * @returns {string|null} Timezone string or null
 */
export function getAirportTimezone(code) {
  const airport = getAirportByCode(code);
  return airport ? airport.timezone : null;
}

export default {
  airports,
  searchAirports,
  getAirportByCode,
  formatAirport,
  getAirportTimezone,
};
