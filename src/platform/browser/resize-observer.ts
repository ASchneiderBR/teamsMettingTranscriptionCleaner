export function observeElementWidth(
  element: Element,
  callback: (width: number) => void,
): () => void {
  if (!("ResizeObserver" in window)) {
    callback(element.getBoundingClientRect().width);
    return () => {};
  }

  const observer = new ResizeObserver((entries) => {
    const width = entries[0]?.contentRect.width ?? element.getBoundingClientRect().width;
    callback(width);
  });
  observer.observe(element);
  callback(element.getBoundingClientRect().width);
  return () => observer.disconnect();
}
