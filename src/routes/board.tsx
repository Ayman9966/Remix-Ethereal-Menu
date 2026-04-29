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

  return (
    <div className="h-screen flex flex-col text-foreground overflow-hidden" style={{ backgroundColor: boardBackgroundColor }}>
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
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
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

      {/* Category + items */}
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
              <div className="mt-2 text-xl text-white/65">
                Add categories and items in the Admin panel to start the board.
              </div>
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

            <div
              className="grid gap-6 h-fit"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {chunked.map((col, cIdx) => (
                <div key={cIdx} className="space-y-6">
                  {col.map((it) => (
                    <div
                      key={it.id}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl transition-all duration-300 hover:border-white/20"
                    >
                      {it.image && showPhotos ? (
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={it.image}
                            alt={it.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.1]"
                            decoding="async"
                            loading="lazy"
                          />
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
                            <div className="truncate font-display text-2xl font-black tracking-tight text-white">
                              {it.name}
                            </div>
                            {showDescription && it.description && (
                              <div className="mt-1 line-clamp-2 text-xs text-white/60 leading-relaxed">
                                {it.description}
                              </div>
                            )}
                          </div>
                          {showPrice && (
                            <div
                              className="shrink-0 rounded-xl bg-white text-black px-3 py-1 font-display text-xl font-black tabular-nums shadow-xl"
                            >
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
                            {!it.image && (
                              <div className="bg-primary/20 text-primary text-[9px] font-black uppercase px-2 py-0.5 rounded border border-primary/30 tracking-tighter">
                                Recommendation
                              </div>
                            )}
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

