let firstSaveTimestamp = null;

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatSaveTimestamp(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("-") + "-" + [
    pad(date.getHours()),
    pad(date.getMinutes())
  ].join("");
}

function getDefaultDrawingFilename() {
  if (!firstSaveTimestamp) {
    firstSaveTimestamp = new Date();
  }

  return `Zeichnung-${formatSaveTimestamp(firstSaveTimestamp)}.json`;
}

export function loadDrawingFromFile(file) {
  return file.text().then(raw => {
    const data = JSON.parse(raw);

    if (
      data.format !== "geometrie-canvas" ||
      !Array.isArray(data.strokes) ||
      !data.ruler ||
      !data.view
    ) {
      throw new Error("Das ist keine gültige Zeichnungsdatei.");
    }

    const isNumber = value => typeof value === "number" && Number.isFinite(value);
    const validStrokes = data.strokes.every(stroke =>
      stroke &&
      typeof stroke.color === "string" &&
      isNumber(stroke.width) &&
      stroke.width > 0 &&
      Array.isArray(stroke.parts) &&
      stroke.parts.every(part =>
        Array.isArray(part) &&
        part.every(point => point && isNumber(point.x) && isNumber(point.y))
      )
    );

    const validRuler =
      isNumber(data.ruler.x) &&
      isNumber(data.ruler.y) &&
      isNumber(data.ruler.w) &&
      isNumber(data.ruler.h) &&
      isNumber(data.ruler.angle) &&
      typeof data.ruler.visible === "boolean";

    const validView =
      isNumber(data.view.zoom) &&
      data.view.zoom > 0 &&
      isNumber(data.view.panX) &&
      isNumber(data.view.panY);

    if (!validStrokes || !validRuler || !validView) {
      throw new Error("Die Zeichnungsdatei enthält ungültige Daten.");
    }

    return {
      strokes: data.strokes,
      ruler: data.ruler,
      zoom: Math.max(0.15, Math.min(4, data.view.zoom)),
      panX: data.view.panX,
      panY: data.view.panY
    };
  });
}

export async function saveDrawingToFile(state) {
  const data = {
    format: "geometrie-canvas",
    version: 1,
    strokes: state.strokes,
    ruler: state.ruler,
    view: { zoom: state.zoom, panX: state.panX, panY: state.panY }
  };

  const json = JSON.stringify(data, null, 2);
  const suggestedName = getDefaultDrawingFilename();

  if (typeof window.showSaveFilePicker === "function") {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{
          description: "Geometrie-Zeichnung",
          accept: { "application/json": [".json"] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
      console.warn("Dateiauswahldialog nicht verfügbar; starte Download.", error);
    }
  }

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = suggestedName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
