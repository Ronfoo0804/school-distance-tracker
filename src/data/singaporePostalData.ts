import { AddressPreset, Coordinates } from '../types';

/**
 * Mapping of Singapore 2-digit postal sectors to planning areas and approximate centroid coordinates.
 * Singapore postal codes are 6-digits, where the first 2 digits indicate the postal sector.
 */
export interface PostalSectorInfo {
  sector: string;
  generalLocation: string;
  planningArea: string;
  coords: Coordinates;
}

export const SINGAPORE_POSTAL_SECTORS: Record<string, PostalSectorInfo> = {
  // 01 to 06: Raffles Place, Cecil, Marina, People's Park
  '01': { sector: '01', generalLocation: 'Raffles Place, Marina Bay', planningArea: 'Downtown Core', coords: { lat: 1.2838, lng: 103.8516 } },
  '02': { sector: '02', generalLocation: 'Anson Road, Tanjong Pagar', planningArea: 'Downtown Core', coords: { lat: 1.2755, lng: 103.8458 } },
  '03': { sector: '03', generalLocation: 'Queenstown, Tiong Bahru', planningArea: 'Bukit Merah', coords: { lat: 1.2870, lng: 103.8290 } },
  '04': { sector: '04', generalLocation: 'Telok Ayer, Chinatown', planningArea: 'Outram', coords: { lat: 1.2820, lng: 103.8465 } },
  '05': { sector: '05', generalLocation: 'Pasir Panjang, Hong Leong Garden', planningArea: 'Clementi', coords: { lat: 1.2980, lng: 103.7710 } },
  '06': { sector: '06', generalLocation: 'Shenton Way, Robinson Road', planningArea: 'Downtown Core', coords: { lat: 1.2785, lng: 103.8505 } },
  // 07 to 08: Tanjong Pagar, Chinatown
  '07': { sector: '07', generalLocation: 'Anson, Tanjong Pagar', planningArea: 'Downtown Core', coords: { lat: 1.2760, lng: 103.8440 } },
  '08': { sector: '08', generalLocation: 'Chinatown, Duxton, Tanjong Pagar', planningArea: 'Outram', coords: { lat: 1.2798, lng: 103.8415 } },
  // 09 to 10: Telok Blangah, HarbourFront
  '09': { sector: '09', generalLocation: 'Telok Blangah, HarbourFront, Keppel', planningArea: 'Bukit Merah', coords: { lat: 1.2715, lng: 103.8205 } },
  '10': { sector: '10', generalLocation: 'Bukit Chermin, Mount Faber', planningArea: 'Bukit Merah', coords: { lat: 1.2740, lng: 103.8090 } },
  // 11 to 13: Pasir Panjang, Clementi Road
  '11': { sector: '11', generalLocation: 'Pasir Panjang, Science Park', planningArea: 'Queenstown', coords: { lat: 1.2890, lng: 103.7850 } },
  '12': { sector: '12', generalLocation: 'Clementi West, West Coast', planningArea: 'Clementi', coords: { lat: 1.3060, lng: 103.7660 } },
  '13': { sector: '13', generalLocation: 'Alexander, Telok Blangah Way', planningArea: 'Bukit Merah', coords: { lat: 1.2810, lng: 103.8160 } },
  // 14 to 16: Queenstown, Tiong Bahru
  '14': { sector: '14', generalLocation: 'Queenstown, Commonwealth', planningArea: 'Queenstown', coords: { lat: 1.2995, lng: 103.8010 } },
  '15': { sector: '15', generalLocation: 'Bukit Merah, Henderson', planningArea: 'Bukit Merah', coords: { lat: 1.2865, lng: 103.8190 } },
  '16': { sector: '16', generalLocation: 'Tiong Bahru, Kim Tian', planningArea: 'Bukit Merah', coords: { lat: 1.2840, lng: 103.8320 } },
  // 17: High Street, Beach Road
  '17': { sector: '17', generalLocation: 'City Hall, High Street', planningArea: 'Downtown Core', coords: { lat: 1.2915, lng: 103.8500 } },
  // 18 to 19: Middle Road, Golden Mile, Bugis
  '18': { sector: '18', generalLocation: 'Bugis, Bras Basah, Middle Road', planningArea: 'Rochor', coords: { lat: 1.2995, lng: 103.8550 } },
  '19': { sector: '19', generalLocation: 'Beach Road, Kampong Glam', planningArea: 'Rochor', coords: { lat: 1.3025, lng: 103.8610 } },
  // 20 to 21: Little India, Farrer Park
  '20': { sector: '20', generalLocation: 'Little India, Jalan Besar', planningArea: 'Rochor', coords: { lat: 1.3090, lng: 103.8560 } },
  '21': { sector: '21', generalLocation: 'Farrer Park, Serangoon Road', planningArea: 'Kallang', coords: { lat: 1.3140, lng: 103.8530 } },
  // 22 to 23: Orchard, Somerset, River Valley, Cairnhill
  '22': { sector: '22', generalLocation: 'Orchard, Somerset, Cairnhill', planningArea: 'Orchard', coords: { lat: 1.3035, lng: 103.8355 } },
  '23': { sector: '23', generalLocation: 'River Valley, Killiney, Leonie Hill', planningArea: 'River Valley', coords: { lat: 1.2985, lng: 103.8370 } },
  // 24 to 27: Tanglin, Bukit Timah, Holland Road
  '24': { sector: '24', generalLocation: 'Tanglin, Napier, Grange Road', planningArea: 'Tanglin', coords: { lat: 1.3050, lng: 103.8210 } },
  '25': { sector: '25', generalLocation: 'Bukit Timah, Cluny, Botanic Gardens', planningArea: 'Bukit Timah', coords: { lat: 1.3180, lng: 103.8150 } },
  '26': { sector: '26', generalLocation: 'Upper Thomson, Springleaf', planningArea: 'Thomson', coords: { lat: 1.3780, lng: 103.8240 } },
  '27': { sector: '27', generalLocation: 'Holland, Ulu Pandan, Mount Sinai', planningArea: 'Bukit Timah', coords: { lat: 1.3140, lng: 103.7860 } },
  // 28 to 30: Novena, Newton, Thomson, Balestier
  '28': { sector: '28', generalLocation: 'Newton, Dunearn Road', planningArea: 'Newton', coords: { lat: 1.3145, lng: 103.8385 } },
  '29': { sector: '29', generalLocation: 'Whitley, Chancery, Mount Rosie', planningArea: 'Novena', coords: { lat: 1.3210, lng: 103.8320 } },
  '30': { sector: '30', generalLocation: 'Balestier, Moulmein, Novena', planningArea: 'Novena', coords: { lat: 1.3235, lng: 103.8465 } },
  // 31 to 33: Toa Payoh, Boon Keng
  '31': { sector: '31', generalLocation: 'Toa Payoh Central & West', planningArea: 'Toa Payoh', coords: { lat: 1.3340, lng: 103.8490 } },
  '32': { sector: '32', generalLocation: 'Balestier, Whampoa', planningArea: 'Novena', coords: { lat: 1.3260, lng: 103.8540 } },
  '33': { sector: '33', generalLocation: 'Potong Pasir, Boon Keng', planningArea: 'Kallang', coords: { lat: 1.3220, lng: 103.8680 } },
  // 34 to 37: MacPherson, Circuit Road, Aljunied
  '34': { sector: '34', generalLocation: 'MacPherson, Circuit Road', planningArea: 'Geylang', coords: { lat: 1.3265, lng: 103.8820 } },
  '35': { sector: '35', generalLocation: 'Potong Pasir, Bidadari', planningArea: 'Toa Payoh', coords: { lat: 1.3360, lng: 103.8710 } },
  '36': { sector: '36', generalLocation: 'Geylang East, Aljunied', planningArea: 'Geylang', coords: { lat: 1.3180, lng: 103.8830 } },
  '37': { sector: '37', generalLocation: 'MacPherson, Mattar Road', planningArea: 'Geylang', coords: { lat: 1.3290, lng: 103.8870 } },
  // 38 to 41: Geylang, Eunos, Paya Lebar
  '38': { sector: '38', generalLocation: 'Geylang Serai, Sims Avenue', planningArea: 'Geylang', coords: { lat: 1.3160, lng: 103.8940 } },
  '39': { sector: '39', generalLocation: 'Kallang, Old Airport Road, Mountbatten', planningArea: 'Kallang', coords: { lat: 1.3070, lng: 103.8840 } },
  '40': { sector: '40', generalLocation: 'Paya Lebar, Eunos, Ubi', planningArea: 'Geylang', coords: { lat: 1.3250, lng: 103.8990 } },
  '41': { sector: '41', generalLocation: 'Kaki Bukit, Lengkong Tiga', planningArea: 'Bedok', coords: { lat: 1.3320, lng: 103.9080 } },
  // 42 to 45: Katong, Marine Parade, Joo Chiat, Tanjong Rhu
  '42': { sector: '42', generalLocation: 'Katong, Joo Chiat, Dunman', planningArea: 'Marine Parade', coords: { lat: 1.3090, lng: 103.9020 } },
  '43': { sector: '43', generalLocation: 'Tanjong Katong, Mountbatten', planningArea: 'Marine Parade', coords: { lat: 1.3010, lng: 103.8960 } },
  '44': { sector: '44', generalLocation: 'Marine Parade Central, Parkway', planningArea: 'Marine Parade', coords: { lat: 1.3025, lng: 103.9075 } },
  '45': { sector: '45', generalLocation: 'Siglap, Telok Kurau, Frankel', planningArea: 'Bedok', coords: { lat: 1.3120, lng: 103.9180 } },
  // 46 to 48: Bedok, Upper East Coast
  '46': { sector: '46', generalLocation: 'Bedok South, Bedok Central', planningArea: 'Bedok', coords: { lat: 1.3240, lng: 103.9290 } },
  '47': { sector: '47', generalLocation: 'Bedok Reservoir, Bedok North', planningArea: 'Bedok', coords: { lat: 1.3360, lng: 103.9280 } },
  '48': { sector: '48', generalLocation: 'Upper East Coast, Bayshore, Eastwood', planningArea: 'Bedok', coords: { lat: 1.3180, lng: 103.9450 } },
  // 49 to 50: Loyang, Changi
  '49': { sector: '49', generalLocation: 'Loyang, Changi Village', planningArea: 'Changi', coords: { lat: 1.3780, lng: 103.9850 } },
  '50': { sector: '50', generalLocation: 'Flora Drive, Upper Changi', planningArea: 'Pasir Ris', coords: { lat: 1.3580, lng: 103.9720 } },
  // 51 to 52: Pasir Ris, Tampines
  '51': { sector: '51', generalLocation: 'Pasir Ris Central, Elias', planningArea: 'Pasir Ris', coords: { lat: 1.3720, lng: 103.9490 } },
  '52': { sector: '52', generalLocation: 'Tampines Central, Tampines West', planningArea: 'Tampines', coords: { lat: 1.3530, lng: 103.9440 } },
  // 53 to 55: Hougang, Serangoon, Punggol South
  '53': { sector: '53', generalLocation: 'Hougang, Defu, Lorong Ah Soo', planningArea: 'Hougang', coords: { lat: 1.3650, lng: 103.8920 } },
  '54': { sector: '54', generalLocation: 'Sengkang East, Buangkok, Compassvale', planningArea: 'Sengkang', coords: { lat: 1.3890, lng: 103.8950 } },
  '55': { sector: '55', generalLocation: 'Serangoon Gardens, Serangoon Central', planningArea: 'Serangoon', coords: { lat: 1.3550, lng: 103.8720 } },
  // 56 to 57: Ang Mo Kio, Bishan
  '56': { sector: '56', generalLocation: 'Ang Mo Kio Central & Avenue 3', planningArea: 'Ang Mo Kio', coords: { lat: 1.3690, lng: 103.8480 } },
  '57': { sector: '57', generalLocation: 'Bishan Central, Marymount, Sin Ming', planningArea: 'Bishan', coords: { lat: 1.3520, lng: 103.8490 } },
  // 58 to 59: Upper Bukit Timah, Hillview
  '58': { sector: '58', generalLocation: 'Upper Bukit Timah, Beauty World', planningArea: 'Bukit Timah', coords: { lat: 1.3410, lng: 103.7760 } },
  '59': { sector: '59', generalLocation: 'Hillview, Hume Avenue, Chestnut', planningArea: 'Bukit Panjang', coords: { lat: 1.3590, lng: 103.7660 } },
  // 60 to 64: Jurong, Boon Lay, Tuas
  '60': { sector: '60', generalLocation: 'Jurong East, Toh Guan', planningArea: 'Jurong East', coords: { lat: 1.3330, lng: 103.7430 } },
  '61': { sector: '61', generalLocation: 'Jurong Port, Pioneer Road', planningArea: 'Jurong West', coords: { lat: 1.3120, lng: 103.7080 } },
  '62': { sector: '62', generalLocation: 'Tuas Industrial, Gul', planningArea: 'Tuas', coords: { lat: 1.3220, lng: 103.6650 } },
  '63': { sector: '63', generalLocation: 'Pioneer, Tuas Avenue', planningArea: 'Tuas', coords: { lat: 1.3310, lng: 103.6820 } },
  '64': { sector: '64', generalLocation: 'Jurong West, Boon Lay, Taman Jurong', planningArea: 'Jurong West', coords: { lat: 1.3460, lng: 103.7050 } },
  // 65 to 68: Bukit Batok, Bukit Panjang, Choa Chu Kang
  '65': { sector: '65', generalLocation: 'Bukit Batok Central, West Mall', planningArea: 'Bukit Batok', coords: { lat: 1.3590, lng: 103.7490 } },
  '66': { sector: '66', generalLocation: 'Bukit Batok East, Hillview Terrace', planningArea: 'Bukit Batok', coords: { lat: 1.3550, lng: 103.7580 } },
  '67': { sector: '67', generalLocation: 'Bukit Panjang, Bangkit, Senja', planningArea: 'Bukit Panjang', coords: { lat: 1.3780, lng: 103.7630 } },
  '68': { sector: '68', generalLocation: 'Choa Chu Kang Central, Yew Tee', planningArea: 'Choa Chu Kang', coords: { lat: 1.3850, lng: 103.7460 } },
  // 69 to 71: Tengah, Lim Chu Kang, Kranji
  '69': { sector: '69', generalLocation: 'Tengah New Town, Plantation', planningArea: 'Tengah', coords: { lat: 1.3650, lng: 103.7250 } },
  '70': { sector: '70', generalLocation: 'Lim Chu Kang, Neo Tiew', planningArea: 'Lim Chu Kang', coords: { lat: 1.4150, lng: 103.7120 } },
  '71': { sector: '71', generalLocation: 'Sungei Buloh, Kranji Farmway', planningArea: 'Lim Chu Kang', coords: { lat: 1.4350, lng: 103.7310 } },
  // 72 to 73: Woodlands, Admiralty
  '72': { sector: '72', generalLocation: 'Kranji Industrial, Woodlands North', planningArea: 'Woodlands', coords: { lat: 1.4380, lng: 103.7620 } },
  '73': { sector: '73', generalLocation: 'Woodlands Central, Marsiling, Admiralty', planningArea: 'Woodlands', coords: { lat: 1.4360, lng: 103.7860 } },
  // 75 to 76: Sembawang, Yishun
  '75': { sector: '75', generalLocation: 'Sembawang, Canberra, Wellington', planningArea: 'Sembawang', coords: { lat: 1.4470, lng: 103.8200 } },
  '76': { sector: '76', generalLocation: 'Yishun Central, Khatib, Chong Pang', planningArea: 'Yishun', coords: { lat: 1.4280, lng: 103.8350 } },
  // 77 to 78: Upper Thomson, Mandai
  '77': { sector: '77', generalLocation: 'Upper Thomson, Tagore, Meadows', planningArea: 'Ang Mo Kio', coords: { lat: 1.3830, lng: 103.8340 } },
  '78': { sector: '78', generalLocation: 'Mandai, Springleaf, Orchid Country', planningArea: 'Mandai', coords: { lat: 1.4050, lng: 103.8180 } },
  // 79 to 80: Seletar, Jalan Kayu, Yio Chu Kang
  '79': { sector: '79', generalLocation: 'Seletar Aerospace, Jalan Kayu', planningArea: 'Seletar', coords: { lat: 1.4020, lng: 103.8680 } },
  '80': { sector: '80', generalLocation: 'Yio Chu Kang, Lentor, Teachers Estate', planningArea: 'Ang Mo Kio', coords: { lat: 1.3850, lng: 103.8440 } },
  // 81: Changi Airport
  '81': { sector: '81', generalLocation: 'Changi Airport, Jewel', planningArea: 'Changi', coords: { lat: 1.3590, lng: 103.9890 } },
  // 82: Punggol
  '82': { sector: '82', generalLocation: 'Punggol Central, Waterway, Sumang', planningArea: 'Punggol', coords: { lat: 1.4040, lng: 103.9020 } }
};

