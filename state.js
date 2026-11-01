export const DEFAULT_STATE = {
  zoom: 1.05,
  panX: 90,
  panY: 180,
  tool: "pen",
  strokes: [],
  activeStroke: null,
  pointerDown: false,
  drag: null,
  ruler: {
    visible: false,
    x: 180,
    y: 320,
    w: 600,
    h: 300,
    angle: 0
  },
  penColor: "standard",
  thickness: "2",
  eraseMode: "whole"
};

export function createState() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}
