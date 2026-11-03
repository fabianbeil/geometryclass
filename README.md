# Geometry Class
Geometry Class is a WebApp to simulate simple construction in German math classes. Its goal is to provide a UI that resembles as closely as possible what students actually have to draw on their paper.
## Installation

Lade `index.html` und `style.css` gemeinsam herunter und öffne `index.html` in einem Browser. Die beiden Dateien müssen im selben Ordner liegen.

## Bedienungsanleitung

### Zeichnen und Ansicht

- Wähle den **Stift** und ziehe mit gedrückter Maustaste über die Zeichenfläche.
- Stelle über **Strich** die Strichstärke ein. Die Farbfelder wählen die Stiftfarbe; **Standard** ist im hellen Design schwarz und im dunklen Design weiß.
- Mit dem **Radierer** löschst du gezeichnete Linien. Über **Radieren** wechselst du zwischen dem Löschen ganzer Linien und dem Löschen einzelner Bereiche.
- Mit dem Mausrad zoomst du an der Zeigerposition. Zum Verschieben wählst du das **Hand-Werkzeug** oder hältst die mittlere Maustaste gedrückt.
- **Rückgängig** und **Wiederherstellen** stehen über die Toolbar sowie mit `Strg+Z`, `Strg+Y` und `Strg+Umschalt+Z` zur Verfügung. Der Verlauf umfasst bis zu 100 Schritte.

### Geodreieck

Klicke auf die Geodreieck-Schaltfläche, um das Werkzeug ein- oder auszublenden. Ziehe es innerhalb der Fläche an eine andere Stelle. Am rechten Eck lässt es sich skalieren; der Griff über der Spitze dreht es.

Beginne einen Strich nahe einer Kante, um ihn an dieser Kante entlangzuführen. Solange die Maustaste gedrückt ist, bleibt der Strich an der gewählten Kante.

Ein Klick auf den Halbkreis mit der Winkelskala erzeugt eine Vorschau-Linie vom Drehpunkt bis zur passenden schrägen Kante. Bewege die Maus bei gedrückter Taste, um den Winkel zu ändern. Beim Loslassen wird die Linie übernommen; sie steht etwa 3 mm über die Kante hinaus.

### Zirkel

Klicke auf die Zirkel-Schaltfläche, um den Zirkel ein- oder auszublenden.

- Ziehe die **Einstichspitze**, um den Zirkel zu versetzen.
- Ziehe die **Mine**, um Öffnung und Richtung einzustellen.
- Ziehe den violetten **Drehknopf am Arm**, um den Zirkel zu drehen, ohne zu zeichnen. Ein einfacher Klick dreht ihn um 15°.
- Ziehe den **Zeichengriff am Gelenk** mit gedrückter Maustaste, um einen Kreisbogen zu zeichnen. Der Bogen folgt der Mausbewegung; Einstichpunkt und Radius bleiben dabei unverändert.

### Speichern, Laden und Exportieren

- **Speichern** legt die Zeichnung als JSON-Datei ab; **Laden** öffnet eine zuvor gespeicherte JSON-Zeichnung.
- **SVG exportieren** erstellt eine Vektordatei mit Raster und gezeichneten Linien im aktuellen sichtbaren Ausschnitt.
- **SVG mit Geodreieck und Zirkel exportieren** fügt zusätzlich die aktuell sichtbaren Werkzeuge samt Skalen hinzu.
- **Alles löschen** entfernt die gezeichneten Linien. Dieser Schritt lässt sich rückgängig machen.
- Über die **Theme-Schaltfläche** wechselst du zwischen hellem und dunklem Design.

## AI Usage

This entire thing is vibe coded. Don't use if you don't like that.
