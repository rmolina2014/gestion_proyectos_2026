import { User, Project, Requirement, Task } from './types';

export const initialUsers: User[] = [
  {
    id: 'usr-1',
    nombre: 'Sofía',
    apellido: 'Rossi',
    email: 'sofia@sistemas-austral.com.ar',
    contrasena: 'admin123',
    rol: 'Administrador',
    estado: 'Activo',
    avatar: 'bg-emerald-500 text-white',
  },
  {
    id: 'usr-2',
    nombre: 'Mariano',
    apellido: 'Giménez',
    email: 'mariano@sistemas-austral.com.ar',
    contrasena: 'analista123',
    rol: 'Analista',
    estado: 'Activo',
    avatar: 'bg-amber-500 text-white',
  },
  {
    id: 'usr-3',
    nombre: 'Esteban',
    apellido: 'Percivati',
    email: 'esteban@sistemas-austral.com.ar',
    contrasena: 'prog123',
    rol: 'Programador',
    estado: 'Activo',
    avatar: 'bg-sky-500 text-white',
  },
  {
    id: 'usr-4',
    nombre: 'Valentina',
    apellido: 'Soler',
    email: 'valentina@sistemas-austral.com.ar',
    contrasena: 'prog456',
    rol: 'Programador',
    estado: 'Activo',
    avatar: 'bg-purple-500 text-white',
  },
  {
    id: 'usr-5',
    nombre: 'Nicolás',
    apellido: 'Fernández',
    email: 'nicolas@sistemas-austral.com.ar',
    contrasena: 'inactivo123',
    rol: 'Programador',
    estado: 'Inactivo',
    avatar: 'bg-slate-400 text-white',
  }
];

export const initialProjects: Project[] = [
  {
    id: 'prj-1',
    nombre: 'E-Commerce Vinoteca Malbec',
    cliente: 'Distribuidora del Plata S.A.',
    descripcion: 'Desarrollo de tienda online premium con integración de Mercado Pago, cálculo de envíos vía Correo Argentino y panel de control de stock de vinos de alta gama.',
    fechaInicio: '2026-05-15',
    fechaEstimada: '2026-08-30',
    estado: 'Activo',
    responsableId: 'usr-1', // Sofía Rossi (Admin)
    prioridad: 'Alta'
  },
  {
    id: 'prj-2',
    nombre: 'Portal Turnos Médicos Sanatorio',
    cliente: 'Grupo Médico Conurbano',
    descripcion: 'Plataforma web ágil para la autogestión de turnos médicos en tiempo real con notificaciones por WhatsApp y validación de cartilla de obras sociales argentinas.',
    fechaInicio: '2026-06-01',
    fechaEstimada: '2026-09-15',
    estado: 'Activo',
    responsableId: 'usr-2', // Mariano Giménez (Analista)
    prioridad: 'Media'
  },
  {
    id: 'prj-3',
    nombre: 'Facturación Electrónica AFIP',
    cliente: 'Cámara Metalúrgica Rosario',
    descripcion: 'Módulo de facturación adaptado a las regulaciones de la AFIP, consumiendo Web Services de autenticación y autorización (WSAA) y facturación electrónica (WSFEX).',
    fechaInicio: '2026-03-01',
    fechaEstimada: '2026-06-15',
    estado: 'Finalizado',
    responsableId: 'usr-1',
    prioridad: 'Alta'
  },
  {
    id: 'prj-4',
    nombre: 'SGA Almacén Logístico',
    cliente: 'Logística San Martín SRL',
    descripcion: 'Sistema de gestión de almacenes con lector de códigos QR, control de despachos y asignación inteligente de dársenas para camiones de reparto.',
    fechaInicio: '2026-07-10',
    fechaEstimada: '2026-11-20',
    estado: 'Pendiente',
    responsableId: 'usr-2',
    prioridad: 'Baja'
  }
];

