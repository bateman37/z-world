"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SimulationStateV2, WorldPoint } from "@z-world/contracts";

const MIN_PIXELS_PER_METER = 0.15;
const MAX_PIXELS_PER_METER = 6;

const TERRAIN_COLORS: Record<string, string> = {
  open_ground: "#3c4a3a",
  dense_vegetation: "#264d2c",
  water: "#25506b",
  obstacle: "#4a3f38",
};
const LINE_COLORS: Record<string, string> = { road: "#8b8168", watercourse: "#3c7ba0" };
const PLACE_COLORS: Record<string, string> = {
  "RES-10": "#9c7b4f",
  "RES-17": "#7c6a45",
  "COM-02": "#5c8ca6",
  "TAL-01": "#a65c5c",
  "ENV-01": "#3c7ba0",
  "ENV-02": "#7a935e",
  "ENV-03": "#2f5c33",
  "ENV-04": "#8b8168",
};

interface Camera {
  readonly centerX: number;
  readonly centerY: number;
  readonly pixelsPerMeter: number;
}

function worldToScreen(point: WorldPoint, camera: Camera, w: number, h: number) {
  return { x: w / 2 + (point.x - camera.centerX) * camera.pixelsPerMeter, y: h / 2 + (point.y - camera.centerY) * camera.pixelsPerMeter };
}

/**
 * Visor Canvas de solo lectura del mundo semántico V2 (S2 de WEB-002):
 * demuestra que el mapa puede consumir directamente `SimulationStateV2`
 * (terreno, vías, lugares/edificios, protagonistas), sin implementar
 * todavía interacción, movimiento ni explotación (eso llega con el motor
 * de resolución de S4 en adelante).
 */
export function VillageMapCanvas({ state }: { readonly state: SimulationStateV2 }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState({ width: 800, height: 600 });
  const [camera, setCamera] = useState<Camera>({ centerX: state.world.arrivalPoint.x, centerY: state.world.arrivalPoint.y, pixelsPerMeter: 1.2 });
  const isPanningRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });

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

    for (const area of Object.values(state.world.terrainAreas)) {
      ctx.beginPath();
      area.polygon.forEach((point, index) => {
        const s = toScreen(point);
        if (index === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      ctx.closePath();
      ctx.fillStyle = TERRAIN_COLORS[area.kind] ?? "#333";
      ctx.fill();
    }

    for (const line of Object.values(state.world.linearFeatures)) {
      ctx.beginPath();
      line.polyline.forEach((point, index) => {
        const s = toScreen(point);
        if (index === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      ctx.strokeStyle = line.wayState === "obstructed" ? "#7a3b3b" : LINE_COLORS[line.kind] ?? "#999";
      ctx.lineWidth = Math.max(1, line.widthMeters * camera.pixelsPerMeter);
      ctx.stroke();
    }

    for (const building of Object.values(state.world.buildings)) {
      const place = state.world.places[building.placeId];
      ctx.beginPath();
      building.footprint.forEach((point, index) => {
        const s = toScreen(point);
        if (index === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      ctx.closePath();
      ctx.fillStyle = place ? (PLACE_COLORS[place.profileId] ?? "#5a4a2f") : "#4a4a4a";
      ctx.globalAlpha = building.interiorGenerated ? 1 : 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    for (const node of Object.values(state.world.nodes)) {
      const s = toScreen(node.position);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#7fd0ff";
      ctx.fill();
    }

    const arrival = toScreen(state.world.arrivalPoint);
    ctx.beginPath();
    ctx.arc(arrival.x, arrival.y, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffd27f";
    ctx.lineWidth = 2;
    ctx.stroke();

    for (const person of Object.values(state.people)) {
      const s = toScreen(person.public.position);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#e7ebee";
      ctx.fill();
    }
  }, [state, camera, viewport]);

  useEffect(() => draw(), [draw]);

  function handleWheel(event: React.WheelEvent<HTMLCanvasElement>) {
    event.preventDefault();
    const zoomFactor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
    setCamera((prev) => ({ ...prev, pixelsPerMeter: Math.min(MAX_PIXELS_PER_METER, Math.max(MIN_PIXELS_PER_METER, prev.pixelsPerMeter * zoomFactor)) }));
  }
  function handleMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
    isPanningRef.current = true;
    lastPanRef.current = { x: event.clientX, y: event.clientY };
  }
  function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!isPanningRef.current) return;
    const dx = event.clientX - lastPanRef.current.x;
    const dy = event.clientY - lastPanRef.current.y;
    lastPanRef.current = { x: event.clientX, y: event.clientY };
    setCamera((prev) => ({ ...prev, centerX: prev.centerX - dx / prev.pixelsPerMeter, centerY: prev.centerY - dy / prev.pixelsPerMeter }));
  }
  function handleMouseUp() {
    isPanningRef.current = false;
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Mapa del pueblo generado"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ display: "block", width: "100%", height: "100%", cursor: isPanningRef.current ? "grabbing" : "grab" }}
      />
    </div>
  );
}
