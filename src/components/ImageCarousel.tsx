import { useState } from "react";

interface Props {
  images: {
    src: string;
    caption?: string;
  }[];
}

export function ImageCarousel({ images }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images.length) return null;

  return (
    <div className="w-full">
      {/* 상단 썸네일 버튼들 */}
      {images.length > 1 && (
        <div className="mx-auto mb-4 flex justify-center gap-3">
          {images.map((image, index) => (
            <button
              type="button"
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                index === currentIndex
                  ? "border-blue-500 shadow-lg"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              <img
                src={image.src}
                alt=""
                className="h-12 w-20 object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      {/* 메인 이미지 영역 */}
      <div className="relative mx-auto overflow-hidden rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="min-w-full">
              <img
                src={image.src}
                alt={image.caption || `Slide ${index + 1}`}
                className="mx-auto max-h-[500px] w-auto object-contain"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* 좌우 버튼 */}
        {images.length > 1 && (
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

      {/* 캡션 */}
      {images[currentIndex]?.caption && (
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {images[currentIndex].caption}
        </p>
      )}
    </div>
  );
}
