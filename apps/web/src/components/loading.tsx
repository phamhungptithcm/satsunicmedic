import { PendingBoundary } from './request-progress';
import styles from './loading.module.css';

type Props = { label?: string; inline?: boolean; overlay?: boolean; dark?: boolean; progress?: { loaded: number; total: number } };
export default function Loading({ label = 'Đang mở nội dung', inline = false, overlay = false, dark = false, progress }: Props) {
 const measured = progress && progress.total > 0 && progress.loaded < progress.total;
 const percent = measured ? Math.max(0, Math.min(99, Math.floor(progress.loaded / progress.total * 100))) : undefined;
 return <span className={[styles.root, inline ? styles.inline : styles.scene, overlay ? styles.overlay : '', dark ? styles.dark : ''].join(' ')} aria-busy="true">
  <PendingBoundary/>
  <span className={styles.label} role="status" aria-live="polite">{label}</span>
  <span className={styles.bar} role="progressbar" aria-label={label} aria-valuemin={measured ? 0 : undefined} aria-valuemax={measured ? 100 : undefined} aria-valuenow={percent}>
   <span className={measured ? styles.measured : styles.indeterminate} style={measured ? { width: `${percent}%` } : undefined}/>
  </span>
  {percent !== undefined && <span className={styles.percent} aria-hidden="true">{percent}%</span>}
 </span>;
}
