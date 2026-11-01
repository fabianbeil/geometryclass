import { createState } from "./state.js";
import { drawScene, pointerPos, screenToWorld, localToScreen, insideRuler, snapPoint, eraseAt, worldToLocal } from "./geometry.js";
import { bindUI, syncControls } from "./ui.js";
import { saveDrawingToFile, loadDrawingFromFile } from "./storage.js";

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const body = document.body;
const state = createState();

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
}

function redraw() {
  drawScene(ctx, canvas, body, state);
  syncControls(state);
}

bindUI({ canvas, body, state, onRedraw: redraw });
resizeCanvas();

canvas.addEventListener("pointerdown", event => {
  const screen = pointerPos(event, canvas);
  const world = screenToWorld(state, screen.x, screen.y);
  state.pointerDown = true;

  if (event.button === 1 || state.tool === "pan") {
    state.drag = { kind: "pan", x: screen.x, y: screen.y, panX: state.panX, panY: state.panY };
    redraw();
    return;
  }

  if (state.ruler.visible) {
    const scale = localToScreen(state, state.ruler, state.ruler.w, 0);
    const rotate = localToScreen(state, state.ruler, state.ruler.w / 2, -state.ruler.h - 30);
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    if (dist(screen, scale) < 18) {
      state.drag = { kind: "scale" };
      redraw();
      return;
    }
    if (dist(screen, rotate) < 18) {
      state.drag = { kind: "rotate" };
      redraw();
      return;
    }
    if (insideRuler(worldToLocal(state.ruler, world), state.ruler)) {
      state.drag = { kind: "rulerMove", offsetX: world.x - state.ruler.x, offsetY: world.y - state.ruler.y };
      redraw();
      return;
    }
  }

  if (state.tool === "eraser") {
    state.strokes = eraseAt(world, state.strokes, state.eraseMode, state.zoom);
    state.drag = { kind: "erase" };
    redraw();
    return;
  }

  if (state.tool === "pen") {
    const first = snapPoint(world, state.ruler, state.zoom);
    state.activeStroke = {
      width: Number(state.thickness) / state.zoom,
      color: state.penColor,
      parts: [[first]]
    };
    state.strokes.push(state.activeStroke);
    state.drag = { kind: "draw" };
    redraw();
  }
});

canvas.addEventListener("pointermove", event => {
  if (!state.pointerDown) return;
  const screen = pointerPos(event, canvas);
  const world = screenToWorld(state, screen.x, screen.y);

  if (state.drag?.kind === "pan") {
    state.panX = state.drag.panX + screen.x - state.drag.x;
    state.panY = state.drag.panY + screen.y - state.drag.y;
  } else if (state.drag?.kind === "rulerMove") {
    state.ruler.x = world.x - state.drag.offsetX;
    state.ruler.y = world.y - state.drag.offsetY;
  } else if (state.drag?.kind === "rotate") {
    const zero = { x: state.ruler.w / 2, y: 0 };
    const fixedZero = localToScreen(state, state.ruler, zero.x, zero.y);
    state.ruler.angle = Math.atan2(world.y - fixedZero.y, world.x - fixedZero.x) + Math.PI / 2;
    const c = Math.cos(state.ruler.angle);
    const s = Math.sin(state.ruler.angle);
    state.ruler.x = fixedZero.x - (zero.x * c - zero.y * s);
    state.ruler.y = fixedZero.y - (zero.x * s + zero.y * c);
  } else if (state.drag?.kind === "scale") {
    const local = worldToLocal(state.ruler, world);
    const newW = Math.max(240, local.x);
    state.ruler.h = state.ruler.h * (newW / state.ruler.w);
    state.ruler.w = newW;
  } else if (state.drag?.kind === "draw" && state.activeStroke) {
    const p = snapPoint(world, state.ruler, state.zoom);
    const part = state.activeStroke.parts[state.activeStroke.parts.length - 1];
    if (Math.hypot(p.x - part[part.length - 1].x, p.y - part[part.length - 1].y) > 1) {
      part.push(p);
    }
  } else if (state.drag?.kind === "erase") {
    state.strokes = eraseAt(world, state.strokes, state.eraseMode, state.zoom);
  }

  redraw();
});

canvas.addEventListener("pointerup", () => {
  state.pointerDown = false;
  state.activeStroke = null;
  state.drag = null;
  redraw();
});

canvas.addEventListener("pointercancel", () => {
  state.pointerDown = false;
  state.activeStroke = null;
  state.drag = null;
  redraw();
});

window.addEventListener("resize", () => {
  resizeCanvas();
  redraw();
});

window.addEventListener("load", () => {
  resizeCanvas();
  redraw();
});

if (typeof lucide !== "undefined" && lucide.createIcons) {
  lucide.createIcons();
}
redraw();