/**
 * Curated preset addresses across various Singapore towns for rapid one-click testing
 */
export const SAMPLE_ADDRESS_PRESETS: AddressPreset[] = [
  {
    name: 'Bishan St 22',
    postalCode: '570220',
    address: 'Blk 220 Bishan Street 22',
    area: 'Bishan',
    coords: { lat: 1.3582, lng: 103.8488 }
  },
  {
    name: 'Marine Parade Central',
    postalCode: '440080',
    address: 'Blk 80 Marine Parade Central',
    area: 'Marine Parade',
    coords: { lat: 1.3025, lng: 103.9070 }
  },
  {
    name: 'Tampines Ave 4',
    postalCode: '520842',
    address: 'Blk 842 Tampines Avenue 4',
    area: 'Tampines',
    coords: { lat: 1.3512, lng: 103.9378 }
  },
  {
    name: 'Bukit Timah / Dunearn',
    postalCode: '289630',
    address: '883 Dunearn Road, Bukit Timah',
    area: 'Bukit Timah',
    coords: { lat: 1.3325, lng: 103.7840 }
  },
  {
    name: 'Clementi Ave 3',
    postalCode: '120441',
    address: 'Blk 441 Clementi Avenue 3',
    area: 'Clementi',
    coords: { lat: 1.3142, lng: 103.7651 }
  },
  {
    name: 'Punggol Central',
    postalCode: '828761',
    address: '83 Punggol Central, Waterway Point',
    area: 'Punggol',
    coords: { lat: 1.4065, lng: 103.9023 }
  },
  {
    name: 'Jurong West St 52',
    postalCode: '640510',
    address: 'Blk 510 Jurong West Street 52',
    area: 'Jurong West',
    coords: { lat: 1.3485, lng: 103.7190 }
  },
  {
    name: 'Toa Payoh Central',
    postalCode: '310185',
    address: 'Blk 185 Toa Payoh Central',
    area: 'Toa Payoh',
    coords: { lat: 1.3332, lng: 103.8510 }
  }
];

