import type { AppRefs } from "../refs";
import type { AppViewModel } from "../view-models";

export function renderTimeline(refs: AppRefs, viewModel: AppViewModel): void {
  refs.timelineMeta.textContent = viewModel.timelineMeta;
  refs.timelineStart.textContent = viewModel.timelineStart;
  refs.timelineEnd.textContent = viewModel.timelineEnd;
  refs.timelineChart.innerHTML = "";
  refs.timelineLegend.innerHTML = "";
  refs.timelineChart.classList.toggle("chartEmpty", !viewModel.timeline.buckets.length);

  if (!viewModel.timeline.buckets.length) {
    refs.timelineChart.textContent = "Sem dados";
    return;
  }

  const bucketFragment = document.createDocumentFragment();
  for (const bucket of viewModel.timeline.buckets) {
    const bar = document.createElement("div");
    bar.className = "chartBar";

    for (const speaker of bucket.speakers) {
      const segment = document.createElement("div");
      segment.className = "chartSeg";
      segment.style.height = `${(speaker.seconds / viewModel.timeline.maxBucketSeconds) * 100}%`;
      segment.style.background = viewModel.timelineColors[speaker.name] || "var(--primary)";
      segment.title = `${speaker.name}: ${speaker.seconds.toFixed(1)}s`;
      bar.append(segment);
    }
    bucketFragment.append(bar);
  }
  refs.timelineChart.append(bucketFragment);

  const legendFragment = document.createDocumentFragment();
  for (const item of viewModel.timelineLegend) {
    const legendItem = document.createElement("div");
    legendItem.className = "legendItem";
    legendItem.innerHTML = `<span class="legendSwatch" style="background:${item.color}"></span><span>${escapeHtml(item.name)}</span>`;
    legendFragment.append(legendItem);
  }
  refs.timelineLegend.append(legendFragment);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
