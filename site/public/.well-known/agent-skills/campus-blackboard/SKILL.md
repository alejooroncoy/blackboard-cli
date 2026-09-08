---
name: campus-blackboard
description: Consulta de forma segura cursos, tareas, notas, anuncios y materiales de Blackboard UPC mediante Campus MCP.
---

# Campus Blackboard

Usa esta habilidad cuando una persona estudiante de UPC necesite revisar su
información de Blackboard: cursos, tareas, calificaciones, anuncios o archivos.
Conecta al MCP remoto `https://mcp.campuscli.com/mcp` y permite que la persona
complete OAuth con su propia cuenta Campus.

## Límites de acceso

- Solicita solo `campus.identity` y `campus.read`.
- No pidas, recopiles ni pegues contraseñas universitarias.
- Presenta las notas junto con el nombre de la evaluación, puntaje máximo y
  fecha de entrega cuando estén disponibles.
- Confirma con la persona antes de cualquier acción que pueda enviar una tarea.

## Flujo recomendado

1. Identifica el curso relevante.
2. Consulta tareas y fechas de entrega.
3. Consulta notas, anuncios o contenidos según la pregunta.
4. Distingue lo confirmado en Blackboard de recomendaciones o datos que aún no
   estén publicados.

La guía completa para usuarios y clientes compatibles está en
https://campuscli.com/blackboard-mcp/.
