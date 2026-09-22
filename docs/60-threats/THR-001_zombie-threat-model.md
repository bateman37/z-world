---
id: THR-001
title: Modelo de amenaza zombi
status: approved
canonical_for:
  - zombi estándar inicial
  - fuentes de la amenaza (presencia, movimiento, ruido, contacto)
  - combate elemental
depends_on: []
related:
  - UI-001
  - SET-003
  - THR-002
  - SCN-003
---

## 1. Propósito

Definir el zombi estándar inicial y las reglas elementales de riesgo, ruido y
combate para la primera versión visual.

## 2. Principios que no deben romperse

- Ninguna ruta militar es obligatoria ni vuelve seguro al asentamiento para
  siempre.
- La causa del ruido debe ser visible o explicable, nunca oculta al jugador.

## 3. Modelo funcional

El zombi estándar inicial se inspira en George Romero: lento, físico,
peligroso por número, persistencia y cercanía. No corre de forma normal ni
requiere habilidades especiales.

La amenaza zombi tiene cuatro fuentes documentadas: presencia local,
movimiento, ruido y contacto. El ruido puede atraer o despertar actividad
zombi dentro de un alcance y una intensidad que la futura implementación
concretará. Disparar, romper elementos, construir y otras acciones pueden
generar ruido.

## 4. Reglas aprobadas

- El cuerpo a cuerpo evita parte del ruido, pero exige cercanía y conlleva
  riesgo alto de herida, mordedura o quedar rodeado.
- Las armas de fuego aumentan distancia y potencia, pero consumen munición y
  pueden atraer amenazas (ver
  [UI-001](../80-interface/UI-001_interaction-and-command-model.md) sobre su
  reserva a defensa o acción directa del jugador).
- Sigilo, retirada, barreras, vigilancia y evitar un lugar son alternativas
  válidas.
- La primera versión incluye amenaza local elemental, ruido, retirada y una
  defensa básica. No incluye un director de hordas completo, tipos de zombi
  especiales, epidemias avanzadas, asedios masivos ni equilibrio final.
- El modelo futuro de zombis será configurable antes de iniciar una partida.
  Los ejes candidatos de esa configuración, todavía sin aprobar, se
  registran en [THR-002](THR-002_configurable-threat-horizon.md); solo el
  perfil lento actual está aprobado.

## 5. Interacciones con otros sistemas

- El combate y la retirada se ejecutan mediante control puntual o trabajos de
  guardia definidos en
  [UI-001](../80-interface/UI-001_interaction-and-command-model.md).
- La munición y los materiales de defensa se gestionan según
  [SET-003](../40-settlement/SET-003_resources-logistics-and-condition.md).
- El presupuesto concreto de población zombi inicial (`12–30`,
  contenida y limpiable) del primer escenario, que aplica este zombi
  estándar sin ampliarlo, se define en
  [SCN-003](../scenarios/SCN-003_first-day-starting-state.md), sección
  3.6; es una aplicación de escenario, no una regla universal para toda
  semilla futura.

## 6. Casos límite o riesgos

- Quedar rodeado en combate cuerpo a cuerpo es un riesgo alto documentado, no
  un fallo del sistema.

## 7. Preguntas abiertas

- Lista exacta de configuraciones, infección, sentidos, abundancia y
  dificultad. Ver `docs/OPEN-QUESTIONS.md`.
- Alcance, intensidad y fórmulas exactas de ruido, combate e infección.

## 8. Ejemplos no normativos

Ninguno.
