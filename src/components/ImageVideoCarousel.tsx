import { useEffect, useMemo, useRef, useState } from "react";

interface SlideItem {
  topImage: string;
  bottomImage: string;
  video: string;
  caption?: string;
  topLabel?: string;
  bottomLabel?: string;
  videoLabel?: string;
}

interface Props {
  items: SlideItem[];
}

const SLIDE_GAP_REM = 0; // slides touch edge-to-edge during motion
const SWIPE_THRESHOLD_PX = 50;
const TRANSITION_MS = 320;

export function ImageVideoCarousel({ items }: Props) {
  const hasMultipleSlides = items.length > 1;
  const extendedItems = useMemo(() => {
    if (!hasMultipleSlides) {
      return items;
    }
    const first = items[0];
    const last = items[items.length - 1];
    return [last, ...items, first];
  }, [items, hasMultipleSlides]);

  const initialPosition = hasMultipleSlides ? 1 : 0;
  const [position, setPosition] = useState(initialPosition);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isPlayingStates, setIsPlayingStates] = useState<boolean[]>(() =>
    items.map((_, idx) => idx === 0)
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const slidesContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const positionRef = useRef(position);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    setPosition(hasMultipleSlides ? 1 : 0);
    setIsPlayingStates(items.map((_, idx) => idx === 0));
    videoRefs.current = new Array(extendedItems.length).fill(null);
  }, [items, hasMultipleSlides, extendedItems.length]);

  const mapExtendedToOriginal = (idx: number) => {
    if (!hasMultipleSlides) {
      return idx;
    }
    if (idx === 0) {
      return items.length - 1;
    }
    if (idx === extendedItems.length - 1) {
      return 0;
    }
    return idx - 1;
  };

  const logicalIndex = items.length
    ? hasMultipleSlides
      ? (position - 1 + items.length) % items.length
      : 0
    : 0;

  useEffect(() => {
    if (!items.length) {
      return;
    }
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      const originalIdx = mapExtendedToOriginal(idx);
      if (originalIdx === logicalIndex) {
        const playPromise = video.play();
        if (playPromise) {
          void playPromise.catch(() => undefined);
        }
      } else {
        video.pause();
      }
    });
    setIsPlayingStates(items.map((_, idx) => idx === logicalIndex));
  }, [logicalIndex, items]);

  const enableTransitionSoon = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsTransitionEnabled(true));
    });
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!hasMultipleSlides) return;
    setIsTransitionEnabled(true);
    setPosition((prev) => prev + 1);
  };

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!hasMultipleSlides) return;
    setIsTransitionEnabled(true);
    setPosition((prev) => prev - 1);
  };

  const goToSlide = (target: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasMultipleSlides) return;
    if (target === logicalIndex) return;
    setIsTransitionEnabled(true);
    const delta = target - logicalIndex;
    setPosition((prev) => prev + delta);
  };

  const togglePlayPause = (originalIndex: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlayingStates((prev) => {
      const updated = [...prev];
      updated[originalIndex] = !updated[originalIndex];
      return updated;
    });
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (mapExtendedToOriginal(idx) !== originalIndex) return;
      if (isPlayingStates[originalIndex]) {
        video.pause();
      } else {
        const playPromise = video.play();
        if (playPromise) {
          void playPromise.catch(() => undefined);
        }
      }
    });
  };

  const beginDrag = (clientX: number) => {
    if (!hasMultipleSlides) return;
    setIsTransitionEnabled(false);
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
  };

  const updateDrag = (clientX: number) => {
    if (!isDragging) return;
    setDragOffset(clientX - startX);
  };

  const endDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const offset = dragOffset;
    setDragOffset(0);
    setIsTransitionEnabled(true);
    if (offset > SWIPE_THRESHOLD_PX) {
      goToPrevious();
    } else if (offset < -SWIPE_THRESHOLD_PX) {
      goToNext();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    beginDrag(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => updateDrag(e.clientX);
  const handleMouseUp = () => endDrag();
  const handleMouseLeave = () => endDrag();

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    beginDrag(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => updateDrag(e.touches[0].clientX);
  const handleTouchEnd = () => endDrag();

  const handleTransitionEnd = () => {
    if (!hasMultipleSlides) return;
    const total = extendedItems.length;
    const current = positionRef.current;
    if (current === total - 1) {
      setIsTransitionEnabled(false);
      setPosition(1);
      enableTransitionSoon();
    } else if (current === 0) {
      setIsTransitionEnabled(false);
      setPosition(total - 2);
      enableTransitionSoon();
    }
  };

  const getContainerWidth = () => containerRef.current?.offsetWidth ?? 0;

  const computeTransform = () => {
    if (!hasMultipleSlides) {
      return "translateX(0%)";
    }
    const basePercentage = -position * 100;
    if (isDragging) {
      const width = getContainerWidth();
      if (width === 0) {
        return `translateX(${basePercentage}%)`;
      }
      const dragPercent = (dragOffset / width) * 100;
      return `translateX(calc(${basePercentage}% + ${dragPercent}%))`;
    }
    return `translateX(${basePercentage}%)`;
  };

  if (!items.length) {
    return null;
  }

  const currentItem = items[logicalIndex];

  return (
    <div className="w-full">
      {/* 상단 썸네일 버튼들 */}
      {hasMultipleSlides && (
        <div className="mx-auto mb-4 flex max-w-[900px] justify-center gap-3">
          {items.map((item, index) => (
            <button
              type="button"
              key={index}
              onClick={goToSlide(index)}
              className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                index === logicalIndex
                  ? "border-blue-500 shadow-lg"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              <div className="flex h-16 w-24">
                <img
                  src={item.topImage}
                  alt=""
                  className="h-full w-1/2 object-cover"
                  draggable={false}
                />
                <img
                  src={item.bottomImage}
                  alt=""
                  className="h-full w-1/2 object-cover"
                  draggable={false}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative mx-auto max-w-[900px] overflow-hidden rounded-lg bg-zinc-100 px-2 py-4 dark:bg-zinc-800 ${
          isDragging ? "cursor-grabbing" : hasMultipleSlides ? "cursor-grab" : "cursor-default"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Side paddings rendered as overlays so upcoming slides stay hidden */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-2 bg-zinc-100 dark:bg-zinc-800"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-2 bg-zinc-100 dark:bg-zinc-800"
          aria-hidden
        />
        <div
          ref={slidesContainerRef}
          className="flex"
          style={{
            gap: `${SLIDE_GAP_REM}rem`,
            transform: computeTransform(),
            transition:
              isDragging || !isTransitionEnabled
                ? "none"
                : `transform ${TRANSITION_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedItems.map((item, idx) => {
            const originalIndex = mapExtendedToOriginal(idx);
            const isActive = originalIndex === logicalIndex;
            const isPlaying = isPlayingStates[originalIndex] ?? false;
            return (
              <div
                key={`${item.video}-${idx}`}
                className="flex min-w-full justify-center gap-1"
                style={{ height: "420px" }}
              >
                {/* 왼쪽: 이미지 2개, 각각 높이 절반 */}
                <div className="flex h-full w-[30%] flex-col gap-2">
                  <div className="flex h-[calc(50%-4px)] items-center justify-center overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                    {item.topImage ? (
                      <div className="relative inline-block max-h-full max-w-full">
                        <img
                          src={item.topImage}
                          alt="Top image"
                          className="max-h-full max-w-full object-contain"
                          style={{ maxHeight: "calc((420px - 8px) / 2 - 4px)" }}
                          draggable={false}
                        />
                        {item.topLabel && (
                          <div className="absolute left-1 top-1 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            {item.topLabel}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex h-[calc(50%-4px)] items-center justify-center overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                    {item.bottomImage ? (
                      <div className="relative inline-block max-h-full max-w-full">
                        <img
                          src={item.bottomImage}
                          alt="Bottom image"
                          className="max-h-full max-w-full object-contain"
                          style={{ maxHeight: "calc((420px - 8px) / 2 - 4px)" }}
                          draggable={false}
                        />
                        {item.bottomLabel && (
                          <div className="absolute left-1 top-1 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            {item.bottomLabel}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
                {/* 오른쪽: 비디오, 전체 높이 */}
                <div className="flex h-full items-center justify-center overflow-hidden rounded">
                  <div className="relative inline-block h-full">
                    <video
                      ref={(el) => {
                        videoRefs.current[idx] = el;
                      }}
                      className="h-full w-auto object-contain"
                      src={item.video}
                      loop
                      muted
                      playsInline
                      autoPlay={isActive}
                    />
                    {item.videoLabel && (
                      <div className="absolute left-2 top-2 z-10 rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white">
                        {item.videoLabel}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={togglePlayPause(originalIndex)}
                      className="absolute bottom-3 right-3 rounded-full bg-black/55 p-2 text-white transition-colors hover:bg-black/70"
                      aria-label={isPlaying ? "Pause video" : "Play video"}
                    >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 9v6m4-6v6"
                        />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m10 8 6 4-6 4z"
                        />
                      </svg>
                    )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasMultipleSlides && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white shadow transition-colors hover:bg-black/75"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m15 6-6 6 6 6"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white shadow transition-colors hover:bg-black/75"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m9 6 6 6-6 6"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {currentItem?.caption && (
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {currentItem.caption}
        </p>
      )}
    </div>
  );
}
