"use client";
import { useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, CircleCheck, Lightbulb, RotateCcw, ScanEye, Sparkles, Target } from "lucide-react";
import type { LearningScenario } from "@hs/contracts";
import { answerQuestion, confirmQuestion, quizScore, type QuizQuestion, type QuizResponse } from "../lib/learning-quiz";
import type { MedicalQuizQuestion } from "../lib/medical-english-quiz";
import styles from "./quiz-slides.module.css";

export default function QuizSlides({ questions, sources, onObserve, medical = false, observeDisabled = false }: { questions: (QuizQuestion | MedicalQuizQuestion)[]; medical?: boolean; observeDisabled?: boolean; sources: LearningScenario["sources"]; onObserve: (stageId: string) => void }) {
  const uid = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuizResponse>>({});
  const [finished, setFinished] = useState(false);
  const question = questions[index];
  if (!question) return null;
  const response = responses[question.id];
  const confirmed = response?.confirmed === true;
  const correct = response?.optionId === question.correctId;
  const answered = questions.filter(q => responses[q.id]?.confirmed).length;
  const score = quizScore(questions, responses);
  const complete = answered === questions.length;
  const firstUnanswered = questions.findIndex(q => !responses[q.id]?.confirmed);
  function focusHeading() { requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })); }
  function go(next: number) { setIndex(next); setFinished(false); focusHeading(); }
  function restart() { setResponses({}); go(0); }
  return <section className={styles.quiz} aria-labelledby={`${uid}-title`} data-quiz="slides">
    <header className={styles.header}><span className={styles.brandIcon}><BookOpen size={20} /></span><div><p>{medical ? "ÔN TẬP ANH–VIỆT" : "ÔN TẬP SINH LÝ BỆNH"}</p><h2 id={`${uid}-title`}>{medical ? "Nhớ từ trong ngữ cảnh" : "Câu hỏi lượng giá"}</h2></div><span className={styles.count}>{questions.length} câu</span></header>
    <nav className={styles.steps} aria-label="Tiến độ câu hỏi">{questions.map((q, i) => <button key={q.id} type="button" aria-label={`Câu ${i + 1}${responses[q.id]?.confirmed ? ": đã trả lời" : ""}`} aria-current={!finished && index === i ? "step" : undefined} disabled={firstUnanswered !== -1 && i > firstUnanswered} data-done={responses[q.id]?.confirmed || undefined} onClick={() => go(i)}><span>{responses[q.id]?.confirmed ? <Check size={12} /> : String(i + 1).padStart(2, "0")}</span><i /></button>)}</nav>
    {finished ? <div className={styles.slide} key="results"><div className={styles.resultHero}><span className={styles.resultIcon}><Sparkles size={26} /></span><p className={styles.eyebrow}>HOÀN THÀNH BÀI ÔN TẬP</p><h3 ref={heading} tabIndex={-1}>Kết quả ôn tập</h3><div className={styles.score}><strong>{score}</strong><span>/ {questions.length}<small>câu đúng</small></span></div><p>{score === questions.length ? "Bạn đã trả lời đúng tất cả câu hỏi trong lượt này. Có thể xem lại từng lời giải bên dưới." : "Xem lại các câu trả lời chưa đúng và phần giải thích trước khi làm lại."}</p></div><div className={styles.reviewList}>{questions.map((q, i) => <button key={q.id} type="button" onClick={() => go(i)}><span>{i + 1}</span><span>{q.kind}<small>{responses[q.id]?.optionId === q.correctId ? "Trả lời đúng" : "Chưa đúng · Xem lại"}</small></span>{responses[q.id]?.optionId === q.correctId ? <CircleCheck size={18} /> : <ArrowRight size={18} />}</button>)}</div><button className={styles.primary} type="button" onClick={restart}><RotateCcw size={16} />Làm lại bài</button><p className={styles.note}>Kết quả ôn tập cho lượt này, không phải đánh giá năng lực lâm sàng.</p></div> : <div className={styles.slide} key={question.id}>
      <div className={styles.questionMeta}><span><Target size={14} />{question.kind}</span><span>{String(index + 1).padStart(2, "0")} <i>/ {String(questions.length).padStart(2, "0")}</i></span></div>
      <h3 ref={heading} id={`${uid}-question`} tabIndex={-1}>{question.question}{"promptTerm" in question && <> <span lang={question.promptLanguage}>{question.promptTerm}</span></>}</h3>
      <form onSubmit={event => { event.preventDefault(); setResponses(current => confirmQuestion(current, question)); }}>
        <fieldset className={styles.options} disabled={confirmed} aria-labelledby={`${uid}-question`}><legend className={styles.srOnly}>Chọn một đáp án</legend>{question.options.map((option, i) => { const chosen = response?.optionId === option.id; const right = confirmed && option.id === question.correctId; return <label key={option.id} className={styles.option} data-selected={chosen || undefined} data-correct={right || undefined} data-wrong={confirmed && chosen && !right || undefined}><input type="radio" name={`${uid}-${question.id}`} value={option.id} checked={chosen} onChange={() => setResponses(current => answerQuestion(current, question.id, option.id))} /><span className={styles.letter}>{String.fromCharCode(65 + i)}</span><span className={styles.optionText}><span lang={"optionsLanguage" in question ? question.optionsLanguage : undefined}>{option.label}</span>{confirmed && (right || chosen) && <small>{right ? "Đáp án đúng" : "Bạn đã chọn"}</small>}</span>{right && <Check size={17} />}</label>; })}</fieldset>
        {confirmed && <div className={styles.feedback} role="status"><div>{correct ? <CircleCheck size={19} /> : <Lightbulb size={19} />}<strong>{correct ? "Đáp án đúng" : "Giải thích đáp án"}</strong></div><p>{question.explanation}</p><div className={styles.references}>{question.sourceIds.map(id => { const source = sources.find(s => s.id === id); return source && <a key={id} href={source.url} target="_blank" rel="noreferrer">Đọc nguồn {id === question.sourceIds[0] ? "tham khảo" : "bổ sung"}<ArrowUpRight size={12} /><span className={styles.srOnly}>: {source.title}</span></a>; })}</div>{question.stageId && <button className={styles.observe} type="button" disabled={observeDisabled} onClick={() => onObserve(question.stageId!)}><ScanEye size={15} />Đối chiếu giai đoạn mô phỏng<ArrowUpRight size={14} /></button>}</div>}
        <footer className={styles.footer}><button className={styles.back} type="button" disabled={index === 0} onClick={() => go(index - 1)}><ArrowLeft size={16} /><span>Quay lại</span></button>{!confirmed ? <button className={styles.primary} type="submit" disabled={!response?.optionId}><Check size={16} />Kiểm tra đáp án</button> : <button className={styles.primary} type="button" onClick={() => { if (index === questions.length - 1 && complete) { setFinished(true); focusHeading(); } else go(Math.min(index + 1, questions.length - 1)); }}>{index === questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}<ArrowRight size={16} /></button>}</footer>
      </form>
      {complete && <button className={styles.resultsLink} type="button" onClick={() => { setFinished(true); focusHeading(); }}>Về bảng kết quả</button>}
    </div>}
    <div className={styles.bottomNote}><span>{answered}/{questions.length} câu đã trả lời</span><span>Chỉ lưu trong lượt xem này</span></div>
  </section>;
}
