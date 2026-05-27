// URL에서 og:title 추출 시도. CORS 실패 또는 파싱 실패 시 null 반환.
export async function fetchOgTitle(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const match = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
