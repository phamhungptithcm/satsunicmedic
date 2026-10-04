"use client";
import Loading from './loading';
import { useEffect, useRef, useState } from 'react';
import { ApiError, request } from '@hs/api-client';
import type { LearningReviewList } from '@hs/contracts';

export function reviewDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value));
}
export default function LearningReviews({ onOpen, disabled }: { onOpen: (id: string) => void; disabled: boolean }) {
  const [data, setData] = useState<LearningReviewList | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    const clear = () => { pending.current?.abort(); setData(null); setMessage(''); setLoading(false); };
    window.addEventListener('hs-auth-changed', clear);
    return () => { pending.current?.abort(); window.removeEventListener('hs-auth-changed', clear); };
  }, []);
  async function load(more = false) {
    pending.current?.abort();
    const controller = new AbortController(); pending.current = controller;
    setLoading(true); if (!more) setData(null); setMessage(more ? 'Đang tải thêm bài ôn…' : 'Đang tải lịch ôn…');
    try {
      const response = await request<LearningReviewList>('/api/v1/me/reviews' + (more && data?.nextCursor ? `?cursor=${encodeURIComponent(data.nextCursor)}` : ''), { signal: controller.signal });
      if (controller.signal.aborted) return;
      setData(previous => more && previous ? { ...response, items: [...new Map([...previous.items, ...response.items].map(item => [`${item.quizId}:${item.quizRevision}`, item])).values()] } : response);
      setMessage(response.items.length ? '' : response.nextCursor ? 'Phần lịch này chưa có bài ôn khả dụng. Bạn có thể tải tiếp.' : response.truncated ? 'Chưa tìm thấy bài ôn khả dụng trong phần lịch đã tải.' : more ? 'Đã tải hết lịch ôn khả dụng.' : 'Chưa có bài ôn khả dụng. Hoàn thành một bài đã xuất bản để tạo lịch ôn.');
    } catch (error) {
      if (controller.signal.aborted) return;
      setMessage(error instanceof ApiError && error.status === 401 ? 'Đăng nhập để xem lịch ôn của bạn.' : error instanceof ApiError && error.code === 'CURSOR_EXPIRED' ? 'Lịch ôn đã thay đổi. Tải lại lịch để tiếp tục.' : 'Chưa tải được lịch ôn. Bạn có thể thử lại.');
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }
  return <section aria-label="Lịch ôn của bạn">
    <h2>Ôn lại kiến thức</h2>
    <p>Lịch gợi ý thử nghiệm, không phải đánh giá năng lực lâm sàng. Thời gian hiển thị theo giờ Việt Nam (UTC+7).</p>
    <button type="button" disabled={loading || disabled} onClick={() => void load()}>Tải lịch ôn của tôi</button>
    <p role={loading ? undefined : "status"}>{loading ? <Loading inline label={message.replace(/…$/, '')}/> : message}</p>
    {data?.nextCursor && <button type="button" disabled={loading || disabled} onClick={() => void load(true)}>Tải thêm bài ôn</button>}
    {data?.truncated && !data.nextCursor && <p>Đang hiển thị một phần lịch ôn. Các bài khác vẫn được lưu trong tài khoản.</p>}
    <ul>{data?.items.map(item => <li key={`${item.quizId}:${item.quizRevision}`}>
      <button type="button" disabled={disabled} onClick={() => onOpen(item.quizId)}>Ôn bài: {item.title}</button>{' '}
      <time dateTime={item.schedule.dueAt}>{reviewDate(item.schedule.dueAt)}</time>
    </li>)}</ul>
  </section>;
}
