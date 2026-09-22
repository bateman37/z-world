---
id: WLD-004
title: Recuperación dependiente de la persona
status: approved
canonical_for:
  - inspección, saqueo y reconocimiento experto
  - revisitas y agotamiento
  - diferencia entre registrar, recuperar, desmontar y catalogar
  - contenido base estable frente a información obtenida
depends_on:
  - WLD-002
related:
  - WLD-003
  - UI-003
  - CHR-001
  - CHR-002
  - SET-006
  - ARC-002
  - WLD-005
  - WLD-006
---

## 1. Propósito

Definir cómo la inspección, el saqueo, el reconocimiento experto, las
revisitas, la recuperación y el desmontaje dependen de quién interviene,
manteniendo siempre un contenido base estable que no se resortea. Amplía
[WLD-002](WLD-002_local-exploration-and-information.md) sin sustituir sus
estados generales.

## 2. Principios que no deben romperse

- El contenido físico base de cada lugar o contenedor se deriva de semilla,
  ID, versión y cambios persistentes (ver
  [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md)
  y [DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md)). No
  depende de quién entra, del orden de visitas, de recargar una partida ni
  de una tirada nueva al abrir.
- La persona sí cambia qué observa, reconoce, interpreta, alcanza y puede
  extraer sin dañarlo. «Quién va» importa mucho sin convertir al
  especialista en un bonus que hace aparecer objetos inexistentes.
- Una extracción torpe puede causar pérdida, rotura o desperdicio, pero esa
  consecuencia es un cambio causal persistente, no otro sorteo del
  contenido. Una comunidad externa puede llevarse o destruir bienes por
  simulación; ese cambio también persiste.

## 3. Modelo funcional

### 3.1 Capas de descubrimiento

Sobre los estados generales de [WLD-002](WLD-002_local-exploration-and-information.md)
(sección 3.1), se registra evidencia separada por aspecto o categoría. Una
localización puede estar inspeccionada en general y seguir conteniendo
maquinaria, documentos o materiales mal comprendidos.

Una visita puede producir:

- objetos obvios reconocidos por casi cualquiera;
- recursos identificados con tipo y uso;
- indicios vagos: «equipamiento mecánico», «archivadores técnicos», «varios
  sistemas electrónicos»;
- elementos portátiles no identificados;
- instalaciones integradas que requieren un especialista;
- accesos, contenedores o compartimentos todavía no abiertos;
- riesgos y señales sobre habitantes anteriores o actividad reciente.

La evidencia registra quién la obtuvo, con qué confianza y en qué momento
cuando resulte relevante. La comunidad comparte esta información según sus
reglas de comunicación, sin asumir telepatía.

### 3.2 Influencia de la persona

El resultado informativo depende de una combinación de:

- observación y búsqueda;
- habilidad técnica relacionada;
- conocimiento de objetos, modelos y compatibilidades (ver
  [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md));
- experiencia previa y profesión de origen;
- herramientas de diagnóstico o acceso;
- tiempo dedicado;
- iluminación, peligro, estrés y estado físico;
- ayuda de otra persona o consulta de documentación.

Una persona sin mecánica puede reconocer herramientas, combustible y piezas
obvias. Un mecánico puede distinguir alternadores, correas,
compatibilidades, motores reparables, herramientas especializadas y
maquinaria aprovechable. Este ejemplo no es un catálogo exhaustivo.

### 3.3 Pistas y decisión de volver

La primera visita puede indicar qué tipo de especialista aportaría valor,
por ejemplo: «Hay maquinaria que nadie del grupo sabe valorar», «Parece
haber documentación técnica», «Los equipos podrían contener componentes
electrónicos» o «El estado de esta instalación requiere diagnóstico».

El jugador decide entre: enviar inmediatamente a alguien más adecuado,
llevar objetos no identificados a la base, recuperar solo lo evidente,
dedicar más tiempo a registrar, desmontar con riesgo o dejar el lugar para
más adelante.

### 3.4 Objetos no identificados

Un elemento portátil puede recuperarse como lote o artefacto no
identificado, con procedencia, peso, condición y descripción aproximada.
Catalogarlo o estudiarlo más adelante (ver
[SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md))
puede revelar su naturaleza. No es una bolsa abstracta que vuelve a tirar
su contenido al abrirla: el contenido ya está fijado.

Una instalación integrada, vehículo, máquina pesada o componente conectado
puede permanecer en el lugar hasta que exista conocimiento, herramienta o
capacidad de transporte. El jugador también puede ordenar llevar «todo lo
posible», asumiendo tiempo, peso, espacio y riesgo de transportar chatarra.

### 3.5 Revisitas y agotamiento

