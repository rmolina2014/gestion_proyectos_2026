import React, { useState, useEffect } from 'react';
import { 
  User, 
  Project, 
  Requirement, 
  Task, 
  UserRole, 
  UserStatus, 
  ProjectStatus, 
  Priority, 
  ReqStatus, 
  TaskType, 
  TaskStatus 
} from './types';
import { 
  initialUsers, 
  initialProjects, 
  initialRequirements, 
  initialTasks 
} from './initialData';

// Views
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import ProjectsView from './components/ProjectsView';
import RequirementsView from './components/RequirementsView';
import TasksView from './components/TasksView';
import KanbanView from './components/KanbanView';
import UsersView from './components/UsersView';
import ReportsView from './components/ReportsView';

// Icons
import { 
  LayoutDashboard, 
  FolderGit2, 
  FileText, 
  CheckSquare, 
  KanbanSquare, 
  Users as UsersIcon, 
  LogOut, 
  UserCircle2, 
  KeyRound, 
  ChevronDown, 
  Clock, 
  Building2, 
  CheckCircle, 
  AlertTriangle,
  X,
  Lock,
  ChevronRight,
  RefreshCw,
  BarChart3
} from 'lucide-react';

// Storage helper
const getStorageItem = <T,>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(`austral_pyme_${key}`);
  if (item) {
    try {
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

const saveStorageItem = <T,>(key: string, value: T) => {
  localStorage.setItem(`austral_pyme_${key}`, JSON.stringify(value));
};

export default function App() {
  // Global States
  const [users, setUsers] = useState<User[]>(() => getStorageItem('users', initialUsers));
  const [projects, setProjects] = useState<Project[]>(() => getStorageItem('projects', initialProjects));
  const [requirements, setRequirements] = useState<Requirement[]>(() => getStorageItem('requirements', initialRequirements));
  const [tasks, setTasks] = useState<Task[]>(() => getStorageItem('tasks', initialTasks));
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStorageItem('currentUser', null));

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Profile password modal
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Dropdown states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);

  // Sync to Storage on changes
  useEffect(() => {
    saveStorageItem('users', users);
  }, [users]);

  useEffect(() => {
    saveStorageItem('projects', projects);
  }, [projects]);

  useEffect(() => {
    saveStorageItem('requirements', requirements);
  }, [requirements]);

  useEffect(() => {
    saveStorageItem('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveStorageItem('currentUser', currentUser);
  }, [currentUser]);

  // Operations: Login / Logout
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsProfileOpen(false);
    setIsSimulateOpen(false);
  };

  // Hot-swapping active role for fast demonstration
  const handleSimulateUser = (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (selected && selected.estado === 'Activo') {
      setCurrentUser(selected);
      setIsSimulateOpen(false);
    }
  };

  // Reset demo state back to seeds
  const handleResetDemoState = () => {
    if (window.confirm('¿Está seguro de restaurar el estado inicial? Esto borrará tus cambios locales.')) {
      setUsers(initialUsers);
      setProjects(initialProjects);
      setRequirements(initialRequirements);
      setTasks(initialTasks);
      
      // Keep logged in as matching seed or log out
      if (currentUser) {
        const matching = initialUsers.find(u => u.email === currentUser.email);
        setCurrentUser(matching || initialUsers[0]);
      }
      
      alert('Base de datos restablecida correctamente.');
    }
  };

  // CHANGE PASSWORD (Módulo 1)
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentUser) return;

    if (currentUser.contrasena !== oldPassword) {
      setPassError('La contraseña actual es incorrecta.');
      return;
    }

    if (newPassword.length < 5) {
      setPassError('La nueva contraseña debe tener al menos 5 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    // Success: Update state
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, contrasena: newPassword };
      }
      return u;
    });

    setUsers(updatedUsers);
    setCurrentUser({ ...currentUser, contrasena: newPassword });
    
    setPassSuccess('¡Contraseña actualizada exitosamente!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      setIsPassModalOpen(false);
      setPassSuccess('');
    }, 2000);
  };

  // OPERATIONS: Projects (Módulo 3)
  const handleAddProject = (newProj: Omit<Project, 'id'>) => {
    const id = `prj-${projects.length + 1}-${Math.floor(Math.random() * 1000)}`;
    const projectWithId: Project = { ...newProj, id };
    setProjects([...projects, projectWithId]);
  };

  const handleEditProject = (updatedProj: Project) => {
    const nextProjects = projects.map(p => p.id === updatedProj.id ? updatedProj : p);
    setProjects(nextProjects);
  };

  // RN-010: No se puede eliminar un proyecto con tareas asociadas.
  const handleDeleteProject = (projectId: string): string | null => {
    const hasAssociatedTasks = tasks.some(t => t.proyectoId === projectId);
    if (hasAssociatedTasks) {
      return 'RN-010: No se puede eliminar este proyecto porque tiene tareas activas asociadas en el backlog.';
    }
    const nextProjects = projects.filter(p => p.id !== projectId);
    setProjects(nextProjects);
    
    // Also clear requirements for that project safely
    setRequirements(requirements.filter(r => r.proyectoId !== projectId));
    return null;
  };

  // OPERATIONS: Requirements (Módulo 4)
  const handleAddRequirement = (newReq: Omit<Requirement, 'id' | 'codigo' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    const codeIndex = requirements.length + 1;
    const codigo = `REQ-${String(codeIndex).padStart(3, '0')}`;
    const id = `req-${codeIndex}-${Math.floor(Math.random() * 1000)}`;
    const today = new Date().toISOString().split('T')[0];

    const reqWithId: Requirement = {
      ...newReq,
      id,
      codigo,
      fechaCreacion: today,
      fechaActualizacion: today
    };

    setRequirements([...requirements, reqWithId]);
  };

  const handleEditRequirement = (updatedReq: Requirement) => {
    const nextReqs = requirements.map(r => r.id === updatedReq.id ? updatedReq : r);
    setRequirements(nextReqs);
  };

  const handleDeleteRequirement = (id: string) => {
    const nextReqs = requirements.filter(r => r.id !== id);
    setRequirements(nextReqs);
    // Remove tasks associated to that requirement
    setTasks(tasks.filter(t => t.requerimientoId !== id));
  };

  // OPERATIONS: Tasks (Módulo 5)
  const handleAddTask = (newTask: Omit<Task, 'id' | 'comentarios' | 'fechaCreacion'>) => {
    const id = `tsk-${tasks.length + 1}-${Math.floor(Math.random() * 1000)}`;
    const today = new Date().toISOString().split('T')[0];
    
    const taskWithId: Task = {
      ...newTask,
      id,
      comentarios: [],
      fechaCreacion: today
    };

    setTasks([...tasks, taskWithId]);
  };

  const handleEditTask = (updatedTask: Task) => {
    const nextTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(nextTasks);
  };

  const handleDeleteTask = (id: string) => {
    const nextTasks = tasks.filter(t => t.id !== id);
    setTasks(nextTasks);
  };

  const handleAddComment = (taskId: string, commentText: string) => {
    if (!currentUser) return;
    const newComment = {
      id: `c-${Date.now()}`,
      userId: currentUser.id,
      text: commentText,
      createdAt: new Date().toISOString()
    };

    const nextTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          comentarios: [...t.comentarios, newComment]
        };
      }
      return t;
    });

    setTasks(nextTasks);
  };

  // OPERATIONS: Users (Módulo 2)
  const handleAddUser = (newUser: Omit<User, 'id' | 'avatar'>) => {
    const id = `usr-${users.length + 1}-${Math.floor(Math.random() * 100)}`;
    const avatar = 'bg-slate-700 text-white'; // default
    const userWithId: User = { ...newUser, id, avatar };
    setUsers([...users, userWithId]);
  };

  const handleEditUser = (updatedUser: User) => {
    const nextUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(nextUsers);
    
    // If we updated ourselves, sync current user
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const nextUsers = users.filter(u => u.id !== userId);
    setUsers(nextUsers);
  };

  // Render Login view if no user session is present
  if (!currentUser) {
    return (
      <div className="bg-slate-100 min-h-screen font-sans flex flex-col justify-center py-10">
        <LoginView users={users} onLoginSuccess={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* APP HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left Brand block */}
            <div className="flex items-center gap-3">
              <div className="relative group flex items-center justify-center">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 3L28 10V22L16 29L4 22V10L16 3Z" stroke="url(#hdGradient1)" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M16 8L24 12.5V21.5L16 26L8 21.5V12.5L16 8Z" fill="url(#hdGradient2)" fillOpacity="0.3" stroke="url(#hdGradient3)" strokeWidth="1" strokeLinejoin="round" />
                    <circle cx="16" cy="17" r="3" fill="#10b981" />
                    <defs>
                      <linearGradient id="hdGradient1" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3b82f6" />
                        <stop offset="1" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="hdGradient2" x1="8" y1="8" x2="24" y2="26" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#60a5fa" />
                        <stop offset="1" stopColor="#34d399" />
                      </linearGradient>
                      <linearGradient id="hdGradient3" x1="8" y1="21.5" x2="24" y2="12.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3b82f6" />
                        <stop offset="1" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight block text-white flex items-center gap-1.5">
                  Gestión de Proyectos
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 font-mono px-1.5 py-0.5 rounded border border-blue-500/30 font-bold tracking-wider">HD</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Building2 size={10} className="text-emerald-400" />
                  Control Ágil de Ingeniería
                </span>
              </div>
            </div>

            {/* Quick switcher & Profile Actions */}
            <div className="flex items-center gap-4">
              
              {/* Quick Simulation Swapper Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsSimulateOpen(!isSimulateOpen);
                    setIsProfileOpen(false);
                  }}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 rounded-lg text-xs font-mono text-slate-300 border border-slate-700/50 cursor-pointer"
                  id="header-role-simulator"
                >
                  <RefreshCw size={12} className="text-blue-400 animate-spin-slow" />
                  <span>Simular: <strong>{currentUser.nombre} ({currentUser.rol})</strong></span>
                  <ChevronDown size={12} />
                </button>

                {isSimulateOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-scale-in text-xs font-sans">
                    <div className="px-3 py-1.5 border-b border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Cambiar de Rol Rápido
                    </div>
                    <div className="space-y-1 mt-1">
                      {users.filter(u => u.estado === 'Activo').map((u) => (
                        <button
                          key={u.id}
                          onClick={() => handleSimulateUser(u.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-slate-700 cursor-pointer ${
                            u.id === currentUser.id ? 'bg-slate-700 text-white font-bold' : 'text-slate-300'
                          }`}
                        >
                          <div>
                            <div>{u.nombre} {u.apellido}</div>
                            <div className="text-[9px] text-slate-400 font-mono">{u.rol}</div>
                          </div>
                          {u.id === currentUser.id && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                        </button>
                      ))}
                    </div>
                    <div className="p-1 border-t border-slate-700 mt-2">
                      <button
                        onClick={handleResetDemoState}
                        className="w-full text-center py-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 text-red-400 text-[10px] font-mono rounded cursor-pointer transition-all"
                      >
                        Restablecer Datos Demo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsSimulateOpen(false);
                  }}
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  id="profile-dropdown-trigger"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${currentUser.avatar || 'bg-blue-600'}`}>
                    {currentUser.nombre.substring(0,1)}{currentUser.apellido.substring(0,1)}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <span className="font-semibold block max-w-[100px] truncate">{currentUser.nombre}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{currentUser.rol}</span>
                  </div>
                  <ChevronDown size={14} className="opacity-60" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 p-1.5 text-slate-800 z-50 animate-scale-in text-xs font-sans">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <span className="font-bold block text-slate-900">{currentUser.nombre} {currentUser.apellido}</span>
                      <span className="text-slate-400 font-mono text-[10px] block truncate">{currentUser.email}</span>
                    </div>

                    <div className="py-1">
                      {/* Change Password option */}
                      <button
                        onClick={() => {
                          setIsPassModalOpen(true);
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-2 rounded-lg cursor-pointer text-slate-600"
                      >
                        <KeyRound size={14} />
                        Cambiar Contraseña
                      </button>
                      
                      {/* Direct role indicator in mobile */}
                      <div className="block md:hidden border-t border-slate-100 mt-1 pt-1 px-3 py-1 text-[10px] text-slate-400 uppercase font-mono">
                        Sesión: {currentUser.rol}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-1.5 mt-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 rounded-lg cursor-pointer"
                        id="btn-logout"
                      >
                        <LogOut size={14} />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* VIEW TABS NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200" id="main-nav-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-4 overflow-x-auto h-12 items-center" style={{ scrollbarWidth: 'none' }}>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="tab-dashboard"
            >
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('proyectos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                activeTab === 'proyectos' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="tab-projects"
            >
              <FolderGit2 size={14} />
              <span>Proyectos</span>
            </button>

            <button
              onClick={() => setActiveTab('requerimientos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                activeTab === 'requerimientos' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="tab-requirements"
            >
              <FileText size={14} />
              <span>Requerimientos</span>
            </button>

            <button
              onClick={() => setActiveTab('tareas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                activeTab === 'tareas' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="tab-tasks"
            >
              <CheckSquare size={14} />
              <span>Tareas</span>
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                activeTab === 'kanban' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="tab-kanban"
            >
              <KanbanSquare size={14} />
              <span>Tablero Kanban</span>
            </button>

            <button
              onClick={() => setActiveTab('usuarios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                activeTab === 'usuarios' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="tab-users"
            >
              <UsersIcon size={14} />
              <span>Usuarios & Roles</span>
            </button>

            <button
              onClick={() => setActiveTab('reportes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                activeTab === 'reportes' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="tab-reports"
            >
              <BarChart3 size={14} />
              <span>Reportes</span>
            </button>

          </div>
        </div>
      </nav>

      {/* MASTER CENTRAL SPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView 
            projects={projects} 
            requirements={requirements} 
            tasks={tasks} 
            users={users} 
            onNavigate={(tab) => setActiveTab(tab)} 
          />
        )}

        {activeTab === 'proyectos' && (
          <ProjectsView
            projects={projects}
            users={users}
            tasks={tasks}
            currentUser={currentUser}
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {activeTab === 'requerimientos' && (
          <RequirementsView
            requirements={requirements}
            projects={projects}
            users={users}
            currentUser={currentUser}
            onAddRequirement={handleAddRequirement}
            onEditRequirement={handleEditRequirement}
            onDeleteRequirement={handleDeleteRequirement}
          />
        )}

        {activeTab === 'tareas' && (
          <TasksView
            tasks={tasks}
            projects={projects}
            requirements={requirements}
            users={users}
            currentUser={currentUser}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onAddComment={handleAddComment}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanView
            tasks={tasks}
            projects={projects}
            users={users}
            currentUser={currentUser}
            onEditTask={handleEditTask}
          />
        )}

        {activeTab === 'usuarios' && (
          <UsersView
            users={users}
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === 'reportes' && (
          <ReportsView
            tasks={tasks}
            projects={projects}
            requirements={requirements}
            users={users}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-600">Sistema de Gestión de Proyectos</p>
          <p>Enfoque de Ingeniería de Contexto adaptado para PYMEs de Argentina</p>
          <p className="text-[10px] font-mono mt-2 text-slate-400/80">Local time: 2026-06-30 • AR timezone</p>
        </div>
      </footer>

      {/* PASSWORD CHANGE MODAL (Módulo 1) */}
      {isPassModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="password-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm font-sans flex items-center gap-1.5">
                <KeyRound size={16} className="text-slate-700" />
                Cambio de Contraseña (Módulo 1)
              </h3>
              <button 
                onClick={() => setIsPassModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="p-5 space-y-4">
              {passError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-[11px] rounded-lg flex items-start gap-1.5">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <div>{passError}</div>
                </div>
              )}

              {passSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-lg flex items-start gap-1.5">
                  <CheckCircle size={14} className="mt-0.5 shrink-0" />
                  <div>{passSuccess}</div>
                </div>
              )}

              {/* Old password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 font-mono block">Contraseña Actual *</label>
                <input
                  type="password"
                  required
                  placeholder="Ingrese su contraseña actual"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 font-mono block">Nueva Contraseña (Mínimo 5 carac.) *</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 5 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 font-mono block">Confirmar Nueva Contraseña *</label>
                <input
                  type="password"
                  required
                  placeholder="Repita la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setIsPassModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors font-medium cursor-pointer"
                >
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
