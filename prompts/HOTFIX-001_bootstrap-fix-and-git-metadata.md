# HOTFIX-001 — Arranque de IMPLEMENTATION-003 y metadatos de Git/Godot

## Objetivo

Corregir el error de compilación que impide ejecutar `IMPLEMENTATION-003` y
normalizar el control de versiones para que Godot no genere cambios engañosos
por finales de línea en Windows.

Esta es una corrección técnica acotada. No implementes contenido nuevo,
`IMPLEMENTATION-004`, prioridades de `DESIGN-003`, defensa, zombis,
autonomía, aprendizaje, generación procedural ni guardado.

## Estado y reglas obligatorias

1. Lee primero `AGENTS.md`, `CLAUDE.md`, `docs/INDEX.md` y `docs/STATUS.md`.
2. Toda la prosa para personas debe estar en español.
3. Preserva cambios existentes ajenos. Antes de modificar, ejecuta
   `git status --short` e informa de qué cambios hay.
4. No descartes ni sobrescribas cambios sin comprobar su contenido.
5. No hagas refactors ni limpiezas no relacionadas.
6. No crees una batería nueva de pruebas. La validación debe ser mínima y
   específica para este hotfix.

## Problema confirmado

Al abrir el proyecto con Godot 4.7.2, `src/resources/resource_registry.gd`
falla con este error en la función `reserve`:

```text
Error en (108, 32): Cannot assign a value of type Array to variable "stack"
with specified type ResourceStack.
```

> Nota: el resto del prompt original se recibió truncado en la conversación
> (el mensaje del usuario terminó aquí). Este archivo conserva el texto tal
> como se recibió; no se ha inventado contenido adicional.
