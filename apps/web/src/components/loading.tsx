import styles from "./loading.module.css";

type Props = { label?: string; inline?: boolean; overlay?: boolean; dark?: boolean };
/** Indeterminate feedback only: never implies measured progress. */
export default function Loading({ label = "Đang mở nội dung", inline = false, overlay = false, dark = false }: Props) {
  return <span role="status" aria-live="polite" className={[styles.root, inline ? styles.inline : styles.scene, overlay ? styles.overlay : "", dark ? styles.dark : ""].join(" ")}>
    <span className={styles.art} aria-hidden="true">
      <span className={styles.halo} />
      <svg className={styles.orbit} viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="49" /><circle cx="60" cy="60" r="49" className={styles.arc} /><circle cx="60" cy="11" r="3" className={styles.dot} /></svg>
      <svg className={styles.core} viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="m8 31 20 11 20-11" /><path d="m8 24 20 11 20-11" /><path d="m8 17 20-11 20 11-20 11Z" /></svg>
    </span>
    <span className={styles.label}>{label}<span className={styles.dots} aria-hidden="true"><i /><i /><i /></span></span>
  </span>;
}
