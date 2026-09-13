"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { cx } from "@/lib/cx";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const openAt = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const step = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <>
      <div className="relative grid h-72 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-card sm:h-[28rem]">
        {images.slice(0, 5).map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => openAt(i)}
            className={cx("relative bg-surface", i === 0 ? "col-span-4 row-span-2 md:col-span-2" : "hidden md:block")}
            aria-label={`Open photo ${i + 1} of ${images.length}`}
          >
            <Image
              src={src}
              alt={`${name} photo ${i + 1}`}
              fill
              priority={i === 0}
              sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "25vw"}
              className="object-cover transition-opacity hover:opacity-90"
            />
          </button>
        ))}
        <button
          type="button"
          onClick={() => openAt(0)}
          className={buttonClass({ variant: "outline", size: "sm", className: "absolute bottom-4 right-4" })}
        >
          All {images.length} photos
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="m-auto h-full max-h-none w-full max-w-none bg-ink p-0 text-white"
        aria-label={`${name} photos`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-white/60">
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-control p-2 hover:bg-white/10"
              aria-label="Close photos"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={images[index]} alt={`${name} photo ${index + 1}`} fill sizes="100vw" className="object-contain" />
            {[
              { delta: -1, label: "Previous photo", Icon: ChevronLeft, side: "left-4" },
              { delta: 1, label: "Next photo", Icon: ChevronRight, side: "right-4" },
            ].map(({ delta, label, Icon, side }) => (
              <button
                key={label}
                type="button"
                onClick={() => step(delta)}
                className={cx("absolute top-1/2 -translate-y-1/2 rounded-control bg-white/10 p-3 hover:bg-white/20", side)}
                aria-label={label}
              >
                <Icon className="size-5" />
              </button>
            ))}
          </div>
          <div className="h-8" />
        </div>
      </dialog>
    </>
  );
}
