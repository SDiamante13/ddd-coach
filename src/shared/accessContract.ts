export const ACCESS_MAX_AGE_S = 7_776_000;
const SECONDS_PER_DAY = 86_400;
export const UNLOCKED_FOR = `This browser stays unlocked for ${Math.floor(ACCESS_MAX_AGE_S / SECONDS_PER_DAY)} days.`;
export const ACCESS_WRONG_PASSWORD = "That password isn't right. Try again, or ask the organizer for it.";
export const ACCESS_REQUIRED = "Your access has expired. Enter the conference password below, then send your message again.";
export const ACCESS_BAD_REQUEST = "Enter the conference password.";
