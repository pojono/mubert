// month-from-date.js (ES Module)

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function monthFromDate(date: Date | string): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return MONTHS[date.getMonth()];
}
