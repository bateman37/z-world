"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  FogMaskProjection,
  MapEntitiesProjectionV2,
  MovementProjection,
  PersonCardProjection,
  VisibilityState,
  WorldPoint,
} from "@z-world/contracts";

/**
 * Mapa Canvas 2D jugable del runtime V2 (S3 §5.9): pan/zoom, selección y
 * órdenes de movimiento con ratón sobre el pueblo semántico generado por
 * S2, niebla y descubrimiento reales. Adaptado de `map-canvas.tsx` de
 * WEB-001 (mismo modelo de cámara y de interacción) para dibujar lugares,
 * edificios, estancias y aberturas en vez de estructuras planas. El Canvas
 * nunca decide reglas: solo representa proyecciones ya filtradas y emite
 * comandos (§5.9: "no conviertas el Canvas en autoridad de reglas").
 */

const MIN_PIXELS_PER_METER = 0.3;
const MAX_PIXELS_PER_METER = 10;
const DEFAULT_PIXELS_PER_METER = 3;

const TERRAIN_COLORS: Record<string, string> = {
  open_ground: "#3c4a3a",
  dense_vegetation: "#264d2c",
  water: "#25506b",
  obstacle: "#4a3f38",
};

const LINE_COLORS: Record<string, string> = {
  road: "#8b8168",
  watercourse: "#3c7ba0",
};

/** Colores de cobertura removible (S10, WLD-010 §3.2 capa 2): "none" no añade tinte propio sobre el color base del terreno. */
const COVERAGE_TINTS: Record<string, string> = {
  vegetation: "rgba(38, 77, 44, 0.55)",
  debris: "rgba(122, 92, 58, 0.55)",
};

/** Colores de estado de vía (S10, WLD-010 §3.7). */
const WAY_STATE_COLORS: Record<string, string> = {
  transitable: "#8b8168",
  cleared: "#a8a084",
  obstructed: "#c98a3d",
  function_removed: "#3c4a3a",
};

/** Colores de estado de parcela de cultivo (S10, SET-011 §3.1). */
const CULTIVATION_STATE_COLORS: Record<string, string> = {
  unprepared: "rgba(90, 74, 47, 0.35)",
  cleared: "rgba(120, 110, 80, 0.4)",
  prepared: "rgba(150, 120, 70, 0.5)",
  sown: "rgba(120, 140, 70, 0.55)",
  growing: "rgba(90, 150, 60, 0.6)",
  harvestable: "rgba(210, 180, 60, 0.7)",
  harvested: "rgba(110, 100, 70, 0.4)",
};

interface Camera {
  readonly centerX: number;
  readonly centerY: number;
  readonly pixelsPerMeter: number;
}

function worldToScreen(point: WorldPoint, camera: Camera, viewportWidth: number, viewportHeight: number): { x: number; y: number } {
  return {
    x: viewportWidth / 2 + (point.x - camera.centerX) * camera.pixelsPerMeter,
    y: viewportHeight / 2 + (point.y - camera.centerY) * camera.pixelsPerMeter,
  };
}

function screenToWorld(screenX: number, screenY: number, camera: Camera, viewportWidth: number, viewportHeight: number): WorldPoint {
  return {
    x: camera.centerX + (screenX - viewportWidth / 2) / camera.pixelsPerMeter,
    y: camera.centerY + (screenY - viewportHeight / 2) / camera.pixelsPerMeter,
  };
}

export interface ContextAction {
  readonly screenX: number;
  readonly screenY: number;
  readonly worldPoint: WorldPoint;
}

