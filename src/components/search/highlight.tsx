import { highlightParts } from "@/features/search/search";

/** `text` with the words of `query` in gold, as in the search popup. */
export function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightParts(text, query).map((part, i) =>
        part.match ? (
          <mark key={i} className="bg-transparent font-semibold text-gold-ink">
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  );
}