Volver con otra persona puede descubrir valor no reconocido, un acceso o
una forma de recuperación distinta. Nunca repone recursos retirados.

La interfaz distingue al menos:

- recursos conocidos pendientes de retirar;
- recursos conocidos agotados;
- elementos presentes pero no identificados;
- indicios de valor que requieren otro conocimiento;
- registro incompleto por acceso, tiempo o riesgo;
- localización físicamente vaciada o destruida.

«No queda nada» solo se usa cuando el estado físico permite afirmarlo. «No
reconocemos nada más útil» mantiene incertidumbre. Una localización puede
quedar agotada respecto a comida conocida y no respecto a componentes
técnicos.

### 3.6 Registrar, recuperar, desmontar y catalogar

- **Recuperar** preserva, en lo posible, un objeto portátil o componente
  extraíble para usarlo, almacenarlo, estudiarlo o repararlo.
- **Desmontar** altera o sacrifica el original para obtener piezas,
  materiales o conocimiento estructural.
- **Registrar** obtiene información y localiza oportunidades; no transporta
  automáticamente.
- **Catalogar** organiza una fuente ya recuperada; no sustituye el registro
  físico del lugar (ver
  [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md)).

Un desmontaje puede mejorar conocimiento, dañar piezas, consumir
herramienta y cerrar la posibilidad de reparar el conjunto original. Sus
consecuencias persisten.

## 4. Reglas aprobadas

- El contenido base de un lugar o contenedor nunca se resortea al volver a
  visitarlo ni al recargar una partida.
- Un fallo o una extracción torpe es un cambio causal persistente, nunca
  una repetición del sorteo de contenido.
- Un agotamiento se declara por categoría (por ejemplo comida frente a
  componentes técnicos), nunca como estado único de todo el lugar.
- Registrar, recuperar, desmontar y catalogar son acciones distintas con
  efectos distintos; ninguna sustituye a las demás.

## 5. Interacciones con otros sistemas

- Los estados generales de información y las familias de acciones de
  descubrimiento siguen definidos en
  [WLD-002](WLD-002_local-exploration-and-information.md), que este
  documento amplía sin sustituir.
- El origen del contenido base y la política de generación reproducible se
  rigen por
  [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md)
  y [DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md).
- La generación semántica que produce ese contenido base por edificio,
  estancia y ocupante se rige por
  [WLD-005](WLD-005_semantic-place-and-building-generation.md); la presión
  y rutas de saqueo que modifican su estado histórico previo se rigen por
  [WLD-006](WLD-006_historical-looting-pressure-and-routes.md). Ninguna de
  ellas cambia el principio de esta sección: la persona interpreta, nunca
  resortea.
- La prioridad Saqueo y recuperación y otras prioridades de exploración se
  definen en [UI-003](../80-interface/UI-003_work-priority-taxonomy.md).
- El conocimiento que se obtiene al catalogar o estudiar una fuente
  recuperada se rige por
  [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md).
- La conexión con pistas y localizaciones del mapa estratégico futuro se
  limita a lo descrito en
  [WLD-003](WLD-003_strategic-world-and-regional-simulation.md); este
  documento no diseña el planificador de expediciones.
- El reconocimiento dependiente de la persona se aplica igualmente al
  desmontaje de objetos completos ([SET-009](../40-settlement/SET-009_disassembly-and-world-transformation.md))
  y a la transformación de terreno, accesos y transporte
  ([WLD-010](WLD-010_mutable-terrain-and-spatial-construction.md),
  [WLD-011](WLD-011_openings-access-and-connectivity.md),
  [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md)), sin
  que este documento repita sus reglas específicas.

## 6. Casos límite o riesgos

- Confundir «agotado» con «no reconocido» en una sola categoría rompería la
  lógica de progreso ya advertida en
  [WLD-002](WLD-002_local-exploration-and-information.md).
- Tratar un objeto no identificado como una bolsa que vuelve a sortear su
  contenido al abrirla contradice la generación reproducible de
  `ARC-002`.

## 7. Preguntas abiertas

- Catálogo exhaustivo de acciones, herramientas de diagnóstico y objetos
  declarables por categoría. Ver `docs/OPEN-QUESTIONS.md`.
- Fórmulas numéricas exactas de calidad de reconocimiento según persona,
  herramienta y tiempo.

## 8. Ejemplos no normativos

Ver el ejemplo transversal de la estación municipal de bombeo (Ana, sin
conocimientos técnicos, registra y recupera; Marcos, mecánico, vuelve y
reconoce bombas, motor y manual sin que nada apareciera por llevarlo a él)
en
[SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md#8-ejemplos-no-normativos),
que desarrolla su continuación en el modelo de conocimiento.
