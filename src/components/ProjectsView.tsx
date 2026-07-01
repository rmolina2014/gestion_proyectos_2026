import React, { useState } from 'react';
import { Project, User, Task, ProjectStatus, Priority } from '../types';
import { 
  FolderGit2, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  UserSquare2, 
  ShieldAlert, 
  AlertTriangle,
  Briefcase,
  Search,
  CheckCircle,
  X,
  FileCheck
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  users: User[];
  tasks: Task[];
  currentUser: User;
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => string | null; // returns error message if validation fails (RN-010)
}

export default function ProjectsView({
  projects,
  users,
  tasks,
  currentUser,
  onAddProject,
  onEditProject,
  onDeleteProject
}: ProjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    cliente: '',
    descripcion: '',
    fechaInicio: '',
    fechaEstimada: '',
    estado: 'Pendiente' as ProjectStatus,
    responsableId: '',
    prioridad: 'Media' as Priority
  });

  const [formError, setFormError] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Filter based on role
  // Programador: Puede ver únicamente proyectos asignados. (either project responsible or has tasks in the project)
  const visibleProjects = projects.filter(p => {
    // Check if the user is programmer
    if (currentUser.rol === 'Programador') {
      const isResponsible = p.responsableId === currentUser.id;
      const hasTaskInProject = tasks.some(t => t.proyectoId === p.id && t.responsableId === currentUser.id);
      return isResponsible || hasTaskInProject;
    }
    return true; // Admin and Analyst can see all
  });

  // Apply search query and status filter
  const filteredProjects = visibleProjects.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'todos' || p.estado === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Open modal for Create
  const handleOpenCreate = () => {
    setFormError('');
    setEditingProject(null);
    setFormData({
      nombre: '',
      cliente: '',
      descripcion: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaEstimada: '',
      estado: 'Pendiente',
      responsableId: users.find(u => u.rol !== 'Programador' && u.estado === 'Activo')?.id || users[0]?.id || '',
      prioridad: 'Media'
    });
    setIsFormOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (project: Project) => {
    setFormError('');
    setEditingProject(project);
    setFormData({
      nombre: project.nombre,
      cliente: project.cliente,
      descripcion: project.descripcion,
      fechaInicio: project.fechaInicio,
      fechaEstimada: project.fechaEstimada,
      estado: project.estado,
      responsableId: project.responsableId,
      prioridad: project.prioridad
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nombre.trim()) {
      setFormError('El nombre del proyecto es obligatorio.');
      return;
    }
    if (!formData.cliente.trim()) {
      setFormError('El nombre del cliente es obligatorio.');
      return;
    }
    // RN-002: Un proyecto debe tener un responsable.
    if (!formData.responsableId) {
      setFormError('RN-002: Todo proyecto debe tener un responsable asignado.');
      return;
    }
    if (!formData.fechaEstimada) {
      setFormError('Debe ingresar una fecha de finalización estimada.');
      return;
    }

    if (editingProject) {
      onEditProject({
        ...editingProject,
        ...formData
      });
    } else {
      onAddProject(formData);
    }

    handleCloseForm();
  };

  const handleDelete = (id: string) => {
    setDeleteError(null);
    setDeleteSuccess(null);
    
    // Check role restriction: Programador cannot delete.
    if (currentUser.rol === 'Programador') {
      setDeleteError('No tiene permisos para eliminar información.');
      return;
    }

    const error = onDeleteProject(id);
    if (error) {
      setDeleteError(error);
    } else {
      setDeleteSuccess('Proyecto eliminado correctamente.');
      setTimeout(() => setDeleteSuccess(null), 3000);
    }
  };

  const getPriorityBadgeColor = (p: Priority) => {
    switch(p) {
      case 'Alta': return 'bg-red-50 text-red-700 border-red-200';
      case 'Media': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Baja': return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeColor = (s: ProjectStatus) => {
    switch(s) {
      case 'Pendiente': return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Activo': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Suspendido': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Finalizado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="projects-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">Administración de Proyectos</h1>
          <p className="text-slate-500 mt-1">
            {currentUser.rol === 'Programador' 
              ? 'Tus proyectos de desarrollo asignados y tareas activas.' 
              : 'Gestión ágil de la cartera de proyectos activos de desarrollo.'
            }
          </p>
        </div>

        {currentUser.rol !== 'Programador' && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm cursor-pointer"
            id="btn-add-project"
          >
            <Plus size={16} />
            Crear Proyecto
          </button>
        )}
      </div>

      {/* Messages */}
      {deleteError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-start gap-3" id="delete-error">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">Error de validación:</span> {deleteError}
          </div>
          <button onClick={() => setDeleteError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {deleteSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-3" id="delete-success">
          <FileCheck size={18} className="shrink-0" />
          <div>{deleteSuccess}</div>
          <button onClick={() => setDeleteSuccess(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters and search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center" id="projects-filters">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, cliente o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white text-sm"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {['todos', 'Pendiente', 'Activo', 'Suspendido', 'Finalizado'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                selectedStatus === status 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === 'todos' ? 'Todos' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Projects */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-50 text-center py-12 rounded-xl border border-dashed border-slate-300" id="empty-projects-state">
          <FolderGit2 className="mx-auto text-slate-400 mb-3" size={40} />
          <h3 className="text-slate-800 font-semibold font-sans">No se encontraron proyectos</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
            {searchQuery || selectedStatus !== 'todos' 
              ? 'Prueba modificando tus criterios de búsqueda o filtros.'
              : 'Comienza creando tu primer proyecto con el botón "Crear Proyecto".'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="projects-grid">
          {filteredProjects.map((project) => {
            const resp = users.find(u => u.id === project.responsableId);
            const projectTasks = tasks.filter(t => t.proyectoId === project.id);
            const doneTasks = projectTasks.filter(t => t.estado === 'Terminada').length;
            const progress = projectTasks.length > 0 
              ? Math.round((doneTasks / projectTasks.length) * 100) 
              : 0;

            return (
              <div 
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                id={`project-card-${project.id}`}
              >
                {/* Card Header */}
                <div className="p-6 pb-4 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg tracking-tight font-sans hover:text-blue-600 transition-colors">
                          {project.nombre}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">Cliente: <span className="text-slate-600 font-bold">{project.cliente}</span></p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${getPriorityBadgeColor(project.prioridad)}`}>
                        {project.prioridad}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${getStatusBadgeColor(project.estado)}`}>
                        {project.estado}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm mt-4 leading-relaxed line-clamp-3 font-sans">
                    {project.descripcion}
                  </p>
                </div>

                {/* Info and Progress */}
                <div className="px-6 py-4 space-y-4 bg-slate-50/50">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                      <span>Tareas Completas</span>
                      <span className="font-bold text-slate-700">{doneTasks}/{projectTasks.length} ({progress}%)</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {/* Responsable */}
                    <div className="flex items-center gap-2">
                      <UserSquare2 size={16} className="text-slate-400" />
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-mono">Responsable</div>
                        <div className="text-slate-700 font-medium">
                          {resp ? `${resp.nombre} ${resp.apellido}` : 'Sin asignar'}
                        </div>
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-mono">Lanzamiento</div>
                        <div className="text-slate-700 font-medium font-mono">{project.fechaEstimada || 'Sin definir'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs bg-white rounded-b-xl">
                  <span className="text-slate-400 font-mono text-[11px]">
                    Inicio: {project.fechaInicio}
                  </span>

                  <div className="flex gap-2">
                    {/* Edit button */}
                    <button
                      onClick={() => handleOpenEdit(project)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
                      title="Editar proyecto"
                    >
                      <Edit3 size={15} />
                    </button>

                    {/* Delete button (programmers cannot delete) */}
                    {currentUser.rol !== 'Programador' && (
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar proyecto"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="project-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg font-sans flex items-center gap-2">
                <FolderGit2 size={20} className="text-slate-700" />
                {editingProject ? 'Editar Proyecto' : 'Crear Proyecto Nuevo'}
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

              {/* Nombre */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Nombre del Proyecto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: E-Commerce Vinoteca Mendoza"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Cliente */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Cliente / PYME Solicitante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Distribuidora del Cuyo SRL"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Descripción / Alcance</label>
                <textarea
                  placeholder="Detalles sobre las funcionalidades, integraciones y expectativas del sistema..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24 resize-none"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-mono block">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-mono block">Fecha Estimada *</label>
                  <input
                    type="date"
                    required
                    value={formData.fechaEstimada}
                    onChange={(e) => setFormData({ ...formData, fechaEstimada: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Responsable & Prioridad */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-mono block">Responsable (RN-002) *</label>
                  {currentUser.rol === 'Administrador' ? (
                    <select
                      value={formData.responsableId}
                      onChange={(e) => setFormData({ ...formData, responsableId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Seleccione responsable</option>
                      {users.filter(u => u.estado === 'Activo').map(u => (
                        <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.rol})</option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-600">
                      {users.find(u => u.id === formData.responsableId)?.nombre || currentUser.nombre} {users.find(u => u.id === formData.responsableId)?.apellido || currentUser.apellido} (Predefinido)
                    </div>
                  )}
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
                <label className="text-xs font-bold text-slate-700 font-mono block">Estado Operativo</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as ProjectStatus })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Activo">Activo</option>
                  <option value="Suspendido">Suspendido</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>

              {/* Botones de acción */}
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
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
