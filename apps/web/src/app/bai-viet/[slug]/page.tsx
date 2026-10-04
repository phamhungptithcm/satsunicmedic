import { ArticleNavigation } from "../../../components/site-shell";
import { cookies, headers } from "next/headers";
import ArticleAd from "../../../components/article-ad";
import { adConfig, eligibleAdPath } from "../../../lib/ads-policy";
import { notFound } from "next/navigation";
import { articleBodySchema } from "@hs/contracts";
export default async function Article({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) notFound();
  const res = await fetch(
    `${process.env.API_ORIGIN ?? "http://127.0.0.1:4186"}/api/v1/articles/${slug}`,
    { cache: "no-store", signal: AbortSignal.timeout(5000) },
  );
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Article unavailable");
  const raw = await res.json();
  const article = articleBodySchema.parse(raw.body);
  const config = adConfig(process.env);
  const jar = await cookies();
  const requestHeaders = await headers();
  const hasSession = jar.has("__Host-hs_session") || jar.has("hs_session");
  const eligible = eligibleAdPath(config, `/bai-viet/${slug}`, hasSession, Object.keys(await searchParams).length > 0)
    && Boolean(raw.reviewedAt) && Date.parse(raw.reviewDueAt) > Date.now();
  const nonce = requestHeaders.get("x-nonce") ?? "";
  return (
    <>
      <ArticleNavigation fullDocument={eligible} />
      <main id="main" className="article-layout reading">
        <p className="eyebrow">THƯ VIỆN KIẾN THỨC</p>
        <h1>{article.title}</h1>
        <p className="lead">{article.summary}</p>
        {article.sections.map((s, i) => (
          <section key={i}>
            <h2>{s.heading}</h2>
            <p>{s.text}</p>
          </section>
        ))}
        {eligible && config && nonce && <ArticleAd config={config} nonce={nonce} />}
        <h2>Nguồn tham khảo</h2>
        <ul>
          {article.sources.map((s, i) => (
            <li key={i}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
        <p>
          Hiệu lực nội dung đến:{" "}
          {new Intl.DateTimeFormat("vi", {
            dateStyle: "medium",
            timeZone: "UTC",
          }).format(new Date(raw.reviewDueAt))}
        </p>
      </main>
    </>
  );
}
