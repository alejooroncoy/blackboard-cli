# Servidores MCP para Blackboard: qué opciones existen (2026)

> Comparación de los servidores MCP que conectan Blackboard Learn con asistentes de IA: institucionales, de estudiante, proyectos por universidad y el patrón blackboard (que no es el LMS).

Fuente: https://campuscli.com/blackboard-mcp/alternativas/
Actualizado: 2026-08-06
Aviso: Campus, uno de los proyectos comparados, es nuestro.

---

## En resumen

- Hay **tres tipos de servidor MCP de Blackboard**, más un homónimo que no tiene relación con el LMS.
- Los **institucionales** (Composio, bb-mcp) requieren una *developer key* de Blackboard emitida por el administrador del LMS. Un estudiante no la va a conseguir.
- Los **de estudiante** autentican con la sesión del propio alumno. Es la única vía practicable sin permiso de la universidad.
- Los **proyectos por universidad** que aparecen en GitHub suelen ser de un fin de semana y quedan sin mantenimiento.
- El **patrón blackboard** es memoria compartida entre agentes de IA. Comparte nombre con el LMS y nada más.

## Los cuatro grupos

| Tipo | Ejemplos | Qué exige | Para quién |
|---|---|---|---|
| Institucional | Composio, `nitsuah/bb-mcp`, Blackboard Learn MCP | Credenciales OAuth2 y rol de docente o de sistema en el LMS | Equipos de TI, universidades, docentes con permisos |
| De estudiante | Campus | La sesión SSO del propio alumno | Estudiantes |
| Por universidad | `pku-blackboard-mcp`, `uoh-blackboard-mcp` y similares | Clonar el repo y adaptarlo a mano | El autor y poco más |
| Patrón blackboard | `parallax`, `agent-blackboard-mcp` | Nada relacionado con un LMS | Quien coordina varios agentes de IA |

## Servidores institucionales

Son envoltorios de la API REST oficial de Blackboard Learn. Están bien construidos y cubren mucho: gestión de anuncios, copia de cursos, libro de calificaciones completo, control de acceso por rol.

El obstáculo no es técnico sino de permisos: necesitan una clave de desarrollador que el administrador del LMS debe emitir y asociar a un rol con privilegios. Para un estudiante esa puerta está cerrada. Para el área de TI de una universidad, es exactamente lo que busca.

## Servidores de estudiante

Usan la sesión con la que el alumno entra a su campus todos los días. El login pasa por el flujo normal de SSO de la universidad, en el navegador del propio estudiante, con MFA incluido.

Campus es el que mantenemos nosotros: hoy implementa Blackboard UPC (Perú), está publicado en npm, expone diecinueve herramientas `blackboard_*` y trae guías para seis clientes MCP. Canvas y Moodle están en el roadmap.

Límite honesto de este enfoque: depende de que la universidad concreta esté implementada. Un servidor institucional funciona contra cualquier instancia de Blackboard con las llaves correctas; uno de estudiante tiene que resolver el SSO de cada universidad por separado.

## Proyectos por universidad

Cada pocos meses aparece en GitHub un repositorio del estilo `<universidad>-blackboard-mcp`. Revisamos varios en agosto de 2026 y el patrón es constante: historial de dos o tres días, ninguna publicación en un registro de paquetes, sin documentación de instalación y sin actividad posterior.

Útiles como referencia si vas a escribir el tuyo; no como herramienta que siga funcionando el ciclo que viene.

## El patrón blackboard no es Blackboard Learn

En arquitectura de sistemas multiagente, el *blackboard pattern* es una técnica en la que varios agentes escriben y leen hechos sobre una pizarra compartida para coordinarse. Existen varios servidores MCP que la implementan.

No tienen ninguna relación con Blackboard Learn, el LMS que usan las universidades. Comparten el nombre y nada más.

## Cómo elegir

La pregunta útil no es cuál es mejor sino qué credenciales tienes. Si administras el LMS o eres docente con permisos, un servidor institucional da más cobertura. Si eres estudiante, la única vía practicable es uno que autentique con tu sesión, y entonces la pregunta pasa a ser si tu universidad está implementada. Si lo que quieres es coordinar agentes de IA entre sí, ninguno de los dos: busca el patrón blackboard.

## Enlaces

- Blackboard MCP de Campus: https://campuscli.com/blackboard-mcp/
- Guías por cliente: https://campuscli.com/blackboard-mcp/claude-desktop/
- Blackboard CLI: https://campuscli.com/blackboard-cli/
- Código fuente: https://github.com/alejooroncoy/campus-cli
