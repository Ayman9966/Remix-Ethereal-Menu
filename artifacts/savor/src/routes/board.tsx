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

// ─── Template 2: Grand Menu Spotlight ────────────────────────────────────────
const ITEM_CYCLE_SECS = 4;

function BoardTemplate2({
  brand, showPhotos, showPrice, showDescription, showPrepTime,
  reduceMotion, now,
  availableCategories, totalStates, activeCategory, activeItems,
  activeCategoryPosition,
}: BoardProps) {
  const accent = brand.accentColor || '#426564';
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  // Item-level cycling within the current category
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [itemProgress, setItemProgress] = useState(0); // 0-100 for the progress bar

  // Reset when category changes
  useEffect(() => {
    setFeaturedIdx(0);
    setItemProgress(0);
  }, [activeCategory?.id]);

  // Cycle through items
  useEffect(() => {
    if (activeItems.length <= 1) return;
    const t = window.setInterval(() => {
      setFeaturedIdx(n => (n + 1) % activeItems.length);
      setItemProgress(0);
    }, ITEM_CYCLE_SECS * 1000);
    return () => window.clearInterval(t);
  }, [activeItems.length, activeCategory?.id]);

  // Smooth progress bar for item cycle
  useEffect(() => {
    setItemProgress(0);
    if (activeItems.length <= 1) return;
    const TICK = 50; // ms
    const step = (TICK / (ITEM_CYCLE_SECS * 1000)) * 100;
    const t = window.setInterval(() => setItemProgress(p => Math.min(100, p + step)), TICK);
    return () => window.clearInterval(t);
  }, [featuredIdx, activeItems.length]);

  const featuredItem = activeItems[featuredIdx] ?? activeItems[0] ?? null;

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#0C0A08' }}>
      <style>{`
        @keyframes t2HeroIn {
          from { opacity: 0; transform: scale(1.06); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes t2PanelIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes t2RowIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes t2Shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes t2Ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .t2-row { animation: t2RowIn 480ms cubic-bezier(0.2,0.8,0.2,1) both; }
      `}</style>

      {/* ── LEFT: Hero Featured Item ── */}
      <div
        key={`hero-${activeCategory?.id}-${featuredIdx}`}
        className="relative w-[52%] shrink-0 overflow-hidden"
        style={reduceMotion ? undefined : { animation: 't2HeroIn 700ms cubic-bezier(0.2,0.8,0.2,1)' }}
      >
        {/* Background — item image or gradient */}
        {featuredItem?.image && showPhotos ? (
          <img
            src={featuredItem.image}
            alt={featuredItem.name}
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
            loading="eager"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 30% 40%, ${accent}55, transparent 65%),
                radial-gradient(ellipse 60% 80% at 75% 70%, ${accent}33, transparent 60%),
                #0C0A08
              `,
            }}
          />
        )}

        {/* Gradient overlays for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />

        {/* Top bar — restaurant + category breadcrumb */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 pt-8 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 flex items-center justify-center rounded-xl shrink-0"
              style={{ backgroundColor: `${accent}33`, border: `1px solid ${accent}55` }}
            >
              <UtensilsCrossed className="h-4 w-4" style={{ color: accent }} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/90">{brand.restaurantName}</p>
              {brand.tagline && <p className="text-[9px] text-white/40 tracking-wider">{brand.tagline}</p>}
            </div>
          </div>
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
            style={{ backgroundColor: `${accent}`, color: '#fff' }}
          >
            <span>{activeCategory?.icon}</span>
            <span>{activeCategory?.name ?? 'Menu'}</span>
          </div>
        </div>

        {/* Bottom — featured item info */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          {featuredItem ? (
            <>
              {/* Item position label + progress bar */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: accent }}>
                    {activeItems.length > 1 ? `${featuredIdx + 1} of ${activeItems.length}` : 'Featured'}
                  </span>
                </div>
                {/* Item cycle progress bar */}
                {activeItems.length > 1 && (
                  <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="h-full rounded-full transition-none"
                      style={{ width: `${itemProgress}%`, backgroundColor: accent }}
                    />
                  </div>
                )}
                {/* Item dots */}
                {activeItems.length > 1 && activeItems.length <= 12 && (
                  <div className="flex gap-1.5 mt-2">
                    {activeItems.map((_, i) => (
                      <div
                        key={i}
                        className="rounded-full transition-all duration-400"
                        style={{
                          width: i === featuredIdx ? 16 : 5,
                          height: 5,
                          backgroundColor: i === featuredIdx ? accent : 'rgba(255,255,255,0.2)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <h2 className="font-display text-[52px] font-black leading-none text-white mb-3 drop-shadow-2xl">
                {featuredItem.name}
              </h2>

              {showDescription && featuredItem.description && (
                <p className="text-sm text-white/60 leading-relaxed mb-4 max-w-sm line-clamp-2">
                  {featuredItem.description}
                </p>
              )}

              <div className="flex items-center gap-4">
                {showPrice && (
                  <div
                    className="rounded-2xl px-5 py-2.5 font-display text-2xl font-black tabular-nums"
                    style={{ backgroundColor: accent, color: '#fff' }}
                  >
                    {brand.currency}{featuredItem.price.toFixed(2)}
                  </div>
                )}
                {showPrepTime && featuredItem.preparationTime > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/50 uppercase tracking-wider">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>Ready in {featuredItem.preparationTime} min</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center pb-8">
              <Sparkles className="h-12 w-12 mx-auto mb-3" style={{ color: accent }} />
              <p className="font-display text-3xl font-black text-white/40">No items yet</p>
            </div>
          )}
        </div>

        {/* Category progress strip at left edge */}
        {availableCategories.length > 1 && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pl-3">
            {availableCategories.map((cat, i) => (
              <div
                key={cat.id}
                className="rounded-full transition-all duration-500"
                style={{
                  width: 4,
                  height: i === activeCategoryPosition - 1 ? 28 : 8,
                  backgroundColor: i === activeCategoryPosition - 1 ? accent : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT: Menu List Panel ── */}
      <div
        className="flex flex-col flex-1 min-w-0 border-l"
        style={{ borderColor: 'rgba(255,255,255,0.06)', animation: reduceMotion ? undefined : 't2PanelIn 600ms 200ms cubic-bezier(0.2,0.8,0.2,1) both' }}
      >
        {/* Panel header */}
        <div className="shrink-0 px-8 pt-8 pb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: accent }}>
            {activeCategory?.name ?? 'Menu'}
          </p>
          <p className="font-display text-2xl font-black text-white leading-tight">
            {activeItems.length > 1 ? `${activeItems.length} Selections` : activeItems.length === 1 ? '1 Selection' : 'No items'}
          </p>
        </div>

        {/* All items list — active one highlighted */}
        <div className="flex-1 overflow-y-auto px-6 py-4" key={activeCategory?.id}>
          {activeItems.length === 0 && (
            <div className="flex h-full items-center justify-center flex-col gap-3">
              <div className="text-5xl opacity-20">{activeCategory?.icon ?? '🍽️'}</div>
              <p className="text-white/20 text-sm font-bold uppercase tracking-widest">Nothing here yet</p>
            </div>
          )}

          <div className="space-y-1">
            {activeItems.map((it, index) => {
              const isActive = index === featuredIdx;
              return (
                <div
                  key={it.id}
                  className="t2-row flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-500"
                  style={{
                    animationDelay: `${index * 60}ms`,
                    backgroundColor: isActive ? `${accent}22` : 'transparent',
                    border: isActive ? `1px solid ${accent}44` : '1px solid transparent',
                  }}
                >
                  {/* Sequence number */}
                  <span
                    className="shrink-0 font-display text-xs font-black tabular-nums w-6 text-right transition-colors duration-500"
                    style={{ color: isActive ? accent : `${accent}55` }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Thumbnail */}
                  {showPhotos && (
                    it.image ? (
                      <div
                        className="h-12 w-12 shrink-0 overflow-hidden rounded-xl transition-all duration-500"
                        style={{ opacity: isActive ? 1 : 0.45, transform: isActive ? 'scale(1.05)' : 'scale(1)' }}
                      >
                        <img src={it.image} alt={it.name} className="h-full w-full object-cover" decoding="async" loading="lazy" />
                      </div>
                    ) : (
                      <div
                        className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-xl transition-all duration-500"
                        style={{
                          backgroundColor: isActive ? `${accent}35` : `${accent}12`,
                          opacity: isActive ? 1 : 0.5,
                        }}
                      >
                        {activeCategory?.icon ?? '🍽️'}
                      </div>
                    )
                  )}

                  {/* Name + description */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-display text-[17px] font-black leading-tight truncate transition-colors duration-500"
                      style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.45)' }}
                    >
                      {it.name}
                    </p>
                    {showDescription && it.description && (
                      <p
                        className="text-[11px] leading-snug line-clamp-1 mt-0.5 transition-colors duration-500"
                        style={{ color: isActive ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)' }}
                      >
                        {it.description}
                      </p>
                    )}
                  </div>

                  {/* Right: price + prep */}
                  <div className="shrink-0 text-right">
                    {showPrice && (
                      <p
                        className="font-display text-lg font-black tabular-nums transition-colors duration-500"
                        style={{ color: isActive ? accent : `${accent}55` }}
                      >
                        {brand.currency}{it.price.toFixed(2)}
                      </p>
                    )}
                    {showPrepTime && it.preparationTime > 0 && (
                      <p className="flex items-center justify-end gap-1 text-[10px] text-white/25 mt-0.5">
                        <Clock3 className="h-2.5 w-2.5" />
                        {it.preparationTime}m
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom — clock + ticker */}
        <div className="shrink-0 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {/* Clock row */}
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <p className="font-display text-2xl font-black text-white tabular-nums">{timeStr}</p>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{dateStr}</p>
            </div>
            {availableCategories.length > 1 && (
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Collection</p>
                <p className="font-display text-2xl font-black text-white">
                  {activeCategoryPosition}
                  <span className="text-white/30 text-lg"> / {totalStates}</span>
                </p>
              </div>
            )}
          </div>

          {/* Scrolling category ticker */}
          {availableCategories.length > 1 && (
            <div
              className="overflow-hidden py-2.5 border-t"
              style={{ borderColor: `${accent}22`, backgroundColor: `${accent}10` }}
            >
              <div
                className="flex gap-8 whitespace-nowrap"
                style={{ animation: `t2Ticker ${availableCategories.length * 4}s linear infinite` }}
              >
                {[...availableCategories, ...availableCategories].map((cat, i) => (
                  <span
                    key={`${cat.id}-${i}`}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ color: cat.id === availableCategories[activeCategoryPosition - 1]?.id ? accent : 'rgba(255,255,255,0.2)' }}
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
    </div>
  );
}
