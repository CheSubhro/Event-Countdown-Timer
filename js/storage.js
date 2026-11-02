
const STORAGE_KEY = "eventCountdownEvents";

export function getEvents() {
  try {
    const events = localStorage.getItem(STORAGE_KEY);
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error("Failed to load events:", error);
    return [];
  }
}

export function saveEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return true;
  } catch (error) {
    console.error("Failed to save events:", error);
    return false;
  }
}

export function clearEvents() {
  localStorage.removeItem(STORAGE_KEY);
}
