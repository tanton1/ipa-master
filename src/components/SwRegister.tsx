'use client';

import { useEffect } from 'react';

/** Đăng ký service worker (chỉ ở bản production) để app dùng được offline. */
export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* bỏ qua: app vẫn chạy bình thường khi không có SW */
    });
  }, []);
  return null;
}
