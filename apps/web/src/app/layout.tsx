import { headers } from "next/headers";
import GoogleOneTap from "../components/google-one-tap";
import type { Metadata } from "next";
import "./globals.css";
import Footer from "../components/footer";
import SiteShell from "../components/site-shell";
export const metadata: Metadata = {
  title: {
    default: "SatsunicMec — Khám phá cơ thể người",
    template: "%s · SatsunicMec",
  },
  icons: {
    icon: { url: "/brand/satsunicmec-mark.svg", type: "image/svg+xml", sizes: "any" },
  },
  description:
    "Không gian khám phá giải phẫu, học và soạn bài với mô hình 3D theo thời gian.",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <a className="skip-link" href="#main">
          Đến nội dung chính
        </a>
        <GoogleOneTap nonce={(await headers()).get("x-nonce") ?? ""} />
        <SiteShell footer={<Footer />}>{children}</SiteShell>
      </body>
    </html>
  );
}
