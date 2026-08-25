# Campus frente a intentos similares: fracasos, riesgos y decisiones

> Investigación estratégica — 21 de agosto de 2026.  
> Alcance: productos que ayudan a estudiantes a planificar cursos, comparar profesores o reunir datos académicos mediante software e IA. No todos los casos son fracasos empresariales; se separan los cierres de los incidentes y de los competidores que siguen activos.

## Conclusión ejecutiva

Campus tiene una oportunidad real porque el problema es recurrente: antes de matrícula el alumno necesita comparar opciones; durante el ciclo necesita recuperar rápidamente tareas, notas, anuncios y materiales que están dispersos. Sin embargo, **Campus no debe competir como una “superapp universitaria con IA”**.

La posición viable para el piloto es más estrecha:

> **Campus ayuda al estudiante UPC a decidir su matrícula y entender su ciclo usando información académica real, bajo su control.**

Esta posición exige cuatro disciplinas:

1. **Un caso de uso frecuente y demostrable:** pendientes, fechas, notas y materiales; no una promesa abstracta de IA.
2. **Privacidad y límites visibles:** Campus es independiente de UPC, no almacena más de lo necesario y permite revocar acceso.
3. **Datos de profesores moderados:** las reseñas no pueden convertirse en un ranking agresivo ni publicar contenido sensible.
4. **Unidad económica comprobada antes de escalar:** el precio, la activación y la renovación deben validarse con usuarios reales antes de comprar alcance.

---

## 1. Los casos investigados

### A. MyEdu — cierre de un producto muy cercano

