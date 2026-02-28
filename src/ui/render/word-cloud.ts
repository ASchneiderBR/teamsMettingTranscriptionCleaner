import { D3CloudTs } from "d3-cloud-ts";
import type { WordCloudItem } from "../../domain/transcript/types";
import type { AppRefs } from "../refs";

const WORD_CLOUD_MIN_WIDTH = 280;
const WORD_CLOUD_MIN_HEIGHT = 320;
const WORD_CLOUD_MIN_FONT = 18;
const WORD_CLOUD_MAX_FONT = 62;
const runningLayouts = new WeakMap<HTMLDivElement, D3CloudTs.CloudData>();
let renderSequence = 0;

type LayoutWord = D3CloudTs.Word & {
  fill: string;
};

export function renderWordCloud(refs: AppRefs, items: WordCloudItem[], meta: string): void {
  refs.wordCloudMeta.textContent = meta;
  refs.wordCloud.replaceChildren();
  refs.wordCloud.classList.toggle("chartEmpty", items.length === 0);
  stopRunningLayout(refs.wordCloud);

  if (!items.length) {
    refs.wordCloud.textContent = "Sem dados";
    return;
  }

  const width = Math.max(
    WORD_CLOUD_MIN_WIDTH,
    Math.round(refs.wordCloud.getBoundingClientRect().width || refs.wordCloud.clientWidth || 0),
  );
  const height = Math.max(
    WORD_CLOUD_MIN_HEIGHT,
    Math.round(refs.wordCloud.getBoundingClientRect().height || refs.wordCloud.clientHeight || 0),
  );

  if (!supportsCloudLayout()) {
    renderFallbackWords(refs.wordCloud, items);
    return;
  }

  const words = buildLayoutWords(items);
  const currentRenderId = String(++renderSequence);
  refs.wordCloud.dataset.renderId = currentRenderId;

  try {
    const layout = new D3CloudTs.Cloud().config;
    runningLayouts.set(refs.wordCloud, layout);

    layout.size?.([width, height]);
    layout.words?.(words);
    layout.text?.((_, word) => word.key);
    layout.font?.("Segoe UI");
    layout.fontWeight?.((_, word) => (word.value >= 4 ? "800" : "700"));
    layout.rotate?.((_, __, index) => (index % 7 === 0 ? 90 : 0));
    layout.padding?.((_, word) => (word.value >= 5 ? 3 : 5));
    layout.fontSize?.((_, word) => scaleFontSize(word.value, items));
    layout.random?.(createSeededRandom(words));
    layout.on?.([
      "end",
      (placedWords: D3CloudTs.Word[]) => {
        if (refs.wordCloud.dataset.renderId !== currentRenderId) {
          return;
        }
        runningLayouts.delete(refs.wordCloud);
        drawSvgCloud(refs.wordCloud, width, height, placedWords as LayoutWord[]);
      },
    ]);
    layout.start?.();
  } catch {
    stopRunningLayout(refs.wordCloud);
    renderFallbackWords(refs.wordCloud, items);
  }
}

function renderFallbackWords(container: HTMLDivElement, items: WordCloudItem[]): void {
  const max = Math.max(...items.map((item) => item.count));
  const min = Math.min(...items.map((item) => item.count));
  const fragment = document.createDocumentFragment();

  for (const [index, item] of items.entries()) {
    const span = document.createElement("span");
    const ratio = max === min ? 0.65 : (item.count - min) / (max - min);
    span.className = "cloudWord";
    span.textContent = item.word;
    span.title = `${item.word}: ${item.count}`;
    span.style.fontSize = `${1 + ratio * 2.2}rem`;
    span.style.color = pickWordColor(index, item.word);
    fragment.append(span);
  }

  container.append(fragment);
}

function buildLayoutWords(items: WordCloudItem[]): LayoutWord[] {
  return items.map((item, index) => ({
    key: item.word,
    value: item.count,
    text: item.word,
    fill: pickWordColor(index, item.word),
  }));
}

function drawSvgCloud(
  container: HTMLDivElement,
  width: number,
  height: number,
  words: LayoutWord[],
): void {
  const svgNamespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("class", "wordCloudSvg");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Nuvem de palavras da transcrição");

  const group = document.createElementNS(svgNamespace, "g");
  group.setAttribute("transform", `translate(${width / 2} ${height / 2})`);

  for (const word of words) {
    if (typeof word.x !== "number" || typeof word.y !== "number" || !word.text) {
      continue;
    }

    const text = document.createElementNS(svgNamespace, "text");
    text.textContent = word.text;
    text.setAttribute("class", "wordCloudText");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("transform", `translate(${word.x} ${word.y}) rotate(${word.rotate || 0})`);
    text.setAttribute("font-size", `${word.size || WORD_CLOUD_MIN_FONT}`);
    text.setAttribute("fill", word.fill);
    text.setAttribute("font-family", "Segoe UI");
    text.setAttribute("font-weight", word.value >= 4 ? "800" : "700");
    text.setAttribute("aria-label", `${word.text}: ${word.value}`);
    group.append(text);
  }

  svg.append(group);
  container.replaceChildren(svg);
}

function scaleFontSize(value: number, items: WordCloudItem[]): number {
  const counts = items.map((item) => item.count);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  if (max === min) {
    return (WORD_CLOUD_MIN_FONT + WORD_CLOUD_MAX_FONT) / 2;
  }
  return (
    WORD_CLOUD_MIN_FONT +
    ((value - min) / (max - min)) * (WORD_CLOUD_MAX_FONT - WORD_CLOUD_MIN_FONT)
  );
}

function pickWordColor(index: number, word: string): string {
  const seed = Array.from(word).reduce((total, char) => total + char.charCodeAt(0), 0);
  return `hsl(${(seed + index * 29) % 360}deg 72% 42%)`;
}

function stopRunningLayout(container: HTMLDivElement): void {
  const layout = runningLayouts.get(container);
  layout?.stop?.();
  runningLayouts.delete(container);
}

function supportsCloudLayout(): boolean {
  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    return Boolean(context && typeof context.getImageData === "function");
  } catch {
    return false;
  }
}

function createSeededRandom(words: LayoutWord[]): () => number {
  let seed = words.reduce((total, word, index) => {
    return (
      total +
      (index + 1) * word.value +
      Array.from(word.key).reduce((innerTotal, char) => innerTotal + char.charCodeAt(0), 0)
    );
  }, 0);

  if (seed <= 0) {
    seed = 1;
  }

  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}
