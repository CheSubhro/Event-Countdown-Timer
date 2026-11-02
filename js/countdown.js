
export function getCountdown(targetDate) {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (!Number.isFinite(target) || difference <= 0) {
    return {
      completed: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (difference / (1000 * 60 * 60)) % 24
  );
  const minutes = Math.floor(
    (difference / (1000 * 60)) % 60
  );
  const seconds = Math.floor(
    (difference / 1000) % 60
  );

  return {
    completed: false,
    days,
    hours,
    minutes,
    seconds
  };
}

export function formatNumber(number) {
  return String(number).padStart(2, "0");
}