**Qué hacía.** MyEdu ofrecía gratuitamente planificación de cursos y de carrera, datos de clases y profesores, perfiles de estudiante y conexión con oportunidades laborales. Blackboard la adquirió en 2014; en ese momento MyEdu afirmaba haber ayudado a un millón de estudiantes en más de 800 instituciones. [Blackboard](https://www.prnewswire.com/news-releases/blackboard-acquires-myedu-240262411.html) y la [Universidad de Texas](https://utsystem.edu/news/2014/01/15/ut-system-partner-myedu-acquired-blackboard-ut-benefit-expanded-services) describieron esa adquisición.

**Qué pasó.** Blackboard anunció el fin de vida de MyEdu.com el 30 de septiembre de 2016. La explicación oficial fue que la tecnología para sostener y mantener el sitio ya no era viable; parte de la funcionalidad se incorporaría a otros productos. [Aviso oficial de Blackboard](https://support.anthology.com/apex/downloadArticleasPDF?id=kaEPU0000002gAe2AI).

**Qué no sabemos.** La explicación pública no permite afirmar que MyEdu cerró por falta de usuarios, de ingresos o por una causa técnica específica. Decirlo sería especulación.

**Lectura para Campus.**

- Tener usuarios, una universidad aliada o incluso una adquisición no asegura continuidad.
- El costo oculto está en mantener datos académicos actualizados y flujos de integración a largo plazo.
- Campus debe conservar un “modo degradado” útil: si una integración cambia, el usuario debe poder seguir accediendo a Campus Profes, horarios, guía y sus propios datos no sensibles.
- No ampliar a varias universidades hasta que el mantenimiento de una integración UPC sea medible y repetible.

### B. CourseTable / Yale Bluebook+ — el producto no murió, pero tuvo que rediseñar su relación con la universidad

**Qué hacía.** Estudiantes de Yale crearon un planificador que comparaba cursos y mostraba evaluaciones y calificaciones de profesores. Miles lo usaron; según sus creadores, 1,871 estudiantes hicieron planes en un semestre, sobre una población de pregrado cercana a 5,000. [Reporte contemporáneo](https://www.washingtonpost.com/news/the-switch/wp/2014/01/16/yale-students-made-a-better-version-of-its-course-catalog-then-yale-shut-it-down/).

**Qué pasó.** En 2014 Yale bloqueó el sitio por preocupaciones sobre datos a los que podían acceder personas no autorizadas, el uso de marca de Yale y la manera destacada de mostrar evaluaciones. Los creadores cambiaron el nombre y ofrecieron ajustes, pero el bloqueo se mantuvo durante ese periodo. [Versión de CourseTable](https://legacy.coursetable.com/recommendations.htm).

**Qué aprendió el producto.** CourseTable sigue existiendo, pero diferencia explícitamente los datos públicos del catálogo de los datos sensibles de evaluaciones y reseñas. Sus notas de lanzamiento explican que las calificaciones y reseñas permanecían privadas porque Yale lo exigía. [Release de CourseTable](https://coursetable.com/releases/spring24). Yale, además, sigue aclarando que CourseTable es independiente y no es un sitio oficial. [Guía de Yale](https://advising.yalecollege.yale.edu/choosing-courses).

**Lectura para Campus.**

- La función más valiosa para el alumno —comparar profesores— puede ser la más sensible para la institución y docentes.
- Separar datos públicos, datos aportados por usuarios y datos académicos privados no es un detalle legal: es una decisión de producto.
- No usar logos de UPC, dar a entender una afiliación ni publicar información que el usuario no autorizó.
- Campus Profes debe priorizar reseñas contextualizadas y moderadas sobre una tabla reductiva de “mejor/peor profesor”.

### C. Coursicle — competidor vivo con un fallo de confianza y control

**Qué hace.** Coursicle ofrece planificador de horarios, tracker de tareas, datos de profesores y funciones de organización. Hoy comunica integración de tareas con Canvas, Blackboard, Brightspace y Google Classroom; también ofrece un plan Premium. [Descripción de producto](https://www.coursicle.com/about/) y [ficha de App Store](https://apps.apple.com/br/app/coursicle/id1187418307).

**Qué pasó.** En 2022, notificaciones ofensivas y extrañas desde Coursicle llevaron a UNC a retirarlo de sus páginas oficiales y bloquearlo en la red del campus. La autoridad de TI citó ausencia de controles administrativos y de desarrollo mínimos para un servicio de producción. [Reporte local](https://carolinaconnection.org/2022/04/08/after-bizarre-notifications-unc-blocks-access-to-the-coursicle-scheduling-app).

**Por qué importa aunque Coursicle siga activo.** No es un fracaso de mercado, sino una falla de gobernanza: un producto útil puede perder distribución y legitimidad en días cuando una decisión editorial o una herramienta de comunicación queda sin control.

**Lectura para Campus.**

- El canal de notificaciones, redes y WhatsApp requiere reglas de aprobación, responsable y registro de cambios.
- Nunca experimentar con mensajes sobre usuarios reales sin revisión humana.
- El tono irreverente puede servir para contenido orgánico; no sirve para comunicaciones de servicio, pagos, seguridad ni datos académicos.
- La promesa de integración debe incluir fiabilidad: informar incidencias, no ocultarlas y no prometer disponibilidad absoluta.

### D. AllHere / Ed — IA que agregaba datos académicos y colapsó

**Qué hacía.** AllHere construyó “Ed”, un asistente de IA para LAUSD que reunía datos y recursos de múltiples sistemas para orientar a estudiantes y familias. La compañía presentó el cruce de herramientas como la innovación central. [Investigación de EdSurge](https://www.edsurge.com/news/2024-07-15-an-education-chatbot-company-collapsed-where-did-the-student-data-go).

**Qué pasó.** El distrito apagó el chatbot pocos meses después de lanzarlo, cuando AllHere suspendió a gran parte de su personal por dificultades financieras. Hubo cuestionamientos públicos sobre la protección de los datos estudiantiles. Posteriormente, el Departamento de Justicia de EE. UU. acusó a la entonces CEO de fraude a inversionistas; esto explica la caída financiera de la empresa, no una conclusión sobre la utilidad del producto para los usuarios. [Comunicado del DOJ](https://www.justice.gov/usao-sdny/pr/ceo-artificial-intelligence-startup-company-charged-defrauding-investors).

**Lectura para Campus.**

- La IA con datos académicos aumenta el valor, pero también la expectativa de seguridad y continuidad.
- Campus no debe enviar el historial completo a un modelo por defecto. Cada acción debe limitarse a los datos necesarios para responder la consulta.
- La ruta de sesión local de Campus es una ventaja que debe explicarse con lenguaje claro, no solo documentarse técnicamente.
- El modelo financiero debe sostener soporte, seguridad y mantenimiento incluso sin una ronda de inversión.

### E. CampusLearn / Sizzle — cierre de una app de aprendizaje con IA

**Qué hacía.** Sizzle, posteriormente CampusLearn, ofrecía aprendizaje asistido por IA. Es menos parecido a Campus porque se centraba en estudiar contenidos, no en la conexión con sistemas académicos.

**Qué pasó.** La empresa anunció que la aplicación cerrará el 1 de septiembre de 2026; indicó que las suscripciones dejarían de renovarse y que CampusLearn pasaría a formar parte de una oferta más amplia de Campus.edu. No publicó una causa detallada del cierre. [Anuncio oficial](https://web.szl.ai/shutdown).

**Lectura para Campus.**

- No se debe atribuir el cierre a una razón que la empresa no ha divulgado.
- Sí es una advertencia: “tener IA” no garantiza que una app se vuelva indispensable. El valor debe depender de un trabajo recurrente del estudiante y no de la novedad.

### F. Applixy — tracción de marca sin continuidad

**Qué hacía.** Applixy buscaba cerrar la brecha de orientación para postulantes a educación superior. Es adyacente a Campus, no un competidor directo.

**Qué pasó.** La startup anunció que cerró sus operaciones entre 2024 y 2026. Su propio comunicado menciona cientos de conversaciones con estudiantes, 10,000 seguidores y reconocimientos, pero no explica la causa de fondo. [Comunicado de cierre](https://myapplixy.com/).

**Lectura para Campus.**

- Seguidores, entrevistas y concursos son señales útiles, no evidencia de negocio sostenible.
- Campus debe reportar por separado: alcance, activación, pago, uso semanal y renovación.

---

## 2. Patrones: qué mata o debilita estos productos

| Patrón | Evidencia | Riesgo concreto para Campus | Respuesta requerida |
|---|---|---|---|
| Integración cara o frágil | MyEdu terminó por tecnología no viable; Coursicle depende de múltiples sistemas | Cambios de Blackboard, sesiones caducas, soporte manual creciente | Medir errores, tiempo de soporte y costo por integración; ampliar solo después de estabilidad UPC. |
| Datos académicos tratados como cualquier dato | AllHere concentró sistemas y enfrentó cuestionamientos de privacidad | Pérdida de confianza si se retienen credenciales, notas o materiales de más | Mínima retención, sesión local, consentimiento específico, borrado y revocación comprensibles. |
| Información de profesores sin reglas | CourseTable fue bloqueado por la forma de mostrar evaluaciones | Conflicto con UPC/docentes, reseñas dañinas o riesgo de difamación | Moderación, trazabilidad, derecho a reporte, no publicar acusaciones ni datos personales. |
| Falta de controles de comunicación | Coursicle fue bloqueado tras notificaciones impropias | Daño reputacional que corta crecimiento y alianzas | Matriz de aprobación, acceso limitado a canales y protocolo de incidentes. |
| Uso estacional confundido con hábito | Planificadores se usan mucho antes de matrícula; una app de IA puede perder novedad | Muchos registros pero baja retención/renovación | Tener un valor semanal durante el ciclo y un valor alto antes de matrícula. |
| Métricas de vanidad | Applixy cerró aun con comunidad y reconocimientos | Invertir en seguidores sin ventas o retención | Decidir por cohortes activadas y renovaciones, no por alcance aislado. |

---

## 3. Dónde Campus es distinto — y dónde no

### Diferenciadores que sí pueden ser defendibles

1. **Conexión práctica con el ciclo real.** Campus no empieza con una IA genérica: parte de cursos, tareas, notas, anuncios y materiales que el alumno ya tiene en Blackboard.
2. **Dos momentos de alto valor.** Campus Profes y horarios resuelven matrícula; Blackboard conectado resuelve la operación semanal del ciclo. Esto reduce la estacionalidad si ambas experiencias cumplen su promesa.
3. **Contexto local.** UPC, medios de pago peruanos, lenguaje y flujos de matrícula pueden ser más útiles que una aplicación global genérica.
4. **Arquitectura centrada en la sesión del estudiante.** La sesión local y la ausencia de un intermediario con las credenciales universitarias son una base de confianza, siempre que se comuniquen y auditen correctamente.

### Suposiciones peligrosas que no son diferenciadores todavía

- “Tenemos IA”: es fácil de copiar y por sí sola no crea uso recurrente.
- “Los estudiantes están frustrados con Blackboard”: eso prueba el problema, no prueba que pagarán por resolverlo.
- “S/5 es barato”: el alumno compara contra alternativas gratuitas y el costo de aprender una nueva herramienta.
- “Más universidades = más crecimiento”: sin un proceso repetible de integración, también significa más fragilidad y soporte.
- “Las reseñas generan comunidad”: solo ocurrirá si son confiables, útiles y si el usuario recibe valor antes de pedirle contribuir.

---

## 4. Decisión de producto recomendada

### Campus debe lanzar como un producto de tres capas

| Capa | Qué incluye | Por qué existe | Estado recomendado |
|---|---|---|---|
| Núcleo semanal | Consultar pendientes, fechas, notas, anuncios, materiales y feedback desde un asistente compatible | Genera uso durante el ciclo | Prioridad máxima. |
| Decisión de matrícula | Profesores, cursos, horarios, NRC, sedes y cupos | Crea pico de valor y adquisición antes de cada ciclo | Mantener claro qué información está verificada y cuál es comunitaria. |
| Comunidad y recompensas | Reseñas útiles, créditos y referidos | Produce datos y recomendación orgánica | Activar solo con moderación y reglas listas. |

La capa de IA debe ser transversal, pero no el centro de la promesa. La pregunta comercial no es “¿quieres usar IA?”, sino: **“¿quieres saber qué te toca hacer y decidir mejor sin buscar en cinco lugares?”**

### Lo que no conviene construir o prometer todavía

- Un dashboard masivo que quiera reemplazar Blackboard por completo.
- Automatización de decisiones académicas o recomendaciones presentadas como oficiales.
- Rankings públicos agresivos de docentes.
- Integraciones simultáneas con Canvas, Moodle u otras universidades antes de validar UPC.
- Pago o suscripción antes de que el usuario vea una demostración concreta de valor.

---

## 5. Guardrails no negociables

### Datos y privacidad

- Declarar en una pantalla breve: qué se consulta, qué se guarda, por cuánto tiempo, quién lo ve y cómo se revoca.
- No guardar contraseñas de Blackboard ni pedirlas por WhatsApp.
- Mantener descargas y archivos dentro del equipo o la carpeta explícitamente elegida por el usuario, salvo que este autorice otra cosa.
- No usar notas, tareas, materiales o chats para entrenar modelos sin consentimiento expreso e informado.
- Preparar una vía real para borrar datos y una página de contacto para incidentes.

### Reseñas de profesores

- Exigir curso y periodo aproximado; pedir hechos y contexto, no solo una nota.
- Prohibir datos personales, insultos, acusaciones graves sin sustento y contenido copiado.
- Moderar antes de publicar; permitir reportar contenido y corregirlo.
- Mostrar rangos, contexto y número de aportes; evitar afirmar que una reseña representa la calidad definitiva de un profesor.
- Tener una política de revisión de reclamos antes de abrir rankings públicos.

### Comunicación y marca

- Campus es independiente: no presentarse como herramienta oficial de UPC, Blackboard ni OpenAI.
- Separar las cuentas personales del acceso operativo a Instagram, LinkedIn, TikTok y WhatsApp.
- Toda notificación masiva, anuncio de precio o mensaje de seguridad requiere revisión de una segunda persona mientras el equipo sea pequeño.
- Publicar una página de estado o, como mínimo, un canal de incidencias para no dejar a usuarios sin respuesta si Blackboard cambia o falla.

---

## 6. Experimentos que deben decidir el rumbo

### Primeros 30 días: descubrir si el núcleo resuelve un dolor recurrente

| Pregunta | Experimento | Señal para seguir | Señal para corregir |
|---|---|---|---|
| ¿El mensaje conecta? | Tres piezas: matrícula, pendientes y Blackboard + IA | Mensajes/registros que mencionan el problema específico | Alcance sin mensajes ni registros. |
| ¿Se entiende la confianza? | Demo + explicación de privacidad de 30 segundos | Usuarios pueden explicar que usan su propia sesión y pueden revocarla | Dudas repetidas sobre quién ve sus notas o contraseña. |
| ¿El producto activa? | 10–20 pilotos guiados | Usuario hace una primera consulta útil en 24 horas | No logra conectarse o no sabe qué preguntar. |
| ¿Hay hábito? | Seguimiento de uso en semana 1 y semana 2 | Regresa para otra necesidad real | Solo usa la demo inicial. |

### Días 31–60: probar precio y retención

- Ofrecer S/5 solo después de que el alumno haya visto una demostración o usado el piloto.
- Registrar cada no-conversión: no confía / no ve valor / no tiene método de pago / prefiere gratis / otro.
- Comparar el interés por Campus Profes frente al interés por Blackboard conectado; podrían requerir mensajes y precios distintos.
- Pedir una reseña o testimonio solo a usuarios que tuvieron una experiencia útil verificable.

### Días 61–90: decidir si escalar

Escalar orgánico o pauta únicamente si hay evidencia de las cuatro condiciones:

1. La mayoría de pilotos logra activarse sin soporte intensivo.
2. Una parte significativa vuelve a usar Campus durante una segunda semana.
3. El precio inicial convierte sin presión manual excesiva.
4. El costo de soporte y de infraestructura por usuario no supera el margen previsto.

Si falla una condición, la respuesta no es abrir otro canal o añadir IA: es corregir el cuello de botella específico.

---

## 7. Métricas de decisión (no métricas de vanidad)

| Métrica | Definición inicial | Decisión que habilita |
|---|---|---|
| Activación | Usuario que conecta Blackboard y completa una consulta de valor | ¿El onboarding funciona? |
| Activación asistida | Usuario que lo logra solo después de soporte humano | ¿Cuánto soporte cuesta cada alta? |
| Retención semana 2 | Activados que vuelven a hacer una consulta útil en la segunda semana | ¿Campus entra en la rutina? |
| Conversión a pago | Activados que pagan luego de probar valor | ¿El valor justifica S/5? |
| Renovación | Pagadores que continúan al siguiente mes | ¿S/15 es sostenible? |
| Aporte comunitario útil | Reseñas aprobadas que pasan moderación y son consultadas | ¿Campus Profes genera un activo de comunidad? |
| Incidentes de confianza | Quejas de privacidad, contenido o comunicación por cada 100 usuarios | ¿Podemos crecer sin dañar la marca? |

No fijar todavía una tasa “correcta” sin línea base. En los primeros 90 días importa conocer el embudo real y su principal fuga.

---

## 8. Registro de decisiones para la siguiente reunión

1. ¿Qué experiencia exacta recibe un alumno en sus primeros cinco minutos con Campus?
2. ¿Qué datos de Campus Profes son públicos, cuáles requieren cuenta y cuáles nunca se publican?
3. ¿Quién modera reseñas y con qué tiempo máximo de respuesta?
4. ¿Cuál es el texto de privacidad que cualquier estudiante puede entender antes de conectar Blackboard?
5. ¿Qué métrica semanal decidirá si el piloto continúa, cambia o se pausa?
6. ¿Qué presupuesto máximo se puede perder en el primer mes de prueba?
7. ¿Qué parte del producto seguirá funcionando si Blackboard cambia temporalmente su acceso?

## Dictamen

El camino no es copiar MyEdu, Coursicle o una app de IA. Campus debe tomar de ellos el problema validado y evitar sus dependencias:

- De **MyEdu**, aprender que la integración debe poder mantenerse.
- De **CourseTable**, aprender que reseñas y datos institucionales requieren límites claros.
- De **Coursicle**, aprender que la confianza se puede perder de golpe por mala gobernanza.
- De **AllHere**, aprender que IA + datos estudiantiles eleva la obligación de privacidad y continuidad.
- De **CampusLearn** y **Applixy**, aprender que interés, IA y comunidad no sustituyen un hábito de uso y una economía sostenible.

La apuesta sensata es un piloto UPC pequeño, verificable y confiable que demuestre hábito semanal antes de intentar ser una marca universitaria masiva.
