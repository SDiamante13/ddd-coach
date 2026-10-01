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

// user-event defines a null view on the mouse events it dispatches; a browser always sets one, and d3-drag reads it on draggable cards.
// Installed per test file and restored after it, and limited to a mouse event's null view.
export function giveMouseEventsAView(): () => void {
  const define = Object.defineProperty;
  Object.defineProperty = function <T>(target: T, key: PropertyKey, descriptor: PropertyDescriptor & ThisType<unknown>): T {
    const nullView = key === "view" && target instanceof MouseEvent && descriptor.get !== undefined && descriptor.get() === null;
    return define(target, key, nullView ? { get: () => window } : descriptor);
  } as typeof Object.defineProperty;
  return () => {
    Object.defineProperty = define;
  };
}
