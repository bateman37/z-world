---
id: WLD-002
title: Exploración local e información
status: approved
canonical_for:
  - estados de información de lugares y objetos
  - familias de acciones de descubrimiento
  - diferencia entre agotado y no reconocido
depends_on:
  - WLD-001
related:
  - UI-001
  - SET-003
  - WLD-004
---

## 1. Propósito

Definir cómo el estado real de un lugar u objeto del mapa local se distingue
de la información que la comunidad ha llegado a conocer sobre él, y qué
acciones permiten avanzar ese conocimiento.

## 2. Principios que no deben romperse

- Todo lugar tiene un estado real y persistente, independiente de quién lo
  visita. La información conocida no es ese estado real: es evidencia ligada
  a la comunidad y, cuando importa, a la persona que la obtuvo.
- Una habilidad o conocimiento puede permitir reconocer una oportunidad que
  siempre estaba allí; no modifica el contenido del lugar ni reabastece un
  recurso ya agotado.

## 3. Modelo funcional

### 3.1 Estados de información

Para cada lugar u objeto relevante, la información pasa por estos estados:

1. **No conocido**: no existe información operativa.
2. **Avistado**: se conoce su presencia o una característica exterior.
3. **Observado**: se obtienen indicios visibles, sonidos, rastros o riesgos
   desde una posición segura.
4. **Inspeccionado**: alguien accede o estudia suficientemente el objetivo y
   descubre detalles internos o técnicos.
5. **Aprovechado o transformado**: se han extraído recursos, reparado,
   conectado, asegurado o alterado elementos; cada cambio queda en el estado
   real.

Los estados no siempre se recorren de forma lineal: una ventana permite
observar un interior; forzar una puerta permite inspeccionar; una
herramienta o técnica puede abrir una vía diferente. La interfaz solo ofrece
acciones que tengan sentido para el objetivo, el acceso y el conocimiento
actual (ver [UI-001](../80-interface/UI-001_interaction-and-command-model.md)).

### 3.2 Familias de acciones de descubrimiento

- Obtener indicios: observar, escuchar, rastrear.
- Comprender: inspeccionar, diagnosticar, analizar.
- Comprobar: probar, medir, tomar una muestra.
- Acceder: abrir, despejar, forzar, trepar.
- Recuperar: recoger, desmontar, copiar, trasladar.
- Transformar: reparar, adaptar, reforzar, conectar.

Son verbos de diseño, no un conjunto de botones que deba aparecer en todos
los objetos. Los edificios, recursos y elementos de contenido declararán
cuáles pueden aplicar.

## 4. Reglas aprobadas

- «No queda nada» significa que los recursos extraíbles conocidos se
  agotaron. «No reconocemos nada más útil» significa que puede existir algo
  sin descubrir. Volver con un especialista puede cambiar la segunda
  situación, nunca crear de nuevo comida, materiales o herramientas ya
  consumidos.
- Los lugares pueden contener pistas coherentes sobre su pasado: cierres
  improvisados, huellas, daños, notas, herramientas abandonadas o señales de
  actividad. Esas pistas pueden cambiar riesgos y decisiones; no son
  decoración sin consecuencia.

## 5. Interacciones con otros sistemas

- Las acciones de descubrimiento se designan y ejecutan según
  [UI-001](../80-interface/UI-001_interaction-and-command-model.md).
- Los recursos extraídos pasan a gestionarse según
  [SET-003](../40-settlement/SET-003_resources-logistics-and-condition.md).
- La generación del contenido base de cada lugar se rige por
  [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md).
- El reconocimiento dependiente de la persona, las revisitas y el
  agotamiento por categoría se amplían, sobre estos mismos estados
  generales, en
  [WLD-004](WLD-004_expertise-dependent-recovery.md).

## 6. Casos límite o riesgos

- Confundir «agotado» con «no reconocido» rompería la lógica de progreso: el
  sistema debe distinguir siempre ambos casos en la información mostrada.

## 7. Preguntas abiertas

- Tamaño, escala, revelado y transición del mapa estratégico. Ver
  `docs/OPEN-QUESTIONS.md` y [WLD-001](WLD-001_world-scales.md).
- Catálogo concreto de qué edificios y recursos declaran qué acciones de la
  sección 3.2.

## 8. Ejemplos no normativos

Ninguno.
