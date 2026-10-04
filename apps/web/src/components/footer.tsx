import Link from "./progress-link";
import { Info, Layers3 } from "lucide-react";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <Link href="/" className={styles.brand} aria-label="HumanScope — trang khám phá">
            <span className={styles.mark}><Layers3 size={21} aria-hidden="true" /></span>
            <span className={styles.brandText}>
              <span className={styles.name}>Human<span>Scope</span></span>
              <span className={styles.byline}>by HunpeoLabs</span>
            </span>
          </Link>
          <nav className={styles.links} aria-label="Thông tin trang">
            <Link href="/gioi-thieu">Về HumanScope</Link>
            <Link href="/gioi-thieu#quyen-rieng-tu">Quyền riêng tư</Link>
          </nav>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copyright}>© {new Date().getFullYear()} Copyright by HunpeoLabs</p>
          <p className={styles.note}>
            <Info size={15} aria-hidden="true" />
            <span>Nội dung chỉ mang tính tham khảo, không phải kết luận chuyên môn hay thay thế tư vấn y tế. HunpeoLabs miễn trừ trách nhiệm trong phạm vi pháp luật cho phép.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