/**
 * Resolve a Singapore postal code or address into coordinates and location details
 */
export function resolveSingaporeAddress(input: string): {
  coords: Coordinates;
  formattedAddress: string;
  planningArea: string;
  source: 'preset' | 'postal_lookup' | 'default';
} {
  const cleanInput = input.trim();
  
  // Check exact preset match
  const preset = SAMPLE_ADDRESS_PRESETS.find(
    p => p.postalCode === cleanInput || p.name.toLowerCase() === cleanInput.toLowerCase()
  );
  if (preset) {
    return {
      coords: preset.coords,
      formattedAddress: `${preset.address}, Singapore ${preset.postalCode}`,
      planningArea: preset.area,
      source: 'preset'
    };
  }

  // Extract 6-digit postal code pattern
  const postalMatch = cleanInput.match(/\b(\d{6})\b/) || cleanInput.match(/^(\d{6})$/);
  if (postalMatch) {
    const postalCode = postalMatch[1];
    const sector = postalCode.substring(0, 2);
    const sectorInfo = SINGAPORE_POSTAL_SECTORS[sector];

    if (sectorInfo) {
      // Deterministic slight offset based on last 4 digits to simulate individual block location
      const subOffset1 = ((parseInt(postalCode.substring(2, 4), 10) || 50) - 50) * 0.00018;
      const subOffset2 = ((parseInt(postalCode.substring(4, 6), 10) || 50) - 50) * 0.00018;

      return {
        coords: {
          lat: sectorInfo.coords.lat + subOffset1,
          lng: sectorInfo.coords.lng + subOffset2
        },
        formattedAddress: `${cleanInput.length === 6 ? `Postal Code ${postalCode}` : cleanInput}, Singapore ${postalCode}`,
        planningArea: sectorInfo.planningArea,
        source: 'postal_lookup'
      };
    }
  }

  // Check if string matches any sector or planning area name
  const lower = cleanInput.toLowerCase();
  for (const info of Object.values(SINGAPORE_POSTAL_SECTORS)) {
    if (
      lower.includes(info.planningArea.toLowerCase()) ||
      lower.includes(info.generalLocation.toLowerCase())
    ) {
      return {
        coords: info.coords,
        formattedAddress: `${cleanInput}, Singapore`,
        planningArea: info.planningArea,
        source: 'postal_lookup'
      };
    }
  }

  // Default fallback: Bishan Central (Geographic central Singapore)
  return {
    coords: { lat: 1.3526, lng: 103.8490 },
    formattedAddress: cleanInput || 'Bishan Central, Singapore 570123',
    planningArea: 'Bishan',
    source: 'default'
  };
}
