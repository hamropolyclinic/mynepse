/**
 * NEPSE (Nepal Stock Exchange) Schedule & Trading Hours Logic
 * 
 * Official Trading Schedule:
 * - Trading Days: Monday to Friday
 * - Pre-Open Session: 10:30 AM – 10:45 AM (Order Collection & Equilibrium Price Determination)
 * - Pre-Open Matching: 10:45 AM – 11:00 AM (Final buffer before regular trading)
 * - Regular Continuous Trading: 11:00 AM – 3:00 PM (15:00)
 * - Market Closed: Saturday, Sunday, Before 10:30 AM, and After 3:00 PM
 * - Timezone: Nepal Time (NPT = UTC + 5:45)
 */

export type NepseSessionType = 'REGULAR_OPEN' | 'PRE_OPEN' | 'PRE_OPEN_BUFFER' | 'CLOSED';

export interface NepseMarketScheduleInfo {
  session: NepseSessionType;
  statusText: string;
  badgeLabel: 'OPEN' | 'PRE-OPEN' | 'CLOSED';
  badgeColor: 'emerald' | 'amber' | 'slate';
  nepalTimeFormatted: string;
  nepalDateFormatted: string;
  dayName: string;
  isTradingDay: boolean;
  nextSessionText: string;
  tradingHoursSummary: string;
}

/**
 * Converts a JavaScript Date to Nepal Standard Time (UTC + 5:45)
 */
export function getNepalDateTime(date: Date = new Date()): {
  year: number;
  month: number;
  date: number;
  day: number; // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
  dateObj: Date;
} {
  // Current UTC timestamp + 5 hours 45 minutes (in milliseconds)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const nepalOffsetMs = (5 * 60 + 45) * 60000;
  const nepalDate = new Date(utc + nepalOffsetMs);

  const hours = nepalDate.getHours();
  const minutes = nepalDate.getMinutes();
  const seconds = nepalDate.getSeconds();
  const totalMinutes = hours * 60 + minutes;

  return {
    year: nepalDate.getFullYear(),
    month: nepalDate.getMonth(),
    date: nepalDate.getDate(),
    day: nepalDate.getDay(),
    hours,
    minutes,
    seconds,
    totalMinutes,
    dateObj: nepalDate,
  };
}

/**
 * Evaluates current NEPSE market session according to Monday–Friday 11:00 AM – 3:00 PM
 * with Pre-Open session 10:30 AM – 10:45 AM.
 */
