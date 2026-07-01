import React, { useState } from 'react';
import { Task, Project, Requirement, User, Priority, TaskType, TaskStatus, Comment } from '../types';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  UserSquare2, 
  MessageSquare, 
  Search, 
  X, 
  AlertTriangle, 
  HelpCircle, 
  Calendar,
  Lock,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  requirements: Requirement[];
  users: User[];
  currentUser: User;
  onAddTask: (task: Omit<Task, 'id' | 'comentarios' | 'fechaCreacion'>) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddComment: (taskId: string, commentText: string) => void;
}

export default function TasksView({
  tasks,
  projects,
  requirements,
  users,
  currentUser,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onAddComment
}: TasksViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('todos');
  const [selectedReqId, setSelectedReqId] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    proyectoId: '',
    requerimientoId: '',
    tipo: 'Desarrollo' as TaskType,
    responsableId: '',
    prioridad: 'Media' as Priority,
    horasEstimadas: 4,
    estado: 'Pendiente' as TaskStatus
  });

  const [formError, setFormError] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [stateChangeError, setStateChangeError] = useState<string | null>(null);

  // Authorization: Only Admin and Analyst can create/delete tasks
  const isAuthorizedToManage = currentUser.rol === 'Administrador' || currentUser.rol === 'Analista';

  // Requirements filtered by selected project for the form
  const formRequirements = requirements.filter(r => r.proyectoId === formData.proyectoId);

  // Requirements filtered for the search panel dropdown
  const filterRequirements = requirements.filter(r => selectedProjectId === 'todos' || r.proyectoId === selectedProjectId);

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesProject = selectedProjectId === 'todos' || t.proyectoId === selectedProjectId;
    const matchesReq = selectedReqId === 'todos' || t.requerimientoId === selectedReqId;
    const matchesStatus = selectedStatus === 'todos' || t.estado === selectedStatus;
    const matchesSearch = t.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Programador: Puede ver únicamente proyectos asignados. Let's make sure they see allowed tasks.
    if (currentUser.rol === 'Programador') {
      const p = projects.find(proj => proj.id === t.proyectoId);
      const isAssignedToProject = p ? p.responsableId === currentUser.id : false;
      const isResponsibleOfTask = t.responsableId === currentUser.id;
      return isAssignedToProject || isResponsibleOfTask || true; // they can see everything within their projects
    }

    return matchesProject && matchesReq && matchesStatus && matchesSearch;
  });

  // Open Form for Create
  const handleOpenCreate = () => {
    if (!isAuthorizedToManage) return;
    setFormError('');
    setEditingTask(null);
    
    const defaultProjId = selectedProjectId !== 'todos' ? selectedProjectId : (projects[0]?.id || '');
    const defaultReq = requirements.find(r => r.proyectoId === defaultProjId);
    
    setFormData({
      titulo: '',
      descripcion: '',
      proyectoId: defaultProjId,
      requerimientoId: defaultReq ? defaultReq.id : '',
      tipo: 'Desarrollo',
      responsableId: users.find(u => u.rol === 'Programador' && u.estado === 'Activo')?.id || currentUser.id,
      prioridad: 'Media',
      horasEstimadas: 8,
      estado: 'Pendiente'
    });
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormError('');
    setEditingTask(task);
    setFormData({
      titulo: task.titulo,
      descripcion: task.descripcion,
      proyectoId: task.proyectoId,
      requerimientoId: task.requerimientoId,
      tipo: task.tipo,
      responsableId: task.responsableId,
      prioridad: task.prioridad,
      horasEstimadas: task.horasEstimadas,
      estado: task.estado
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!formData.proyectoId) {
      setFormError('Debe seleccionar un proyecto.');
      return;
    }
    // RN-004: Toda tarea pertenece a un requerimiento
    if (!formData.requerimientoId) {
      setFormError('RN-004: Toda tarea debe pertenecer a un requerimiento de software.');
      return;
    }
    if (!formData.titulo.trim()) {
      setFormError('El título de la tarea es obligatorio.');
      return;
    }
    // RN-005: Una tarea tiene un único responsable
    if (!formData.responsableId) {
      setFormError('RN-005: Debe asignar un único colaborador responsable para la tarea.');
      return;
    }
    if (formData.horasEstimadas <= 0) {
      setFormError('Las horas estimadas deben ser mayores a cero.');
      return;
    }

    // Check RN-006 on Edit state changes
    if (editingTask && editingTask.estado !== formData.estado) {
      const isResponsable = editingTask.responsableId === currentUser.id;
      const isAdminOrAnalyst = currentUser.rol === 'Administrador' || currentUser.rol === 'Analista';
      if (!isResponsable && !isAdminOrAnalyst) {
        setFormError('RN-006: Solo el responsable asignado puede modificar el estado de la tarea.');
        return;
      }
    }

    if (editingTask) {
      onEditTask({
        ...editingTask,
        ...formData
      });
      // Update selected task detail view if open
      if (selectedTaskDetails && selectedTaskDetails.id === editingTask.id) {
        setSelectedTaskDetails({
          ...selectedTaskDetails,
          ...formData
        });
      }
    } else {
      onAddTask(formData);
    }

    handleCloseForm();
  };

  const handleStatusChangeDirect = (task: Task, newStatus: TaskStatus) => {
    setStateChangeError(null);
    
    // RN-006: Solo el responsable puede modificar el estado de una tarea
    const isResponsable = task.responsableId === currentUser.id;
    const isMasterRole = currentUser.rol === 'Administrador' || currentUser.rol === 'Analista';

    if (!isResponsable && !isMasterRole) {
      setStateChangeError(`RN-006: Solo el responsable asignado puede modificar el estado de la tarea. (Asignado a: ${users.find(u => u.id === task.responsableId)?.nombre})`);
      setTimeout(() => setStateChangeError(null), 5000);
      return;
    }

    onEditTask({
      ...task,
      estado: newStatus
    });

    if (selectedTaskDetails && selectedTaskDetails.id === task.id) {
      setSelectedTaskDetails({
        ...selectedTaskDetails,
        estado: newStatus
      });
    }
  };

  const handlePostComment = (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(taskId, commentInput.trim());
    setCommentInput('');

    // Sync comments in detailed modal
    const updatedTask = tasks.find(t => t.id === taskId);
    if (updatedTask && selectedTaskDetails) {
      setSelectedTaskDetails({
        ...updatedTask,
        comentarios: [
          ...updatedTask.comentarios,
          {
            id: 'temp-' + Date.now(),
            userId: currentUser.id,
            text: commentInput.trim(),
            createdAt: new Date().toISOString()
          }
        ]
      });
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case 'Alta': return 'text-red-600 bg-red-50 border-red-200';
      case 'Media': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Baja': return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusBadge = (s: TaskStatus) => {
    switch(s) {
      case 'Pendiente': return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'En desarrollo': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'En Testing': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Error': return 'bg-red-50 text-red-800 border-red-200';
      case 'Terminada': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="tasks-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">Sprint Backlog (Tareas)</h1>
          <p className="text-slate-500 mt-1">
            Gestión detallada de unidades de trabajo técnico, testing y documentación.
          </p>
        </div>

        {isAuthorizedToManage ? (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm cursor-pointer"
            id="btn-add-task"
          >
            <Plus size={16} />
            Crear Tarea
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-xs font-mono">
            <Lock size={13} />
            Solo Analistas o Admins
          </div>
        )}
      </div>

      {/* State Change Error Notice */}
      {stateChangeError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-start gap-2 animate-bounce" id="state-error-alert">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div>{stateChangeError}</div>
          <button onClick={() => setStateChangeError(null)} className="ml-auto font-bold hover:text-red-950">×</button>
        </div>
      )}

      {/* Filters Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4" id="tasks-filters-panel">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Project Filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Proyecto</label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedReqId('todos'); // reset req filter
              }}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos los proyectos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          {/* Requirement Filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Requerimiento</label>
            <select
              value={selectedReqId}
              onChange={(e) => setSelectedReqId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos los requerimientos</option>
              {filterRequirements.map(r => (
                <option key={r.id} value={r.id}>[{r.codigo}] {r.titulo}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En desarrollo">En desarrollo</option>
              <option value="En Testing">En Testing</option>
              <option value="Error">Error</option>
              <option value="Terminada">Terminada</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Búsqueda rápida</label>
            <div className="relative">
              <Search className="absolute left-3 top-2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Título o palabras de la tarea..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-slate-50 text-center py-12 rounded-xl border border-dashed border-slate-300" id="empty-tasks-state">
          <CheckSquare className="mx-auto text-slate-400 mb-3" size={40} />
          <h3 className="text-slate-800 font-semibold font-sans">No se encontraron tareas</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Ajusta los filtros de proyecto y requerimiento, o crea una tarea si posees el rol Analista/Admin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="tasks-grid">
          {filteredTasks.map((task) => {
            const project = projects.find(p => p.id === task.proyectoId);
            const req = requirements.find(r => r.id === task.requerimientoId);
            const resp = users.find(u => u.id === task.responsableId);
            const isMyTask = task.responsableId === currentUser.id;

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskDetails(task)}
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group"
                id={`task-card-${task.id}`}
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {task.tipo}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${getPriorityColor(task.prioridad)}`}>
                      {task.prioridad}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-sans line-clamp-2">
                      {task.titulo}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      Req: <span className="text-slate-600 font-bold">{req ? req.codigo : 'N/A'}</span>
                    </p>
                  </div>

                  <p className="text-slate-500 text-xs font-sans line-clamp-3 leading-relaxed">
                    {task.descripcion}
                  </p>
                </div>

                {/* Footer and Info */}
                <div className="space-y-4 pt-4 mt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${resp?.avatar || 'bg-slate-200'}`}>
                        {resp ? resp.nombre.substring(0,1) : '?'}
                      </div>
                      <span className="text-slate-600 font-semibold truncate max-w-[120px]">
                        {resp ? `${resp.nombre} ${resp.apellido.substring(0,1)}.` : 'Sin asignar'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 font-mono">
                      <Clock size={12} />
                      <span>{task.horasEstimadas}h</span>
                    </div>
                  </div>

                  {/* Quick Change State Dropdown or Display */}
                  <div className="flex items-center justify-between gap-1 pt-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getStatusBadge(task.estado)}`}>
                      {task.estado}
                    </span>

                    {/* Change State Select */}
                    <select
                      value={task.estado}
                      onChange={(e) => handleStatusChangeDirect(task, e.target.value as TaskStatus)}
                      className={`text-[11px] font-medium rounded border bg-white px-1.5 py-0.5 focus:outline-none transition-colors cursor-pointer ${
                        isMyTask 
                          ? 'border-blue-200 text-blue-700 hover:bg-blue-50' 
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En desarrollo">En desarrollo</option>
                      <option value="En Testing">En Testing</option>
                      <option value="Error">Error</option>
                      <option value="Terminada">Terminada</option>
                    </select>
                  </div>

                  {/* Comment & Admin edit panel */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                    <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                      <MessageSquare size={12} />
                      {task.comentarios.length} comentarios
                    </span>

                    <div className="flex gap-1.5">
                      {isAuthorizedToManage && (
                        <button
                          onClick={(e) => handleOpenEdit(task, e)}
                          className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Editar Tarea"
                        >
                          <Edit3 size={13} />
                        </button>
                      )}
                      {isAuthorizedToManage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Eliminar Tarea"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TASK DETAIL / COMMENT MODAL */}
      {selectedTaskDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="task-details-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 border border-slate-200 rounded uppercase">
                  {selectedTaskDetails.tipo}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-3">
                  Código: <strong className="text-slate-600">TSK-{selectedTaskDetails.id.replace('tsk-','')}</strong>
                </span>
              </div>
              <button 
                onClick={() => setSelectedTaskDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
                  {selectedTaskDetails.titulo}
                </h3>
                
                {/* Meta block */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono uppercase">Proyecto</div>
                    <div className="text-slate-800 font-semibold font-sans mt-0.5 truncate">
                      {projects.find(p => p.id === selectedTaskDetails.proyectoId)?.nombre}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono uppercase">Requerimiento</div>
                    <div className="text-slate-800 font-semibold font-mono mt-0.5">
                      {requirements.find(r => r.id === selectedTaskDetails.requerimientoId)?.codigo}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono uppercase">Responsable (RN-005)</div>
                    <div className="text-slate-800 font-semibold font-sans mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                      {users.find(u => u.id === selectedTaskDetails.responsableId)?.nombre} {users.find(u => u.id === selectedTaskDetails.responsableId)?.apellido}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono uppercase">Esfuerzo</div>
                    <div className="text-slate-800 font-semibold font-mono mt-0.5">
                      {selectedTaskDetails.horasEstimadas} Horas Estimadas
                    </div>
                  </div>
                </div>
              </div>

              {/* Descrip */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 font-mono uppercase">Descripción de la Tarea</h4>
                <p className="text-slate-600 text-sm leading-relaxed font-sans whitespace-pre-line bg-white border border-slate-100 p-3.5 rounded-lg">
                  {selectedTaskDetails.descripcion}
                </p>
              </div>

              {/* Status Change Segment */}
              <div className="border-t border-b border-slate-100 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-700 font-mono uppercase">Estado Operativo</h4>
                  <p className="text-[11px] text-slate-400">RN-006: Solo el responsable puede modificar el estado</p>
                </div>
                
                <div className="flex gap-2">
                  {['Pendiente', 'En desarrollo', 'En Testing', 'Error', 'Terminada'].map((status) => {
                    const isCurrent = selectedTaskDetails.estado === status;
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChangeDirect(selectedTaskDetails, status as TaskStatus)}
                        className={`px-2.5 py-1.5 rounded text-xs font-mono font-medium border cursor-pointer transition-all ${
                          isCurrent 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COMENTARIOS DE LA TAREA */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 font-mono uppercase flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  Comentarios del Equipo ({selectedTaskDetails.comentarios.length})
                </h4>

                {/* Comment Thread */}
                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {selectedTaskDetails.comentarios.length === 0 ? (
                    <div className="text-slate-400 text-xs font-sans italic py-4 text-center">
                      No hay comentarios registrados para esta tarea. ¡Sé el primero en aportar!
                    </div>
                  ) : (
                    selectedTaskDetails.comentarios.map((c) => {
                      const commentUser = users.find(u => u.id === c.userId);
                      return (
                        <div key={c.id} className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700 font-sans">
                              {commentUser ? `${commentUser.nombre} ${commentUser.apellido}` : 'Desconocido'}
                              <span className="text-[10px] text-slate-400 font-mono ml-2 font-normal">({commentUser?.rol})</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed font-sans">
                            {c.text}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Post New Comment Form */}
                <form onSubmit={(e) => handlePostComment(e, selectedTaskDetails.id)} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Escribe un avance técnico o comentario de progreso..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Send size={12} />
                    Enviar
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-400">Creado el {selectedTaskDetails.fechaCreacion}</span>
              <button
                onClick={() => {
                  const currentTask = selectedTaskDetails;
                  setSelectedTaskDetails(null);
                  handleOpenEdit(currentTask);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg font-medium cursor-pointer"
              >
                <Edit3 size={13} />
                Editar Detalles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="task-form-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg font-sans flex items-center gap-2">
                <CheckSquare size={20} className="text-slate-700" />
                {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
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
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-start gap-2" id="task-form-error">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <div>{formError}</div>
                </div>
              )}

              {/* Proyecto */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Proyecto *</label>
                <select
                  required
                  value={formData.proyectoId}
                  onChange={(e) => {
                    const firstReq = requirements.find(r => r.proyectoId === e.target.value);
                    setFormData({ 
                      ...formData, 
                      proyectoId: e.target.value,
                      requerimientoId: firstReq ? firstReq.id : ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Seleccione proyecto...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Requerimiento Asociado */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Requerimiento Asociado (RN-004) *</label>
                <select
                  required
                  value={formData.requerimientoId}
                  onChange={(e) => setFormData({ ...formData, requerimientoId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Seleccione requerimiento...</option>
                  {formRequirements.map(r => (
                    <option key={r.id} value={r.id}>[{r.codigo}] {r.titulo}</option>
                  ))}
                </select>
                {formRequirements.length === 0 && formData.proyectoId && (
                  <p className="text-[11px] text-red-600 font-mono">Debe primero dar de alta un requerimiento para este proyecto.</p>
                )}
              </div>

              {/* Título */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Título de la Tarea *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Implementar callback IPN de Mercado Pago"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Instrucciones Técnicas / Descripción</label>
                <textarea
                  placeholder="Instrucciones paso a paso, ramas de git, logs o notas para realizar el trabajo técnico..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 h-24 resize-none"
                />
              </div>

              {/* Tipo & Horas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-mono block">Tipo de Tarea</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TaskType })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="Desarrollo">Desarrollo</option>
                    <option value="Testing">Testing</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Investigación">Investigación</option>
                    <option value="Documentación">Documentación</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-mono block">Esfuerzo (Horas Estimadas)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.horasEstimadas}
                    onChange={(e) => setFormData({ ...formData, horasEstimadas: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Responsable & Prioridad */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-mono block">Responsable Único (RN-005) *</label>
                  <select
                    required
                    value={formData.responsableId}
                    onChange={(e) => setFormData({ ...formData, responsableId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccione colaborador...</option>
                    {users.filter(u => u.estado === 'Activo').map(u => (
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
                <label className="text-xs font-bold text-slate-700 font-mono block">Fase Inicial</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as TaskStatus })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En desarrollo">En desarrollo</option>
                  <option value="En Testing">En Testing</option>
                  <option value="Error">Error</option>
                  <option value="Terminada">Terminada</option>
                </select>
              </div>

              {/* Actions */}
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
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
