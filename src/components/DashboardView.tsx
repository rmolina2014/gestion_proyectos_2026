import React, { useState } from 'react';
import { Project, Requirement, Task, User } from '../types';
import { 
  FolderGit2, 
  FileText, 
  CheckSquare, 
  AlertCircle, 
  Play, 
  Users, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  BarChart4
} from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  requirements: Requirement[];
  tasks: Task[];
  users: User[];
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ 
  projects, 
  requirements, 
  tasks, 
  users, 
  onNavigate 
}: DashboardViewProps) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Stats calculation
  const totalProjects = projects.length;
  const totalRequirements = requirements.length;
  const totalTasks = tasks.length;
  
  const pendingTasks = tasks.filter(t => t.estado === 'Pendiente').length;
  const completedTasks = tasks.filter(t => t.estado === 'Terminada').length;
  const errorTasks = tasks.filter(t => t.estado === 'Error').length;
  const activeProjects = projects.filter(p => p.estado === 'Activo').length;
  const activeUsers = users.filter(u => u.estado === 'Activo').length;

  // Task Status Distribution
  const taskStatusCounts = {
    'Pendiente': tasks.filter(t => t.estado === 'Pendiente').length,
    'En desarrollo': tasks.filter(t => t.estado === 'En desarrollo').length,
    'En Testing': tasks.filter(t => t.estado === 'En Testing').length,
    'Error': tasks.filter(t => t.estado === 'Error').length,
    'Terminada': tasks.filter(t => t.estado === 'Terminada').length,
  };

  const statusColors: Record<string, string> = {
    'Pendiente': '#64748b', // Slate
    'En desarrollo': '#3b82f6', // Blue
    'En Testing': '#eab308', // Yellow
    'Error': '#ef4444', // Red
    'Terminada': '#10b981', // Emerald
  };

  const statusBgTailwind: Record<string, string> = {
    'Pendiente': 'bg-slate-100 text-slate-800 border-slate-200',
    'En desarrollo': 'bg-blue-50 text-blue-800 border-blue-200',
    'En Testing': 'bg-amber-50 text-amber-800 border-amber-200',
    'Error': 'bg-red-50 text-red-800 border-red-200',
    'Terminada': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  // Project Status Distribution
  const projectStatusCounts = {
    'Pendiente': projects.filter(p => p.estado === 'Pendiente').length,
    'Activo': projects.filter(p => p.estado === 'Activo').length,
    'Suspendido': projects.filter(p => p.estado === 'Suspendido').length,
    'Finalizado': projects.filter(p => p.estado === 'Finalizado').length,
  };

  const projectColors: Record<string, string> = {
    'Pendiente': '#94a3b8',
    'Activo': '#06b6d4', // Cyan
    'Suspendido': '#f97316', // Orange
    'Finalizado': '#10b981', // Emerald
  };

  // Tasks per User
  const tasksPerUser = users.map(user => {
    const count = tasks.filter(t => t.responsableId === user.id).length;
    return {
      name: `${user.nombre} ${user.apellido.substring(0, 1)}.`,
      fullName: `${user.nombre} ${user.apellido}`,
      count,
      role: user.rol,
      avatar: user.avatar
    };
  }).filter(u => u.count > 0 || u.role === 'Programador');

  // Interactive SVG Donut Chart Calculation
  const totalStatusTasks = Object.values(taskStatusCounts).reduce((a, b) => a + b, 0);
  const donutData = Object.entries(taskStatusCounts).map(([name, value]) => ({
    name,
    value,
    color: statusColors[name]
  })).filter(d => d.value > 0);

  let accumulatedAngle = 0;
  const radius = 60;
  const cx = 100;
  const cy = 100;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-container">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">Panel de Control </h1>
          <p className="text-slate-500 mt-1">
            Indicadores en tiempo real para la toma de decisiones basada en metodologías ágiles.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate('kanban')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm cursor-pointer"
            id="btn-nav-kanban"
          >
            <BarChart4 size={16} />
            Ver Tablero Kanban
          </button>
          
          <button 
            onClick={() => onNavigate('reportes')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm cursor-pointer"
            id="btn-nav-reports"
          >
            <FileText size={16} />
            Generar Reportes
          </button>
        </div>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
        {/* Proyectos */}
        <div 
          onClick={() => onNavigate('proyectos')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
          id="kpi-projects"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Proyectos</span>
            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors text-slate-600">
              <FolderGit2 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-sans">{totalProjects}</span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
              <TrendingUp size={12} />
              {activeProjects} activos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">Proyectos de software registrados</p>
        </div>

        {/* Requerimientos */}
        <div 
          onClick={() => onNavigate('requerimientos')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
          id="kpi-requirements"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Requerimientos</span>
            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors text-slate-600">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-sans">{totalRequirements}</span>
            <span className="text-xs text-slate-500 font-medium">Asociados</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">Especificaciones del cliente</p>
        </div>

        {/* Tareas */}
        <div 
          onClick={() => onNavigate('tareas')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
          id="kpi-tasks"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Tareas Totales</span>
            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors text-slate-600">
              <CheckSquare size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-sans">{totalTasks}</span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
              <CheckCircle2 size={12} />
              {completedTasks} completadas
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">Sprint backlog en curso</p>
        </div>

        {/* Usuarios */}
        <div 
          onClick={() => onNavigate('usuarios')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
          id="kpi-users"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Colaboradores</span>
            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors text-slate-600">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-sans">{users.length}</span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              {activeUsers} activos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">Equipo de desarrollo asignado</p>
        </div>
      </div>

      {/* Sub-indicadores de estados de Tareas */}
      <div className="grid grid-cols-3 gap-4" id="task-sub-stats">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
            <Clock size={16} />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400">Pendientes</div>
            <div className="text-xl font-bold text-slate-800 font-sans">{pendingTasks}</div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400">Terminadas</div>
            <div className="text-xl font-bold text-slate-800 font-sans">{completedTasks}</div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-red-100 text-red-700 rounded-lg">
            <AlertCircle size={16} />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400">En Error</div>
            <div className="text-xl font-bold text-slate-800 font-sans">{errorTasks}</div>
          </div>
        </div>
      </div>

      {/* Sección Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="charts-section">
        {/* Gráfico 1: Distribución de Estado de Tareas (Donut Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans mb-1">Estado de Tareas</h3>
            <p className="text-xs text-slate-500">Proporción actual del ciclo de desarrollo</p>
          </div>

          <div className="my-6 flex flex-col sm:flex-row items-center justify-around gap-4">
            {/* SVG Donut */}
            {totalStatusTasks === 0 ? (
              <div className="text-slate-400 text-sm font-sans h-40 flex items-center">No hay tareas registradas</div>
            ) : (
              <div className="relative w-40 h-40">
                <svg width="100%" height="100%" viewBox="0 0 200 200" className="transform -rotate-90">
                  {donutData.map((slice, index) => {
                    const percentage = (slice.value / totalStatusTasks) * 360;
                    const strokeDashoffset = circumference - (slice.value / totalStatusTasks) * circumference;
                    const currentAngle = accumulatedAngle;
                    accumulatedAngle += percentage;

                    const isHovered = hoveredSlice === index;

                    return (
                      <circle
                        key={slice.name}
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform={`rotate(${currentAngle} ${cx} ${cy})`}
                        style={{
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={() => setHoveredSlice(index)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      />
                    );
                  })}
                </svg>
                {/* Text in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {hoveredSlice !== null ? (
                    <>
                      <span className="text-2xl font-bold text-slate-800 font-sans">
                        {donutData[hoveredSlice].value}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                        {donutData[hoveredSlice].name}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-slate-800 font-sans">{totalStatusTasks}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">TAREAS</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Leyenda */}
            <div className="space-y-1.5 flex-1">
              {Object.entries(taskStatusCounts).map(([name, val]) => (
                <div key={name} className="flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[name] }}></span>
                    <span className="text-slate-600 font-medium">{name}</span>
                  </div>
                  <span className="text-slate-900 font-bold bg-slate-50 px-1.5 py-0.5 rounded font-mono border border-slate-100">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-3 text-center">
            <span className="text-[11px] text-slate-400 font-mono">Sprint real-time feed</span>
          </div>
        </div>

        {/* Gráfico 2: Tareas asignadas por Usuario (Column Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs lg:col-span-7 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans mb-1">Carga de Trabajo por Usuario</h3>
            <p className="text-xs text-slate-500">Cantidad de tareas asignadas (activas e históricas)</p>
          </div>

          <div className="my-6">
            {tasksPerUser.length === 0 ? (
              <div className="text-slate-400 text-sm font-sans h-44 flex items-center justify-center">No hay desarrolladores con tareas</div>
            ) : (
              <div className="space-y-4">
                {tasksPerUser.map((userStats, index) => {
                  const maxCount = Math.max(...tasksPerUser.map(u => u.count), 1);
                  const percentage = (userStats.count / maxCount) * 100;
                  
                  return (
                    <div 
                      key={userStats.fullName} 
                      className="space-y-1 group"
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${userStats.avatar}`}>
                            {userStats.name.substring(0, 1)}
                          </div>
                          <div>
                            <span className="text-slate-800 font-semibold group-hover:text-blue-600 transition-colors">{userStats.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono ml-2">({userStats.role})</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          {userStats.count} {userStats.count === 1 ? 'tarea' : 'tareas'}
                        </span>
                      </div>
                      
                      {/* Bar Container */}
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 text-right">
            <span className="text-[11px] text-slate-400 font-mono">Estadísticas basadas en asignación directa</span>
          </div>
        </div>
      </div>

      {/* Gráfico 3: Estado de Proyectos */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs" id="project-status-chart-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans mb-1">Estado de Proyectos de Software</h3>
            <p className="text-xs text-slate-500">Porcentaje de avance y volumen por fase operativa</p>
          </div>
          <span className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2 py-1 rounded font-mono font-semibold">
            {totalProjects} Registrados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {Object.entries(projectStatusCounts).map(([status, count]) => {
            const pct = totalProjects > 0 ? ((count / totalProjects) * 100).toFixed(0) : 0;
            return (
              <div 
                key={status} 
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-2 text-xs font-mono font-semibold mb-1" style={{ color: projectColors[status] }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: projectColors[status] }}></span>
                  {status}
                </div>
                <div className="text-2xl font-bold text-slate-800 font-sans">{count}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">{pct}% del portfolio</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