export function getNepseMarketSchedule(currentDate: Date = new Date()): NepseMarketScheduleInfo {
  const npt = getNepalDateTime(currentDate);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[npt.day];
  
  // Trading days: Monday (1) to Friday (5)
  const isTradingDay = npt.day >= 1 && npt.day <= 5;

  // Key minute markers in the day:
  // 10:30 AM = 10 * 60 + 30 = 630
  // 10:45 AM = 10 * 60 + 45 = 645
  // 11:00 AM = 11 * 60 = 660
  // 3:00 PM (15:00) = 15 * 60 = 900
  const PRE_OPEN_START = 10 * 60 + 30;  // 630 (10:30 AM)
  const PRE_OPEN_END = 10 * 60 + 45;    // 645 (10:45 AM)
  const REGULAR_START = 11 * 60;        // 660 (11:00 AM)
  const REGULAR_END = 15 * 60;          // 900 (3:00 PM / 15:00)

  const timeString = npt.dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateString = npt.dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const tradingHoursSummary = 'Mon – Fri: 11:00 AM – 3:00 PM (Pre-Open: 10:30 AM – 10:45 AM)';

  if (!isTradingDay) {
    return {
      session: 'CLOSED',
      statusText: `Market Closed (Weekend: ${dayName})`,
      badgeLabel: 'CLOSED',
      badgeColor: 'slate',
      nepalTimeFormatted: `${timeString} NPT`,
      nepalDateFormatted: dateString,
      dayName,
      isTradingDay: false,
      nextSessionText: 'Pre-Open starts Monday at 10:30 AM NPT',
      tradingHoursSummary,
    };
  }

  // It is a weekday (Monday to Friday)
  const mins = npt.totalMinutes;

  if (mins >= REGULAR_START && mins < REGULAR_END) {
    // 11:00 AM to 3:00 PM (Continuous Trading)
    const minutesLeft = REGULAR_END - mins;
    const hoursLeft = Math.floor(minutesLeft / 60);
    const remMins = minutesLeft % 60;
    const closeNotice = hoursLeft > 0 ? `${hoursLeft}h ${remMins}m left` : `${remMins}m left`;

    return {
      session: 'REGULAR_OPEN',
      statusText: `Market Open (Continuous: 11:00 AM – 3:00 PM)`,
      badgeLabel: 'OPEN',
      badgeColor: 'emerald',
      nepalTimeFormatted: `${timeString} NPT`,
      nepalDateFormatted: dateString,
      dayName,
      isTradingDay: true,
      nextSessionText: `Closes at 3:00 PM NPT (${closeNotice})`,
      tradingHoursSummary,
    };
  }

  if (mins >= PRE_OPEN_START && mins < PRE_OPEN_END) {
    // 10:30 AM to 10:45 AM (Pre-Open Session)
    const minutesLeft = PRE_OPEN_END - mins;
    return {
      session: 'PRE_OPEN',
      statusText: `Pre-Open Session Active (10:30 AM – 10:45 AM)`,
      badgeLabel: 'PRE-OPEN',
      badgeColor: 'amber',
      nepalTimeFormatted: `${timeString} NPT`,
      nepalDateFormatted: dateString,
      dayName,
      isTradingDay: true,
      nextSessionText: `Continuous Trading starts at 11:00 AM (${minutesLeft}m in Pre-Open)`,
      tradingHoursSummary,
    };
  }

  if (mins >= PRE_OPEN_END && mins < REGULAR_START) {
    // 10:45 AM to 11:00 AM (Pre-Open Order Matching / Opening Buffer)
    const minutesToOpen = REGULAR_START - mins;
    return {
      session: 'PRE_OPEN_BUFFER',
      statusText: `Pre-Open Order Matching (10:45 AM – 11:00 AM)`,
      badgeLabel: 'PRE-OPEN',
      badgeColor: 'amber',
      nepalTimeFormatted: `${timeString} NPT`,
      nepalDateFormatted: dateString,
      dayName,
      isTradingDay: true,
      nextSessionText: `Continuous Trading opens in ${minutesToOpen} min (11:00 AM)`,
      tradingHoursSummary,
    };
  }

  if (mins < PRE_OPEN_START) {
    // Before 10:30 AM on a trading day
    const minutesToPreOpen = PRE_OPEN_START - mins;
    const hoursTo = Math.floor(minutesToPreOpen / 60);
    const remMins = minutesToPreOpen % 60;
    const timeNotice = hoursTo > 0 ? `${hoursTo}h ${remMins}m` : `${remMins}m`;

    return {
      session: 'CLOSED',
      statusText: `Market Closed (Opens at 10:30 AM Pre-Open)`,
      badgeLabel: 'CLOSED',
      badgeColor: 'slate',
      nepalTimeFormatted: `${timeString} NPT`,
      nepalDateFormatted: dateString,
      dayName,
      isTradingDay: true,
      nextSessionText: `Pre-Open starts today in ${timeNotice} (10:30 AM)`,
      tradingHoursSummary,
    };
  }

  // After 3:00 PM (15:00) on a trading day
  const nextDayText = npt.day === 5 ? 'Pre-Open opens Monday at 10:30 AM NPT' : 'Pre-Open opens tomorrow at 10:30 AM NPT';
  return {
    session: 'CLOSED',
    statusText: `Market Closed (Closed at 3:00 PM)`,
    badgeLabel: 'CLOSED',
    badgeColor: 'slate',
    nepalTimeFormatted: `${timeString} NPT`,
    nepalDateFormatted: dateString,
    dayName,
    isTradingDay: true,
    nextSessionText: nextDayText,
    tradingHoursSummary,
  };
}
