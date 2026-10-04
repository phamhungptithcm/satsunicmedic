"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="article-layout">
      <h1>Chưa tải được nội dung</h1>
      <p>
        Bạn có thể thử lại. Nội dung cũ sẽ không được hiển thị khi chưa xác minh
        được trạng thái xuất bản.
      </p>
      <button onClick={reset}>Thử lại</button>
    </main>
  );
}
