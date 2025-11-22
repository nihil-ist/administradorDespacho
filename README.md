# Administrador Despacho

## Recordatorios por correo para la agenda

El backend ahora puede enviar recordatorios automáticos para cada evento de la agenda en los siguientes momentos antes de la hora programada: 24 h, 6 h, 1 h y 15 min. Los correos se envían al email registrado del usuario propietario del evento.

### Configuración requerida

Define las credenciales SMTP en el archivo `backend/.env` (ya creado con valores de ejemplo) o ajusta `backend/.env.example` y cópialo como `.env` antes de iniciar el backend:

```
EMAIL_HOST=smtp.tudominio.com
EMAIL_PORT=587
EMAIL_USER=notificaciones@tudominio.com
EMAIL_PASS=super-secreto
EMAIL_FROM="Administrador Despacho" <notificaciones@tudominio.com>
# Opcional
EMAIL_SECURE=false
TZ=America/Mexico_City
ENABLE_AGENDA_REMINDERS=true
```

> Si `EMAIL_FROM` no se define se usará `EMAIL_USER`. Establece `ENABLE_AGENDA_REMINDERS=false` cuando quieras desactivar temporalmente el job sin quitar la configuración.

### Funcionamiento

- El job se programa automáticamente al iniciar el backend (`node-cron`, corre cada minuto).
- Solo se consideran eventos con fecha futura y se agrupan por usuario/ventana para evitar múltiples correos innecesarios.
- Cada evento guarda internamente qué ventanas ya fueron notificadas (`recordatoriosEnviados`) para evitar duplicados.
- Si el envío falla se reintentará en la siguiente ejecución hasta que se logre.

### Dependencias nuevas

Ejecuta `npm install` dentro de `backend/` para asegurarte de tener `nodemailer` y `node-cron` instalados.