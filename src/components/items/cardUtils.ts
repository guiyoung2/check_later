// 카드 상단 타임스탬프 포맷 (오늘/어제 시각, 이번 주 상대, 이전 날짜)
export function formatCardDate(dateStr: string): string {
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');

  if (diffDays === 0) return `오늘 ${hh}:${mm}`;
  if (diffDays === 1) return `어제 ${hh}:${mm}`;
  if (diffDays < 7) return `${diffDays}일 전`;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (diffDays < 365) return `${month}월 ${day}일`;
  return `${Math.floor(diffDays / 365)}년 전`;
}
