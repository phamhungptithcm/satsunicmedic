"use client";
import Loading from "./loading";
import LearningEmpty from "./learning-empty";
import LearningReviews, { reviewDate } from "./learning-reviews";
import type { ReviewSchedule } from "@hs/contracts";
import { useEffect, useRef, useState } from "react";
import { request, csrfHeaders, ApiError } from "@hs/api-client";
type Quiz = {
  id: string;
  title: string;
  revision: number;
  questions: {
    id: string;
    prompt: string;
    options: { id: string; label: string }[];
  }[];
};
type Result = {
  nextReview?: ReviewSchedule;
  correct: number;
  total: number;
  feedback: { questionId: string; correct: boolean; explanation: string }[];
};
export default function Quizzes({initialQuiz,initialRevision}:{initialQuiz?:string;initialRevision?:number}={}) {
  const [items, setItems] = useState<
    { id: string; title: string; revision: number }[]
  >([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const recovery = useRef<HTMLDivElement>(null);
  const quizPicker = useRef<HTMLDivElement>(null);
  const focusAfterRetry = useRef(false);
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(false);
  const [key, setKey] = useState<string | null>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!loading && focusAfterRetry.current) {
      focusAfterRetry.current = false;
      (recovery.current?.querySelector<HTMLElement>('h2') ?? quizPicker.current?.querySelector('button'))?.focus();
    }
  }, [loading]);
  useEffect(() => {
    const clear = () => {
      pending.current?.abort(); setQuiz(null); setAnswers({}); setResult(null);
      setKey(null); setMessage(''); setBusy(false); setOpening(false);
    };
    window.addEventListener('hs-auth-changed', clear);
    return () => { pending.current?.abort(); window.removeEventListener('hs-auth-changed', clear); };
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    void request<{ items: typeof items }>("/api/v1/quizzes", {
      signal: abort.signal,
    })
      .then((r) => {
        setLoading(false);
        setLoadFailed(false);
        setItems(r.items);
        setMessage("");
        if(initialQuiz){const match=r.items.find(item=>item.id===initialQuiz);if(match&&(initialRevision===undefined||match.revision===initialRevision))void open(initialQuiz);else setMessage('Bản bài kiểm tra được tham chiếu không còn khả dụng. Bạn có thể chọn một bài hiện hành bên dưới.');}
      })
      .catch(() => {
        if (!abort.signal.aborted) {
          setLoading(false);
          setLoadFailed(true);
        }
      });
    return () => abort.abort();
  }, [loadAttempt,initialQuiz,initialRevision]);
  async function open(id: string) {
    pending.current?.abort();
    const controller = new AbortController(); pending.current = controller;
    setBusy(true);
    setOpening(true);
    try {
      const opened = await request<Quiz>(`/api/v1/quizzes/${id}`, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setQuiz(opened);
      setAnswers({});
      setResult(null);
      setKey(crypto.randomUUID());
      setMessage("");
    } catch {
      if (controller.signal.aborted) return;
      setMessage("Bài học không còn khả dụng. Hãy chọn bài khác.");
    } finally {
      if (!controller.signal.aborted) { setBusy(false); setOpening(false); }
    }
  }
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quiz || !key) return;
    pending.current?.abort();
    const controller = new AbortController(); pending.current = controller;
    setBusy(true);
    try {
      await request("/auth/csrf", { signal: controller.signal });
      if (controller.signal.aborted) return;
      const res = await request<Result>(`/api/v1/quizzes/${quiz.id}/attempts`, {
        method: "POST",
        signal: controller.signal,
        headers: { ...csrfHeaders(), "Idempotency-Key": key },
        body: JSON.stringify({
          revision: quiz.revision,
          answers: Object.entries(answers).map(([questionId, optionId]) => ({
            questionId,
            optionId,
          })),
        }),
      });
      if (controller.signal.aborted) return;
      setResult(res);
      setMessage("Đã lưu kết quả.");
    } catch (error) {
      if (controller.signal.aborted) return;
      setMessage(
        error instanceof ApiError && error.status === 401
          ? "Đăng nhập từ không gian khám phá để lưu kết quả. Câu trả lời vẫn được giữ ở đây."
          : error instanceof ApiError && error.status === 409
            ? "Bài học đã thay đổi hoặc lượt nộp đang xử lý. Hãy mở lại bài để kiểm tra."
            : "Chưa lưu được kết quả. Bạn có thể thử nộp lại.",
      );
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  return (
    <>
      {loading && <Loading label="Đang mở bài học" />}
      {opening && <Loading label="Đang mở bài học" />}
      <p role="status">{message}</p>
      <div ref={recovery} aria-live="polite">
        {!loading && !items.length && !quiz && <LearningEmpty failed={loadFailed} retry={() => { focusAfterRetry.current = true; setLoading(true); setLoadFailed(false); setLoadAttempt(value => value + 1); }} />}
      </div>
      <LearningReviews onOpen={(id) => void open(id)} disabled={busy} />
      <div ref={quizPicker} className="quiz-picker">
        {items.map((item) => (
          <button
            key={item.id}
            disabled={busy}
            onClick={() => void open(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>
      {quiz && (
        <form onSubmit={submit}>
          <h2>{quiz.title}</h2>
          {quiz.questions.map((q) => (
            <fieldset
              key={q.id}
              className="quiz-question"
              disabled={busy || !!result}
            >
              <legend>{q.prompt}</legend>
              {q.options.map((o) => (
                <label key={o.id}>
                  <input
                    required
                    type="radio"
                    name={q.id}
                    value={o.id}
                    checked={answers[q.id] === o.id}
                    onChange={() => {
                      setAnswers({ ...answers, [q.id]: o.id });
                      setKey(crypto.randomUUID());
                    }}
                  />
                  {o.label}
                </label>
              ))}
            </fieldset>
          ))}
          {!result && (
            <button className="primary" aria-label={busy && !opening ? "Đang nộp" : undefined} disabled={busy}>
              {busy && !opening ? <Loading inline label="Đang nộp" /> : "Nộp câu trả lời"}
            </button>
          )}
          {result && (
            <section aria-label="Kết quả bài kiểm tra">
              <h2>
                {result.correct}/{result.total} câu đúng
              </h2>
              <p>Kết quả của lượt luyện tập này không phải đánh giá năng lực lâm sàng.</p>
              {result.nextReview && <p>Lần ôn gợi ý: <time dateTime={result.nextReview.dueAt}>{reviewDate(result.nextReview.dueAt)}</time> (giờ Việt Nam). Bạn có thể tải lại lịch ôn để xem lịch mới nhất.</p>}
              {result.feedback.map((f) => (
                <p key={f.questionId}>
                  {f.correct ? "Đúng." : "Chưa đúng."} {f.explanation}
                </p>
              ))}
            </section>
          )}
        </form>
      )}
    </>
  );
}
