import type { ItemType } from '../types';

interface DetectTypeParams {
  hasImage: boolean;
  url?: string;
}

export function detectType(params: DetectTypeParams): ItemType {
  const url = params.url?.trim();
  if (url) {
    if (/youtube\.com|youtu\.be/i.test(url)) return 'video';
    return 'article';
  }
  if (params.hasImage) return 'screenshot';
  return 'memo';
}