export function VillageMapCanvas({
  mapEntities,
  fog,
  movements,
  personCards,
  selectedPersonId,
  onSelectPerson,
  onOrderMove,
  centerOnPersonRequestId,
}: {
  readonly mapEntities: MapEntitiesProjectionV2;
  readonly fog: FogMaskProjection;
  readonly movements: readonly MovementProjection[];
  readonly personCards: readonly PersonCardProjection[];
  readonly selectedPersonId: string | null;
  readonly onSelectPerson: (personId: string | null) => void;
  readonly onOrderMove: (personId: string, destination: WorldPoint) => void;
  readonly centerOnPersonRequestId: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState({ width: 800, height: 600 });
  const [camera, setCamera] = useState<Camera>(() => {
    const firstPerson = mapEntities.people[0];
    return {
      centerX: firstPerson?.position.x ?? 0,
      centerY: firstPerson?.position.y ?? 0,
      pixelsPerMeter: DEFAULT_PIXELS_PER_METER,
    };
  });
  const [contextAction, setContextAction] = useState<ContextAction | null>(null);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setViewport({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (centerOnPersonRequestId === 0) return;
    if (!selectedPersonId) return;
    const person = mapEntities.people.find((p) => p.personId === selectedPersonId);
    if (!person) return;
    setCamera((prev) => ({ ...prev, centerX: person.position.x, centerY: person.position.y }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerOnPersonRequestId]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(viewport.width * dpr);
    canvas.height = Math.round(viewport.height * dpr);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = "#0d1012";
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    const toScreen = (p: WorldPoint) => worldToScreen(p, camera, viewport.width, viewport.height);

    for (const area of mapEntities.areas) {
      ctx.beginPath();
      area.polygon.forEach((point, index) => {
        const s = toScreen(point);
        if (index === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      ctx.closePath();
      ctx.fillStyle = TERRAIN_COLORS[area.kind] ?? "#333";
      ctx.fill();
      // S10: la cobertura removible (matorral/escombros sin despejar) se pinta encima del terreno de base.
      const tint = COVERAGE_TINTS[area.coverage];
      if (tint) {
        ctx.fillStyle = tint;
        ctx.fill();
      }
    }

    // S10: parcelas de cultivo, siempre visibles como terreno de fondo (SET-011 §3.1); nunca revela cultivo/rendimiento aquí.
    for (const plot of mapEntities.cultivationPlots) {
      ctx.beginPath();
      plot.polygon.forEach((point, index) => {
        const s = toScreen(point);
        if (index === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      ctx.closePath();
      ctx.fillStyle = CULTIVATION_STATE_COLORS[plot.state] ?? "rgba(150, 120, 70, 0.4)";
      ctx.fill();
      ctx.strokeStyle = "rgba(210, 180, 60, 0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (const line of mapEntities.lines) {
      ctx.beginPath();
      line.polyline.forEach((point, index) => {
        const s = toScreen(point);
        if (index === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      // S10: una vía obstruida se pinta distinta (más lenta, no cerrada); una sin función deja de pintarse como vía.
      ctx.strokeStyle = (line.kind === "road" && line.wayState ? WAY_STATE_COLORS[line.wayState] : undefined) ?? LINE_COLORS[line.kind] ?? "#999";
      ctx.lineWidth = Math.max(1, line.widthMeters * camera.pixelsPerMeter);
      ctx.setLineDash(line.wayState === "obstructed" ? [6, 4] : []);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // S10: barreras entre anclajes (WLD-010 §3.6): sólida si está construida, discontinua si solo está planificada.
    for (const segment of mapEntities.barrierSegments) {
      const from = toScreen(segment.from);
      const to = toScreen(segment.to);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = segment.built ? "#c9a45c" : "rgba(201, 164, 92, 0.5)";
      ctx.lineWidth = segment.built ? 3 : 2;
      ctx.setLineDash(segment.built ? [] : [5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      if (segment.crossesWay) {
        const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
        ctx.beginPath();
        ctx.arc(mid.x, mid.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = segment.wayCrossingMode === "full_block" ? "#e0605a" : "#7fb3ff";
        ctx.fill();
      }
    }

    for (const building of mapEntities.buildings) {
      ctx.beginPath();
      building.footprint.forEach((point, index) => {
        const s = toScreen(point);
        if (index === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      ctx.closePath();
      // S9: un edificio demolido se dibuja como escombros; uno desmantelado, como solar despejado.
      ctx.fillStyle = building.terminal === "demolished" ? "#4a4541" : building.terminal === "dismantled" ? "#3a3d33" : "#5a4a2f";
      ctx.fill();
      ctx.strokeStyle = building.terminal ? "rgba(160, 150, 140, 0.6)" : "#c9a45c";
      ctx.lineWidth = building.terminal ? 1 : 2;
      if (building.terminal) ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const room of mapEntities.rooms) {
      ctx.beginPath();
      room.polygon.forEach((point, index) => {
        const s = toScreen(point);
        if (index === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      ctx.closePath();
      ctx.strokeStyle = "rgba(201, 164, 92, 0.7)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (const place of mapEntities.places) {
      const s = toScreen(place.position);
      ctx.beginPath();
      ctx.arc(s.x, s.y, place.knowledge === "observed" ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = place.knowledge === "observed" ? "#c9a45c" : "rgba(201, 164, 92, 0.4)";
      ctx.fill();
    }

    for (const opening of mapEntities.openings) {
      const s = toScreen(opening.position);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
      // S9: un acceso bloqueado, barricado o tapiado se ve en rojo (no transitable).
      ctx.fillStyle = opening.passable === false ? "#e0605a" : "#7fb3ff";
      ctx.fill();
    }

    for (const movement of movements) {
      if (movement.path.length < 2) continue;
      ctx.beginPath();
      movement.path.forEach((point, index) => {
        const s = toScreen(point);
        if (index === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      ctx.strokeStyle = "rgba(127, 179, 255, 0.6)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const person of mapEntities.people) {
      const s = toScreen(person.position);
      const isSelected = person.personId === selectedPersonId;
      ctx.beginPath();
      ctx.arc(s.x, s.y, isSelected ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = person.indoors ? "#f0d98c" : isSelected ? "#6fc79a" : "#e7ebee";
      ctx.fill();
      if (isSelected) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#7fb3ff";
        ctx.stroke();
      }
      const card = personCards.find((c) => c.personId === person.personId);
      if (card) {
        ctx.fillStyle = "#e7ebee";
        ctx.font = "11px system-ui, sans-serif";
        ctx.fillText(card.firstName, s.x + 8, s.y + 4);
      }
    }

    drawFog(ctx, fog, camera, viewport);

    if (contextAction) {
      ctx.beginPath();
      ctx.arc(contextAction.screenX, contextAction.screenY, 6, 0, Math.PI * 2);
      ctx.strokeStyle = "#7fb3ff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [mapEntities, fog, movements, personCards, selectedPersonId, camera, viewport, contextAction]);

  useEffect(() => {
    draw();
  }, [draw]);

  function handleWheel(event: React.WheelEvent<HTMLCanvasElement>) {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const worldUnderCursor = screenToWorld(cursorX, cursorY, camera, viewport.width, viewport.height);

    const zoomFactor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
    const nextPixelsPerMeter = Math.min(MAX_PIXELS_PER_METER, Math.max(MIN_PIXELS_PER_METER, camera.pixelsPerMeter * zoomFactor));

    const nextCamera: Camera = { ...camera, pixelsPerMeter: nextPixelsPerMeter };
    const worldUnderCursorAfter = screenToWorld(cursorX, cursorY, nextCamera, viewport.width, viewport.height);
    setCamera({
      pixelsPerMeter: nextPixelsPerMeter,
      centerX: nextCamera.centerX + (worldUnderCursor.x - worldUnderCursorAfter.x),
      centerY: nextCamera.centerY + (worldUnderCursor.y - worldUnderCursorAfter.y),
    });
  }

  function handleMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
    setContextAction(null);
    if (event.button === 1) {
      event.preventDefault();
      isPanningRef.current = true;
      lastPanPointRef.current = { x: event.clientX, y: event.clientY };
      return;
    }
    if (event.button === 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickWorld = screenToWorld(event.clientX - rect.left, event.clientY - rect.top, camera, viewport.width, viewport.height);
      const nearest = findNearestPerson(mapEntities.people, clickWorld, camera.pixelsPerMeter);
      onSelectPerson(nearest);
    }
  }

  function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
    if (isPanningRef.current) {
      const dx = event.clientX - lastPanPointRef.current.x;
      const dy = event.clientY - lastPanPointRef.current.y;
      lastPanPointRef.current = { x: event.clientX, y: event.clientY };
      setCamera((prev) => ({
        ...prev,
        centerX: prev.centerX - dx / prev.pixelsPerMeter,
        centerY: prev.centerY - dy / prev.pixelsPerMeter,
      }));
    }
  }

  function handleMouseUp() {
    isPanningRef.current = false;
  }

  function handleContextMenu(event: React.MouseEvent<HTMLCanvasElement>) {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const worldPoint = screenToWorld(screenX, screenY, camera, viewport.width, viewport.height);
    setContextAction({ screenX, screenY, worldPoint });
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        role="application"
        aria-label="Mapa del pueblo"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        style={{ display: "block", width: "100%", height: "100%", cursor: isPanningRef.current ? "grabbing" : "default" }}
      />
      {contextAction && (
        <div className="z-panel" style={{ position: "absolute", left: contextAction.screenX + 8, top: contextAction.screenY + 8, padding: 6, zIndex: 10 }}>
          <button
            onClick={() => {
              if (selectedPersonId) {
                onOrderMove(selectedPersonId, contextAction.worldPoint);
              }
              setContextAction(null);
            }}
            disabled={!selectedPersonId}
          >
            Moverse aquí
          </button>
          <button onClick={() => setContextAction(null)} style={{ marginLeft: 4 }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

function findNearestPerson(
  people: MapEntitiesProjectionV2["people"],
  worldPoint: WorldPoint,
  pixelsPerMeter: number,
): string | null {
  const maxDistanceMeters = 12 / pixelsPerMeter;
  let closestId: string | null = null;
  let closestDistance = Infinity;
  for (const person of people) {
    const distance = Math.hypot(person.position.x - worldPoint.x, person.position.y - worldPoint.y);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestId = person.personId;
    }
  }
  return closestDistance <= maxDistanceMeters ? closestId : null;
}

function drawFog(ctx: CanvasRenderingContext2D, fog: FogMaskProjection, camera: Camera, viewport: { width: number; height: number }): void {
  const cellScreenSize = fog.resolutionMeters * camera.pixelsPerMeter;
  const topLeft = screenToWorld(0, 0, camera, viewport.width, viewport.height);
  const bottomRight = screenToWorld(viewport.width, viewport.height, camera, viewport.width, viewport.height);
  const colStart = Math.max(0, Math.floor((topLeft.x - fog.originX) / fog.resolutionMeters));
  const colEnd = Math.min(fog.columns - 1, Math.ceil((bottomRight.x - fog.originX) / fog.resolutionMeters));
  const rowStart = Math.max(0, Math.floor((topLeft.y - fog.originY) / fog.resolutionMeters));
  const rowEnd = Math.min(fog.rows - 1, Math.ceil((bottomRight.y - fog.originY) / fog.resolutionMeters));

  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      const state: VisibilityState = fog.cells[row * fog.columns + col] ?? "hidden";
      if (state === "observable") continue;
      const worldX = fog.originX + col * fog.resolutionMeters;
      const worldY = fog.originY + row * fog.resolutionMeters;
      const screen = worldToScreen({ x: worldX, y: worldY }, camera, viewport.width, viewport.height);
      ctx.fillStyle = state === "hidden" ? "rgba(5, 6, 7, 0.92)" : "rgba(5, 6, 7, 0.55)";
      ctx.fillRect(screen.x, screen.y, cellScreenSize + 1, cellScreenSize + 1);
    }
  }
}
