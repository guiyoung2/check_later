import type { ItemType } from '../types';

interface DetectTypeParams {
  hasImage: boolean;
  url?: string;
}

// ARCHITECTURE.md의 우선순위: 이미지 → YouTube → 일반 URL → 메모
export function detectType(params: DetectTypeParams): ItemType {
  if (params.hasImage) return 'screenshot';

  const url = params.url?.trim();
  if (url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video';
    return 'article';
  }

  return 'memo';
}
