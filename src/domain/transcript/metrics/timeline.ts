import type { Cue, TimelineBucket } from "../types";

export function pickBucketSeconds(totalSeconds: number, chartWidthPx: number): number {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return 120;
  }
  const safeWidth = Math.max(240, Math.round(chartWidthPx || 0));
  const desiredBars = Math.max(8, Math.floor(safeWidth / 28));
  const rough = totalSeconds / desiredBars;
  const windows = [120, 150, 180, 240, 300];
  return windows.reduce((best, current) =>
    Math.abs(current - rough) < Math.abs(best - rough) ? current : best,
  );
}

export function computeTimeline(
  cues: Cue[],
  orderDesc: string[],
  chartWidthPx: number,
): {
  bucketSeconds: number;
  bucketCount: number;
  maxBucketSeconds: number;
  buckets: TimelineBucket[];
} {
  if (!cues.length) {
    return {
      bucketSeconds: 120,
      bucketCount: 0,
      maxBucketSeconds: 0,
      buckets: [],
    };
  }

  const minS = Math.min(...cues.map((cue) => cue.startS));
  const maxE = Math.max(...cues.map((cue) => cue.endS));
  const totalSeconds = Math.max(0, maxE - minS);
  const bucketSeconds = pickBucketSeconds(totalSeconds, chartWidthPx);
  const bucketCount = Math.max(1, Math.ceil(totalSeconds / bucketSeconds));

  const buckets: TimelineBucket[] = Array.from({ length: bucketCount }, (_, index) => ({
    startS: minS + index * bucketSeconds,
    endS: minS + (index + 1) * bucketSeconds,
    speakers: [],
    totalSeconds: 0,
  }));

  for (const cue of cues) {
    const duration = Math.max(0, cue.endS - cue.startS);
    if (!duration || !cue.speakers.length) {
      continue;
    }
    const uniqueNames = Array.from(new Set(cue.speakers.map((speaker) => speaker.name)));
    const share = duration / uniqueNames.length;
    const firstIndex = Math.max(0, Math.floor((cue.startS - minS) / bucketSeconds));
    const lastIndex = Math.min(
      bucketCount - 1,
      Math.floor((Math.max(cue.endS - 0.001, minS) - minS) / bucketSeconds),
    );

    for (let index = firstIndex; index <= lastIndex; index += 1) {
      const bucket = buckets[index];
      if (!bucket) {
        continue;
      }
      const overlapStart = Math.max(bucket.startS, cue.startS);
      const overlapEnd = Math.min(bucket.endS, cue.endS);
      const overlap = Math.max(0, overlapEnd - overlapStart);
      if (!overlap) {
        continue;
      }
      for (const name of uniqueNames) {
        const existing = bucket.speakers.find((speaker) => speaker.name === name);
        const seconds = (overlap / duration) * share;
        if (existing) {
          existing.seconds += seconds;
        } else {
          bucket.speakers.push({ name, seconds });
        }
        bucket.totalSeconds += seconds;
      }
    }
  }

  for (const bucket of buckets) {
    bucket.speakers.sort((left, right) => {
      const leftOrder = orderDesc.indexOf(left.name);
      const rightOrder = orderDesc.indexOf(right.name);
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      return right.seconds - left.seconds;
    });
  }

  return {
    bucketSeconds,
    bucketCount,
    maxBucketSeconds: Math.max(0, ...buckets.map((bucket) => bucket.totalSeconds)),
    buckets,
  };
}
