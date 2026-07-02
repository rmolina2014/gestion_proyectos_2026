# Reglas y Convenciones del Proyecto

## Protección de Datos de Producción y Estado Inicial
- **NO modificar ni sobreescribir `src/initialData.ts` en futuros commits o despliegues.** 
- Los datos iniciales (`initialUsers`, `initialProjects`, `initialRequirements`, `initialTasks`) sirven únicamente como base o referencia. Modificarlos en futuros commits puede impactar y alterar la información ya almacenada en las bases de datos o almacenamiento persistente (`localStorage`) de los usuarios en producción.
- Respetar siempre las personalizaciones del cliente en producción (identidad de HacerDigital, correos corporativos y configuración actual).
