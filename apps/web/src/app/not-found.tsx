import Link from "../components/progress-link";
export default function NotFound() {
  return (
    <main id="main" className="article-layout">
      <h1>Nội dung không khả dụng</h1>
      <p>Bài viết có thể chưa xuất bản hoặc đã được rút khỏi thư viện.</p>
      <Link href="/thu-vien">Về thư viện</Link>
    </main>
  );
}
