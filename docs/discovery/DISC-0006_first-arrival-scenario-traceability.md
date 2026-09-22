---
id: DISC-0006
title: Trazabilidad del primer escenario de llegada
status: draft
canonical_for: []
depends_on: []
related:
  - SCN-001
  - SCN-002
  - SCN-003
  - WLD-009
  - DEC-0012
  - CHR-007
---

## 1. Propósito

Registrar, para el encargo `DESIGN-007` (prompt
[prompts/DESIGN-007_first-arrival-scenario.md](../../prompts/DESIGN-007_first-arrival-scenario.md)),
qué decisiones quedan cerradas, qué elementos son procedurales, qué
invariantes y cifras de presupuesto se fijan, qué ejemplos son no
normativos, qué opciones quedaron descartadas, cómo se reconcilia con
entregas anteriores y qué preguntas permanecen abiertas fuera de este
alcance. Es un documento de síntesis y trazabilidad; no es fuente
canónica de reglas.

## 2. Decisiones cerradas por esta entrega

| Decisión | Fuente canónica | Estado anterior | Estado final |
|---|---|---|---|
| Momento exacto de llegada (Día 1, 17:30, seis semanas tras el colapso, primera mitad de abril, cuatro días de marcha) | `SCN-003` §3.1 | Abierto en `SCN-001` §7 | Cerrado |
| Banda meteorológica inicial, sin fenómenos letales | `SCN-003` §3.1 | No documentado | Cerrado |
| Seis adultos procedurales sin elenco fijo | `SCN-002` §3.1 | Abierto en `SCN-001` §7 | Cerrado |
| Distribución mínima de calibre oculto `5/4+/4+/3+/3+/3+` de la cohorte protagonista | `SCN-002` §3.2, `CHR-007` §3.2.1 | No documentado | Cerrado (específico de escenario) |
| Cobertura funcional colectiva mínima y restricciones de diversidad | `SCN-002` §3.3 | Abierto en `SCN-001` §7 | Cerrado |
| Red procedural de relaciones (mínimos de grafo) | `SCN-002` §3.4–3.5 | Abierto en `SCN-001` §7 | Cerrado |
| Acontecimiento compartido reciente obligatorio | `SCN-002` §3.6 | No documentado | Cerrado |
| Refugio provisional garantizado (100–250 m, contrato de carencias) | `SCN-003` §3.4 | Abierto en `SCN-001` §7 | Cerrado |
| Candidatos a asentamiento (3–5, sin mudanza obligatoria) | `SCN-003` §3.4, `SET-001` §3.1 | No documentado | Cerrado |
| Todo edificio, incluido el refugio provisional, se genera por programa de estancias | `SCN-003` §3.4, `WLD-005`, `CAT-002` | Ya cerrado en `WLD-005`; sin aplicación explícita al escenario | Reconciliado |
| Presupuesto numérico del mapa (huella 3×3 km, 55–85 construcciones, red viaria, agua, cobertura de terreno, puntos de interés) | `WLD-009` | Abierto en `SCN-001` §7 y `WLD-008` §7 | Cerrado como presupuesto del escenario |
| Amenaza zombi inicial contenida (12–30, sin respawn, sin horda inicial) | `SCN-003` §3.6, `WLD-009` §3.8 | Abierto en `SCN-001` §7 | Cerrado |
| Estado físico tras la marcha | `SCN-003` §3.2 | No documentado | Cerrado |
| Pertenencias, arma cuerpo a cuerpo por protagonista y carencias obligatorias | `SCN-003` §3.5 | Abierto en `SCN-001` §7 | Cerrado |
| Garantías de semilla válida (nueve condiciones) | `SCN-003` §3.7 | No documentado | Cerrado |
| Presencia humana local y regional incierta | `SCN-003` §3.8 | Abierto en `SCN-001` §7 | Cerrado |
| Identidad jugable de las primeras horas sin misión lineal | `SCN-003` §3.9 | No documentado | Cerrado |
| Contrato transversal que une las tres capas anteriores | `DEC-0012` | No documentado | Cerrado |

## 3. Elementos procedurales frente a elementos fijos

