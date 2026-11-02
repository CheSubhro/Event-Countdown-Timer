
export function createCountdown({
  targetDate,
  container,
  showDate = true,
  title = "",
  onComplete = null
}) {
  const element =
    typeof container === "string"
      ? document.querySelector(container)
      : container;

  if (!element) {
    throw new Error("Countdown container not found.");
  }

  const target = new Date(targetDate).getTime();

  if (!Number.isFinite(target)) {
    throw new Error("Invalid target date.");
  }

  let interval = null;
  let completed = false;

  element.innerHTML = `
    <div class="ect-widget">
      ${title ? `<h2 class="ect-title">${title}</h2>` : ""}

      <div class="ect-countdown">
        <div class="ect-unit">
          <span data-unit="days">00</span>
          <small>Days</small>
        </div>
        <div class="ect-unit">
          <span data-unit="hours">00</span>
          <small>Hours</small>
        </div>
        <div class="ect-unit">
          <span data-unit="minutes">00</span>
          <small>Minutes</small>
        </div>
        <div class="ect-unit">
          <span data-unit="seconds">00</span>
          <small>Seconds</small>
        </div>
      </div>

      ${
        showDate
          ? `<p class="ect-date">${new Date(target).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}</p>`
          : ""
      }
    </div>
  `;

  function update() {
    const difference = target - Date.now();

    if (difference <= 0) {
      ["days", "hours", "minutes", "seconds"].forEach((unit) => {
        element.querySelector(`[data-unit="${unit}"]`).textContent = "00";
      });

      if (!completed) {
        completed = true;
        stop();
        onComplete?.();
      }

      return;
    }

    const values = {
      days: Math.floor(difference / 86400000),
      hours: Math.floor((difference / 3600000) % 24),
      minutes: Math.floor((difference / 60000) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };

    Object.entries(values).forEach(([unit, value]) => {
      element.querySelector(`[data-unit="${unit}"]`).textContent =
        String(value).padStart(2, "0");
    });
  }

  function start() {
    if (interval) return;

    update();

    if (!completed) {
      interval = setInterval(update, 1000);
    }
  }

  function stop() {
    clearInterval(interval);
    interval = null;
  }

  function destroy() {
    stop();
    element.innerHTML = "";
  }

  return { start, stop, destroy };
}
