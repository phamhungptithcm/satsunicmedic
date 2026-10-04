"use client";
import { suppressOneTap } from "../lib/google-one-tap";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "./progress-link";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { assetManifestSchema, isAssetCurrent } from "@hs/contracts";
import { useViewer } from "@hs/anatomy-viewer";
import { request, csrfHeaders, ApiError } from "@hs/api-client";
import {
  Search,
  Layers3,
  Box,
  BookOpen,
  Presentation,
  Info,
  ChevronRight,
  RotateCcw,
  Undo2,
  Redo2,
  Scan,
  Tag,
  Eye,
  EyeOff,
  Play,
  Pause,
  ArrowUpRight,
  SlidersHorizontal,
  Plus,
  Minus,
  Move3D,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import StructureInfo from "./structure-info";
import Loading from "./loading";
import { useSiteShell } from "./site-shell";
import Login from "./login";
import { canPreviewReferenceAnatomy } from "../lib/reference-anatomy";
const AnatomyCanvas = dynamic(() => import("@hs/anatomy-viewer/canvas"), {
  ssr: false,
  loading: () => (
    <Loading overlay label="Đang mở không gian 3D" />
  ),
});
const systemLabels = [
  "Da",
  "Cơ và gân",
  "Xương và khớp",
  "Tim mạch",
  "Thần kinh",
  "Hô hấp",
  "Tiêu hóa",
  "Tiết niệu",
  "Nội tiết",
  "Bạch huyết",
  "Sinh sản",
];
export default function Explorer() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 0,
            gcTime: 0,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <ExplorerWorkspace />
    </QueryClientProvider>
  );
}
function ExplorerWorkspace() {
  const store = useViewer();
  const { scene, manifest, mode } = store;
  const [panel, setPanel] = useState<"layers" | "info" | "activity">("info");
  const [login, setLogin] = useState(false);
  const [query, setQuery] = useState("");
  const [assetError, setAssetError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const canvas = useRef<HTMLDivElement>(null);
  const asset = useQuery({
    queryKey: ["current-asset"],
    queryFn: async ({ signal }) => {
      const result = await request<{ asset: unknown }>(
        "/api/v1/assets/current",
        { signal },
      );
      if (!result.asset) return null;
      const m = assetManifestSchema.parse(result.asset);
      return isAssetCurrent(m) ? m : null;
    },
    refetchInterval: 60000,
  });
  const me = useQuery({
    queryKey: ["me"],
    queryFn: ({ signal }) => request<{ id: string }>("/api/v1/me", { signal }),
    retry: false,
  });
  const refreshSession = me.refetch;
  useEffect(() => { const refresh = () => { void refreshSession(); }; window.addEventListener("hs-auth-changed", refresh); return () => window.removeEventListener("hs-auth-changed", refresh); }, [refreshSession]);
  const openLogin = useCallback(() => setLogin(true), []);
  useSiteShell({ authenticated: !!me.data, onLogin: openLogin });
  const onCanvasError = useCallback(() => setAssetError(true), []);
  useEffect(() => {
    store.setManifest(asset.data ?? null);
    setUrl(null);
    setAssetError(false);
    if (!asset.data) return;
    const controller = new AbortController();
    void request<{ url: string }>(
      `/api/v1/assets/versions/${asset.data.id}/access`,
      { method: "POST", body: "{}", signal: controller.signal },
    )
      .then((r) => setUrl(r.url))
      .catch(() => {
        if (!controller.signal.aborted) setAssetError(true);
      });
    return () => controller.abort();
  }, [asset.data, asset.error, store.setManifest, loadAttempt]);
  useEffect(() => {
    if (!manifest) return;
    const expiry = Math.min(
      Date.parse(manifest.review.reviewDueAt),
      manifest.license.expiresAt
        ? Date.parse(manifest.license.expiresAt)
        : Infinity,
    );
    const timer = setTimeout(
      () => {
        store.setManifest(null);
        setUrl(null);
      },
      Math.min(Math.max(0, expiry - Date.now()), 2147483647),
    );
    return () => clearTimeout(timer);
  }, [manifest, store.setManifest]);
  const selected = manifest?.structures.find(
    (s) => s.anatomyId === scene?.selectedAnatomyId,
  );
  const filtered =
    manifest?.structures.filter((s) =>
      s.label.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")),
    ) ?? [];
  const clip = manifest?.clips.find((c) => c.id === scene?.animation.clipId);
  const active = !!scene && !!url && !assetError && !asset.isError;
  function view(side: "front" | "back" | "left" | "right") {
    if (!scene || !manifest) return;
    const t = scene.camera.target;
    const d = Math.hypot(
      ...manifest.camera.position.map((v, i) => v - manifest.camera.target[i]!),
    );
    const p: [number, number, number] =
      side === "front"
        ? [t[0], t[1], t[2] + d]
        : side === "back"
          ? [t[0], t[1], t[2] - d]
          : side === "left"
            ? [t[0] + d, t[1], t[2]]
            : [t[0] - d, t[1], t[2]];
    store.change({ camera: { ...scene.camera, position: p } });
  }
  function zoom(factor: number) {
    if (!scene) return;
    store.change({
      camera: {
        ...scene.camera,
        position: scene.camera.position.map(
          (v, i) =>
            scene.camera.target[i]! + (v - scene.camera.target[i]!) * factor,
        ) as [number, number, number],
      },
    });
  }
  async function logout() {
    try {
      await request("/auth/csrf");
      await request("/auth/session", {
        method: "DELETE",
        headers: csrfHeaders(),
      });
      suppressOneTap();
      window.dispatchEvent(new Event("hs-auth-changed"));
      await me.refetch();
      setStatus("Đã đăng xuất.");
    } catch {
      setStatus("Chưa đăng xuất được. Hãy thử lại.");
    }
  }
  return (
    <>
      <main id="main" className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">GIẢI PHẪU TƯƠNG TÁC</p>
            <h1>Cơ thể người, từng lớp một.</h1>
          </div>
          <div className="workspace-links">
            {canPreviewReferenceAnatomy(process.env.NODE_ENV) && (
              <Link className="quiet-link" href="/kham-pha/mo-hinh-tham-khao">
                Mô hình tham khảo
              </Link>
            )}
            <Link href="/gioi-thieu" className="quiet-link">
              Cách sử dụng <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div className="workspace-bar">
          <div className="mode-tabs" role="group" aria-label="Chế độ sử dụng">
            {(
              [
                { id: "explore", label: "Khám phá", Icon: Box },
                { id: "learn", label: "Học tập", Icon: BookOpen },
                { id: "teach", label: "Giảng dạy", Icon: Presentation },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                aria-pressed={mode === id}
                className={mode === id ? "active" : ""}
                onClick={() => store.setMode(id)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
          <div className="workspace-account">
            {me.data ? (
              <>
                <span>Không gian cá nhân</span>
                <button onClick={logout}>Đăng xuất</button>
              </>
            ) : (
              <span>
                <ShieldCheck size={14} />
                Khám phá không cần đăng nhập
              </span>
            )}
          </div>
        </div>
        <div className="studio">
          <aside
            className={`structure-panel ${panel === "layers" ? "mobile-open" : ""}`}
            aria-label="Cấu trúc cơ thể"
          >
            <div className="panel-heading">
              <h2>Cấu trúc cơ thể</h2>
              <Layers3 size={17} />
            </div>
            <label className="search-field">
              <Search size={16} />
              <input
                aria-label="Tìm cấu trúc trong mô hình"
                placeholder="Tìm cấu trúc…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              
            </label>
            <div className="section-caption">
              {query ? "KẾT QUẢ TÌM KIẾM" : "CÁC HỆ CƠ QUAN"}
            </div>
            {manifest && scene ? (
              <div className="structure-list">
                {query
                  ? filtered.map((s) => (
                      <button
                        className="structure-option"
                        key={s.meshName}
                        onClick={() => {
                          store.change({ selectedAnatomyId: s.anatomyId });
                          setPanel("info");
                        }}
                      >
                        {s.label}
                        <ChevronRight size={14} />
                      </button>
                    ))
                  : manifest.layers.map((layer) => {
                      const state = scene.layers.find(
                        (l) => l.id === layer.id,
                      )!;
                      return (
                        <div key={layer.id} className="layer-row">
                          <div>
                            <button
                              className="layer-toggle"
                              aria-label={`${state.visible ? "Ẩn" : "Hiện"} ${layer.label}`}
                              onClick={() =>
                                store.change({
                                  layers: scene.layers.map((l) =>
                                    l.id === layer.id
                                      ? { ...l, visible: !l.visible }
                                      : l,
                                  ),
                                })
                              }
                            >
                              {state.visible ? (
                                <Eye size={16} />
                              ) : (
                                <EyeOff size={16} />
                              )}
                            </button>
                            <strong>{layer.label}</strong>
                          </div>
                          <label className="opacity-label">
                            Độ đục
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={state.opacity}
                              aria-label={`Độ đục ${layer.label}`}
                              onChange={(e) =>
                                store.change({
                                  layers: scene.layers.map((l) =>
                                    l.id === layer.id
                                      ? {
                                          ...l,
                                          opacity: Number(e.target.value),
                                        }
                                      : l,
                                  ),
                                })
                              }
                            />
                          </label>
                          {manifest.structures
                            .filter((s) => s.layerId === layer.id)
                            .map((s) => (
                              <button
                                className="structure-option"
                                aria-pressed={
                                  selected?.anatomyId === s.anatomyId
                                }
                                key={s.meshName}
                                onClick={() => {
                                  store.change({
                                    selectedAnatomyId: s.anatomyId,
                                  });
                                  setPanel("info");
                                }}
                              >
                                {s.label}
                                <ChevronRight size={12} />
                              </button>
                            ))}
                        </div>
                      );
                    })}
                {query && !filtered.length && (
                  <p className="inline-empty">
                    Không tìm thấy cấu trúc phù hợp.
                  </p>
                )}
              </div>
            ) : (
              <div className="structure-list">
                {systemLabels
                  .filter((label) =>
                    label
                      .toLocaleLowerCase("vi")
                      .includes(query.toLocaleLowerCase("vi")),
                  )
                  .map((label, index) => (
                    <div className="unavailable-layer" key={label}>
                      <span className="layer-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{label}</span>
                      <span className="small-dash" aria-label="Chưa có mô hình">
                        —
                      </span>
                    </div>
                  ))}
                <p className="inline-empty">
                  Các lớp sẽ mở khi mô hình sẵn sàng.
                </p>
              </div>
            )}
            <div className="panel-foot">
              <Info size={14} />
              <span>Trái và phải theo cơ thể người.</span>
            </div>
          </aside>
          <section className="model-panel" aria-label="Không gian mô hình">
            <div className="canvas-top">
              <span>
                <span className={`status-dot ${active ? "ready" : ""}`} />
                {active ? "Mô hình 3D" : "Không gian 3D"}
              </span>
              <span className="canvas-tag">
                {active ? "3D" : "CHƯA CÓ MÔ HÌNH"}
              </span>
            </div>
            <div ref={canvas} className="model-canvas">
              {active && manifest && url ? (
                <AnatomyCanvas
                  manifest={manifest}
                  url={url}
                  loadingFallback={<Loading overlay label="Đang mở mô hình" />}
                  renderSelection={id => { const structure = manifest.structures.find(item => item.anatomyId === id); return structure ? <StructureInfo item={{ id, label: structure.label, description: "Cấu trúc được xác định theo dữ liệu của mô hình hiện tại.", scope: "Chưa có bài viết chi tiết được xuất bản cho cấu trúc này." }} /> : null; }}
                  onError={onCanvasError}
                />
              ) : asset.isPending ? <Loading overlay label="Đang kết nối thư viện mô hình" /> : (
                <div className="asset-empty">
                  <div className="empty-orbit">
                    <Box size={42} strokeWidth={1} />
                  </div>
                  <span className="canvas-eyebrow">HUMANSCOPE / ANATOMY</span>
                  <h2>
                    {asset.isPending
                      ? "Đang kiểm tra mô hình…"
                      : asset.isError
                        ? "Chưa kết nối được thư viện"
                        : assetError
                          ? "Chưa tải được mô hình"
                          : "Mô hình chưa sẵn sàng"}
                  </h2>
                  <p>
                    {asset.isError
                      ? "Hãy thử kết nối lại. Bạn vẫn có thể tìm hiểu cách sử dụng HumanScope."
                      : assetError
                        ? "Hãy thử tải lại mô hình. Cấu trúc và hoạt động chỉ mở khi tài nguyên tải thành công."
                        : "Thư viện hiện chưa có mô hình giải phẫu để hiển thị."}
                  </p>
                  {(asset.isError || assetError) && (
                    <button
                      className="canvas-retry"
                      onClick={() => {
                        setAssetError(false);
                        setLoadAttempt((n) => n + 1);
                        void asset.refetch();
                      }}
                    >
                      <RefreshCw size={14} />
                      Thử lại
                    </button>
                  )}
                  <Link href="/gioi-thieu">
                    Tìm hiểu về mô hình <ArrowUpRight size={14} />
                  </Link>
                </div>
              )}
            </div>
            <div className="canvas-tools">
              <div className="view-controls" aria-label="Góc nhìn">
                {(["front", "back", "left", "right"] as const).map((s, i) => (
                  <button key={s} disabled={!active} onClick={() => view(s)}>
                    {["Trước", "Sau", "Trái", "Phải"][i]}
                  </button>
                ))}
              </div>
              <div className="tool-buttons">
                <button
                  disabled={!active}
                  aria-label="Thu nhỏ"
                  title="Thu nhỏ"
                  onClick={() => zoom(1.2)}
                >
                  <Minus size={17} />
                </button>
                <button
                  disabled={!active}
                  aria-label="Phóng to"
                  title="Phóng to"
                  onClick={() => zoom(0.8)}
                >
                  <Plus size={17} />
                </button>
                <button
                  disabled={!active}
                  aria-label="Khôi phục góc nhìn và các lớp"
                  title="Khôi phục góc nhìn và các lớp"
                  onClick={store.reset}
                >
                  <RotateCcw size={17} />
                </button>
                <button
                  disabled={!active || !store.past.length}
                  aria-label="Hoàn tác"
                  title="Hoàn tác"
                  onClick={store.undo}
                >
                  <Undo2 size={17} />
                </button>
                <button
                  disabled={!active || !store.future.length}
                  aria-label="Làm lại"
                  title="Làm lại"
                  onClick={store.redo}
                >
                  <Redo2 size={17} />
                </button>
              </div>
            </div>
            <div className="canvas-help">
              <Move3D size={13} />
              {active ? "Kéo để xoay · Cuộn để phóng to · Chọn cấu trúc để xem" : "Các công cụ sẽ mở khi mô hình tải thành công."}
            </div>
          </section>
          <aside
            className={`inspector ${panel !== "layers" ? "mobile-open" : ""}`}
            aria-label="Thông tin và hoạt động"
          >
            <div className="inspector-tabs">
              <button
                aria-pressed={panel !== "activity"}
                onClick={() => setPanel("info")}
              >
                Thông tin
              </button>
              <button
                aria-pressed={panel === "activity"}
                onClick={() => setPanel("activity")}
              >
                Hoạt động 4D
              </button>
            </div>
            {panel === "activity" ? (
              <div className="inspector-content">
                <p className="eyebrow">3D + THỜI GIAN</p>
                <h2>Quan sát hoạt động</h2>
                <p className="muted">
                  Xem cấu trúc thay đổi theo thời gian.
                </p>
                {active && scene && manifest?.clips.length ? (
                  <>
                    <label className="field-label">
                      Hoạt động
                      <select
                        value={scene.animation.clipId ?? ""}
                        onChange={(e) =>
                          store.change({
                            animation: {
                              ...scene.animation,
                              clipId: e.target.value || null,
                              timeSeconds: 0,
                              paused: true,
                            },
                          })
                        }
                      >
                        <option value="">Chọn hoạt động</option>
                        {manifest.clips.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    {clip && (
                      <>
                        <label className="field-label">
                          Thời gian: {scene.animation.timeSeconds.toFixed(1)} /{" "}
                          {clip.duration.toFixed(1)} giây
                          <input
                            type="range"
                            min={0}
                            max={clip.duration}
                            step={0.01}
                            value={scene.animation.timeSeconds}
                            onChange={(e) =>
                              store.change({
                                animation: {
                                  ...scene.animation,
                                  timeSeconds: Number(e.target.value),
                                  paused: true,
                                },
                              })
                            }
                          />
                        </label>
                        <button
                          className="primary full"
                          onClick={() =>
                            store.change({
                              animation: {
                                ...scene.animation,
                                paused: !scene.animation.paused,
                              },
                            })
                          }
                        >
                          {scene.animation.paused ? (
                            <Play size={15} />
                          ) : (
                            <Pause size={15} />
                          )}{" "}
                          {scene.animation.paused
                            ? "Phát hoạt động"
                            : "Tạm dừng"}
                        </button>
                        <label className="field-label">
                          Tốc độ
                          <select
                            value={scene.animation.playbackRate}
                            onChange={(e) =>
                              store.change({
                                animation: {
                                  ...scene.animation,
                                  playbackRate: Number(e.target.value),
                                },
                              })
                            }
                          >
                            {[0.25, 0.5, 1, 1.5, 2].map((v) => (
                              <option key={v} value={v}>
                                {v}×
                              </option>
                            ))}
                          </select>
                        </label>
                      </>
                    )}
                  </>
                ) : (
                  <div className="empty-info">
                    <Play size={24} />
                    <h3>Chưa có hoạt động</h3>
                    <p>
                      Hoạt động sẽ xuất hiện khi có clip phù hợp với mô hình.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="inspector-content">
                <p className="eyebrow">
                  {selected ? "CẤU TRÚC ĐÃ CHỌN" : "BẮT ĐẦU KHÁM PHÁ"}
                </p>
                <h2>{selected?.label ?? "Hiểu từng phần cơ thể"}</h2>
                <p className="muted">
                  {selected
                    ? "Chọn lớp, tách riêng cấu trúc hoặc chuyển sang hoạt động để quan sát."
                    : active ? "Chọn một cấu trúc trên mô hình hoặc trong danh sách để xem thông tin." : "Bạn có thể mở thư viện kiến thức hoặc tìm hiểu cách sử dụng trong lúc mô hình chưa sẵn sàng."}
                </p>
                <div className="selection-actions">
                  <button
                    disabled={!selected || !active}
                    onClick={() =>
                      store.change({
                        isolation: scene?.isolation.length
                          ? []
                          : [selected!.anatomyId],
                      })
                    }
                  >
                    <Scan size={15} />
                    {scene?.isolation.length ? "Hiện toàn bộ" : "Tách riêng"}
                  </button>
                  <button
                    disabled={!active}
                    aria-pressed={scene?.labels ?? false}
                    onClick={() => store.change({ labels: !scene?.labels })}
                  >
                    <Tag size={15} />
                    Nhãn
                  </button>
                </div>
                <div className="info-rule" />
                <h3>Nội dung giải phẫu</h3>
                <div className="empty-info compact">
                  <BookOpen size={23} />
                  <p>Chưa có nội dung được xuất bản.</p>
                </div>
                <Link href="/thu-vien" className="panel-link">
                  Mở thư viện kiến thức
                  <ArrowUpRight size={14} />
                </Link>
                {mode !== "explore" && (
                  <PersonalPanel
                    mode={mode}
                    userId={me.data?.id}
                    onLogin={() => setLogin(true)}
                  />
                )}

              </div>
            )}
          </aside>
        </div>
        <div
          className="mobile-navigation"
          role="group"
          aria-label="Bảng công cụ"
        >
          {(
            [
              { id: "layers", label: "Cấu trúc", Icon: SlidersHorizontal },
              { id: "info", label: "Thông tin", Icon: Info },
              { id: "activity", label: "Hoạt động", Icon: Play },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              aria-pressed={panel === id}
              onClick={() => setPanel(id)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
        <div className="studio-footer">
          <span>
            <ShieldCheck size={14} />
            Nguồn tham khảo đi cùng nội dung.
          </span>
          <Link href="/gioi-thieu#quyen-rieng-tu">Quyền riêng tư</Link>
        </div>
        <div aria-live="polite" className="status-message">
          {status}
        </div>
      </main>
      {login && (
        <Login
          onClose={() => setLogin(false)}
          onSuccess={() => {
            void me.refetch();
            window.dispatchEvent(new Event("hs-auth-changed"));
          }}
        />
      )}
    </>
  );
}
function PersonalPanel({
  mode,
  userId,
  onLogin,
}: {
  mode: string;
  userId: string | undefined;
  onLogin: () => void;
}) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = useViewer((s) => s.scene?.selectedAnatomyId);
  const notes = useInfiniteQuery({
    queryKey: ["personal", mode, userId],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      request<{ items: { id: string; text?: string; title?: string }[]; nextCursor: string | null }>(
        (mode === "teach" ? "/api/v1/lessons" : "/api/v1/notes") + (pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : ''), { signal },
      ),
    getNextPageParam: page => page.nextCursor ?? undefined,
    enabled: !!userId,
  });
  async function save(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await request("/auth/csrf");
      await request(mode === "teach" ? "/api/v1/lessons" : "/api/v1/notes", {
        method: "POST",
        headers: csrfHeaders(),
        body: JSON.stringify(
          mode === "teach"
            ? { title: text, description: "" }
            : { text, anatomyId: selected ?? null },
        ),
      });
      setText("");
      setMessage(
        mode === "teach" ? "Đã tạo bài riêng tư." : "Đã lưu ghi chú riêng.",
      );
      await notes.refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError && error.status === 401
          ? "Phiên đã hết hạn. Đăng nhập để lưu."
          : "Chưa lưu được. Nội dung vẫn ở đây để bạn thử lại.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="personal-panel">
      <h3>{mode === "teach" ? "Bài giảng của bạn" : "Ghi chú riêng"}</h3>
      {mode === "learn" && (
        <Link className="panel-link" href="/hoc-tap">
          Mở bài tự kiểm tra <ArrowUpRight size={14} />
        </Link>
      )}
      {!userId ? (
        <>
          <p>
            Đăng nhập để{" "}
            {mode === "teach" ? "soạn và lưu bài giảng" : "lưu ghi chú khi học"}
            .
          </p>
          <button className="primary full" onClick={onLogin}>
            Đăng nhập để lưu
          </button>
        </>
      ) : (
        <>
          <form onSubmit={save}>
            <label className="field-label">
              {mode === "teach" ? "Tên bài giảng" : "Nội dung ghi chú"}
              <textarea
                required
                maxLength={mode === "teach" ? 160 : 5000}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </label>
            <button className="primary" disabled={busy}>
              {busy
                ? <Loading inline label="Đang lưu" />
                : mode === "teach"
                  ? "Tạo bài riêng tư"
                  : "Lưu ghi chú"}
            </button>
          </form>
          <p role="status">{message}</p>
          {notes.isPending ? <Loading label="Đang mở nội dung đã lưu" /> : notes.isError && !notes.data ? (
            <p>
              Chưa tải được danh sách.{" "}
              <button onClick={() => void notes.refetch()}>Thử lại</button>
            </p>
          ) : (
            [...new Map(notes.data?.pages.flatMap(page => page.items).map(item => [item.id, item])).values()].map((n) => (
              <p className="saved-item" key={n.id}>
                {n.title ?? n.text}
              </p>
            ))
          )}
          {notes.hasNextPage && <button disabled={notes.isFetchingNextPage} onClick={() => void notes.fetchNextPage()}>{notes.isFetchingNextPage ? 'Đang tải thêm…' : 'Tải thêm nội dung đã lưu'}</button>}
          {notes.isFetchNextPageError && <p role="status">Chưa tải được phần tiếp theo. Bạn có thể thử lại hoặc tải lại danh sách.</p>}
          {notes.data && <button disabled={notes.isFetching} onClick={() => void notes.refetch()}>Tải lại danh sách</button>}
        </>
      )}
    </section>
  );
}
