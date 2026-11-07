/** Hiển thị khoá ngày "YYYY-MM-DD" theo cách người Việt đọc: hôm nay, ngày mai, 7/11. */
export function formatDay(key: string | undefined, today: string): string {
  if (!key) return '';
  const [y, m, d] = key.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  const diff = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
  if (diff === 0) return 'hôm nay';
  if (diff === 1) return 'ngày mai';
  if (diff === -1) return 'hôm qua';
  if (diff > 1 && diff < 7) return `${diff} ngày nữa`;
  if (diff < -1 && diff > -7) return `${-diff} ngày trước`;
  return y === ty ? `${d}/${m}` : `${d}/${m}/${y}`;
}
