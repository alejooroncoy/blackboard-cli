# Modelo de pagos y reseñas de Campus

> Documento de decisión — 13 de agosto de 2026

## Decisión comercial

- Primer mes: **S/5**.
- Desde el segundo mes: **S/15 al mes**.
- Una reseña útil y aprobada entrega **S/0.50 en Campus Credits**.
- Los créditos se aplican a la **siguiente renovación**; no devuelven el pago actual.
- Se pueden aplicar como máximo **S/5 en créditos por renovación**.
- El precio mínimo de una renovación, después de créditos, es **S/10**.

La membresía reúne la creación y modificación de horarios, información de profesores, preparación para matrícula y el acceso para conectar la IA del estudiante con Blackboard.

## Costos conocidos

Para planificación se usa un tipo de cambio de **S/3.70 por dólar**.

| Concepto | Costo | Equivalente mensual aproximado |
|---|---:|---:|
| Vercel | US$20/mes | S/74.00 |
| Railway Hobby | US$5/mes | S/18.50 |
| Dominio, primer año | US$8/año | S/2.47 |
| Dominio, segundo año | US$15/año | S/4.63 |

- Costo fijo mensual durante el primer año: **S/94.97**.
- Costo fijo mensual desde el segundo año: **S/97.13**.
- Kapso es un costo variable y debe medirse por conversación real después de las optimizaciones.
- El consumo histórico de US$46.03 de Kapso incluye pruebas y el modelo anterior; no debe asumirse automáticamente como el costo mensual futuro.

## Margen estimado

Con un costo optimizado de Kapso/IA de entre S/0.04 y S/0.11 por alumno activo:

| Cobro | Margen antes de costos fijos |
|---|---:|
| Primer mes: S/5 | S/4.89–S/4.96 |
| Renovación con descuento máximo: S/10 | S/9.89–S/9.96 |
| Renovación regular: S/15 | S/14.89–S/14.96 |

Con diez alumnos pagando S/15, la utilidad estimada después de repartir S/95 de costos fijos es aproximadamente **S/5.39 por alumno**. Con 25 alumnos es aproximadamente **S/11.09 por alumno**.

## Meta de recuperación

- Capital propio por recuperar: **S/305**.
- Préstamo del amigo por devolver: **S/300**.
- Total por recuperar/devolver: **S/605**.
- Incluyendo aproximadamente S/95 de operación mensual: **meta mínima S/700**.

Al precio inicial de S/5 se necesitan aproximadamente **144 activaciones** para alcanzar S/700 después del costo variable estimado. La meta comercial recomendada es **150–160 activaciones**, para mantener un pequeño margen de seguridad.

El dinero debe separarse en este orden:

1. Costos operativos.
2. Reserva para devolver los S/300 prestados.
3. Recuperación progresiva de los S/305 propios.
4. Caja mínima para imprevistos.

## Flujo de pago

Este flujo debe funcionar principalmente con botones, reglas y mensajes predefinidos. No necesita una conversación generada por IA.

### 1. Se presenta el beneficio

Cuando el alumno intenta usar una función incluida en Campus, se muestra:

> Activa Campus por S/5 durante tu primer mes. Desde el siguiente mes, la renovación cuesta S/15. Puedes obtener hasta S/5 de descuento en tu próxima renovación compartiendo reseñas útiles de tus profesores.

Botones:

- **Activar por S/5**
- **Ver qué incluye**
- **Ahora no**

### 2. Se elige el medio de pago

Botones:

- **Yape**
- **Plin**
- **Transferencia**
- **Necesito ayuda**

Se muestran los datos del medio elegido y un único llamado a la acción:

> Realiza el pago de S/5 y envíanos aquí la captura del comprobante.

Si el alumno no puede usar esos medios:

> Escríbenos al +51 946 189 585 y te ayudaremos a activar Campus.

### 3. Se recibe el comprobante

Al llegar una imagen:

1. Se registra el archivo, teléfono, monto esperado y fecha.
2. Se revisan automáticamente los datos básicos: monto, operación y posible duplicado.
3. Se activa el acceso de forma provisional por 24 horas.
4. El pago queda en una bandeja para revisión manual.

Mensaje inmediato:

> Recibimos tu comprobante ✅ Campus quedó activado provisionalmente mientras verificamos el pago. Te avisaremos si necesitamos algún dato adicional.