Ver la distinción íntegra en
[SCN-001 §4](../scenarios/SCN-001_mountain-village-arrival.md#4-elementos-fijos-frente-a-procedurales),
que la resume sin repetir el detalle de `SCN-002`, `SCN-003` y `WLD-009`.
En síntesis: el **cuándo, dónde en términos generales y en qué tono**
llega el grupo es fijo; el **quiénes son, cómo se relacionan, qué mundo
concreto encuentran y qué amenaza concreta enfrentan** es procedural,
dentro de los presupuestos y garantías cerrados por esta entrega.

## 4. Invariantes registradas

- El calibre oculto de la cohorte protagonista nunca es visible, ni
  siquiera indirectamente por orden de presentación (`SCN-002` §2).
- Ningún protagonista puede tener calibre inferior a `3` estrellas
  (`SCN-002` §3.2).
- Todo edificio del escenario, incluido el refugio provisional, depende
  del modelo de estancias de `WLD-005`; ninguno es un bloque indivisible
  ni una excepción hecha a mano (`SCN-003` §3.4).
- La población zombi inicial es finita y no reaparece por respawn
  (`SCN-003` §3.6).
- Cada uno de los seis protagonistas porta al menos un arma cuerpo a
  cuerpo o improvisada (`SCN-003` §3.5).
- Ninguna garantía de semilla válida equivale a información gratuita
  para los personajes (`SCN-003` §3.7).
- `CAT-004` permanece `draft`; ningún presupuesto numérico de `WLD-009`
  lo aprueba como alcance de implementación (`WLD-009` §3.7).
- Ningún documento de esta entrega pasa a `implemented`.

## 5. Cifras de presupuesto registradas

| Magnitud | Rango |
|---|---:|
| Huella del mapa local | ≈ 3 × 3 km |
| Cruce favorable / degradado | 45–60 min / > 90 min |
| Construcciones totales | 55–85 |
| Calles secundarias | 2–4 |
| Caminos rurales | 5–9 |
| Fuentes de agua secundarias | 1–3 |
| Puntos de interés | 12–18 |
| Siluetas/indicios conocidos al llegar | 3–6 |
| Población zombi inicial | 12–30 |
| Zombis cerca de la llegada | 0–2 |
| Concentración evitable máxima | 4–6 |
| Distancia al refugio provisional | 100–250 m |
| Candidatos a asentamiento (días 1–3) | 3–5 |
| Agua disponible de llegada | 5–8 L (capacidad de recipientes 8–12 L) |
| Comidas individuales de llegada | ≈ 6 |
| Luz útil al llegar | ≈ 2 h |
| Comunidades regionales posibles | 0–2 |

## 6. Ejemplos no normativos citados

Los 35 casos de validación documental del prompt (sección 22) y los
ejemplos de las secciones 8 de `SCN-002`, `SCN-003` y `WLD-009` ilustran
el contrato; ninguno fija una semilla, biografía o distribución
concretas como obligatoria.

## 7. Opciones descartadas

Ver la lista completa en la sección 21 del prompt
[DESIGN-007](../../prompts/DESIGN-007_first-arrival-scenario.md#21-opciones-e-interpretaciones-descartadas).
En síntesis, quedan descartados: elenco fijo de personajes; protagonistas
por debajo de calibre 3; estrellas visibles; calibre como bonificador
directo; protección narrativa; líder inicial obligatorio; refugio
definitivo entregado como seguro o elegido antes de explorar; edificio
tratado como bloque indivisible; mapa cuadrado visual o gran ciudad
accidental; horda inicial o respawn de zombis limpiados; combate
tutorial obligatorio; arma de fuego garantizada; personaje sin arma
cuerpo a cuerpo; inventario global sin ubicación; semilla imposible
parcheada después de empezar; comunidad forzada en las primeras 48
horas; secuencia lineal de objetivos; aprobación automática de
`CAT-004`; reactivación del roadmap de Godot.

## 8. Relación con entregas anteriores

- Reconcilia y cierra las preguntas abiertas que `SCN-001` declaraba
  expresamente en su sección 7 (estación, cohorte, refugio, dimensiones,
  amenaza, recursos, comunidades), heredadas también de
  `docs/OPEN-QUESTIONS.md`.
- Aplica, sin reabrir, la escala real `0–10`, la visibilidad del nivel
  actual y el catálogo de frases de potencial ya cerrados por
  `DESIGN-006` en `CHR-006` y `CHR-007`.
- Aplica, sin reabrir, el perfil procedural de pueblo pequeño de montaña,
  las doce capas generativas y la estructura espacial técnica invisible
  ya cerrados por `DESIGN-005` en `WLD-008`.
- Aplica, sin reabrir, el modelo de generación semántica de `WLD-005`,
  la presión de saqueo de `WLD-006` y la historia del apocalipsis de
  `WLD-007`, todos cerrados por `DESIGN-004`.
- No reabre ni amplía `RDM-003`; no aprueba `CAT-004`.

## 9. Preguntas que permanecen abiertas fuera de este alcance

- Algoritmos geométricos exactos de terreno, calles y parcelas (`WLD-008`
  §7, `WLD-009` §7).
- Combate detallado, infección y variantes de zombis (`THR-001` §7,
  `THR-002`).
- Distribución global de calibre de la población mundial, campos de
  potencial y catálogo de rasgos (`CHR-007` §7).
- Interfaz gráfica concreta de la primera noche y de la ficha contextual
  (`UI-005` §7, `UI-006` §7).
- Subconjunto técnico exacto de `CAT-004` para una futura implementación.
- Algoritmo exacto de validación y regeneración de semillas.
