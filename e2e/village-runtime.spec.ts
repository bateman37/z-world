import { test, expect } from "@playwright/test";

/**
 * Recorrido E2E del runtime jugable V2 (S3 de WEB-002 §9): reloj/pausa/
 * velocidades, selección, movimiento válido con ruta real, cancelación,
 * bloqueo por destino oculto, niebla causada por la posición real (no la
 * cámara), entrada a un edificio accesible atravesando una abertura
 * conocida, guardado/recarga sin regenerar ni perder el avance.
 *
 * Semilla fija "probe-seed-92": verificada de antemano (fuera de este
 * archivo) para que el punto de llegada tenga un edificio con interior
 * real a ~16 m — dentro del radio de niebla inicial de 25 m — con al
 * menos una estancia y una abertura exterior conocida, de modo que el
 * paso 9 (entrar en un edificio) sea estable para esta semilla concreta,
 * tal como permite el encargo. Las coordenadas de mundo usadas abajo
 * (destino de movimiento simple, punto oculto, punto dentro de la
 * estancia) se calcularon respecto al punto de llegada real de esa
 * semilla, (13, 36).
 */
const SEED = "probe-seed-92";

test("runtime V2 (S3): reloj, movimiento, cancelación, niebla, descubrimiento y entrada a un edificio", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/Semilla/).fill(SEED);
  await page.getByRole("button", { name: "Generar pueblo" }).click();
  await page.waitForURL(/\/village\//, { timeout: 20_000 });

  // 1-3: Día 1, 17:30, seis protagonistas, mapa interactivo.
  const personButtons = page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button");
  await expect(personButtons).toHaveCount(6, { timeout: 20_000 });
  await expect(page.getByText(/Día 1 · 17:30/)).toBeVisible();
  const canvas = page.getByRole("application", { name: "Mapa del pueblo" });
  await expect(canvas).toBeVisible();

  // 4: velocidades y pausa (se vuelve a pausa explícitamente para poder
  // observar a continuación el estado "Desplazándose" sin que la
  // aceleración temporal complete el trayecto corto en un único tick).
  await page.getByRole("button", { name: "×2" }).click();
  await expect(page.getByRole("button", { name: "×2" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Pausa", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pausa", exact: true })).toHaveAttribute("aria-pressed", "true");

  // 5: seleccionar una persona.
  await personButtons.first().click();
  await expect(page.getByRole("complementary", { name: "Ficha de persona" })).toBeVisible();

  const box = await canvas.boundingBox();
  if (!box) throw new Error("No se pudo medir el Canvas del mapa.");
  const centerX = box.width / 2;
  const centerY = box.height / 2;
  const pixelsPerMeter = 3; // DEFAULT_PIXELS_PER_METER de village-map-canvas.tsx

  // 6-7: orden de movimiento válida a un punto exterior conocido (dentro
  // del radio inicial de niebla). En pausa, el estado "Desplazándose" y la
  // ruta calculada quedan estables para poder comprobarlos.
  await canvas.click({ button: "right", position: { x: centerX + 5 * pixelsPerMeter, y: centerY + 5 * pixelsPerMeter } });
  await page.getByRole("button", { name: "Moverse aquí" }).click();
  await expect(page.getByText(/Orden de movimiento aceptada|Movimiento iniciado/).first()).toBeVisible({ timeout: 10_000 });
  await expect(personButtons.first()).toContainText("Desplazándose");
  // Deja que el guardado automático de esta orden se asiente antes de la
  // siguiente acción causal: dos guardados solapados competirían por la
  // misma revisión esperada (el mismo comportamiento que V1 ya tenía).
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 10_000 });

  // 9: cancelar la orden durante el trayecto.
  await page.getByRole("button", { name: "Cancelar orden de movimiento" }).click();
  await expect(page.getByText(/Movimiento cancelado/).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 10_000 });

  // 10: bloqueo coherente — destino muy lejano, todavía oculto por niebla.
  await canvas.click({ button: "right", position: { x: centerX + 100 * pixelsPerMeter, y: centerY } });
  await page.getByRole("button", { name: "Moverse aquí" }).click();
  await expect(page.getByText(/Orden de movimiento rechazada/).first()).toBeVisible({ timeout: 10_000 });

  // 14: entrar en un edificio accesible atravesando una abertura conocida.
  // Punto dentro de la estancia real de la semilla verificada (offset
  // respecto al punto de llegada, ver cabecera del archivo). Se reanuda el
  // reloj para que el trayecto progrese de verdad.
  await page.getByRole("button", { name: "×2" }).click();
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 10_000 });
  const dxToRoom = -0.37 - 13;
  const dyToRoom = 20.44 - 36;
  await canvas.click({ button: "right", position: { x: centerX + dxToRoom * pixelsPerMeter, y: centerY + dyToRoom * pixelsPerMeter } });
  await page.getByRole("button", { name: "Moverse aquí" }).click();
  await expect(page.getByText(/Entró en una estancia/).first()).toBeVisible({ timeout: 15_000 });

  // 15: guardar, recargar y conservar el avance (el reloj ya no marca la
  // hora de llegada exacta: el tiempo simulado avanzó de verdad). Entrar
  // en la estancia ya disparó un guardado automático (`room_entered` es un
  // evento que provoca snapshot); solo hace falta esperar a que se asiente.
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 15_000 });

  const villageUrl = page.url();
  await page.reload();
  await expect(personButtons).toHaveCount(6, { timeout: 20_000 });
  expect(page.url()).toBe(villageUrl);
  await expect(page.getByText(/Día 1 · 17:30/)).not.toBeVisible();

  // Ninguna entidad no descubierta se filtra como texto identificable en
  // la interfaz (el mapa es Canvas puro; los perfiles de CAT-004 solo
  // aparecían como texto en el antiguo visor de solo lectura de S2). Desde
  // S9, la ficha «Edificios» nombra los edificios que la comunidad ya ha
  // observado —aquí, la vivienda en la que se acaba de entrar— y solo esos:
  // el supermercado y el taller, sin descubrir, no aparecen en ningún sitio.
  for (const label of ["Supermercado pequeño", "Taller mecánico"]) {
    await expect(page.getByText(label)).toHaveCount(0);
  }
  const knownBuildings = page.getByRole("region", { name: "Edificios conocidos" });
  const houseMentions = await page.getByText("Casa familiar mediana").count();
  expect(await knownBuildings.getByText("Casa familiar mediana").count()).toBe(houseMentions);
});
