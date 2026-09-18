---
id: UI-004
title: Presentación cualitativa de capacidad
status: approved
canonical_for:
  - separación entre prioridad visible y capacidad estimada
  - estados cualitativos de capacidad
  - prohibición de umbrales numéricos internos en la UX normal
  - explicación causal de dificultad, riesgo y bloqueo físico
depends_on:
  - UI-003
related:
  - UI-001
  - UI-002
  - CHR-001
  - CHR-002
---

## 1. Propósito

Definir cómo se comunica al jugador la capacidad, dificultad, incertidumbre
y bloqueo de una persona frente a una prioridad o un trabajo, sin exponer
números internos de habilidad como experiencia final. Este documento amplía
[UI-003](UI-003_work-priority-taxonomy.md) y no repite su tabla de
prioridades.

## 2. Principios que no deben romperse

- Una celda de la matriz combina dos dimensiones sin mezclarlas: el valor
  de prioridad elegido (`Nunca` o `1–5`) y un indicador cualitativo de
  capacidad actual. Ambas siempre se muestran y editan por separado.
- La celda siempre conserva y permite editar la prioridad, incluso si
  aparece gris. Una persona puede recibir prioridad `1` en una familia
  antes de aprenderla, para expresar una intención futura. No se generan
  trabajos imposibles por ello.
- La interfaz normal nunca muestra umbrales numéricos internos de
  habilidad, dificultad o probabilidad como experiencia final.

## 3. Modelo funcional

### 3.1 Celda gris configurable

El estado gris de capacidad no impide editar ni conservar el valor de
prioridad. Significa que no existe ahora ninguna acción conocida y
elegible de esa familia para la persona, o que no se ha demostrado
capacidad suficiente. No comunica incapacidad permanente: puede cambiar con
aprendizaje, enseñanza, hallazgo de medios o incorporación de un
especialista.

No se convierte automáticamente toda una fila en gris porque una acción
avanzada esté bloqueada: basta con que exista una acción básica elegible
para que la familia tenga capacidad operativa. El detalle de cada trabajo
muestra su propia dificultad y dependencias.

El estado `Nunca` de prioridad necesita representación visual distinta del
gris de capacidad, por ejemplo texto o símbolo de prioridad separado del
color o indicador de aptitud. Esta entrega no fija colores hexadecimales ni
un diseño gráfico definitivo.

### 3.2 Estados cualitativos de capacidad

| Estado | Significado funcional |
|---|---|
| Gris | No existe ahora ninguna acción conocida y elegible de esa familia para la persona, o no se ha demostrado capacidad suficiente. No significa incapacidad permanente. |
| Advertencia | Existe alguna acción intentable, pero sería difícil, lenta, insegura o con riesgo relevante de desperdicio. |
| Adecuada | La persona puede realizar al menos trabajos habituales de la familia en condiciones razonables. |
| Familiar | Existen evidencias de dominio considerable en acciones conocidas. |
| Incierta | La comunidad carece de evidencia para valorar con confianza; no debe presentarse como una cifra falsa. |

### 3.3 Conceptos que no deben mezclarse

`UI-004` distingue explícitamente:

- dificultad relativa de la acción;
- confianza de la comunidad en la valoración;
- riesgo previsto;
- dependencia física dura;
- disposición personal;
- prioridad configurada.

Color, icono, texto y tooltip pueden combinarse, pero siempre debe existir
una explicación textual. No se combinan estos conceptos en un único
semáforo que los confunda.

### 3.4 Dependencia física dura frente a falta de habilidad

Los requisitos duros provienen de la realidad: no se reproduce un DVD sin
lector, no se accede a un disco sin interfaz compatible, no se suelda sin
un medio válido y una máquina que necesita energía no funciona sin ella. La
falta de habilidad, por el contrario, puede permitir un intento lento,
arriesgado o imperfecto cuando la acción lo admita.

Las tareas peligrosas, médicas, estructurales o que exijan una técnica
irremplazable sí pueden imponer un mínimo duro. Deben explicar la causa en
lenguaje del mundo, no mostrar solo el umbral numérico.