export const initialRequirements: Requirement[] = [
  // E-Commerce Vinoteca (prj-1)
  {
    id: 'req-1',
    codigo: 'REQ-001',
    proyectoId: 'prj-1',
    titulo: 'Integración Mercado Pago SDK',
    descripcion: 'El sistema debe permitir abonar las compras mediante tarjetas de crédito, débito y dinero en cuenta usando el checkout de Mercado Pago de forma transparente.',
    prioridad: 'Alta',
    estado: 'En desarrollo',
    analistaId: 'usr-2', // Mariano Giménez
    fechaCreacion: '2026-05-20',
    fechaActualizacion: '2026-06-25'
  },
  {
    id: 'req-2',
    codigo: 'REQ-002',
    proyectoId: 'prj-1',
    titulo: 'Cálculo de Envío Correo Argentino',
    descripcion: 'Consumir la API de Correo Argentino para cotizar costos de envío a domicilio o sucursal según el código postal ingresado por el cliente en el carrito.',
    prioridad: 'Media',
    estado: 'Aprobado',
    analistaId: 'usr-2',
    fechaCreacion: '2026-05-22',
    fechaActualizacion: '2026-06-10'
  },
  {
    id: 'req-3',
    codigo: 'REQ-003',
    proyectoId: 'prj-1',
    titulo: 'Carrito de Compras y Reserva de Stock',
    descripcion: 'Persistencia temporal del carrito del usuario y bloqueo de botellas en stock durante 15 minutos mientras el cliente inicia el flujo de pago para evitar sobreventa.',
    prioridad: 'Alta',
    estado: 'Terminado',
    analistaId: 'usr-1',
    fechaCreacion: '2026-05-16',
    fechaActualizacion: '2026-06-20'
  },

  // Portal Turnos Médicos (prj-2)
  {
    id: 'req-4',
    codigo: 'REQ-004',
    proyectoId: 'prj-2',
    titulo: 'Validación Automática de Obra Social',
    descripcion: 'Consultar el padrón del Sanatorio en tiempo real según el DNI del paciente para verificar si la obra social (OSDE, Medicus, Galeno, PAMI) está activa y cubre la consulta.',
    prioridad: 'Alta',
    estado: 'En análisis',
    analistaId: 'usr-2',
    fechaCreacion: '2026-06-02',
    fechaActualizacion: '2026-06-15'
  },
  {
    id: 'req-5',
    codigo: 'REQ-005',
    proyectoId: 'prj-2',
    titulo: 'Notificación de Turno vía WhatsApp API',
    descripcion: 'Envío automático de mensajes con los datos del turno (médico, especialidad, dirección, fecha) y un botón de cancelación rápida 24 hs antes de la cita.',
    prioridad: 'Media',
    estado: 'Nuevo',
    analistaId: 'usr-2',
    fechaCreacion: '2026-06-05',
    fechaActualizacion: '2026-06-05'
  },

  // Facturación Electrónica AFIP (prj-3)
  {
    id: 'req-6',
    codigo: 'REQ-006',
    proyectoId: 'prj-3',
    titulo: 'Autenticación AFIP WSAA',
    descripcion: 'Generación de ticket de requerimiento de acceso (TRA), firma digital mediante certificados openssl y obtención del Token y Sign correspondientes.',
    prioridad: 'Alta',
    estado: 'Terminado',
    analistaId: 'usr-1',
    fechaCreacion: '2026-03-02',
    fechaActualizacion: '2026-04-10'
  },
  {
    id: 'req-7',
    codigo: 'REQ-007',
    proyectoId: 'prj-3',
    titulo: 'Generación de Comprobantes tipo A y B',
    descripcion: 'Envío de los datos de la factura al web service de factura electrónica para obtener el CAE (Código de Autorización Electrónico) y vencimiento oficial.',
    prioridad: 'Alta',
    estado: 'Terminado',
    analistaId: 'usr-1',
    fechaCreacion: '2026-03-05',
    fechaActualizacion: '2026-05-12'
  }
];

