/**
 * Abbottabad Location Lock & Validation Module
 * Restricts all restaurant orders strictly to Abbottabad, Khyber Pakhtunkhwa, Pakistan.
 */

export interface AbbottabadArea {
  id: string;
  name: string;
  popularLandmark?: string;
  deliveryTimeEstimate: string;
}

export const ABBOTTABAD_AREAS: AbbottabadArea[] = [
  { id: 'mandian', name: 'Mandian', popularLandmark: 'Jadoon Plaza / Women Medical College', deliveryTimeEstimate: '20-30 mins' },
  { id: 'supply', name: 'Supply Bazaar & Area', popularLandmark: 'Supply Main Chowk', deliveryTimeEstimate: '25-35 mins' },
  { id: 'mansehra-rd', name: 'Mansehra Road Corridor', popularLandmark: 'Ayub Medical Complex / AMC', deliveryTimeEstimate: '25-35 mins' },
  { id: 'pma-road', name: 'PMA Kakul Road', popularLandmark: 'PMA Gate / Kakul', deliveryTimeEstimate: '30-40 mins' },
  { id: 'bilal-town', name: 'Bilal Town', popularLandmark: 'Near City Gate / Supply', deliveryTimeEstimate: '25-35 mins' },
  { id: 'habibullah', name: 'Habibullah Colony', popularLandmark: 'Govt College Area', deliveryTimeEstimate: '30-40 mins' },
  { id: 'nawan-shehr', name: 'Nawan Shehr', popularLandmark: 'Ilyasi Masjid / Main Chowk', deliveryTimeEstimate: '35-45 mins' },
  { id: 'cantt', name: 'Abbottabad Cantonment (Cantt)', popularLandmark: 'Mall Road / CMH / Club', deliveryTimeEstimate: '30-45 mins' },
  { id: 'college-rd', name: 'College Road / Murree Road', popularLandmark: 'Post Graduate College', deliveryTimeEstimate: '30-40 mins' },
  { id: 'kehal', name: 'Kehal & Pine View', popularLandmark: 'Kehal Chowk', deliveryTimeEstimate: '35-45 mins' },
  { id: 'link-road', name: 'Link Road Abbottabad', popularLandmark: 'Connecting Mansehra & Murree Rd', deliveryTimeEstimate: '25-35 mins' },
  { id: 'jinnahabad', name: 'Jinnahabad Colony', popularLandmark: 'Main Jinnahabad Road', deliveryTimeEstimate: '25-35 mins' },
  { id: 'other-atd', name: 'Other Abbottabad Sector', popularLandmark: 'Within Abbottabad City Limits', deliveryTimeEstimate: '35-50 mins' },
];

export const RESTAURANT_PICKUP_LOCATION = {
  restaurantName: 'Dragon Wok',
  plaza: 'Jadoon Plaza Phase 1',
  area: 'Mandian',
  city: 'Abbottabad',
  province: 'Khyber Pakhtunkhwa',
  country: 'Pakistan',
  fullAddress: 'Shop #, Jadoon Plaza Phase 1, Mandian, Abbottabad, Pakistan',
  phone: '0310 0968734',
};

// Cities strictly outside Abbottabad to disallow
const BLOCKED_CITIES = [
  'islamabad',
  'rawalpindi',
  'lahore',
  'karachi',
  'peshawar',
  'haripur',
  'mansehra',
  'swat',
  'mardan',
  'multan',
  'faisalabad',
  'quetta',
  'sialkot',
  'gujranwala',
  'wah cantt',
  'taxila',
  'hassan abdal',
  'havelian',
];

/**
 * Validates whether the delivery address is genuinely inside Abbottabad.
 */
export function validateAbbottabadLocation(
  orderType: 'Delivery' | 'Pickup',
  selectedAreaId: string,
  detailedAddress: string
): { isValid: boolean; errorMessage?: string; formattedAddress: string } {
  if (orderType === 'Pickup') {
    return {
      isValid: true,
      formattedAddress: RESTAURANT_PICKUP_LOCATION.fullAddress,
    };
  }

  const trimmedAddress = (detailedAddress || '').trim();
  const lowerAddress = trimmedAddress.toLowerCase();

  // Check for blocked external cities
  for (const city of BLOCKED_CITIES) {
    if (lowerAddress.includes(city)) {
      return {
        isValid: false,
        errorMessage: `Delivery is exclusively locked to Abbottabad. We cannot deliver to ${city.toUpperCase()}. Please provide an Abbottabad address.`,
        formattedAddress: '',
      };
    }
  }

  // Must have an Abbottabad area selected or entered
  const matchedArea = ABBOTTABAD_AREAS.find((a) => a.id === selectedAreaId);
  if (!matchedArea && selectedAreaId !== 'other-atd') {
    return {
      isValid: false,
      errorMessage: 'Please select your Abbottabad neighborhood from the list.',
      formattedAddress: '',
    };
  }

  if (trimmedAddress.length < 5) {
    return {
      isValid: false,
      errorMessage: 'Please enter your street number, house/plaza name, or landmark in Abbottabad.',
      formattedAddress: '',
    };
  }

  const areaName = matchedArea ? matchedArea.name : 'Abbottabad City';
  const formattedAddress = trimmedAddress.toLowerCase().includes('abbottabad')
    ? `${trimmedAddress} (${areaName})`
    : `${trimmedAddress}, ${areaName}, Abbottabad, Pakistan`;

  return {
    isValid: true,
    formattedAddress,
  };
}
