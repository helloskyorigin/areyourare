export interface CityLocation {
  id: string;
  name: string;
  region?: string;
  country: string;
  formatted: string;
  lat: number;
  lng: number;
  timezone: string;
}

export const GLOBAL_CITIES: CityLocation[] = [
  // Americas - North America
  { id: 'nyc-us', name: 'New York', region: 'New York', country: 'United States', formatted: 'New York, NY, United States', lat: 40.7128, lng: -74.006, timezone: 'America/New_York' },
  { id: 'la-us', name: 'Los Angeles', region: 'California', country: 'United States', formatted: 'Los Angeles, CA, United States', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
  { id: 'chicago-us', name: 'Chicago', region: 'Illinois', country: 'United States', formatted: 'Chicago, IL, United States', lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago' },
  { id: 'houston-us', name: 'Houston', region: 'Texas', country: 'United States', formatted: 'Houston, TX, United States', lat: 29.7604, lng: -95.3698, timezone: 'America/Chicago' },
  { id: 'phoenix-us', name: 'Phoenix', region: 'Arizona', country: 'United States', formatted: 'Phoenix, AZ, United States', lat: 33.4484, lng: -112.074, timezone: 'America/Phoenix' },
  { id: 'philadelphia-us', name: 'Philadelphia', region: 'Pennsylvania', country: 'United States', formatted: 'Philadelphia, PA, United States', lat: 39.9526, lng: -75.1652, timezone: 'America/New_York' },
  { id: 'sanantonio-us', name: 'San Antonio', region: 'Texas', country: 'United States', formatted: 'San Antonio, TX, United States', lat: 29.4241, lng: -98.4936, timezone: 'America/Chicago' },
  { id: 'sandiego-us', name: 'San Diego', region: 'California', country: 'United States', formatted: 'San Diego, CA, United States', lat: 32.7157, lng: -117.1611, timezone: 'America/Los_Angeles' },
  { id: 'dallas-us', name: 'Dallas', region: 'Texas', country: 'United States', formatted: 'Dallas, TX, United States', lat: 32.7767, lng: -96.797, timezone: 'America/Chicago' },
  { id: 'sanfrancisco-us', name: 'San Francisco', region: 'California', country: 'United States', formatted: 'San Francisco, CA, United States', lat: 37.7749, lng: -122.4194, timezone: 'America/Los_Angeles' },
  { id: 'seattle-us', name: 'Seattle', region: 'Washington', country: 'United States', formatted: 'Seattle, WA, United States', lat: 47.6062, lng: -122.3321, timezone: 'America/Los_Angeles' },
  { id: 'denver-us', name: 'Denver', region: 'Colorado', country: 'United States', formatted: 'Denver, CO, United States', lat: 39.7392, lng: -104.9903, timezone: 'America/Denver' },
  { id: 'boston-us', name: 'Boston', region: 'Massachusetts', country: 'United States', formatted: 'Boston, MA, United States', lat: 42.3601, lng: -71.0589, timezone: 'America/New_York' },
  { id: 'miami-us', name: 'Miami', region: 'Florida', country: 'United States', formatted: 'Miami, FL, United States', lat: 25.7617, lng: -80.1918, timezone: 'America/New_York' },
  { id: 'atlanta-us', name: 'Atlanta', region: 'Georgia', country: 'United States', formatted: 'Atlanta, GA, United States', lat: 33.749, lng: -84.388, timezone: 'America/New_York' },
  { id: 'toronto-ca', name: 'Toronto', region: 'Ontario', country: 'Canada', formatted: 'Toronto, Ontario, Canada', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
  { id: 'montreal-ca', name: 'Montreal', region: 'Quebec', country: 'Canada', formatted: 'Montreal, Quebec, Canada', lat: 45.5017, lng: -73.5673, timezone: 'America/Toronto' },
  { id: 'vancouver-ca', name: 'Vancouver', region: 'British Columbia', country: 'Canada', formatted: 'Vancouver, BC, Canada', lat: 49.2827, lng: -123.1207, timezone: 'America/Vancouver' },
  { id: 'calgary-ca', name: 'Calgary', region: 'Alberta', country: 'Canada', formatted: 'Calgary, Alberta, Canada', lat: 51.0447, lng: -114.0719, timezone: 'America/Edmonton' },
  { id: 'mexicocity-mx', name: 'Mexico City', region: 'CDMX', country: 'Mexico', formatted: 'Mexico City, CDMX, Mexico', lat: 19.4326, lng: -99.1332, timezone: 'America/Mexico_City' },
  { id: 'guadalajara-mx', name: 'Guadalajara', region: 'Jalisco', country: 'Mexico', formatted: 'Guadalajara, Jalisco, Mexico', lat: 20.6597, lng: -103.3496, timezone: 'America/Mexico_City' },
  { id: 'monterrey-mx', name: 'Monterrey', region: 'Nuevo León', country: 'Mexico', formatted: 'Monterrey, NL, Mexico', lat: 25.6866, lng: -100.3161, timezone: 'America/Monterrey' },

  // Americas - South America
  { id: 'saopaulo-br', name: 'São Paulo', region: 'São Paulo', country: 'Brazil', formatted: 'São Paulo, SP, Brazil', lat: -23.5505, lng: -46.6333, timezone: 'America/Sao_Paulo' },
  { id: 'riodejaneiro-br', name: 'Rio de Janeiro', region: 'Rio de Janeiro', country: 'Brazil', formatted: 'Rio de Janeiro, RJ, Brazil', lat: -22.9068, lng: -43.1729, timezone: 'America/Sao_Paulo' },
  { id: 'buenosaires-ar', name: 'Buenos Aires', region: 'Capital Federal', country: 'Argentina', formatted: 'Buenos Aires, Argentina', lat: -34.6037, lng: -58.3816, timezone: 'America/Argentina/Buenos_Aires' },
  { id: 'bogota-co', name: 'Bogotá', region: 'Cundinamarca', country: 'Colombia', formatted: 'Bogotá, Colombia', lat: 4.711, lng: -74.0721, timezone: 'America/Bogota' },
  { id: 'lima-pe', name: 'Lima', region: 'Lima', country: 'Peru', formatted: 'Lima, Peru', lat: -12.0464, lng: -77.0428, timezone: 'America/Lima' },
  { id: 'santiago-cl', name: 'Santiago', region: 'Santiago Metropolitan', country: 'Chile', formatted: 'Santiago, Chile', lat: -33.4489, lng: -70.6693, timezone: 'America/Santiago' },

  // Europe
  { id: 'london-uk', name: 'London', region: 'Greater London', country: 'United Kingdom', formatted: 'London, England, United Kingdom', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
  { id: 'manchester-uk', name: 'Manchester', region: 'Greater Manchester', country: 'United Kingdom', formatted: 'Manchester, England, United Kingdom', lat: 53.4808, lng: -2.2426, timezone: 'Europe/London' },
  { id: 'edinburgh-uk', name: 'Edinburgh', region: 'Scotland', country: 'United Kingdom', formatted: 'Edinburgh, Scotland, United Kingdom', lat: 55.9533, lng: -3.1883, timezone: 'Europe/London' },
  { id: 'paris-fr', name: 'Paris', region: 'Île-de-France', country: 'France', formatted: 'Paris, France', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
  { id: 'lyon-fr', name: 'Lyon', region: 'Auvergne-Rhône-Alpes', country: 'France', formatted: 'Lyon, France', lat: 45.764, lng: 4.8357, timezone: 'Europe/Paris' },
  { id: 'marseille-fr', name: 'Marseille', region: "Provence-Alpes-Côte d'Azur", country: 'France', formatted: 'Marseille, France', lat: 43.2965, lng: 5.3698, timezone: 'Europe/Paris' },
  { id: 'berlin-de', name: 'Berlin', region: 'Berlin', country: 'Germany', formatted: 'Berlin, Germany', lat: 52.52, lng: 13.405, timezone: 'Europe/Berlin' },
  { id: 'munich-de', name: 'Munich', region: 'Bavaria', country: 'Germany', formatted: 'Munich, Bavaria, Germany', lat: 48.1351, lng: 11.582, timezone: 'Europe/Berlin' },
  { id: 'frankfurt-de', name: 'Frankfurt', region: 'Hesse', country: 'Germany', formatted: 'Frankfurt, Hesse, Germany', lat: 50.1109, lng: 8.6821, timezone: 'Europe/Berlin' },
  { id: 'hamburg-de', name: 'Hamburg', region: 'Hamburg', country: 'Germany', formatted: 'Hamburg, Germany', lat: 53.5511, lng: 9.9937, timezone: 'Europe/Berlin' },
  { id: 'rome-it', name: 'Rome', region: 'Lazio', country: 'Italy', formatted: 'Rome, Lazio, Italy', lat: 41.9028, lng: 12.4964, timezone: 'Europe/Rome' },
  { id: 'milan-it', name: 'Milan', region: 'Lombardy', country: 'Italy', formatted: 'Milan, Lombardy, Italy', lat: 45.4642, lng: 9.19, timezone: 'Europe/Rome' },
  { id: 'florence-it', name: 'Florence', region: 'Tuscany', country: 'Italy', formatted: 'Florence, Tuscany, Italy', lat: 43.7696, lng: 11.2558, timezone: 'Europe/Rome' },
  { id: 'madrid-es', name: 'Madrid', region: 'Community of Madrid', country: 'Spain', formatted: 'Madrid, Spain', lat: 40.4168, lng: -3.7038, timezone: 'Europe/Madrid' },
  { id: 'barcelona-es', name: 'Barcelona', region: 'Catalonia', country: 'Spain', formatted: 'Barcelona, Catalonia, Spain', lat: 41.3879, lng: 2.1699, timezone: 'Europe/Madrid' },
  { id: 'amsterdam-nl', name: 'Amsterdam', region: 'North Holland', country: 'Netherlands', formatted: 'Amsterdam, Netherlands', lat: 52.3676, lng: 4.9041, timezone: 'Europe/Amsterdam' },
  { id: 'brussels-be', name: 'Brussels', region: 'Brussels', country: 'Belgium', formatted: 'Brussels, Belgium', lat: 50.8503, lng: 4.3517, timezone: 'Europe/Brussels' },
  { id: 'vienna-at', name: 'Vienna', region: 'Vienna', country: 'Austria', formatted: 'Vienna, Austria', lat: 48.2082, lng: 16.3738, timezone: 'Europe/Vienna' },
  { id: 'zurich-ch', name: 'Zurich', region: 'Zurich', country: 'Switzerland', formatted: 'Zurich, Switzerland', lat: 47.3769, lng: 8.5417, timezone: 'Europe/Zurich' },
  { id: 'geneva-ch', name: 'Geneva', region: 'Geneva', country: 'Switzerland', formatted: 'Geneva, Switzerland', lat: 46.2044, lng: 6.1432, timezone: 'Europe/Zurich' },
  { id: 'stockholm-se', name: 'Stockholm', region: 'Stockholm County', country: 'Sweden', formatted: 'Stockholm, Sweden', lat: 59.3293, lng: 18.0686, timezone: 'Europe/Stockholm' },
  { id: 'oslo-no', name: 'Oslo', region: 'Oslo', country: 'Norway', formatted: 'Oslo, Norway', lat: 59.9139, lng: 10.7522, timezone: 'Europe/Oslo' },
  { id: 'copenhagen-dk', name: 'Copenhagen', region: 'Capital Region', country: 'Denmark', formatted: 'Copenhagen, Denmark', lat: 55.6761, lng: 12.5683, timezone: 'Europe/Copenhagen' },
  { id: 'dublin-ie', name: 'Dublin', region: 'Leinster', country: 'Ireland', formatted: 'Dublin, Ireland', lat: 53.3498, lng: -6.2603, timezone: 'Europe/Dublin' },
  { id: 'lisbon-pt', name: 'Lisbon', region: 'Lisbon', country: 'Portugal', formatted: 'Lisbon, Portugal', lat: 38.7223, lng: -9.1393, timezone: 'Europe/Lisbon' },
  { id: 'athens-gr', name: 'Athens', region: 'Attica', country: 'Greece', formatted: 'Athens, Greece', lat: 37.9838, lng: 23.7275, timezone: 'Europe/Athens' },
  { id: 'warsaw-pl', name: 'Warsaw', region: 'Masovian', country: 'Poland', formatted: 'Warsaw, Poland', lat: 52.2297, lng: 21.0122, timezone: 'Europe/Warsaw' },
  { id: 'prague-cz', name: 'Prague', region: 'Prague', country: 'Czech Republic', formatted: 'Prague, Czech Republic', lat: 50.0755, lng: 14.4378, timezone: 'Europe/Prague' },

  // Asia - South Asia
  { id: 'delhi-in', name: 'New Delhi', region: 'Delhi', country: 'India', formatted: 'New Delhi, Delhi, India', lat: 28.6139, lng: 77.209, timezone: 'Asia/Kolkata' },
  { id: 'mumbai-in', name: 'Mumbai', region: 'Maharashtra', country: 'India', formatted: 'Mumbai, Maharashtra, India', lat: 19.076, lng: 72.8777, timezone: 'Asia/Kolkata' },
  { id: 'bengaluru-in', name: 'Bengaluru', region: 'Karnataka', country: 'India', formatted: 'Bengaluru, Karnataka, India', lat: 12.9716, lng: 77.5946, timezone: 'Asia/Kolkata' },
  { id: 'kolkata-in', name: 'Kolkata', region: 'West Bengal', country: 'India', formatted: 'Kolkata, West Bengal, India', lat: 22.5726, lng: 88.3639, timezone: 'Asia/Kolkata' },
  { id: 'chennai-in', name: 'Chennai', region: 'Tamil Nadu', country: 'India', formatted: 'Chennai, Tamil Nadu, India', lat: 13.0827, lng: 80.2707, timezone: 'Asia/Kolkata' },
  { id: 'hyderabad-in', name: 'Hyderabad', region: 'Telangana', country: 'India', formatted: 'Hyderabad, Telangana, India', lat: 17.385, lng: 78.4867, timezone: 'Asia/Kolkata' },
  { id: 'ahmedabad-in', name: 'Ahmedabad', region: 'Gujarat', country: 'India', formatted: 'Ahmedabad, Gujarat, India', lat: 23.0225, lng: 72.5714, timezone: 'Asia/Kolkata' },
  { id: 'pune-in', name: 'Pune', region: 'Maharashtra', country: 'India', formatted: 'Pune, Maharashtra, India', lat: 18.5204, lng: 73.8567, timezone: 'Asia/Kolkata' },
  { id: 'jaipur-in', name: 'Jaipur', region: 'Rajasthan', country: 'India', formatted: 'Jaipur, Rajasthan, India', lat: 26.9124, lng: 75.7873, timezone: 'Asia/Kolkata' },
  { id: 'lucknow-in', name: 'Lucknow', region: 'Uttar Pradesh', country: 'India', formatted: 'Lucknow, Uttar Pradesh, India', lat: 26.8467, lng: 80.9462, timezone: 'Asia/Kolkata' },
  { id: 'patna-in', name: 'Patna', region: 'Bihar', country: 'India', formatted: 'Patna, Bihar, India', lat: 25.5941, lng: 85.1376, timezone: 'Asia/Kolkata' },
  { id: 'siwan-in', name: 'Siwan', region: 'Bihar', country: 'India', formatted: 'Siwan, Bihar, India', lat: 26.2243, lng: 84.3598, timezone: 'Asia/Kolkata' },
  { id: 'bhopal-in', name: 'Bhopal', region: 'Madhya Pradesh', country: 'India', formatted: 'Bhopal, MP, India', lat: 23.2599, lng: 77.4126, timezone: 'Asia/Kolkata' },
  { id: 'chandigarh-in', name: 'Chandigarh', region: 'Chandigarh', country: 'India', formatted: 'Chandigarh, India', lat: 30.7333, lng: 76.7794, timezone: 'Asia/Kolkata' },
  { id: 'karachi-pk', name: 'Karachi', region: 'Sindh', country: 'Pakistan', formatted: 'Karachi, Sindh, Pakistan', lat: 24.8607, lng: 67.0011, timezone: 'Asia/Karachi' },
  { id: 'lahore-pk', name: 'Lahore', region: 'Punjab', country: 'Pakistan', formatted: 'Lahore, Punjab, Pakistan', lat: 31.5204, lng: 74.3587, timezone: 'Asia/Karachi' },
  { id: 'dhaka-bd', name: 'Dhaka', region: 'Dhaka Division', country: 'Bangladesh', formatted: 'Dhaka, Bangladesh', lat: 23.8103, lng: 90.4125, timezone: 'Asia/Dhaka' },
  { id: 'colombo-lk', name: 'Colombo', region: 'Western Province', country: 'Sri Lanka', formatted: 'Colombo, Sri Lanka', lat: 6.9271, lng: 79.8612, timezone: 'Asia/Colombo' },
  { id: 'kathmandu-np', name: 'Kathmandu', region: 'Bagmati', country: 'Nepal', formatted: 'Kathmandu, Nepal', lat: 27.7172, lng: 85.324, timezone: 'Asia/Kathmandu' },

  // Asia - East & SE Asia
  { id: 'tokyo-jp', name: 'Tokyo', region: 'Kantō', country: 'Japan', formatted: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo' },
  { id: 'kyoto-jp', name: 'Kyoto', region: 'Kansai', country: 'Japan', formatted: 'Kyoto, Japan', lat: 35.0116, lng: 135.7681, timezone: 'Asia/Tokyo' },
  { id: 'osaka-jp', name: 'Osaka', region: 'Kansai', country: 'Japan', formatted: 'Osaka, Japan', lat: 34.6937, lng: 135.5023, timezone: 'Asia/Tokyo' },
  { id: 'seoul-kr', name: 'Seoul', region: 'Seoul Capital Area', country: 'South Korea', formatted: 'Seoul, South Korea', lat: 37.5665, lng: 126.978, timezone: 'Asia/Seoul' },
  { id: 'singapore-sg', name: 'Singapore', region: 'Central Region', country: 'Singapore', formatted: 'Singapore, Singapore', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore' },
  { id: 'bangkok-th', name: 'Bangkok', region: 'Bangkok', country: 'Thailand', formatted: 'Bangkok, Thailand', lat: 13.7563, lng: 100.5018, timezone: 'Asia/Bangkok' },
  { id: 'kualalumpur-my', name: 'Kuala Lumpur', region: 'Federal Territory', country: 'Malaysia', formatted: 'Kuala Lumpur, Malaysia', lat: 3.139, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  { id: 'jakarta-id', name: 'Jakarta', region: 'DKI Jakarta', country: 'Indonesia', formatted: 'Jakarta, Indonesia', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta' },
  { id: 'manila-ph', name: 'Manila', region: 'Metro Manila', country: 'Philippines', formatted: 'Manila, Philippines', lat: 14.5995, lng: 120.9842, timezone: 'Asia/Manila' },
  { id: 'hochiminh-vn', name: 'Ho Chi Minh City', region: 'Southeast', country: 'Vietnam', formatted: 'Ho Chi Minh City, Vietnam', lat: 10.8231, lng: 106.6297, timezone: 'Asia/Ho_Chi_Minh' },
  { id: 'hongkong-hk', name: 'Hong Kong', region: 'Hong Kong Island', country: 'Hong Kong', formatted: 'Hong Kong, Hong Kong', lat: 22.3193, lng: 114.1694, timezone: 'Asia/Hong_Kong' },
  { id: 'taipei-tw', name: 'Taipei', region: 'Taipei City', country: 'Taiwan', formatted: 'Taipei, Taiwan', lat: 25.033, lng: 121.5654, timezone: 'Asia/Taipei' },
  { id: 'shanghai-cn', name: 'Shanghai', region: 'East China', country: 'China', formatted: 'Shanghai, China', lat: 31.2304, lng: 121.4737, timezone: 'Asia/Shanghai' },
  { id: 'beijing-cn', name: 'Beijing', region: 'North China', country: 'China', formatted: 'Beijing, China', lat: 39.9042, lng: 116.4074, timezone: 'Asia/Shanghai' },

  // Middle East & Africa
  { id: 'dubai-ae', name: 'Dubai', region: 'Emirate of Dubai', country: 'United Arab Emirates', formatted: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai' },
  { id: 'abudhabi-ae', name: 'Abu Dhabi', region: 'Emirate of Abu Dhabi', country: 'United Arab Emirates', formatted: 'Abu Dhabi, UAE', lat: 24.4539, lng: 54.3773, timezone: 'Asia/Dubai' },
  { id: 'doha-qa', name: 'Doha', region: 'Ad-Dawhah', country: 'Qatar', formatted: 'Doha, Qatar', lat: 25.2854, lng: 51.531, timezone: 'Asia/Qatar' },
  { id: 'riyadh-sa', name: 'Riyadh', region: 'Riyadh Province', country: 'Saudi Arabia', formatted: 'Riyadh, Saudi Arabia', lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh' },
  { id: 'istanbul-tr', name: 'Istanbul', region: 'Marmara', country: 'Turkey', formatted: 'Istanbul, Turkey', lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul' },
  { id: 'telaviv-il', name: 'Tel Aviv', region: 'Tel Aviv District', country: 'Israel', formatted: 'Tel Aviv, Israel', lat: 32.0853, lng: 34.7818, timezone: 'Asia/Jerusalem' },
  { id: 'cairo-eg', name: 'Cairo', region: 'Cairo Governorate', country: 'Egypt', formatted: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo' },
  { id: 'johannesburg-za', name: 'Johannesburg', region: 'Gauteng', country: 'South Africa', formatted: 'Johannesburg, South Africa', lat: -26.2041, lng: 28.0473, timezone: 'Africa/Johannesburg' },
  { id: 'capetown-za', name: 'Cape Town', region: 'Western Cape', country: 'South Africa', formatted: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241, timezone: 'Africa/Johannesburg' },
  { id: 'nairobi-ke', name: 'Nairobi', region: 'Nairobi County', country: 'Kenya', formatted: 'Nairobi, Kenya', lat: -1.2921, lng: 36.8219, timezone: 'Africa/Nairobi' },
  { id: 'lagos-ng', name: 'Lagos', region: 'Lagos State', country: 'Nigeria', formatted: 'Lagos, Nigeria', lat: 6.5244, lng: 3.3792, timezone: 'Africa/Lagos' },

  // Oceania
  { id: 'sydney-au', name: 'Sydney', region: 'New South Wales', country: 'Australia', formatted: 'Sydney, NSW, Australia', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
  { id: 'melbourne-au', name: 'Melbourne', region: 'Victoria', country: 'Australia', formatted: 'Melbourne, VIC, Australia', lat: -37.8136, lng: 144.9631, timezone: 'Australia/Melbourne' },
  { id: 'brisbane-au', name: 'Brisbane', region: 'Queensland', country: 'Australia', formatted: 'Brisbane, QLD, Australia', lat: -27.4698, lng: 153.0251, timezone: 'Australia/Brisbane' },
  { id: 'perth-au', name: 'Perth', region: 'Western Australia', country: 'Australia', formatted: 'Perth, WA, Australia', lat: -31.9505, lng: 115.8605, timezone: 'Australia/Perth' },
  { id: 'auckland-nz', name: 'Auckland', region: 'Auckland Region', country: 'New Zealand', formatted: 'Auckland, New Zealand', lat: -36.8485, lng: 174.7633, timezone: 'Pacific/Auckland' },
  { id: 'wellington-nz', name: 'Wellington', region: 'Wellington Region', country: 'New Zealand', formatted: 'Wellington, New Zealand', lat: -41.2865, lng: 174.7762, timezone: 'Pacific/Auckland' },
];

/**
 * Fast search with score ranking based on exact/prefix/substring match
 */
export async function searchCitiesAsync(query: string): Promise<CityLocation[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // Simulate network debounce resolution
  await new Promise((r) => setTimeout(r, 120));

  const scored = GLOBAL_CITIES.map((city) => {
    const nameLower = city.name.toLowerCase();
    const regionLower = (city.region || '').toLowerCase();
    const countryLower = city.country.toLowerCase();

    let score = 0;
    if (nameLower === trimmed) score = 100;
    else if (nameLower.startsWith(trimmed)) score = 80;
    else if (nameLower.includes(trimmed)) score = 50;
    else if (regionLower.startsWith(trimmed)) score = 40;
    else if (regionLower.includes(trimmed)) score = 30;
    else if (countryLower.startsWith(trimmed)) score = 25;
    else if (countryLower.includes(trimmed)) score = 15;

    return { city, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.city);

  return scored.slice(0, 6);
}
