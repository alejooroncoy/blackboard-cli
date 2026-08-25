# Campus Live Notes — MVP de extensión Chrome

Este prototipo abre un panel lateral derecho en una clase de `upc.class.com`. Lee los subtítulos que Class ya está mostrando después de que el estudiante elija explícitamente ese recuadro. No captura audio, no guarda el enlace de la clase ni sus credenciales.

También puede leer el contenido de un curso específico mediante la sesión que el estudiante ya tiene abierta en `aulavirtual.upc.edu.pe`. El botón **Preguntar** envía la pregunta, la transcripción y los títulos del curso al puente local. No hace entregas ni modifica Blackboard.

## Probar el panel con subtítulos nativos (recomendado)

1. Abre `chrome://extensions` y activa **Modo de desarrollador**.
2. Elige **Cargar sin empaquetar** y selecciona esta carpeta.
3. Pulsa el icono de Campus. Si la reunión ya estaba abierta, la extensión inserta el detector automáticamente.
4. Activa los subtítulos en la reunión de Class.
5. En el panel, pulsa **Usar subtítulos de Class** y luego haz clic una vez sobre el recuadro donde Class muestra el texto.

Desde ese momento la extensión observa solo ese recuadro y copia los cambios al panel. Esta modalidad no captura audio ni necesita un puente local.

Para las preguntas, el endpoint configurado como `http://localhost:8787/v1/ask` recibe:

```json
{ "question": "¿Qué explicó?", "context": "Transcripción y materiales…" }
```

y devuelve `{ "answer": "Respuesta del asistente" }`. Si ese servicio no está encendido, el panel deja el contexto listo para copiar a ChatGPT, Claude o un cliente MCP configurado con `campus-cli`.

El puente para las preguntas es deliberadamente externo: permite usar una API institucional o un proveedor de IA sin exponer una clave de API dentro de la extensión.

## Siguiente iteración

- Añadir el comando `campus live-notes bridge` para responder las preguntas con el proveedor elegido por el estudiante.
- Añadir una ruta local autenticada al servidor MCP para que el panel pueda hacer preguntas y recibir respuestas desde Campus.
- Empaquetar una variante Firefox. El panel lateral es portable, pero la captura fiable del audio de una pestaña usa APIs distintas y debe validarse en Firefox.
