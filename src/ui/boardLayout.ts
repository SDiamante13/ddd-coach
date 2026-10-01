export const CARD_WIDTH = 156;
export const CARD_HEIGHT = 120;
export const CARD_STEP = 196;
export const LANE_INSET = 8;
export const EDGE_CHIP_SAFE = 120;
export const ROW_TOP = 16;
export const CONTROLS_BAND = 72;
export const CONTROLS_CLEARANCE = CONTROLS_BAND + ROW_TOP;

export const lanePosition = (index: number) => ({ x: index * CARD_STEP, y: 0 });
