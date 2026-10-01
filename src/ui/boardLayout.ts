export const CARD_WIDTH = 156;
export const CARD_HEIGHT = 120;
export const CARD_STEP = 196;
export const LANE_INSET = 8;
export const EDGE_CHIP_SAFE = 120;
export const ROW_TOP = 16;
export const BOTTOM_CLEARANCE = ROW_TOP;

export const lanePosition = (index: number) => ({ x: index * CARD_STEP, y: 0 });

export type Bounds = { x: number; y: number; width: number; height: number };
type Size = { width: number; height: number };
type Viewport = { x: number; y: number; zoom: number };

export function fittedViewport(bounds: Bounds, lane: Size, limits: { min: number; max: number }): Viewport {
  const room = { width: lane.width - 2 * ROW_TOP, height: lane.height - 2 * ROW_TOP };
  const zoom = Math.min(limits.max, Math.max(limits.min, Math.min(room.width / bounds.width, room.height / bounds.height)));
  return { x: placed(bounds.x, bounds.width, lane.width, zoom), y: placed(bounds.y, bounds.height, lane.height, zoom), zoom };
}

const placed = (at: number, size: number, room: number, zoom: number): number =>
  size * zoom <= room - 2 * ROW_TOP ? (room - size * zoom) / 2 - at * zoom : ROW_TOP - at * zoom;
