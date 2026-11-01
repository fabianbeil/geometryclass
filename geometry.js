import { DEFAULT_STATE } from "./state.js";

export const dpr = () => window.devicePixelRatio || 1;

export function pointerPos(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

export function screenToWorld(state, screenX, screenY) {
  return { x: (screenX - state.panX) / state.zoom, y: (screenY - state.panY) / state.zoom };
}

export function worldToScreen(state, point) {
  return { x: point.x * state.zoom + state.panX, y: point.y * state.zoom + state.panY };
}

export function localToWorld(ruler, x, y) {
  const c = Math.cos(ruler.angle), s = Math.sin(ruler.angle);
  return { x: ruler.x + x * c - y * s, y: ruler.y + x * s + y * c };
}

export function worldToLocal(ruler, point) {
  const dx = point.x - ruler.x, dy = point.y - ruler.y;
  const c = Math.cos(ruler.angle), s = Math.sin(ruler.angle);
  return { x: dx * c + dy * s, y: -dx * s + dy * c };
}

export function localToScreen(state, ruler, x, y) {
  return worldToScreen(state, localToWorld(ruler, x, y));
}

export function drawGrid(ctx, canvas, body, state) {
  const dark = body.classList.contains("dark");
  const width = canvas.width / dpr();
  const height = canvas.height / dpr();
  const left = -state.panX / state.zoom;
  const top = -state.panY / state.zoom;
  const right = left + width / state.zoom;
  const bottom = top + height / state.zoom;
  const x0 = Math.floor(left / 30) * 30;
  const y0 = Math.floor(top / 30) * 30;

  ctx.fillStyle = dark ? "#171a20" : "#fff";
  ctx.fillRect(left, top, right - left, bottom - top);

  ctx.lineWidth = 1.5 / state.zoom;
  for (let x = x0; x <= right; x += 30) {
    const major = Math.round(x / 30) % 5 === 0;
    ctx.strokeStyle = dark
      ? (major ? "#3c4550" : "#2a3038")
      : (major ? "#c0d2ea" : "#e7edf4");
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  }

  for (let y = y0; y <= bottom; y += 30) {
    const major = Math.round(y / 30) % 5 === 0;
    ctx.strokeStyle = dark
      ? (major ? "#3c4550" : "#2a3038")
      : (major ? "#c0d2ea" : "#e7edf4");
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }
}

export function drawStrokes(ctx, body, strokes) {
  for (const stroke of strokes) {
    for (const part of stroke.parts) {
      if (part.length < 1) continue;
      ctx.beginPath();
      ctx.moveTo(part[0].x, part[0].y);
      for (let i = 1; i < part.length; i++) {
        ctx.lineTo(part[i].x, part[i].y);
      }

      const isStandard = stroke.color === "standard" || stroke.color === "#202124" || stroke.color === "#f5f5f5";
      ctx.strokeStyle = isStandard ? (body.classList.contains("dark") ? "#ffffff" : "#000000") : stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  }
}

export function drawScene(ctx, canvas, body, state) {
  const d = dpr();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(d * state.zoom, 0, 0, d * state.zoom, d * state.panX, d * state.panY);
  drawGrid(ctx, canvas, body, state);
  drawStrokes(ctx, body, state.strokes);
  drawRuler(ctx, body, state.ruler, state.zoom);
}

function drawRuler(ctx, body, ruler, zoom) {
  if (!ruler.visible) return;

  ctx.save();
  ctx.translate(ruler.x, ruler.y);
  ctx.rotate(ruler.angle);

  const mid = ruler.w / 2;
  const dark = body.classList.contains("dark");
  const zero = { x: ruler.w / 2, y: 0 };
  const radius = ruler.h * 0.65;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(ruler.w, 0);
  ctx.lineTo(mid, -ruler.h);
  ctx.closePath();
  ctx.fillStyle = dark ? "rgba(135,190,220,.19)" : "rgba(115,175,220,.22)";
  ctx.fill();
  ctx.strokeStyle = dark ? "rgba(190,220,245,.9)" : "rgba(45,95,135,.9)";
  ctx.lineWidth = 2 / zoom;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(mid, 0);
  ctx.lineTo(mid, -ruler.h);
  ctx.stroke();

  const cm = 60;
  const tickStep = cm / 10;
  const ticksLeft = Math.floor(mid / tickStep);
  const ticksRight = Math.floor((ruler.w - mid) / tickStep);

  for (let i = -ticksLeft; i <= ticksRight; i++) {
    const x = mid + i * tickStep;
    const absI = Math.abs(i);
    const isCm = absI % 10 === 0;
    const isHalfCm = absI % 5 === 0;
    const length = isCm ? 18 : (isHalfCm ? 12 : 7);

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, -length);
    ctx.stroke();

    if (isCm) {
      ctx.fillStyle = dark ? "#edf5ff" : "#263746";
      ctx.font = `${13 / zoom}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(String(absI / 10), x, -22);
    }
  }

  ctx.beginPath();
  ctx.arc(mid, 0, radius, Math.PI, 2 * Math.PI);
  ctx.stroke();

  for (let deg = -90; deg <= 90; deg++) {
    const angle = -Math.PI / 2 + deg * Math.PI / 180;
    const absDeg = Math.abs(deg);
    const major = absDeg % 10 === 0;
    const medium = absDeg % 5 === 0;
    const tickLength = major ? 14 : (medium ? 10 : 5);
    const innerRadius = radius - tickLength;

    ctx.beginPath();
    ctx.moveTo(mid + Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
    ctx.lineTo(mid + Math.cos(angle) * radius, Math.sin(angle) * radius);
    ctx.stroke();

    if (major && deg !== 0) {
      ctx.fillStyle = dark ? "#edf5ff" : "#263746";
      ctx.font = `${12 / zoom}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(absDeg), mid + Math.cos(angle) * (radius - 26), Math.sin(angle) * (radius - 26));
    }
  }

  ctx.beginPath();
  ctx.arc(zero.x, zero.y, 4 / zoom, 0, Math.PI * 2);
  ctx.fillStyle = "#e53935";
  ctx.fill();

  ctx.fillStyle = dark ? "#edf5ff" : "#263746";
  ctx.font = `${13 / zoom}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("0", zero.x, zero.y - 8 / zoom);

  const apex = { x: mid, y: -ruler.h };
  function cross(a, b) { return a.x * b.y - a.y * b.x; }

  function drawSlantedDegreeScale(side) {
    const end = side === "left" ? { x: 0, y: 0 } : { x: ruler.w, y: 0 };
    const edge = { x: end.x - apex.x, y: end.y - apex.y };
    const edgeLength = Math.hypot(edge.x, edge.y);
    const normal = {
      x: side === "left" ? -edge.y / edgeLength : edge.y / edgeLength,
      y: side === "left" ? edge.x / edgeLength : -edge.x / edgeLength
    };

    for (let deg = 0; deg <= 90; deg++) {
      const a = deg * Math.PI / 180;
      const direction = side === "left"
        ? { x: -Math.sin(a), y: -Math.cos(a) }
        : { x: Math.sin(a), y: -Math.cos(a) };

      const fromZeroToApex = { x: apex.x - zero.x, y: apex.y - zero.y };
      const denominator = cross(direction, edge);
      if (Math.abs(denominator) < 1e-9) continue;

      const t = cross(fromZeroToApex, direction) / denominator;
      if (t < -1e-6 || t > 1 + 1e-6) continue;

      const point = { x: apex.x + edge.x * t, y: apex.y + edge.y * t };
      const major = deg % 10 === 0;
      const medium = deg % 5 === 0;
      const length = major ? 14 : (medium ? 10 : 5);

      ctx.beginPath();
      ctx.moveTo(point.x - normal.x * length / 2, point.y - normal.y * length / 2);
      ctx.lineTo(point.x + normal.x * length / 2, point.y + normal.y * length / 2);
      ctx.stroke();

      if (major && deg > 0) {
        ctx.fillStyle = dark ? "#edf5ff" : "#263746";
        ctx.font = `${11 / zoom}px sans-serif`;
        ctx.textAlign = side === "left" ? "right" : "left";
        ctx.textBaseline = "middle";
        ctx.fillText(String(deg), point.x + normal.x * 17, point.y + normal.y * 17);
      }
    }
  }

  drawSlantedDegreeScale("left");
  drawSlantedDegreeScale("right");

  const handleRadius = 8 / zoom;
  for (const p of [{ x: ruler.w, y: 0 }, { x: mid, y: -ruler.h - 30 }]) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, handleRadius, 0, Math.PI * 2);
    ctx.fillStyle = dark ? "#d8e8ff" : "#fff";
    ctx.fill();
    ctx.strokeStyle = "#367fc1";
    ctx.lineWidth = 2 / zoom;
    ctx.stroke();
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

export function insideRuler(local, ruler) {
  if (local.x < 0 || local.x > ruler.w || local.y > 0) return false;
  const halfWidth = ruler.w / 2;
  const heightAtX = ruler.h * (1 - Math.abs(local.x - halfWidth) / halfWidth);
  return -local.y <= heightAtX;
}

export function distanceToSegment(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / len2)) : 0;
  const q = { x: a.x + t * dx, y: a.y + t * dy };
  return { distance: Math.hypot(point.x - q.x, point.y - q.y), point: q };
}

export function nearestRulerEdge(world, ruler, zoom) {
  const p = worldToLocal(ruler, world);
  const mid = ruler.w / 2;
  const edges = [
    [{ x: 0, y: 0 }, { x: ruler.w, y: 0 }],
    [{ x: 0, y: 0 }, { x: mid, y: -ruler.h }],
    [{ x: mid, y: -ruler.h }, { x: ruler.w, y: 0 }]
  ];

  let best = null;
  for (const [a, b] of edges) {
    const result = distanceToSegment(p, a, b);
    if (!best || result.distance < best.distance) best = result;
  }

  if (best && best.distance * zoom < 20) {
    return localToWorld(ruler, best.point.x, best.point.y);
  }
  return null;
}

export function snapPoint(world, ruler, zoom) {
  return ruler.visible ? (nearestRulerEdge(world, ruler, zoom) || world) : world;
}

export function eraseAt(world, strokes, mode, zoom) {
  const radius = 13 / zoom;

  if (mode === "whole") {
    return strokes.filter(stroke => !stroke.parts.some(part => part.some(p => Math.hypot(p.x - world.x, p.y - world.y) < radius)));
  }

  const updated = [];
  for (const stroke of strokes) {
    const newParts = [];
    for (const part of stroke.parts) {
      let current = [];
      for (const p of part) {
        if (Math.hypot(p.x - world.x, p.y - world.y) < radius) {
          if (current.length) newParts.push(current);
          current = [];
        } else {
          current.push(p);
        }
      }
      if (current.length) newParts.push(current);
    }

    stroke.parts = newParts;
    if (newParts.length) updated.push(stroke);
  }

  return updated;
}
