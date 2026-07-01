import React, { useState, useMemo } from 'react';
import { 
  Task, 
  Project, 
  Requirement, 
  User, 
  TaskStatus, 
  TaskType, 
  Priority 
} from '../types';
import { 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Filter, 
  X, 
  Search, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Layers, 
  User as UserIcon,
  HelpCircle,
  TrendingUp,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ReportsViewProps {
  tasks: Task[];
  projects: Project[];
  requirements: Requirement[];
  users: User[];
}

export default function ReportsView({ tasks, projects, requirements, users }: ReportsViewProps) {
  // Filter States
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedReqId, setSelectedReqId] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Clear all filters
  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedProjectId('all');
    setSelectedReqId('all');
    setSelectedUserId('all');
    setSelectedStatus('all');
    setSelectedType('all');
    setSelectedPriority('all');
    setSearchQuery('');
  };

  // Filtered Tasks Memo
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Date range filter
      if (startDate && task.fechaCreacion < startDate) return false;
      if (endDate && task.fechaCreacion > endDate) return false;

      // Project filter
      if (selectedProjectId !== 'all' && task.proyectoId !== selectedProjectId) return false;

      // Requirement filter
      if (selectedReqId !== 'all' && task.requerimientoId !== selectedReqId) return false;

      // Assignee filter
      if (selectedUserId !== 'all' && task.responsableId !== selectedUserId) return false;

      // Status filter
      if (selectedStatus !== 'all' && task.estado !== selectedStatus) return false;

      // Type filter
      if (selectedType !== 'all' && task.tipo !== selectedType) return false;

      // Priority filter
      if (selectedPriority !== 'all' && task.prioridad !== selectedPriority) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.titulo.toLowerCase().includes(query);
        const matchesDesc = task.descripcion.toLowerCase().includes(query);
        
        // Find requirement code/title
        const req = requirements.find(r => r.id === task.requerimientoId);
        const matchesReq = req ? (req.codigo.toLowerCase().includes(query) || req.titulo.toLowerCase().includes(query)) : false;

        if (!matchesTitle && !matchesDesc && !matchesReq) return false;
      }

      return true;
    });
  }, [tasks, startDate, endDate, selectedProjectId, selectedReqId, selectedUserId, selectedStatus, selectedType, selectedPriority, searchQuery, requirements]);

  // KPIs of filtered tasks
  const kpis = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.estado === 'Terminada').length;
    const inProgress = filteredTasks.filter(t => t.estado === 'En desarrollo').length;
    const inTesting = filteredTasks.filter(t => t.estado === 'En Testing').length;
    const pending = filteredTasks.filter(t => t.estado === 'Pendiente').length;
    const errorCount = filteredTasks.filter(t => t.estado === 'Error').length;

    const totalHours = filteredTasks.reduce((sum, t) => sum + (t.horasEstimadas || 0), 0);
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Distribution by Priority
    const priorityCounts = {
      Alta: filteredTasks.filter(t => t.prioridad === 'Alta').length,
      Media: filteredTasks.filter(t => t.prioridad === 'Media').length,
      Baja: filteredTasks.filter(t => t.prioridad === 'Baja').length
    };

    // Distribution by Type
    const typeCounts = {
      Desarrollo: filteredTasks.filter(t => t.tipo === 'Desarrollo').length,
      Testing: filteredTasks.filter(t => t.tipo === 'Testing').length,
      Mantenimiento: filteredTasks.filter(t => t.tipo === 'Mantenimiento').length,
      Investigación: filteredTasks.filter(t => t.tipo === 'Investigación').length,
      Documentación: filteredTasks.filter(t => t.tipo === 'Documentación').length
    };

    return {
      total,
      completed,
      inProgress,
      inTesting,
      pending,
      errorCount,
      totalHours,
      completionRate,
      priorityCounts,
      typeCounts
    };
  }, [filteredTasks]);

  // Project lookup helper
  const getProjectName = (projId: string) => {
    const p = projects.find(proj => proj.id === projId);
    return p ? p.nombre : 'Proyecto no asignado';
  };

  // Requirement lookup helper
  const getReqCodeAndTitle = (reqId: string) => {
    const r = requirements.find(req => req.id === reqId);
    return r ? `${r.codigo}: ${r.titulo}` : 'General / Sin req';
  };

  // User lookup helper
  const getUserName = (userId: string) => {
    const u = users.find(usr => usr.id === userId);
    return u ? `${u.nombre} ${u.apellido}` : 'Sin asignar';
  };

  // EXPORT EXCEL (CSV Format with UTF-8 BOM)
  const handleExportExcel = () => {
    // UTF-8 BOM
    let csvContent = '\uFEFF';
    
    // Header
    const headers = [
      'Código Requerimiento',
      'Título de Tarea',
      'Proyecto',
      'Requerimiento Asociado',
      'Tipo de Tarea',
      'Prioridad',
      'Estado',
      'Horas Estimadas',
      'Asignado A',
      'Fecha Creación',
      'Descripción'
    ];
    
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';

    // Rows
    filteredTasks.forEach(task => {
      const projName = getProjectName(task.proyectoId);
      const req = requirements.find(r => r.id === task.requerimientoId);
      const reqCode = req ? req.codigo : 'N/A';
      const reqTitle = req ? req.titulo : 'General / Sin req';
      const userName = getUserName(task.responsableId);

      const row = [
        reqCode,
        task.titulo,
        projName,
        reqTitle,
        task.tipo,
        task.prioridad,
        task.estado,
        task.horasEstimadas,
        userName,
        task.fechaCreacion,
        task.descripcion
      ];

      csvContent += row.map(cell => {
        const str = cell !== undefined && cell !== null ? String(cell) : '';
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const formattedDate = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Reporte_Tareas_${formattedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT PDF with jspdf & jspdf-autotable
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const todayStr = new Date().toLocaleDateString('es-AR');
    
    // Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 297, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('REPORTE DE TAREAS Y SEGUIMIENTO ÁGIL', 14, 11);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('SISTEMA DE GESTIÓN DE PROYECTOS • ALTO RENDIMIENTO HD', 14, 18);
    
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`Generado el: ${todayStr}`, 240, 15);

    // Filter status box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(14, 30, 269, 20, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(14, 30, 269, 20);

    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Filtros Aplicados:', 18, 36);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const dateRangeStr = (startDate || endDate) 
      ? `Fechas: ${startDate || 'Inicio'} hasta ${endDate || 'Fin'}` 
      : 'Fechas: Todas';
    const projFilterStr = selectedProjectId !== 'all' 
      ? `Proyecto: ${getProjectName(selectedProjectId)}` 
      : 'Proyectos: Todos';
    const userFilterStr = selectedUserId !== 'all' 
      ? `Responsable: ${getUserName(selectedUserId)}` 
      : 'Responsables: Todos';
    const statusFilterStr = selectedStatus !== 'all' 
      ? `Estado: ${selectedStatus}` 
      : 'Estados: Todos';

    doc.text(`${dateRangeStr}  |  ${projFilterStr}`, 18, 42);
    doc.text(`${userFilterStr}  |  ${statusFilterStr}  |  Tareas Coincidentes: ${filteredTasks.length}`, 18, 46);

    // Mini KPIs Box
    doc.setFillColor(239, 246, 255); // blue-50
    doc.rect(190, 32, 88, 16, 'F');
    doc.setDrawColor(191, 219, 254); // blue-200
    doc.rect(190, 32, 88, 16);

    doc.setTextColor(30, 58, 138); // blue-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`Completadas: ${kpis.completed} de ${kpis.total} (${kpis.completionRate}%)`, 194, 38);
    doc.text(`Horas Totales Estimadas: ${kpis.totalHours} hs`, 194, 43);

    // Table Data preparation
    const tableHeaders = [
      ['Req', 'Título de Tarea', 'Proyecto', 'Tipo', 'Prioridad', 'Estado', 'Asignado a', 'F. Creación', 'Horas']
    ];

    const tableRows = filteredTasks.map(task => [
      requirements.find(r => r.id === task.requerimientoId)?.codigo || 'N/A',
      task.titulo.length > 36 ? task.titulo.substring(0, 34) + '...' : task.titulo,
      getProjectName(task.proyectoId),
      task.tipo,
      task.prioridad,
      task.estado,
      getUserName(task.responsableId),
      task.fechaCreacion,
      `${task.horasEstimadas} hs`
    ]);

    // Generate Table
    // @ts-ignore
    doc.autoTable({
      startY: 55,
      head: tableHeaders,
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 50 },
        2: { cellWidth: 42 },
        3: { cellWidth: 26 },
        4: { cellWidth: 18 },
        5: { cellWidth: 24 },
        6: { cellWidth: 32 },
        7: { cellWidth: 22 },
        8: { cellWidth: 16 }
      },
      margin: { left: 14, right: 14 }
    });

    // Save Doc
    const formattedDate = new Date().toISOString().split('T')[0];
    doc.save(`Reporte_Gestion_${formattedDate}.pdf`);
  };

  return (
    <div className="space-y-6" id="reports-view-container">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2">
            <BarChart3 className="text-blue-600 shrink-0" size={30} />
            Módulo de Reportes de Tareas
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-sans">
            Filtre y genere reportes analíticos personalizados de su backlog. Exporte a formatos profesionales Excel y PDF.
          </p>
        </div>
        
        {/* Quick export buttons top */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={filteredTasks.length === 0}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-all border ${
              filteredTasks.length === 0 
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200 cursor-pointer'
            }`}
          >
            <FileSpreadsheet size={15} />
            <span>Descargar Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={filteredTasks.length === 0}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-all border ${
              filteredTasks.length === 0 
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-200 cursor-pointer'
            }`}
          >
            <FileText size={15} />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROL GRID PANEL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm font-sans flex items-center gap-2">
            <Filter size={15} className="text-slate-500" />
            Configuración de Filtros de Tareas
          </h2>
          {(startDate || endDate || selectedProjectId !== 'all' || selectedReqId !== 'all' || selectedUserId !== 'all' || selectedStatus !== 'all' || selectedType !== 'all' || selectedPriority !== 'all' || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
            >
              <X size={12} />
              Limpiar Filtros
            </button>
          )}
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Date Range: Start */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block uppercase flex items-center gap-1">
              <Calendar size={11} className="text-slate-400" />
              Fecha Desde (Creación)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Date Range: End */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block uppercase flex items-center gap-1">
              <Calendar size={11} className="text-slate-400" />
              Fecha Hasta (Creación)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Project filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block uppercase">Proyecto</label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedReqId('all'); // Reset requirement when project changes
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">-- Todos los Proyectos --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          {/* Requirements filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block uppercase">Requerimiento</label>
            <select
              value={selectedReqId}
              onChange={(e) => setSelectedReqId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">-- Todos los Requerimientos --</option>
              {requirements
                .filter(r => selectedProjectId === 'all' || r.proyectoId === selectedProjectId)
                .map(r => (
                  <option key={r.id} value={r.id}>{r.codigo}: {r.titulo}</option>
                ))}
            </select>
          </div>

          {/* User filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block uppercase flex items-center gap-1">
              <UserIcon size={11} className="text-slate-400" />
              Responsable Asignado
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">-- Todos los Responsables --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.rol})</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block uppercase">Estado de Tarea</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">-- Todos los Estados --</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En desarrollo">En desarrollo</option>
              <option value="En Testing">En Testing</option>
              <option value="Error">Error</option>
              <option value="Terminada">Terminada</option>
            </select>
          </div>

          {/* Type filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block uppercase">Tipo de Tarea</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">-- Todos los Tipos --</option>
              <option value="Desarrollo">Desarrollo</option>
              <option value="Testing">Testing</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Investigación">Investigación</option>
              <option value="Documentación">Documentación</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block uppercase">Prioridad</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">-- Todas las Prioridades --</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

        </div>

        {/* Search Input block */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Buscar por título, descripción o código de requerimiento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
          <div className="text-[11px] text-slate-500 font-mono sm:ml-auto">
            Mostrando <strong className="text-slate-800">{filteredTasks.length}</strong> de <strong className="text-slate-800">{tasks.length}</strong> tareas totales.
          </div>
        </div>
      </div>

      {/* DETAILED STATS BENTO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* KPI: Total Tasks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Tareas Encontradas</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{kpis.total}</div>
            <div className="text-[10px] text-slate-500 mt-1">Acorde a los filtros elegidos.</div>
          </div>
        </div>

        {/* KPI: Completion Rate Progress Circle */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            {/* SVG Progress Arc */}
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#f1f5f9" strokeWidth="4.5" fill="transparent" />
              <circle 
                cx="24" 
                cy="24" 
                r="20" 
                stroke="#10b981" 
                strokeWidth="4.5" 
                fill="transparent" 
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * kpis.completionRate) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[11px] font-bold font-mono text-slate-800">{kpis.completionRate}%</span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Tasa de Terminación</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{kpis.completed} <span className="text-xs text-slate-400 font-normal">hechas</span></div>
            <div className="text-[10px] text-emerald-600 font-medium mt-1">Con estado 'Terminada'.</div>
          </div>
        </div>

        {/* KPI: Total Estimated Hours */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Carga Horaria Estimada</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{kpis.totalHours} <span className="text-xs text-slate-400 font-normal">hs</span></div>
            <div className="text-[10px] text-slate-500 mt-1">Esfuerzo total planificado.</div>
          </div>
        </div>

        {/* KPI: Pending and Errors */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
            kpis.errorCount > 0 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}>
            <AlertTriangle size={22} className={kpis.errorCount > 0 ? 'animate-bounce' : ''} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Alertas e Incidencias</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <span className="text-rose-600 font-bold">{kpis.errorCount} <span className="text-xs text-slate-400 font-normal font-sans">Errores</span></span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-600 font-bold">{kpis.inProgress + kpis.inTesting} <span className="text-xs text-slate-400 font-normal font-sans">Activas</span></span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Necesitan revisión técnica.</div>
          </div>
        </div>

      </div>

      {/* FILTERED TASKS DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm font-sans flex items-center gap-2">
            <Layers size={15} className="text-slate-500" />
            Tabla Detallada de Tareas ({filteredTasks.length} registros)
          </h3>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Listo para exportar
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center" id="reports-empty-state">
            <HelpCircle className="mx-auto text-slate-300 mb-3" size={44} />
            <h3 className="font-bold text-slate-700 text-sm font-sans">No se encontraron tareas</h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto font-sans leading-relaxed">
              No hay tareas registradas que cumplan con los filtros de búsqueda establecidos. Intente modificar las fechas u otros parámetros.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-200">
                  <th className="px-5 py-3 font-bold">Req</th>
                  <th className="px-5 py-3 font-bold">Título de Tarea</th>
                  <th className="px-5 py-3 font-bold">Proyecto</th>
                  <th className="px-5 py-3 font-bold">Tipo</th>
                  <th className="px-5 py-3 font-bold">Prioridad</th>
                  <th className="px-5 py-3 font-bold">Estado</th>
                  <th className="px-5 py-3 font-bold">Responsable</th>
                  <th className="px-5 py-3 font-bold">Fecha</th>
                  <th className="px-5 py-3 font-bold text-right">Horas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredTasks.map((task) => {
                  const req = requirements.find(r => r.id === task.requerimientoId);
                  const isCompleted = task.estado === 'Terminada';
                  const isError = task.estado === 'Error';

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Req Code */}
                      <td className="px-5 py-3.5 font-mono text-[10px] font-bold text-slate-500">
                        {req ? (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {req.codigo}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>

                      {/* Title */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">{task.titulo}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">{task.descripcion}</div>
                      </td>

                      {/* Project */}
                      <td className="px-5 py-3.5 text-slate-600 font-medium">
                        {getProjectName(task.proyectoId)}
                      </td>

                      {/* Type */}
                      <td className="px-5 py-3.5">
                        <span className="bg-slate-100 text-slate-700 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-200">
                          {task.tipo}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                          task.prioridad === 'Alta' 
                            ? 'bg-red-50 text-red-700 border border-red-150' 
                            : task.prioridad === 'Media' 
                            ? 'bg-amber-50 text-amber-700 border border-amber-150' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {task.prioridad}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                          task.estado === 'Terminada'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                            : task.estado === 'En Testing'
                            ? 'bg-purple-50 text-purple-700 border-purple-150'
                            : task.estado === 'En desarrollo'
                            ? 'bg-blue-50 text-blue-700 border-blue-150'
                            : task.estado === 'Error'
                            ? 'bg-red-50 text-red-700 border-red-150 animate-pulse'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {task.estado}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="px-5 py-3.5 text-slate-700 font-medium">
                        {getUserName(task.responsableId)}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-slate-500 font-mono text-[10px]">
                        {task.fechaCreacion}
                      </td>

                      {/* Hours */}
                      <td className="px-5 py-3.5 font-mono text-slate-800 font-bold text-right">
                        {task.horasEstimadas} hs
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