La IA solo se usa si la lectura del comprobante es dudosa. Si no hay suficiente confianza, se pide una nueva imagen o se envía a revisión manual; nunca se inventa el resultado.

### 4. Revisión manual

- **Aprobado:** la activación queda confirmada y se registra la fecha de renovación.
- **No legible:** se solicita una foto más clara sin desactivar inmediatamente al alumno.
- **Duplicado o inválido:** se bloquea la activación provisional y se deriva a soporte.
- **Sin revisar en 24 horas:** el caso se mantiene en una cola visible; no debe desaparecer silenciosamente.

### 5. Renovación

Tres días antes del vencimiento:

> Tu plan Campus vence el {fecha}. La renovación cuesta S/15 y tienes S/{créditos} disponibles. Tu total a pagar es S/{total}.

Botones:

- **Renovar ahora**
- **Usar mis créditos**
- **Ver mis beneficios**

El cálculo es una regla fija:

```text
descuento = mínimo(créditos_disponibles, S/5)
total = S/15 - descuento
```

No se necesita IA para calcular, cobrar, activar o renovar.

## Flujo de reseñas y Campus Credits

### 1. Invitación

La invitación aparece después de que el alumno recibió valor, no inmediatamente después del pago:

> ¿Llevaste clase con alguno de estos profesores? Comparte una reseña útil y, si es aprobada, recibirás S/0.50 para tu próxima renovación.

Debe quedar visible que el crédito corresponde a una renovación futura.

### 2. Formulario estructurado

La mayoría de los datos se recopila sin IA:

- Profesor.
- Curso.
- Ciclo aproximado.
- Dificultad.
- Claridad al enseñar.
- Forma de evaluar.
- Asistencia o participación.
- Comentario libre.

### 3. Validación

Las reglas automáticas verifican:

- Campos mínimos completos.
- Longitud suficiente.
- Que no sea un duplicado.
- Que no contenga teléfonos, correos u otros datos personales.
- Que no sean insultos, acusaciones graves sin contexto o texto copiado.
- Que el alumno no esté superando límites razonables de envío.

La IA se utiliza únicamente para apoyar la moderación del comentario libre: detectar contenido dañino, incoherente o demasiado genérico. Los casos dudosos pasan a revisión humana.

Una reseña no se aprueba por ser positiva o negativa, sino por ser específica, respetuosa y útil.

### 4. Crédito

Cuando se aprueba:

> Tu reseña fue aprobada ✅ Sumamos S/0.50 a tus Campus Credits. Podrás usarlos en tu siguiente renovación.

Cuando se rechaza, se explica el motivo y se permite corregirla. El crédito solo se registra una vez por reseña aprobada.

## Qué no debe usar IA

- Mostrar precios y beneficios.
- Elegir el medio de pago.
- Calcular descuentos.
- Activar o vencer una membresía.
- Registrar y descontar créditos.
- Detectar comprobantes repetidos mediante identificadores y reglas.
- Enviar recordatorios de renovación.
- Formularios y botones de reseñas.

## Cuándo sí puede ayudar la IA

- Leer una captura cuando el reconocimiento normal no sea suficiente.
- Moderar el texto libre de una reseña.
- Identificar reseñas vagas o posiblemente duplicadas por significado.
- Redactar una pregunta corta cuando falte información.

En todos esos casos debe recibir solo los datos necesarios, devolver una respuesta estructurada y declarar incertidumbre. Una decisión financiera dudosa siempre termina en revisión humana.

## Datos mínimos que se deben guardar

Por alumno:

- Teléfono o identificador.
- Estado de membresía: inactiva, provisional, activa, vencida o bloqueada.
- Fecha de inicio y renovación.
- Precio contratado.
- Campus Credits disponibles y movimientos.
- Comprobantes y estado de revisión.
- Reseñas enviadas, estado y recompensa.

Esto evita depender del historial completo de WhatsApp o de la memoria de un modelo.

## Métricas esenciales

- Personas que ven el cobro.
- Personas que eligen pagar.
- Comprobantes recibidos, aprobados y rechazados.
- Tiempo medio de verificación.
- Activaciones y renovaciones.
- Créditos emitidos y utilizados.
- Reseñas enviadas, aprobadas y corregidas.
- Costo de Kapso por alumno pagador.
- Ingreso neto y margen por alumno.

