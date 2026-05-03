import { createFileRoute } from '@tanstack/react-router';
import { useMenu } from '@/hooks/use-menu-context';
import { useEffect, useMemo, useState } from 'react';
import { Clock3, Sparkles, UtensilsCrossed } from 'lucide-react';

export const Route = createFileRoute('/board')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      cycle: typeof search.cycle === 'string' ? parseInt(search.cycle, 10) : (search.cycle as number | undefined),
      columns: typeof search.columns === 'string' ? parseInt(search.columns, 10) : (search.columns as number | undefined),
      photos: search.photos === 'true' ? true : search.photos === 'false' ? false : (search.photos as boolean | undefined),
      template: typeof search.template === 'string' ? parseInt(search.template, 10) : (search.template as number | undefined),
    };
  },
  head: () => ({
    meta: [{ title: 'Menu Board — Savor' }],
  }),
  component: MenuBoardPage,
});

function useBoardState() {
  const { categories, items, brand } = useMenu();
  const search = Route.useSearch();

  const cycle = Math.min(120, Math.max(5, search.cycle ?? brand.boardCycleSeconds ?? 15));
  const columns = Math.min(4, Math.max(2, search.columns ?? brand.boardColumns ?? 3));
  const showPhotos = search.photos ?? brand.boardShowPhotos ?? true;
  const showPrice = brand.boardShowPrice ?? true;
  const showDescription = brand.boardShowDescription ?? true;
  const showPrepTime = brand.boardShowPrepTime ?? true;
  const boardBackgroundColor = brand.boardBackgroundColor || '#0a0d13';
  const template = (search.template ?? brand.boardTemplate ?? 1) as 1 | 2;

  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduceMotion(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const availableCategories = useMemo(() => {
    const byCat = new Map<string, number>();
    for (const i of items) {
      if (!i.available) continue;
      byCat.set(i.categoryId, (byCat.get(i.categoryId) ?? 0) + 1);
    }
    return categories.filter((c) => (byCat.get(c.id) ?? 0) > 0);
  }, [categories, items]);

  const totalStates = availableCategories.length;
  const currentIdx = totalStates > 0 ? idx % totalStates : 0;
  const activeCategory = totalStates > 0 ? availableCategories[currentIdx] : null;

  const activeItems = useMemo(() => {
    if (!activeCategory) return [];
    return items
      .filter((i) => i.available && i.categoryId === activeCategory.id)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeCategory, items]);

  const chunked = useMemo(() => {
    const cols = Array.from({ length: columns }, () => [] as typeof activeItems);
    activeItems.forEach((it, i) => cols[i % columns].push(it));
    return cols;
  }, [activeItems, columns]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (totalStates <= 1) return;
    const t = window.setInterval(() => setIdx((n) => (n + 1) % totalStates), cycle * 1000);
    return () => window.clearInterval(t);
  }, [totalStates, cycle]);

  const activeCategoryPosition = availableCategories.length > 0 ? currentIdx + 1 : 0;

  return {
    brand, categories, items,
    cycle, columns, showPhotos, showPrice, showDescription, showPrepTime,
    boardBackgroundColor, template,
    idx, now, reduceMotion,
    availableCategories, totalStates, currentIdx, activeCategory, activeItems, chunked,
    activeCategoryPosition,
  };
}

function MenuBoardPage() {
  const state = useBoardState();
  if (state.template === 2) return <BoardTemplate2 {...state} />;
  return <BoardTemplate1 {...state} />;
}

type BoardProps = ReturnType<typeof useBoardState>;

