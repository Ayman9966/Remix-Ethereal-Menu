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
    };
  },
  head: () => ({
    meta: [{ title: 'Menu Board — Savor' }],
  }),
  component: MenuBoardPage,
});

function MenuBoardPage() {
  const { categories, items, brand } = useMenu();
  const search = Route.useSearch();

  const cycle = Math.min(120, Math.max(5, search.cycle ?? brand.boardCycleSeconds ?? 15));
  const columns = Math.min(4, Math.max(2, search.columns ?? brand.boardColumns ?? 3));
  const showPhotos = search.photos ?? brand.boardShowPhotos ?? true;
  const showPrice = brand.boardShowPrice ?? true;
  const showDescription = brand.boardShowDescription ?? true;
  const showPrepTime = brand.boardShowPrepTime ?? true;
  const boardBackgroundColor = brand.boardBackgroundColor || '#0a0d13';

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

  const activeCategory = availableCategories[idx % Math.max(1, availableCategories.length)];
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
    if (availableCategories.length <= 1) return;
    const t = window.setInterval(() => setIdx((n) => (n + 1) % availableCategories.length), cycle * 1000);
    return () => window.clearInterval(t);
  }, [availableCategories.length, cycle]);

  const nextCategories = useMemo(() => {
    if (availableCategories.length <= 1) return [];
    const out = [];
    for (let i = 1; i <= Math.min(4, availableCategories.length - 1); i++) {
      out.push(availableCategories[(idx + i) % availableCategories.length]);
    }
    return out;
  }, [availableCategories, idx]);

  const activeCategoryPosition = availableCategories.length > 0 ? (idx % availableCategories.length) + 1 : 0;

  return (
    <div className="min-h-screen text-foreground" style={{ backgroundColor: boardBackgroundColor }}>
      <style>{`
        @keyframes boardSlide {
          from { opacity: 0; transform: translate3d(0, 24px, 0); filter: blur(6px); }
          to { opacity: 1; transform: translate3d(0, 0, 0); filter: blur(0); }
        }
        @keyframes boardGlow {
          0%, 100% { opacity: .25; }
          50% { opacity: .45; }
        }
        @keyframes pulseScan {
          from { transform: translateX(-100%); opacity: 0; }
          20% { opacity: .35; }
          to { transform: translateX(120%); opacity: 0; }
        }
      `}</style>

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {brand.heroImageUrl ? (
          <>
            <img
              src={brand.heroImageUrl}
              alt=""
              className="h-full w-full object-cover opacity-25 blur-[2px] scale-[1.03]"
              decoding="async"
              loading="eager"
            />
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

      {/* Top bar (premium signage style) */}
      <div className="border-b border-white/10 bg-black/30 px-10 py-6 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
              <UtensilsCrossed className="h-7 w-7 text-white/90" />
            </div>
            <div>
              <div className="font-display text-4xl font-black tracking-tight text-white">{brand.restaurantName}</div>
              <div className="mt-0.5 flex items-center gap-2 text-sm text-white/65">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{brand.tagline}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden min-[1220px]:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              {nextCategories.map((c) => (
                <div key={c.id} className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/85">
                  <span className="mr-1.5">{c.icon}</span>
                  {c.name}
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-right">
              <div className="font-display text-3xl font-bold tabular-nums text-white">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center justify-end gap-1 text-xs uppercase tracking-wider text-white/60">
                <Clock3 className="h-3.5 w-3.5" />
                {now.toLocaleDateString([], { weekday: 'short', month: 'short', day: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
        {activeCategory && (
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(activeCategoryPosition / Math.max(1, availableCategories.length)) * 100}%`,
                background: `linear-gradient(90deg, ${brand.accentColor}, ${brand.accentColor}bb)`,
                boxShadow: `0 0 28px ${brand.accentColor}88`,
              }}
            />
          </div>
        )}
      </div>

      {/* Category + items */}
      <div className="px-10 pb-10 pt-8">
        {!activeCategory ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 shadow-ambient-sm backdrop-blur-md">
            <div className="font-display text-4xl font-black text-white">No menu items yet</div>
            <div className="mt-2 text-xl text-white/65">
              Add categories and items in the Admin panel.
            </div>
          </div>
        ) : (
          <div
            key={activeCategory.id}
            className={reduceMotion ? '' : 'will-change-transform'}
            style={reduceMotion ? undefined : { animation: 'boardSlide 650ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}
          >
            <div className="mb-8">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/25 p-6 backdrop-blur-md">
                {!reduceMotion && (
                  <div
                    className="pointer-events-none absolute inset-y-0 w-1/3"
                    style={{ animation: 'pulseScan 3.5s linear infinite' }}
                  >
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                )}
                <div className="relative z-10 flex items-end gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-white/10 text-5xl">
                    {activeCategory.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-6xl font-black leading-none tracking-tight text-white">
                      {activeCategory.name}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/65">
                      <span>Now serving</span>
                      <span className="rounded-full bg-white/10 px-3 py-1">{activeItems.length} items</span>
                      <span className="rounded-full bg-white/10 px-3 py-1">
                        Rotation {activeCategoryPosition}/{Math.max(1, availableCategories.length)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div
              className="grid gap-8"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {chunked.map((col, cIdx) => (
                <div key={cIdx} className="space-y-4">
                  {col.map((it) => (
                    <div
                      key={it.id}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/25 shadow-ambient-sm"
                    >
                      {it.image && showPhotos ? (
                        <img
                          src={it.image}
                          alt={it.name}
                          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          decoding="async"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className="h-56 w-full"
                          style={{
                            background:
                              `linear-gradient(135deg, ${brand.accentColor}55, ${brand.accentColor}22),` +
                              'radial-gradient(circle at 20% 20%, rgba(255,255,255,.24), transparent 45%)',
                          }}
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,.18),transparent_45%)]" />

                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <div className="flex items-end gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-display text-3xl font-black tracking-tight text-white drop-shadow-md">
                              {it.name}
                            </div>
                            {showDescription && it.description && (
                              <div className="mt-1.5 line-clamp-2 text-sm text-white/88">
                                {it.description}
                              </div>
                            )}
                          </div>
                          {showPrice && (
                            <div
                              className="shrink-0 rounded-2xl border border-white/20 bg-black/45 px-3 py-1.5 font-display text-3xl font-black tabular-nums text-white backdrop-blur"
                              style={{ boxShadow: `0 0 24px ${brand.accentColor}55` }}
                            >
                              {brand.currency}{it.price.toFixed(2)}
                            </div>
                          )}
                        </div>
                        {showPrepTime && (
                          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs text-white/90 backdrop-blur">
                            <Clock3 className="h-3.5 w-3.5" />
                            Prep {it.preparationTime} min
                          </div>
                        )}
                      </div>

                      <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-16"
                        style={{
                          background: `linear-gradient(180deg, ${brand.accentColor}35, transparent)`,
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
                      {!it.image && (
                        <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/85">
                          Chef Special
                        </div>
                      )}
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

