# Administrador Despacho

Plataforma interna para despachos jurídicos que centraliza expedientes, agenda, directorio y herramientas administrativas. El sistema tiene backend en Node.js/Express + MongoDB y frontend en Angular 18 (standalone components).

## Características principales

- **Autenticación y roles**: inicio de sesión con usuarios almacenados en MongoDB, contraseñas con bcrypt y guardas en Angular. Roles configurados (Administrador, Abogado, Practicante, Becario) controlan navegación, permisos y filtros.
- **Gestión de expedientes**: creación, consulta, actualización y eliminación de expedientes, con control de archivos subidos a Firebase Storage y filtros automáticos según el abogado asignado.
- **Agenda personal y del equipo**: calendario FullCalendar con eventos vinculados a expedientes, modal de creación/edición, panel de próximos eventos y detalle lateral.
- **Recordatorios por correo**: al crear un evento se envía un correo inmediato al propietario y un job automático despacha recordatorios 24 h, 6 h, 1 h y 15 min antes.
- **Herramientas administrativas**: administración de usuarios, configuración y secciones de soporte/contacto listas para contenido.