import React, { useState } from 'react';
import { Task, Project, User, TaskStatus, Priority } from '../types';
import { 
  BarChart4, 
  Clock, 
  UserCircle, 
  Plus, 
  HelpCircle, 
  AlertTriangle,
  FolderGit2,
  Calendar,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BadgeAlert
} from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  currentUser: User;
  onEditTask: (task: Task) => void;
}

export default function KanbanView({
  tasks,
  projects,
  users,
  currentUser,
  onEditTask
}: KanbanViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('todos');
  const [ruleNotice, setRuleNotice] = useState<string | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<TaskStatus | null>(null);

  // Filter tasks based on selected project
  const visibleTasks = tasks.filter(t => {
    const matchesProject = selectedProjectId === 'todos' || t.proyectoId === selectedProjectId;
    
    // Programador project visibility
    if (currentUser.rol === 'Programador') {
      const p = projects.find(proj => proj.id === t.proyectoId);
      const isAssigned = p ? p.responsableId === currentUser.id : false;
      const isResponsibleOfTask = t.responsableId === currentUser.id;
      return matchesProject && (isAssigned || isResponsibleOfTask || true);
    }
    
    return matchesProject;
  });

  // Columns specification
  const columns: { label: string; status: TaskStatus; color: string; bg: string; border: string }[] = [
    { label: 'Pendiente', status: 'Pendiente', color: 'text-slate-700', bg: 'bg-slate-100/75', border: 'border-slate-200' },
    { label: 'En Desarrollo', status: 'En desarrollo', color: 'text-blue-700', bg: 'bg-blue-50/40', border: 'border-blue-100' },
    { label: 'En Testing', status: 'En Testing', color: 'text-amber-700', bg: 'bg-amber-50/40', border: 'border-amber-100' },
    { label: 'Error (QA)', status: 'Error', color: 'text-red-700', bg: 'bg-red-50/40', border: 'border-red-100' },
    { label: 'Terminada', status: 'Terminada', color: 'text-emerald-700', bg: 'bg-emerald-50/40', border: 'border-emerald-150' },
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDraggedOverColumn(status);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    setRuleNotice(null);
    
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    if (task.estado === targetStatus) return; // no change

    // RN-006 Validation: Solo el responsable puede modificar el estado de una tarea.
    const isResponsable = task.responsableId === currentUser.id;
    const isMasterRole = currentUser.rol === 'Administrador' || currentUser.rol === 'Analista';

    if (!isResponsable && !isMasterRole) {
      const respUser = users.find(u => u.id === task.responsableId);
      setRuleNotice(`RN-006: Solo el responsable puede modificar el estado de esta tarea. (Asignado a: ${respUser ? `${respUser.nombre} ${respUser.apellido}` : 'Desconocido'})`);
      setTimeout(() => setRuleNotice(null), 5000);
      return;
    }

    // Success: Update state
    onEditTask({
      ...task,
      estado: targetStatus
    });
  };

  const handleMoveCardClick = (task: Task, targetStatus: TaskStatus) => {
    setRuleNotice(null);
    
    // RN-006 Validation
    const isResponsable = task.responsableId === currentUser.id;
    const isMasterRole = currentUser.rol === 'Administrador' || currentUser.rol === 'Analista';

    if (!isResponsable && !isMasterRole) {
      const respUser = users.find(u => u.id === task.responsableId);
      setRuleNotice(`RN-006: Solo el responsable asignado puede cambiar el estado. (Asignado a: ${respUser ? `${respUser.nombre} ${respUser.apellido}` : 'Desconocido'})`);
      setTimeout(() => setRuleNotice(null), 5000);
      return;
    }

    onEditTask({
      ...task,
      estado: targetStatus
    });
  };

  const getPriorityBorderLeft = (p: Priority) => {
    switch(p) {
      case 'Alta': return 'border-l-4 border-l-red-500';
      case 'Media': return 'border-l-4 border-l-amber-500';
      case 'Baja': return 'border-l-4 border-l-slate-400';
    }
  };

  const getPriorityColorText = (p: Priority) => {
    switch(p) {
      case 'Alta': return 'text-red-700 bg-red-50 border-red-100';
      case 'Media': return 'text-amber-700 bg-amber-50 border-amber-100';
      case 'Baja': return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="kanban-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">Tablero Ágil Kanban</h1>
          <p className="text-slate-500 mt-1">
            Arrastra las tarjetas de tareas para actualizar sus fases en tiempo real.
          </p>
        </div>

        {/* Project Selector filter to reduce visual noise */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 font-mono shrink-0">Filtrar por Proyecto:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 shadow-xs rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 font-sans cursor-pointer max-w-xs"
            id="kanban-project-select"
          >
            <option value="todos">Todos los proyectos activos</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rules Banner (Highly informative for testing!) */}
      {ruleNotice ? (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-start gap-2.5 shadow-xs animate-pulse" id="kanban-rule-warning">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">Regla de Negocio (RN-006):</span> {ruleNotice}
            <div className="mt-1 font-mono text-[10px] text-amber-700">Solo el programador asignado o un Administrador/Analista puede operar este cambio.</div>
          </div>
          <button onClick={() => setRuleNotice(null)} className="ml-auto font-bold text-amber-800 hover:text-amber-950">×</button>
        </div>
      ) : (
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5 text-xs text-slate-500">
          <ShieldCheck size={16} className="text-slate-400 shrink-0" />
          <span>
            <strong className="text-slate-700">Simulación Activa:</strong> Prueba arrastrar las tarjetas. Como <strong className="text-slate-700">{currentUser.nombre} ({currentUser.rol})</strong>, puedes mover las tareas que tienes asignadas.
          </span>
        </div>
      )}

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4" id="kanban-board">
        {columns.map((column) => {
          const columnTasks = visibleTasks.filter(t => t.estado === column.status);
          const isOver = draggedOverColumn === column.status;

          return (
            <div
              key={column.status}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
              className={`rounded-2xl border p-4 flex flex-col min-h-[60vh] max-h-[75vh] transition-all duration-200 ${column.bg} ${column.border} ${
                isOver ? 'ring-2 ring-blue-500 ring-offset-2 scale-[1.01]' : ''
              }`}
              id={`kanban-column-${column.status}`}
            >
              {/* Column Title and Counter */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50">
                <span className={`font-bold font-sans text-xs uppercase tracking-wider flex items-center gap-1.5 ${column.color}`}>
                  <span className="w-2 h-2 rounded-full bg-current inline-block"></span>
                  {column.label}
                </span>
                <span className="bg-white/80 backdrop-blur-xs text-[11px] font-mono font-bold text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  {columnTasks.length}
                </span>
              </div>

              {/* Column Scrollable Content */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1" style={{ scrollbarWidth: 'thin' }}>
                {columnTasks.length === 0 ? (
                  <div className="h-28 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-[11px] p-4 text-center font-sans">
                    Arroja tareas aquí
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const project = projects.find(p => p.id === task.proyectoId);
                    const resp = users.find(u => u.id === task.responsableId);
                    const isMyTask = task.responsableId === currentUser.id;

                    return (
                      <div
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative select-none ${getPriorityBorderLeft(task.prioridad)} ${
                          isMyTask ? 'ring-1 ring-blue-500/20' : ''
                        }`}
                        id={`kanban-card-${task.id}`}
                      >
                        {/* Header metadata */}
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 border border-slate-100 rounded">
                            {task.tipo}
                          </span>
                          <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full border ${getPriorityColorText(task.prioridad)}`}>
                            {task.prioridad}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-slate-800 text-xs tracking-tight line-clamp-2 leading-snug mb-1 font-sans">
                          {task.titulo}
                        </h4>

                        {/* Project name */}
                        <p className="text-[10px] text-slate-400 truncate mb-3 flex items-center gap-1 font-sans">
                          <FolderGit2 size={10} className="shrink-0" />
                          {project ? project.nombre : 'Proyecto'}
                        </p>

                        {/* Assignee & estimate footer */}
                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-[10px]">
                          <div className="flex items-center gap-1">
                            <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] font-bold ${resp?.avatar || 'bg-slate-200 text-slate-600'}`}>
                              {resp ? resp.nombre.substring(0,1) : '?'}
                            </div>
                            <span className="text-slate-500 font-semibold max-w-[80px] truncate" title={resp ? `${resp.nombre} ${resp.apellido}` : ''}>
                              {resp ? resp.nombre : 'Sin asignado'}
                            </span>
                          </div>

                          <span className="font-mono text-slate-400 flex items-center gap-0.5 font-medium">
                            <Clock size={10} />
                            {task.horasEstimadas}h
                          </span>
                        </div>

                        {/* Quick state shift buttons for touch or keyboard accessibility */}
                        <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[9px] text-slate-400">
                          <span>Mover:</span>
                          <div className="flex gap-1">
                            {columns.filter(c => c.status !== task.estado).map((c) => (
                              <button
                                key={c.status}
                                onClick={() => handleMoveCardClick(task, c.status)}
                                className="px-1 py-0.5 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 border border-slate-200 rounded text-[9px] font-mono cursor-pointer transition-colors"
                                title={`Mover a ${c.label}`}
                              >
                                {c.label.substring(0,3)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
