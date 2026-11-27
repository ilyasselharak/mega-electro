"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Loader2, RefreshCw, Star, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoreImage } from "@/components/shared/store-image";
import { uploadImage, type UploadScope } from "@/lib/upload-client";
import type { ImageInput } from "@/lib/validators/common";
import { cn } from "@/lib/utils";

type Pending = { id: string; name: string; progress: number };

function useDropzone(onFiles: (files: File[]) => void) {
  const [over, setOver] = useState(false);
  return {
    over,
    props: {
      onDragOver: (e: React.DragEvent) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setOver(true);
        }
      },
      onDragLeave: () => setOver(false),
      onDrop: (e: React.DragEvent) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        setOver(false);
        onFiles(Array.from(e.dataTransfer.files));
      },
    },
  };
}

/** Multi-image manager: drag & drop upload, reorder (drag or arrows), replace, delete, alt text. */
export function ImageManager({ value, onChange, onUploadingChange, scope = "products", max = 15 }: { value: ImageInput[]; onChange: (v: ImageInput[]) => void; onUploadingChange?: (uploading: boolean) => void; scope?: UploadScope; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceIndex = useRef<number | null>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  // Keep a live reference so concurrent uploads append to the latest list
  const latest = useRef(value);
  useLayoutEffect(() => {
    latest.current = value;
  }, [value]);
  const isUploading = pending.length > 0;
  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  async function handleFiles(files: File[]) {
    const room = max - latest.current.length - pending.length;
    if (room <= 0) return toast.error(`${max} images maximum`);
    for (const file of files.slice(0, room)) {
      const id = crypto.randomUUID();
      setPending((p) => [...p, { id, name: file.name, progress: 0 }]);
      try {
        const img = await uploadImage(file, scope, (progress) => setPending((p) => p.map((x) => (x.id === id ? { ...x, progress } : x))));
        const next = [...latest.current, { ...img, alt: "" }];
        latest.current = next;
        onChange(next);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Échec de l'envoi");
      } finally {
        setPending((p) => p.filter((x) => x.id !== id));
      }
    }
  }

  async function handleReplace(file: File) {
    const index = replaceIndex.current;
    if (index == null) return;
    const id = crypto.randomUUID();
    setPending((p) => [...p, { id, name: file.name, progress: 0 }]);
    try {
      const img = await uploadImage(file, scope, (progress) => setPending((p) => p.map((x) => (x.id === id ? { ...x, progress } : x))));
      const next = [...latest.current];
      next[index] = { ...img, alt: next[index]?.alt ?? "" };
      latest.current = next;
      onChange(next);
      toast.success("Image remplacée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de l'envoi");
    } finally {
      setPending((p) => p.filter((x) => x.id !== id));
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  const dz = useDropzone(handleFiles);

  return (
    <div className="space-y-3">
      <div
        {...dz.props}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        role="button"
        tabIndex={0}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition",
          dz.over ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
        )}
      >
        <UploadCloud className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">Glissez-déposez vos images ici, ou cliquez pour parcourir</p>
        <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, AVIF · 10 Mo max · {value.length}/{max}. La première image est l&apos;image principale.</p>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => { handleFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
        <input ref={replaceInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplace(f); e.target.value = ""; }} />
      </div>

      {value.length || pending.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {value.map((img, i) => (
            <li
              key={img.key}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => { if (dragIndex !== null) e.preventDefault(); }}
              onDrop={(e) => { if (dragIndex !== null) { e.preventDefault(); move(dragIndex, i); setDragIndex(null); } }}
              onDragEnd={() => setDragIndex(null)}
              className={cn("group overflow-hidden rounded-xl border bg-card", dragIndex === i && "opacity-40")}
            >
              <div className="relative aspect-square bg-white">
                <StoreImage imageKey={img.key} alt={img.alt ?? ""} fill sizes="200px" className="object-contain p-2" />
                {i === 0 ? <span className="absolute start-2 top-2 flex items-center gap-1 rounded-full bg-brass px-2 py-0.5 text-[11px] font-bold text-brass-foreground"><Star className="size-3" /> Principale</span> : null}
                <span className="absolute end-2 top-2 cursor-grab rounded-md bg-background/90 p-1 text-muted-foreground shadow-sm" aria-hidden><GripVertical className="size-4" /></span>
                <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <div className="flex gap-1">
                    <Button type="button" size="icon-sm" variant="outline" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Déplacer à gauche"><ArrowLeft /></Button>
                    <Button type="button" size="icon-sm" variant="outline" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} aria-label="Déplacer à droite"><ArrowRight /></Button>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" size="icon-sm" variant="outline" onClick={() => { replaceIndex.current = i; replaceInput.current?.click(); }} aria-label="Remplacer"><RefreshCw /></Button>
                    <Button type="button" size="icon-sm" variant="destructive" className="bg-background" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Supprimer"><Trash2 /></Button>
                  </div>
                </div>
              </div>
              <Input
                value={img.alt ?? ""}
                onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                placeholder="Texte alternatif (SEO)"
                className="h-8 rounded-none border-0 border-t text-xs shadow-none focus-visible:ring-0"
              />
            </li>
          ))}
          {pending.map((p) => (
            <li key={p.id} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border bg-muted/50 p-3 text-center">
              <Loader2 className="size-6 animate-spin text-orange-strong" />
              <p className="line-clamp-1 text-xs text-muted-foreground">{p.name}</p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-background"><div className="h-full bg-primary transition-all" style={{ width: `${p.progress}%` }} /></div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Single image (category image, brand logo). */
export function SingleImageField({ value, onChange, scope }: { value: string | null | undefined; onChange: (key: string | null) => void; scope: UploadScope }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  async function upload(file: File) {
    setProgress(0);
    try {
      const img = await uploadImage(file, scope, setProgress);
      onChange(img.key);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de l'envoi");
    } finally {
      setProgress(null);
    }
  }
  const dz = useDropzone((files) => files[0] && upload(files[0]));
  return (
    <div className="flex items-center gap-4">
      <div {...dz.props} className={cn("relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-white", dz.over && "border-primary")}>
        {progress != null ? <Loader2 className="size-6 animate-spin text-orange-strong" /> : value ? <StoreImage imageKey={value} alt="" fill sizes="96px" className="object-contain p-1.5" /> : <ImagePlus className="size-6 text-muted-foreground" />}
      </div>
      <div className="flex flex-col gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={progress != null}>{value ? "Remplacer" : "Ajouter une image"}</Button>
        {value ? <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => onChange(null)}>Retirer</Button> : null}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
    </div>
  );
}
