'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main id="main" className="article-layout"><h1>Chưa tải được thông tin chi nhánh</h1><p>Kiểm tra kết nối và thử lại.</p><button onClick={reset}>Thử lại</button><a href="/co-so-y-te">Về danh sách</a></main>;}
