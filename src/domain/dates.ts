const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const shortDate = (date: Date): string => `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
