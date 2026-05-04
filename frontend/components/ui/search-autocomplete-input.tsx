"use client";

import { useEffect, useRef, useState } from "react";
import { fetchProducts } from "@/lib/api";

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
};

export function SearchAutocompleteInput({ name, defaultValue, placeholder, className }: Props) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [items, setItems] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const next = defaultValue ?? "";
    setValue(next);
  }, [defaultValue]);

  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      if (!rootRef.current?.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setItems([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetchProducts({ q, page: 0, size: 8 });
        const names = Array.from(new Set(res.content.map((p) => p.name).filter(Boolean)));
        setItems(names);
        setOpen(names.length > 0 || q.length > 0);
        setActiveIndex(-1);
      } catch {
        setItems([]);
        setOpen(false);
        setActiveIndex(-1);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [value]);

  function pick(item: string) {
    setValue(item);
    setOpen(false);
    setActiveIndex(-1);
  }

  const canSearchTyped = value.trim().length > 0;
  const totalOptions = items.length + (canSearchTyped ? 1 : 0);
  const isTypedOptionActive = canSearchTyped && activeIndex === 0;
  const itemIndexOffset = canSearchTyped ? 1 : 0;

  return (
    <div ref={rootRef} className="relative">
      <input
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (!open || totalOptions === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % totalOptions);
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev <= 0 ? totalOptions - 1 : prev - 1));
            return;
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            setActiveIndex(-1);
            return;
          }
          if (e.key === "Enter" && activeIndex >= 0 && activeIndex < totalOptions) {
            e.preventDefault();
            if (canSearchTyped && activeIndex === 0) {
              setOpen(false);
              setActiveIndex(-1);
              return;
            }
            pick(items[activeIndex - itemIndexOffset]);
          }
        }}
        onFocus={() => {
          if (items.length > 0) {
            setOpen(true);
            if (activeIndex < 0) setActiveIndex(-1);
          }
        }}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-white/10 bg-[#11131b] shadow-xl">
          {canSearchTyped && (
            <button
              type="button"
              className={`block w-full px-3 py-2 text-left text-sm ${
                isTypedOptionActive ? "bg-white/15 text-white" : "text-zinc-100 hover:bg-white/10"
              }`}
              onMouseEnter={() => setActiveIndex(0)}
              onClick={() => {
                setOpen(false);
                setActiveIndex(-1);
              }}
            >
              Buscar exactamente: <span className="font-semibold">{value.trim()}</span>
            </button>
          )}
          {items.map((item, idx) => (
            <button
              key={item}
              type="button"
              className={`block w-full px-3 py-2 text-left text-sm ${
                idx + itemIndexOffset === activeIndex
                  ? "bg-white/15 text-white"
                  : "text-zinc-200 hover:bg-white/10"
              }`}
              onMouseEnter={() => setActiveIndex(idx + itemIndexOffset)}
              onClick={() => pick(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
