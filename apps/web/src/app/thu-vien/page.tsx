import Link from "next/link";
import { BookOpen } from "lucide-react";
export const metadata = { title: "Thư viện kiến thức" };
export default async function Library() {
  let items: { slug: string; title: string; summary: string }[] = [];
  let failed = false;
  try {
    const res = await fetch(
      `${process.env.API_ORIGIN ?? "http://127.0.0.1:4186"}/api/v1/knowledge/search`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "", locale: "vi", limit: 20 }),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) throw new Error();
    items = (await res.json()).items;
  } catch {
    failed = true;
  }
  return (
    <>
      
      <main id="main" className="article-layout">
        <p className="eyebrow">KIẾN THỨC CÓ NGUỒN</p>
        <h1>Thư viện giải phẫu</h1>
        <p className="lead">
          Khám phá kiến thức giải phẫu cùng nguồn tham khảo.
        </p>
        {items.length ? (
          <div className="content-grid">
            {items.map((a) => (
              <article className="content-card" key={a.slug}>
                <h2>
                  <a href={`/bai-viet/${a.slug}`}>{a.title}</a>
                </h2>
                <p>{a.summary}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="library-empty">
            <BookOpen size={30} />
            <h2>
              {failed
                ? "Chưa tải được thư viện"
                : "Chưa có nội dung được xuất bản"}
            </h2>
            <p>
              {failed
                ? "Hãy tải lại trang để thử kết nối lại."
                : "Bài viết sẽ xuất hiện tại đây khi được xuất bản."}
            </p>
            <Link href="/" className="primary login-button">
              Quay lại khám phá
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
