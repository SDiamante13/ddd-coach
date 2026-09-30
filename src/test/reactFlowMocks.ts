// jsdom lacks the layout APIs React Flow measures nodes with; these follow React Flow's documented test setup.
class ResizeObserverStub {
  constructor(private readonly callback: ResizeObserverCallback) {}
  observe(target: Element) {
    this.callback([{ target, contentRect: target.getBoundingClientRect() } as ResizeObserverEntry], this as unknown as ResizeObserver);
  }
  unobserve() {}
  disconnect() {}
}

class DOMMatrixReadOnlyStub {
  m22: number;
  constructor(transform?: string) {
    const scale = transform?.match(/scale\(([1-9.])\)/)?.[1];
    this.m22 = scale === undefined ? 1 : Number(scale);
  }
}

export function mockReactFlowLayout(): void {
  globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
  globalThis.DOMMatrixReadOnly ??= DOMMatrixReadOnlyStub as unknown as typeof DOMMatrixReadOnly;
  Object.defineProperties(HTMLElement.prototype, {
    offsetHeight: { configurable: true, get: () => 120 },
    offsetWidth: { configurable: true, get: () => 156 },
  });
  (SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect;
}
