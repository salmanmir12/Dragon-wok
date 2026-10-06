/**
 * Dragon Wok Abbottabad Business Hours Utility
 * Timezone: Asia/Karachi (Pakistan Standard Time)
 * Operating Hours: 12:00 PM (noon) to 2:00 AM (next morning)
 */

export interface RestaurantStatus {
  isOpen: boolean;
  pakistanTimeFormatted: string;
  hours: number;
  minutes: number;
  statusText: string;
  subText: string;
}

/**
 * Checks if Dragon Wok is open right now in Asia/Karachi time.
 * Logic:
 * Open from 12:00 PM (12:00) through midnight until 02:00 AM (02:00).
 * That means:
 * - 12:00 to 23:59 -> OPEN
 * - 00:00 to 01:59 -> OPEN
 * - 02:00 to 11:59 -> CLOSED
 */
export function checkIsRestaurantOpen(date: Date = new Date()): RestaurantStatus {
  try {
    // Format to Asia/Karachi time in 24-hour format
    const timeString = date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Karachi',
      hour12: false,
      hourCycle: 'h23',
      hour: '2-digit',
      minute: '2-digit',
    });

    const [hourStr, minuteStr] = timeString.split(':');
    let hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);

    // Normalize 24:00 to 00:00 if encountered
    if (hours === 24) hours = 0;

    // Overnight schedule: OPEN if hours >= 12 OR hours < 2
    const isOpen = hours >= 12 || hours < 2;

    const formattedTime = date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Karachi',
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
    });

    return {
      isOpen,
      pakistanTimeFormatted: formattedTime,
      hours,
      minutes,
      statusText: isOpen ? 'OPEN NOW' : 'CLOSED NOW',
      subText: isOpen ? '12:00 PM – 2:00 AM' : 'Opens at 12:00 PM',
    };
  } catch (error) {
    // Fallback if timezone not supported in environment
    const hours = date.getUTCHours() + 5; // PKT is UTC+5
    const normalizedHours = (hours % 24 + 24) % 24;
    const isOpen = normalizedHours >= 12 || normalizedHours < 2;
    return {
      isOpen,
      pakistanTimeFormatted: `${normalizedHours}:00 PKT`,
      hours: normalizedHours,
      minutes: date.getUTCMinutes(),
      statusText: isOpen ? 'OPEN NOW' : 'CLOSED NOW',
      subText: isOpen ? '12:00 PM – 2:00 AM' : 'Opens at 12:00 PM',
    };
  }
}
