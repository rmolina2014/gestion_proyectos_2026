import React, { useState } from 'react';
import { Requirement, Project, User, Priority, ReqStatus } from '../types';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  UserCheck, 
  Search, 
  X, 
  FolderGit2, 
  AlertTriangle,
  ArrowRightCircle,
  FileCheck2,
  Lock
} from 'lucide-react';

interface RequirementsViewProps {
  requirements: Requirement[];
  projects: Project[];
  users: User[];
  currentUser: User;
  onAddRequirement: (req: Omit<Requirement, 'id' | 'codigo' | 'fechaCreacion' | 'fechaActualizacion'>) => void;
  onEditRequirement: (req: Requirement) => void;
  onDeleteRequirement: (id: string) => void;
}

export default function RequirementsView({
  requirements,
  projects,
  users,
  currentUser,
  onAddRequirement,
  onEditRequirement,
  onDeleteRequirement
}: RequirementsViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    proyectoId: '',
    titulo: '',
    descripcion: '',
    prioridad: 'Media' as Priority,
    estado: 'Nuevo' as ReqStatus,
    analistaId: ''
  });

  const [formError, setFormError] = useState('');

  // Authorized to edit/create: Admin and Analyst
  const isAuthorized = currentUser.rol === 'Administrador' || currentUser.rol === 'Analista';

  // Filter based on user's projects if they are Programmer
  const visibleProjects = projects.filter(p => {
    if (currentUser.rol === 'Programador') {
      return p.responsableId === currentUser.id || requirements.some(r => r.proyectoId === p.id && r.analistaId === currentUser.id);
    }
    return true;
  });

  // Allowed requirements
  const visibleRequirements = requirements.filter(r => {
    // If programmer, only see requirements for projects the programmer is allowed to see
    if (currentUser.rol === 'Programador') {
      return projects.some(p => p.id === r.proyectoId && (p.responsableId === currentUser.id || r.analistaId === currentUser.id || true)); // simple visibility
    }
    return true;
  });

  // Filtered requirements
  const filteredRequirements = visibleRequirements.filter(r => {
    const matchesProject = selectedProjectId === 'todos' || r.proyectoId === selectedProjectId;
    const matchesStatus = selectedStatus === 'todos' || r.estado === selectedStatus;
    const matchesSearch = r.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.codigo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesStatus && matchesSearch;
  });

  const handleOpenCreate = () => {
    if (!isAuthorized) return;
    setFormError('');
    setEditingReq(null);
    setFormData({
      proyectoId: selectedProjectId !== 'todos' ? selectedProjectId : (projects[0]?.id || ''),
      titulo: '',
      descripcion: '',
      prioridad: 'Media',
      estado: 'Nuevo',
      analistaId: users.find(u => u.rol === 'Analista' && u.estado === 'Activo')?.id || currentUser.id
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (req: Requirement) => {
    if (!isAuthorized) return;
    setFormError('');
    setEditingReq(req);
    setFormData({
      proyectoId: req.proyectoId,
      titulo: req.titulo,
      descripcion: req.descripcion,
      prioridad: req.prioridad,
      estado: req.estado,
      analistaId: req.analistaId
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingReq(null);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // RN-003: Todo requerimiento pertenece a un proyecto
    if (!formData.proyectoId) {
      setFormError('RN-003: Todo requerimiento debe pertenecer a un proyecto.');
      return;
    }
    if (!formData.titulo.trim()) {
      setFormError('El título del requerimiento es obligatorio.');
      return;
    }
    if (!formData.analistaId) {
      setFormError('Debe asignar un analista responsable.');
      return;
    }

    if (editingReq) {
      onEditRequirement({
        ...editingReq,
        ...formData,
        fechaActualizacion: new Date().toISOString().split('T')[0]
      });
    } else {
      onAddRequirement(formData);
    }

    handleCloseForm();
  };

  const getPriorityBadgeColor = (p: Priority) => {
    switch(p) {
      case 'Alta': return 'bg-red-50 text-red-700 border-red-200';
      case 'Media': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Baja': return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeColor = (s: ReqStatus) => {
    switch(s) {
      case 'Nuevo': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'En análisis': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Aprobado': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'En desarrollo': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Terminado': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="requirements-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">Requerimientos de Software</h1>
          <p className="text-slate-500 mt-1">
            Mapeo de especificaciones, casos de uso e historias de usuario de cada proyecto.
          </p>
        </div>

        {isAuthorized ? (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm cursor-pointer"
            id="btn-add-req"
          >
            <Plus size={16} />
            Crear Requerimiento
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-xs font-mono">
            <Lock size={13} />
            Solo Analistas o Admins
          </div>
        )}
      </div>

      {/* Filters and search panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4" id="req-filters-panel">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Proyecto</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-sans"
            >
              <option value="todos">Todos los proyectos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Estado del Requerimiento</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-sans"
            >
              <option value="todos">Todos los estados</option>
              <option value="Nuevo">Nuevo</option>
              <option value="En análisis">En análisis</option>
              <option value="Aprobado">Aprobado</option>
              <option value="En desarrollo">En desarrollo</option>
              <option value="Terminado">Terminado</option>
            </select>
          </div>

          {/* Search query */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Buscar por texto</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Código, título, palabras clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Requirements */}
      {filteredRequirements.length === 0 ? (
        <div className="bg-slate-50 text-center py-12 rounded-xl border border-dashed border-slate-300" id="empty-reqs-state">
          <FileText className="mx-auto text-slate-400 mb-3" size={40} />
          <h3 className="text-slate-800 font-semibold font-sans">No se encontraron requerimientos</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
            {searchQuery || selectedProjectId !== 'todos' || selectedStatus !== 'todos'
              ? 'Prueba modificando tus filtros o ingresando otro término de búsqueda.'
              : 'Empieza a definir los requerimientos y especificaciones del cliente.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4" id="reqs-list">
          {filteredRequirements.map((req) => {
            const project = projects.find(p => p.id === req.proyectoId);
            const analista = users.find(u => u.id === req.analistaId);

            return (
              <div 
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-slate-900"
                id={`req-card-${req.id}`}
                style={{ borderLeftColor: getPriorityBadgeColor(req.prioridad).includes('red') ? '#ef4444' : getPriorityBadgeColor(req.prioridad).includes('amber') ? '#f59e0b' : '#64748b' }}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {req.codigo}
                    </span>
                    <h3 className="font-bold text-slate-900 font-sans text-base">
                      {req.titulo}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${getPriorityBadgeColor(req.prioridad)}`}>
                      {req.prioridad}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${getStatusBadgeColor(req.estado)}`}>
                      {req.estado}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm font-sans line-clamp-2 max-w-4xl">
                    {req.descripcion}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <FolderGit2 size={13} />
                      Proyecto: <strong className="text-slate-600">{project ? project.nombre : 'Desconocido'}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck size={13} />
                      Analista: <strong className="text-slate-600">{analista ? `${analista.nombre} ${analista.apellido}` : 'Sin asignar'}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      Creado: <strong className="text-slate-600">{req.fechaCreacion}</strong>
                    </span>
                  </div>
                </div>

                {/* Actions & Buttons */}
                <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Actualizado: {req.fechaActualizacion}
                  </span>

                  <div className="flex gap-2">
                    {/* Edit button */}
                    {isAuthorized && (
                      <button
                        onClick={() => handleOpenEdit(req)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
                        title="Editar requerimiento (RN-007)"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}

                    {/* Delete button */}
                    {isAuthorized && (
                      <button
                        onClick={() => onDeleteRequirement(req.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar requerimiento"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Form para Crear o Editar */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="req-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg font-sans flex items-center gap-2">
                <FileText size={20} className="text-slate-700" />
                {editingReq ? 'Modificar Requerimiento' : 'Alta de Requerimiento'}
              </h3>
              <button 
                onClick={handleCloseForm}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-start gap-2" id="form-error">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <div>{formError}</div>
                </div>
              )}

              {/* Proyecto Asociado */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Proyecto Asociado (RN-003) *</label>
                <select
                  required
                  value={formData.proyectoId}
                  onChange={(e) => setFormData({ ...formData, proyectoId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Seleccione proyecto...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Título */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Título del Requerimiento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Integración de pasarela de pago Mercado Pago"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Especificación / Criterios de Aceptación</label>
                <textarea
                  placeholder="Defina las reglas de negocio, entradas, salidas y comportamiento esperado del requerimiento..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-32 resize-none"
                />
              </div>

              {/* Prioridad & Analista */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-mono block">Analista Designado *</label>
                  <select
                    required
                    value={formData.analistaId}
                    onChange={(e) => setFormData({ ...formData, analistaId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccione analista...</option>
                    {users.filter(u => u.rol !== 'Programador' && u.estado === 'Activo').map(u => (
                      <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.rol})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-mono block">Prioridad</label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as Priority })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Fase del Requerimiento</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as ReqStatus })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="En análisis">En análisis</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="En desarrollo">En desarrollo</option>
                  <option value="Terminado">Terminado</option>
                </select>
              </div>

              {/* Botones */}
              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2 text-sm">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Guardar Requerimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
