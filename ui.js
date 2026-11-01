export function bindUI({ canvas, body, state, onRedraw }) {
  const toolButtons = document.querySelectorAll("[data-tool]");
  const swatches = document.querySelectorAll(".color-swatch");
  const thickness = document.querySelector("#thickness");
  const eraseMode = document.querySelector("#eraseMode");
  const penColor = document.querySelector("#penColor");
  const rulerButton = document.querySelector("#rulerButton");
  const themeButton = document.querySelector("#themeButton");
  const saveButton = document.querySelector("#saveButton");
  const loadButton = document.querySelector("#loadButton");
  const loadFile = document.querySelector("#loadFile");
  const clearButton = document.querySelector("#clearButton");

  toolButtons.forEach(button => {
    button.addEventListener("click", () => {
      state.tool = button.dataset.tool;
      toolButtons.forEach(b => b.classList.toggle("active", b === button));
      onRedraw();
    });
  });

  swatches.forEach(button => {
    button.addEventListener("click", () => {
      state.penColor = button.dataset.color;
      penColor.value = state.penColor;
      swatches.forEach(swatch => swatch.classList.toggle("active", swatch === button));
      onRedraw();
    });
  });

  thickness.addEventListener("change", () => {
    state.thickness = thickness.value;
    onRedraw();
  });

  eraseMode.addEventListener("change", () => {
    state.eraseMode = eraseMode.value;
    onRedraw();
  });

  rulerButton.addEventListener("click", () => {
    state.ruler.visible = !state.ruler.visible;
    rulerButton.classList.toggle("active", state.ruler.visible);
    onRedraw();
  });

  themeButton.addEventListener("click", () => {
    body.classList.toggle("dark");
    const icon = body.classList.contains("dark") ? "sun" : "moon";
    themeButton.innerHTML = `<i data-lucide="${icon}"></i>`;
    lucide.createIcons();
    onRedraw();
  });

  saveButton.addEventListener("click", async () => {
    const { saveDrawingToFile } = await import("./storage.js");
    await saveDrawingToFile(state);
  });

  loadButton.addEventListener("click", () => {
    loadFile.click();
  });

  loadFile.addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { loadDrawingFromFile } = await import("./storage.js");
      const loaded = await loadDrawingFromFile(file);
      Object.assign(state, loaded);
      onRedraw();
    } catch (error) {
      alert("Die Zeichnung konnte nicht geladen werden: " + error.message);
    } finally {
      event.target.value = "";
    }
  });

  clearButton.addEventListener("click", () => {
    state.strokes = [];
    onRedraw();
  });

  canvas.addEventListener("wheel", event => {
    event.preventDefault();
    const p = canvas.getBoundingClientRect();
    const screenX = event.clientX - p.left;
    const screenY = event.clientY - p.top;
    const before = {
      x: (screenX - state.panX) / state.zoom,
      y: (screenY - state.panY) / state.zoom
    };

    state.zoom = Math.max(0.15, Math.min(4, state.zoom * (event.deltaY < 0 ? 1.1 : 0.9)));
    state.panX = screenX - before.x * state.zoom;
    state.panY = screenY - before.y * state.zoom;
    onRedraw();
  }, { passive: false });
}

export function syncControls(state) {
  const thickness = document.querySelector("#thickness");
  const penColor = document.querySelector("#penColor");
  const rulerButton = document.querySelector("#rulerButton");

  if (thickness) thickness.value = state.thickness;
  if (penColor) penColor.value = state.penColor;
  if (rulerButton) rulerButton.classList.toggle("active", state.ruler.visible);

  document.querySelectorAll(".color-swatch").forEach(swatch => {
    swatch.classList.toggle("active", swatch.dataset.color === state.penColor);
  });

  document.querySelectorAll("[data-tool]").forEach(button => {
    button.classList.toggle("active", button.dataset.tool === state.tool);
  });
}
