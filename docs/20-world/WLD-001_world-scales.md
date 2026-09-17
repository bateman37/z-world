---
id: WLD-001
title: Escalas del mundo
status: approved
canonical_for:
  - mapa local
  - mapa estratégico
  - relación entre escalas
depends_on: []
related:
  - VIS-002
  - SET-001
  - SOC-001
  - WLD-002
---

## 1. Propósito

Definir las escalas de representación del mundo de Z-World y su relación.

## 2. Principios que no deben romperse

- El detalle de lo cercano es profundo; lo lejano puede simularse de forma
  más abstracta y materializar mayor detalle cuando se vuelve relevante.

## 3. Modelo funcional

Existen dos escalas complementarias:

1. **Mapa local 3D**: donde se observa y gestiona el asentamiento, sus
   habitantes, edificios, terrenos cercanos, defensas, producción y amenazas
   inmediatas.
2. **Mapa estratégico**: mucho mayor, concebido actualmente como una
   cuadrícula hexagonal con niebla de guerra, para exploración, rutas,
   comunidades, expediciones, puestos y cambios regionales.

## 4. Reglas aprobadas

- La cuadrícula hexagonal es una dirección de diseño aprobada para
  documentar y explorar, no una implementación cerrada. **El mapa
  estratégico no es jugable en la primera versión visual** (ver
  [RDM-001](../roadmap/RDM-001_first-playable-slice.md)); su exploración,
  información y transición de escala siguen abiertas.
- El mapa local es donde ocurre la gestión detallada del asentamiento (ver
  [SET-001](../40-settlement/SET-001_settlement-growth.md)) y donde se aplica
  el modelo de exploración e información de
  [WLD-002](WLD-002_local-exploration-and-information.md).
- El mapa estratégico es donde otras comunidades y el mundo exterior viven de
  forma más abstracta (ver
  [SOC-001](../50-society/SOC-001_living-community.md)).

## 5. Interacciones con otros sistemas

- El asentamiento (dominio 40) existe dentro del mapa local.
- Las comunidades externas (dominio 50) existen principalmente en el mapa
  estratégico, con posible materialización de detalle cuando el jugador se
  acerca o interactúa.

## 6. Casos límite o riesgos

Ninguno específico a este documento más allá de las preguntas abiertas.

## 7. Preguntas abiertas

- Escala, tamaño y representación exacta de la cuadrícula hexagonal.
- Mecanismo exacto de transición entre el mapa estratégico y el mapa local.

Ver también `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

Ninguno.
