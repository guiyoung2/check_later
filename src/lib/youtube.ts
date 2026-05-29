// YouTube URL에서 thumbnail URL 추출
export function getYouTubeThumbnail(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;
    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes('youtube.com')) {
      videoId = parsed.searchParams.get('v');
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}
