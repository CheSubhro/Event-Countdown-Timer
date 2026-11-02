
import { getCountdown, formatNumber } from "./countdown.js";

import {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents
} from "./event-manager.js";

// DOM Elements
const eventsContainer = document.getElementById("eventsContainer");
const emptyState = document.getElementById("emptyState");
const eventModal = document.getElementById("eventModal");
const eventForm = document.getElementById("eventForm");

const addEventBtn = document.getElementById("addEventBtn");
const emptyAddEventBtn = document.getElementById("emptyAddEventBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const themeToggle = document.getElementById("themeToggle");

const modalTitle = document.getElementById("modalTitle");

let timerInterval;

// Utility: prevent HTML injection
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Date formatting
function formatDate(dateString) {
  return new Date(dateString).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Modal
function openModal(event = null) {
  eventForm.reset();

  document.getElementById("eventId").value = "";

  if (event) {
    modalTitle.textContent = "Edit Event";

    document.getElementById("eventId").value = event.id;
    document.getElementById("eventName").value = event.name;
    document.getElementById("eventDescription").value =
      event.description || "";

    const target = new Date(event.targetDate);

    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, "0");
    const day = String(target.getDate()).padStart(2, "0");

    const hours = String(target.getHours()).padStart(2, "0");
    const minutes = String(target.getMinutes()).padStart(2, "0");

    document.getElementById("eventDate").value =
      `${year}-${month}-${day}`;

    document.getElementById("eventTime").value =
      `${hours}:${minutes}`;

    document.getElementById("eventColor").value =
      event.color || "#8b5cf6";
  } else {
    modalTitle.textContent = "Create New Event";
    document.getElementById("eventColor").value = "#8b5cf6";
  }

  eventModal.classList.remove("hidden");
}

function closeModal() {
  eventModal.classList.add("hidden");
  eventForm.reset();
}

// Event Rendering
function renderEvents() {
  const events = getAllEvents();

  const upcoming = events.filter(
    (event) => new Date(event.targetDate).getTime() > Date.now()
  );

  const completed = events.length - upcoming.length;

  document.getElementById("totalEvents").textContent = events.length;
  document.getElementById("upcomingEvents").textContent = upcoming.length;
  document.getElementById("completedEvents").textContent = completed;

  emptyState.classList.toggle("show", events.length === 0);
  eventsContainer.style.display = events.length === 0 ? "none" : "grid";

  eventsContainer.innerHTML = events.map((event) => {
    const countdown = getCountdown(event.targetDate);
    const color = /^#[0-9a-f]{6}$/i.test(event.color)
      ? event.color
      : "#8b5cf6";

    const status = countdown.completed ? "Completed" : "Upcoming";

    return `
      <article class="event-card" style="--event-color: ${color}">
        <h3>${escapeHTML(event.name)}</h3>

        <p class="event-description">
          ${escapeHTML(event.description || "No description added")}
        </p>

        <span class="event-status ${countdown.completed ? "completed" : ""}">
          ${status}
        </span>

        <div class="countdown-grid" data-countdown="${escapeHTML(event.id)}">
          <div class="time-box">
            <strong>${formatNumber(countdown.days)}</strong>
            <span>Days</span>
          </div>

          <div class="time-box">
            <strong>${formatNumber(countdown.hours)}</strong>
            <span>Hours</span>
          </div>

          <div class="time-box">
            <strong>${formatNumber(countdown.minutes)}</strong>
            <span>Minutes</span>
          </div>

          <div class="time-box">
            <strong>${formatNumber(countdown.seconds)}</strong>
            <span>Seconds</span>
          </div>
        </div>

        <p class="event-date">
          ${formatDate(event.targetDate)}
        </p>

        <div class="event-actions">
          <button data-action="edit" data-id="${escapeHTML(event.id)}">
            Edit
          </button>

          <button data-action="delete" data-id="${escapeHTML(event.id)}">
            Delete
          </button>
        </div>
      </article>
    `;
  }).join("");
}

// Update countdown without rebuilding cards
function updateCountdowns() {
  const events = getAllEvents();

  events.forEach((event) => {
    const countdown = getCountdown(event.targetDate);

    const container = eventsContainer.querySelector(
      `[data-countdown="${CSS.escape(event.id)}"]`
    );

    if (!container) return;

    const values = [
      countdown.days,
      countdown.hours,
      countdown.minutes,
      countdown.seconds
    ];

    container.querySelectorAll(".time-box strong").forEach((element, index) => {
      element.textContent = formatNumber(values[index]);
    });

    const status = container.parentElement.querySelector(".event-status");

    if (status) {
      status.textContent = countdown.completed ? "Completed" : "Upcoming";
      status.classList.toggle("completed", countdown.completed);
    }
  });

  const eventsBefore = document.getElementById("upcomingEvents").textContent;

  const upcoming = events.filter(
    (event) => new Date(event.targetDate).getTime() > Date.now()
  );

  document.getElementById("upcomingEvents").textContent = upcoming.length;
  document.getElementById("completedEvents").textContent =
    events.length - upcoming.length;
}

// Refresh application
function refreshApp() {
  renderEvents();

  clearInterval(timerInterval);
  timerInterval = setInterval(updateCountdowns, 1000);
}

// Save event
eventForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = document.getElementById("eventId").value;

  const eventData = {
    name: document.getElementById("eventName").value,
    description: document.getElementById("eventDescription").value,
    date: document.getElementById("eventDate").value,
    time: document.getElementById("eventTime").value,
    color: document.getElementById("eventColor").value
  };

  const targetDate = new Date(`${eventData.date}T${eventData.time}`);

  if (!Number.isFinite(targetDate.getTime())) {
    alert("Please enter a valid date and time.");
    return;
  }

  const success = id
    ? updateEvent(id, eventData)
    : createEvent(eventData);

  if (!success) {
    alert("Unable to save event. Please try again.");
    return;
  }

  closeModal();
  refreshApp();
});

// Event actions
eventsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  const events = getAllEvents();
  const selectedEvent = events.find((item) => item.id === id);

  if (!selectedEvent) return;

  if (action === "edit") {
    openModal(selectedEvent);
  }

  if (action === "delete") {
    const confirmed = confirm(
      `Are you sure you want to delete "${selectedEvent.name}"?`
    );

    if (confirmed) {
      deleteEvent(id);
      refreshApp();
    }
  }
});

// Buttons
addEventBtn.addEventListener("click", () => openModal());
emptyAddEventBtn.addEventListener("click", () => openModal());

closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

eventModal.addEventListener("click", (event) => {
  if (event.target === eventModal) closeModal();
});

// Theme
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("eventTimerTheme", theme);
}

themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.classList.contains("dark")
    ? "dark"
    : "light";

  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

// Initialize
applyTheme(localStorage.getItem("eventTimerTheme") || "light");
refreshApp();
