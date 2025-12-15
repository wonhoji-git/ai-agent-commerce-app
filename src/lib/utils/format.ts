/**
 * Format utilities for display
 */

/**
 * Format relative time (e.g., "방금 전", "5분 전")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 10) {
    return "방금 전";
  } else if (diffSec < 60) {
    return `${diffSec}초 전`;
  } else if (diffMin < 60) {
    return `${diffMin}분 전`;
  } else if (diffHour < 24) {
    return `${diffHour}시간 전`;
  } else if (diffDay < 7) {
    return `${diffDay}일 전`;
  } else {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

/**
 * Format duration in milliseconds to human readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}시간 ${remainingMinutes}분`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  } else {
    return `${seconds}초`;
  }
}

/**
 * Format currency (Korean Won)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ko-KR").format(num);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
