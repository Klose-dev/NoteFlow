export function formatRelativeTime(date, referenceDate = Date.now()) {
  const timestamp = new Date(date).getTime();
  const reference = new Date(referenceDate).getTime();
  if (Number.isNaN(timestamp) || Number.isNaN(reference)) return `just now • ${getTimeZone()}`;

  const difference = Math.max(0, reference - timestamp);
  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) return `just now • ${getTimeZone()}`;
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago • ${getTimeZone()}`;
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago • ${getTimeZone()}`;
  if (days === 1) return `Yesterday • ${getTimeZone()}`;
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago • ${getTimeZone()}`;

  const timeZone = getTimeZone();
  return `${new Date(timestamp).toLocaleDateString()} • ${timeZone}`;
}

function getTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time';
  } catch {
    return 'local time';
  }
}