export const initialTasks: Task[] = [
  // Tasks for Mercado Pago (req-1)
  {
    id: 'tsk-1',
    titulo: 'Crear credenciales de prueba en MP Developer Console',
    descripcion: 'Configurar usuarios integradores ficticios de comprador y vendedor para realizar transacciones de testing en el sandbox local.',
    proyectoId: 'prj-1',
    requerimientoId: 'req-1',
    tipo: 'Investigación',
    responsableId: 'usr-3', // Esteban (Programador)
    prioridad: 'Media',
    horasEstimadas: 6,
    estado: 'Terminada',
    fechaCreacion: '2026-05-21',
    comentarios: [
      {
        id: 'c-1',
        userId: 'usr-3',
        text: 'Ya cree las cuentas de prueba. Los emails son seller_test@test.com y buyer_test@test.com.',
        createdAt: '2026-05-21T14:30:00Z'
      }
    ]
  },
  {
    id: 'tsk-2',
    titulo: 'Diseñar endpoint de webhook (IPN) para Mercado Pago',
    descripcion: 'Implementar el callback en el servidor que recibe los eventos de cambio de estado de los pagos y actualiza la orden de compra en la base de datos local.',
    proyectoId: 'prj-1',
    requerimientoId: 'req-1',
    tipo: 'Desarrollo',
    responsableId: 'usr-3', // Esteban
    prioridad: 'Alta',
    horasEstimadas: 16,
    estado: 'En desarrollo',
    fechaCreacion: '2026-05-22',
    comentarios: [
      {
        id: 'c-2',
        userId: 'usr-2',
        text: 'Recordá validar el signature de Mercado Pago para asegurar la veracidad de la notificación.',
        createdAt: '2026-05-23T09:15:00Z'
      }
    ]
  },
  {
    id: 'tsk-3',
    titulo: 'Pruebas de flujo de pago rechazado por saldo insuficiente',
    descripcion: 'Verificar la UI y la respuesta del sistema al simular un pago declinado por el sandbox de Mercado Pago.',
    proyectoId: 'prj-1',
    requerimientoId: 'req-1',
    tipo: 'Testing',
    responsableId: 'usr-4', // Valentina (Programadora)
    prioridad: 'Baja',
    horasEstimadas: 4,
    estado: 'Pendiente',
    fechaCreacion: '2026-05-25',
    comentarios: []
  },

  // Tasks for Correo Argentino (req-2)
  {
    id: 'tsk-4',
    titulo: 'Conectar API REST de cotización de envíos',
    descripcion: 'Codificar la integración del API de Correo Argentino pasando el peso total del carrito y los códigos postales origen-destino.',
    proyectoId: 'prj-1',
    requerimientoId: 'req-2',
    tipo: 'Desarrollo',
    responsableId: 'usr-4', // Valentina
    prioridad: 'Media',
    horasEstimadas: 12,
    estado: 'Error',
    fechaCreacion: '2026-05-26',
    comentarios: [
      {
        id: 'c-3',
        userId: 'usr-4',
        text: 'La API de Correo Argentino me está devolviendo un error 401 Unauthorized de forma intermitente, incluso usando la API key de desarrollo provista por el cliente.',
        createdAt: '2026-05-28T16:45:00Z'
      },
      {
        id: 'c-4',
        userId: 'usr-1',
        text: 'Ya me puse en contacto con el soporte técnico de Correo Argentino para que revisen los alcances de la API key de test.',
        createdAt: '2026-05-29T10:10:00Z'
      }
    ]
  },

  // Tasks for Carrito (req-3)
  {
    id: 'tsk-5',
    titulo: 'Maquetado de UI del carrito flotante',
    descripcion: 'Diseño responsivo del componente lateral del carrito con animaciones de entrada y listado de vinos seleccionados.',
    proyectoId: 'prj-1',
    requerimientoId: 'req-3',
    tipo: 'Desarrollo',
    responsableId: 'usr-3',
    prioridad: 'Media',
    horasEstimadas: 8,
    estado: 'Terminada',
    fechaCreacion: '2026-05-17',
    comentarios: []
  },
  {
    id: 'tsk-6',
    titulo: 'Lógica de expiración del bloqueo de stock',
    descripcion: 'Utilizar temporizadores cliente y validación servidor para expirar las botellas reservadas si el pago no se procesó a tiempo.',
    proyectoId: 'prj-1',
    requerimientoId: 'req-3',
    tipo: 'Desarrollo',
    responsableId: 'usr-4',
    prioridad: 'Alta',
    horasEstimadas: 10,
    estado: 'Terminada',
    fechaCreacion: '2026-05-18',
    comentarios: []
  },

  // Tasks for Turnos Médicos (req-4, req-5)
  {
    id: 'tsk-7',
    titulo: 'Investigar web service del padrón del Sanatorio',
    descripcion: 'Leer documentación del WS SOAP heredado del sanatorio para verificar el formato de entrada de credenciales y datos de DNI.',
    proyectoId: 'prj-2',
    requerimientoId: 'req-4',
    tipo: 'Investigación',
    responsableId: 'usr-3',
    prioridad: 'Media',
    horasEstimadas: 8,
    estado: 'En Testing',
    fechaCreacion: '2026-06-03',
    comentarios: []
  },
  {
    id: 'tsk-8',
    titulo: 'Crear plantillas oficiales de WhatsApp en Facebook Developer Console',
    descripcion: 'Definar y mandar a aprobar los templates necesarios ante Meta (ejemplo: recordatorio_turno_pyme) que requiere la API oficial de WhatsApp Business.',
    proyectoId: 'prj-2',
    requerimientoId: 'req-5',
    tipo: 'Documentación',
    responsableId: 'usr-2', // Mariano (Analista) - Analista puede crear tareas y modificarlas
    prioridad: 'Baja',
    horasEstimadas: 5,
    estado: 'Pendiente',
    fechaCreacion: '2026-06-06',
    comentarios: []
  },

  // Tasks for AFIP (req-6, req-7)
  {
    id: 'tsk-9',
    titulo: 'Configurar certificados x509 con OpenSSL',
    descripcion: 'Generar la Clave Privada y el Certificate Signing Request (CSR) oficial para subir al panel de Clave Fiscal AFIP en producción y homologación.',
    proyectoId: 'prj-3',
    requerimientoId: 'req-6',
    tipo: 'Mantenimiento',
    responsableId: 'usr-3',
    prioridad: 'Alta',
    horasEstimadas: 8,
    estado: 'Terminada',
    fechaCreacion: '2026-03-03',
    comentarios: []
  },
  {
    id: 'tsk-10',
    titulo: 'Consumir WSFEV1 (Factura Electrónica Nacional)',
    descripcion: 'Codificar el parseo de XML/JSON y encriptación de firma digital del WSAA para obtener el CAE autorizado por AFIP.',
    proyectoId: 'prj-3',
    requerimientoId: 'req-7',
    tipo: 'Desarrollo',
    responsableId: 'usr-4',
    prioridad: 'Alta',
    horasEstimadas: 24,
    estado: 'Terminada',
    fechaCreacion: '2026-03-08',
    comentarios: [
      {
        id: 'c-5',
        userId: 'usr-4',
        text: 'La homologación dio exitosa al 100%. Ya facturamos lotes de prueba con CAE emitido.',
        createdAt: '2026-03-12T18:00:00Z'
      }
    ]
  }
];
