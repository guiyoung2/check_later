import { useEffect, useState } from 'react';
import { storageService } from '../../services/storageService';

interface SignedEntry {
  path: string;
  url: string;
}

// Supabase Storage signed URL 조회 훅
export function useSignedUrl(imagePath: string | null): string | null {
  const [entry, setEntry] = useState<SignedEntry | null>(null);

  useEffect(() => {
    let ignore = false;
    if (!imagePath) return;

    storageService
      .getSignedUrl(imagePath)
      .then((url) => {
        if (!ignore && url) setEntry({ path: imagePath, url });
      })
      .catch(() => null);

    return () => {
      ignore = true;
    };
  }, [imagePath]);

  return entry?.path === imagePath ? entry.url : null;
}
