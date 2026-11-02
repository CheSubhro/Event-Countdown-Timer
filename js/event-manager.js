
import { getEvents, saveEvents } from "./storage.js";

export function createEvent(eventData) {
  const events = getEvents();

  const newEvent = {
    id: crypto.randomUUID(),
    name: eventData.name.trim(),
    description: eventData.description.trim(),
    targetDate: `${eventData.date}T${eventData.time}`,
    color: eventData.color,
    createdAt: new Date().toISOString()
  };

  events.push(newEvent);
  return saveEvents(events);
}

export function updateEvent(id, eventData) {
  const events = getEvents();

  const updatedEvents = events.map((event) => {
    if (event.id !== id) return event;

    return {
      ...event,
      name: eventData.name.trim(),
      description: eventData.description.trim(),
      targetDate: `${eventData.date}T${eventData.time}`,
      color: eventData.color
    };
  });

  return saveEvents(updatedEvents);
}

export function deleteEvent(id) {
  const events = getEvents();
  const filteredEvents = events.filter((event) => event.id !== id);

  return saveEvents(filteredEvents);
}

export function getAllEvents() {
  return getEvents().sort(
    (a, b) => new Date(a.targetDate) - new Date(b.targetDate)
  );
}