// ─── Template 1: Dark Cinematic ───────────────────────────────────────────────
function BoardTemplate1({
  brand, showPhotos, showPrice, showDescription, showPrepTime,
  boardBackgroundColor, reduceMotion,
  availableCategories, totalStates, activeCategory, activeItems, chunked,
  activeCategoryPosition, columns,
}: BoardProps) {
  return (
    <div className="h-screen flex flex-col text-foreground overflow-hidden" style={{ backgroundColor: boardBackgroundColor }}>
      <style>{`
        @keyframes boardSlide {
          from { opacity: 0; transform: translate3d(0, 24px, 0); filter: blur(6px); }
          to { opacity: 1; transform: translate3d(0, 0, 0); filter: blur(0); }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {brand.heroImageUrl ? (
          <>
            <img src={brand.heroImageUrl} alt="" className="h-full w-full object-cover opacity-25 blur-[2px] scale-[1.03]" decoding="async" loading="eager" />
            <div className="absolute inset-0 bg-black/70" />
          </>
        ) : (
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                `radial-gradient(1200px 600px at 10% 10%, ${brand.accentColor}33, transparent 60%),` +
                `radial-gradient(1000px 800px at 90% 20%, ${brand.accentColor}22, transparent 55%),` +
                `radial-gradient(900px 700px at 40% 95%, ${brand.accentColor}1f, transparent 55%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,7,11,.24)_36%,rgba(6,7,11,.62)_100%)]" />
      </div>

      <div className="flex-1 overflow-auto px-6 py-6 custom-scrollbar relative flex flex-col">
        {totalStates > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 z-50">
            <div
              className="h-full shadow-lg transition-all duration-1000 ease-in-out"
              style={{
                width: `${(activeCategoryPosition / totalStates) * 100}%`,
                background: `linear-gradient(90deg, ${brand.accentColor}, ${brand.accentColor}bb)`,
                boxShadow: `0 0 20px ${brand.accentColor}aa`,
              }}
            />
          </div>
        )}

        {!activeCategory ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 shadow-ambient-sm backdrop-blur-md text-center max-w-lg">
              <div className="font-display text-4xl font-black text-white">No menu items yet</div>
              <div className="mt-2 text-xl text-white/65">Add categories and items in the Admin panel to start the board.</div>
            </div>
          </div>
        ) : (
          <div
            key={activeCategory.id}
            className={reduceMotion ? '' : 'will-change-transform'}
            style={reduceMotion ? undefined : { animation: 'boardSlide 650ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}
          >
            <div className="mb-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-4xl shadow-inner backdrop-blur-sm">
                    {activeCategory.icon}
                  </div>
                  <div>
                    <div className="font-display text-5xl font-black leading-tight tracking-tight text-white uppercase italic">
                      {activeCategory.name}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-white/50 font-bold uppercase tracking-widest">
                      <span>Serving {activeItems.length} delicacies</span>
                      <span className="h-1 w-1 rounded-full bg-white/20" />
                      <span>Collection {activeCategoryPosition}/{Math.max(1, availableCategories.length)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 h-fit" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {chunked.map((col, cIdx) => (
                <div key={cIdx} className="space-y-6">
                  {col.map((it) => (
                    <div key={it.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl transition-all duration-300 hover:border-white/20">
                      {it.image && showPhotos ? (
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img src={it.image} alt={it.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.1]" decoding="async" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        </div>
                      ) : (
                        <div
                          className="aspect-[16/10] w-full"
                          style={{
                            background:
                              `linear-gradient(135deg, ${brand.accentColor}33, ${brand.accentColor}11),` +
                              'radial-gradient(circle at 20% 20%, rgba(255,255,255,.1), transparent 45%)',
                          }}
                        />
                      )}
                      <div className="p-4 relative">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-display text-2xl font-black tracking-tight text-white">{it.name}</div>
                            {showDescription && it.description && (
                              <div className="mt-1 line-clamp-2 text-xs text-white/60 leading-relaxed">{it.description}</div>
                            )}
                          </div>
                          {showPrice && (
                            <div className="shrink-0 rounded-xl bg-white text-black px-3 py-1 font-display text-xl font-black tabular-nums shadow-xl">
                              {brand.currency}{it.price.toFixed(2)}
                            </div>
                          )}
                        </div>
                        {showPrepTime && (
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
                              <Clock3 className="h-3 w-3" />
                              <span>Ready in {it.preparationTime}m</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Template 2: Light Editorial Split ────────────────────────────────────────
function BoardTemplate2({
  brand, showPhotos, showPrice, showDescription, showPrepTime,
  reduceMotion, now,
  availableCategories, totalStates, activeCategory, activeItems,
  activeCategoryPosition,
}: BoardProps) {
  const accent = brand.accentColor || '#426564';

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="h-screen flex overflow-hidden bg-[#FAFAF8] text-[#1a1a1a]">
      <style>{`
        @keyframes t2SlideIn {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes t2FadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes t2Ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .t2-item { animation: t2FadeUp 500ms cubic-bezier(0.2,0.8,0.2,1) both; }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div
        className="relative flex w-[38%] shrink-0 flex-col overflow-hidden"
        style={{ backgroundColor: accent }}
      >
        {/* Subtle texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(0,0,0,0.3) 0%, transparent 50%)`,
          }}
        />

        {/* Restaurant header */}
        <div className="relative z-10 px-8 pt-8 pb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-white/90 uppercase tracking-widest leading-none">{brand.restaurantName}</p>
            {brand.tagline && <p className="text-[10px] text-white/50 tracking-wider mt-0.5">{brand.tagline}</p>}
          </div>
        </div>

        {/* Category hero */}
        <div
          key={activeCategory?.id ?? 'empty'}
          className="relative z-10 flex-1 flex flex-col items-start justify-center px-8"
          style={reduceMotion ? undefined : { animation: 't2SlideIn 600ms cubic-bezier(0.2,0.8,0.2,1)' }}
        >
          {activeCategory ? (
            <>
              <div className="text-[88px] leading-none drop-shadow-xl mb-4 select-none">{activeCategory.icon}</div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-2">Now Serving</p>
              <h1 className="font-display text-5xl font-black text-white leading-none uppercase tracking-tight mb-3">
                {activeCategory.name}
              </h1>
              <p className="text-sm font-bold text-white/50 uppercase tracking-widest">
                {activeItems.length} {activeItems.length === 1 ? 'Item' : 'Items'}
              </p>
            </>
          ) : (
            <div className="text-center">
              <Sparkles className="h-16 w-16 text-white/30 mb-4" />
              <p className="text-2xl font-black text-white/60">No items yet</p>
            </div>
          )}
        </div>

        {/* Category progress dots */}
        {availableCategories.length > 1 && (
          <div className="relative z-10 px-8 pb-4 flex items-center gap-1.5">
            {availableCategories.map((cat, i) => (
              <div
                key={cat.id}
                className="rounded-full transition-all duration-500"
                style={{
                  width: i === activeCategoryPosition - 1 ? 20 : 6,
                  height: 6,
                  backgroundColor: i === activeCategoryPosition - 1 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
            <span className="ml-auto text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {activeCategoryPosition}/{totalStates}
            </span>
          </div>
        )}

        {/* Clock */}
        <div className="relative z-10 px-8 pb-8">
          <div className="rounded-2xl bg-black/20 backdrop-blur-sm px-4 py-3">
            <p className="font-display text-3xl font-black text-white tabular-nums">{timeStr}</p>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mt-0.5">{dateStr}</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Right header bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#e8e4dc] bg-white/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#888]">Menu</span>
            <span className="text-[#ccc] mx-1">/</span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>
              {activeCategory?.name ?? '—'}
            </span>
          </div>
          {activeItems.length > 0 && (
            <span className="text-[10px] font-bold text-[#999] uppercase tracking-wider">
              {activeItems.length} {activeItems.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {!activeCategory || activeItems.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-20">🍽️</div>
                <p className="text-lg font-bold text-[#aaa]">No items to display</p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {activeItems.map((it, index) => (
                <div
                  key={it.id}
                  className="t2-item group flex items-center gap-5 py-5 border-b border-[#eeece8] last:border-0"
                  style={reduceMotion ? undefined : { animationDelay: `${index * 60}ms` }}
                >
                  {/* Image or placeholder */}
                  {showPhotos ? (
                    it.image ? (
                      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl shadow-md">
                        <img src={it.image} alt={it.name} className="h-full w-full object-cover" decoding="async" loading="lazy" />
                      </div>
                    ) : (
                      <div
                        className="h-[72px] w-[72px] shrink-0 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${accent}15` }}
                      >
                        {activeCategory?.icon ?? '🍽️'}
                      </div>
                    )
                  ) : null}

                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display text-[22px] font-black text-[#1a1a1a] leading-tight truncate">
                        {it.name}
                      </h3>
                      {showPrepTime && it.preparationTime > 0 && (
                        <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-[#bbb] uppercase tracking-wider">
                          <Clock3 className="h-3 w-3" />
                          {it.preparationTime}m
                        </span>
                      )}
                    </div>
                    {showDescription && it.description && (
                      <p className="mt-1 text-sm text-[#888] leading-snug line-clamp-2">{it.description}</p>
                    )}
                  </div>

                  {/* Price */}
                  {showPrice && (
                    <div
                      className="shrink-0 rounded-2xl px-4 py-2 font-display text-xl font-black tabular-nums"
                      style={{ color: accent, backgroundColor: `${accent}12` }}
                    >
                      {brand.currency}{it.price.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom ticker — all category names scrolling */}
        {availableCategories.length > 1 && (
          <div
            className="shrink-0 border-t border-[#e8e4dc] overflow-hidden py-2.5 bg-white/60 backdrop-blur-sm"
            style={{ borderTopColor: `${accent}22` }}
          >
            <div
              className="flex gap-8 whitespace-nowrap"
              style={{ animation: `t2Ticker ${availableCategories.length * 5}s linear infinite` }}
            >
              {[...availableCategories, ...availableCategories].map((cat, i) => (
                <span
                  key={`${cat.id}-${i}`}
                  className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em]"
                  style={{ color: cat.id === availableCategories[activeCategoryPosition - 1]?.id ? accent : '#bbb' }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