### 3.5 Descriptores en lugar de cifras

La interfaz normal no muestra, por ejemplo, «Mecánica 5/10», «Requiere
Electricidad 6», «43 % de comprender» ni límites personales secretos como
cifras absolutas. Muestra descriptores y causas comprensibles, por ejemplo:

- «No sabemos si Marta podría hacerlo».
- «Muy por encima de su experiencia conocida».
- «Difícil; podría desperdiciar componentes».
- «Exigente, pero parece capaz de intentarlo».
- «Trabajo adecuado para Luis».
- «Muy familiar para Ana».
- «Conoce la teoría, pero carece de práctica».
- «Falta un adaptador compatible».
- «Nadie reconoce estos componentes».

### 3.6 Compatibilidad temporal con números de depuración

El backend futuro puede usar niveles, umbrales, porcentajes, probabilidades,
progreso y modificadores internos. La interfaz de desarrollo puede
conservar números bajo un modo de depuración explícito, distinto de la
experiencia normal. Esta entrega no ordena retirar los números del
prototipo ya implementado en
`IMPLEMENTATION-002`/`IMPLEMENTATION-003`; solo fija que no son la
presentación final al jugador.

### 3.7 Gestión progresiva de límites personales

Las aptitudes y límites personales no se revelan de inicio como una lista
completa. La comunidad descubre indicios por trabajo, convivencia y
enseñanza, de forma consistente con
[CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md) y
[CHR-004](../30-characters/CHR-004_life-history-and-personal-arcs.md). Un
resultado desfavorable puntual no revela un límite definitivo ni se
presenta como tal.

## 4. Reglas aprobadas

- Prioridad y capacidad se muestran y editan como dos dimensiones separadas
  en toda celda de la matriz de [UI-003](UI-003_work-priority-taxonomy.md).
- No se muestran umbrales numéricos de habilidad en la experiencia de
  jugador normal.
- Toda explicación cualitativa debe acompañarse de una causa comprensible,
  no solo de un color o icono aislado.
- Los requisitos duros se comunican como dependencia física real, nunca
  como una cifra de habilidad insuficiente.

## 5. Interacciones con otros sistemas

- Las 34 prioridades y nueve bloques que esta presentación acompaña se
  definen en [UI-003](UI-003_work-priority-taxonomy.md).
- La gestión a escala con filtros, plantillas y edición por grupo se
  desarrolla en [UI-002](UI-002_management-at-community-scale.md), que
  enlaza este documento para la presentación de capacidad en la matriz
  ampliada.
- Las capas de personaje que sustentan la capacidad real (habilidad,
  técnica, conocimiento, aptitud, medios) se definen en
  [CHR-001](../30-characters/CHR-001_character-model.md).
- El aprendizaje y la enseñanza que cambian el estado cualitativo de una
  persona se rigen por
  [CHR-002](../30-characters/CHR-002_knowledge-and-learning.md).

## 6. Casos límite o riesgos

- Presentar una celda «Incierta» como si fuera «Gris» confundiría falta de
  capacidad con falta de evidencia; deben distinguirse siempre.
- Mostrar un semáforo único que mezcle riesgo, dificultad y prioridad
  ocultaría causas relevantes para la decisión del jugador.

## 7. Preguntas abiertas

- Fórmulas numéricas exactas de idoneidad, dificultad, riesgo y confianza
  que alimentan estos estados cualitativos. Ver `docs/OPEN-QUESTIONS.md`.
- Color, iconografía y disposición visual final de los estados de la
  sección 3.2.

## 8. Ejemplos no normativos

Una persona sin conocimientos eléctricos frente a un cuadro de fusibles
puede mostrar «Advertencia — podría provocar un cortocircuito», mientras que
un electricista frente al mismo cuadro muestra «Adecuada». Si nadie de la
comunidad ha intentado nunca esa acción, el estado correcto es «Incierta —
no sabemos si alguien podría hacerlo», no un gris idéntico al de
incapacidad demostrada.
