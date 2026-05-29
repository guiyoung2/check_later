// URL에서 제목 추출. YouTube는 oEmbed, 나머지는 CORS 차단으로 skip.
export async function fetchOgTitle(url: string): Promise<string | null> {
  try {
    if (/youtube\.com|youtu\.be/i.test(url)) {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      );
      if (!res.ok) return null;
      const data = await res.json();
      return (data.title as string) ?? null;
    }
    // 비YouTube: 브라우저 CORS 차단으로 실패하므로 시도하지 않음
    return null;
  } catch {
    return null;
  }
}
