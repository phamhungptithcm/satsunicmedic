import Link from "./progress-link";
import { BookOpen, RotateCcw } from 'lucide-react';
import styles from './learning-empty.module.css';

export default function LearningEmpty({ failed, retry }: { failed: boolean; retry: () => void }) {
  return <section className={styles.card} aria-label={failed ? 'Kết nối bài học' : 'Bài học chưa xuất bản'}>
    <BookOpen size={24} aria-hidden="true" />
    <h2 tabIndex={-1}>{failed ? 'Chưa tải được bài học' : 'Chưa có bài kiểm tra được xuất bản'}</h2>
    <p>{failed ? 'Thử kết nối lại để xem những bài học hiện có.' : 'Bạn vẫn có thể tìm hiểu cách khám phá mô hình. Bài kiểm tra sẽ xuất hiện khi nội dung được xuất bản.'}</p>
    <div className={styles.actions}>
      {failed && <button type="button" onClick={retry}><RotateCcw size={16} aria-hidden="true" />Thử tải lại</button>}
      <Link href="/">Về không gian khám phá</Link>
      <Link href="/gioi-thieu">Xem cách sử dụng</Link>
    </div>
  </section>;
}
