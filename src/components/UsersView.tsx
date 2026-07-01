import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { 
  Users, 
  Plus, 
  Lock, 
  Search, 
  X, 
  UserPlus, 
  ShieldCheck, 
  AlertTriangle,
  Mail,
  UserCheck2,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface UsersViewProps {
  users: User[];
  currentUser: User;
  onAddUser: (user: Omit<User, 'id' | 'avatar'>) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export default function UsersView({
  users,
  currentUser,
  onAddUser,
  onEditUser,
  onDeleteUser
}: UsersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('todos');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    contrasena: '',
    rol: 'Programador' as UserRole,
    estado: 'Activo' as UserStatus
  });

  const [formError, setFormError] = useState('');

  // RN-001: Solo un Administrador puede crear usuarios
  const isAdmin = currentUser.rol === 'Administrador';

  // Filters
  const filteredUsers = users.filter(u => {
    const matchesRole = selectedRole === 'todos' || u.rol === selectedRole;
    const fullName = `${u.nombre} ${u.apellido}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleOpenCreate = () => {
    if (!isAdmin) return;
    setFormError('');
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      contrasena: '',
      rol: 'Programador',
      estado: 'Activo'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    if (!isAdmin) return;
    setFormError('');
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      contrasena: user.contrasena,
      rol: user.rol,
      estado: user.estado
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setFormError('');
    setShowPassword(false);
  };

  const handleToggleState = (user: User) => {
    if (!isAdmin) return;
    onEditUser({
      ...user,
      estado: user.estado === 'Activo' ? 'Inactivo' : 'Activo'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setFormError('Nombre y Apellido son obligatorios.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Por favor ingrese un correo electrónico válido.');
      return;
    }
    if (formData.contrasena.length < 5) {
      setFormError('La contraseña debe tener al menos 5 caracteres.');
      return;
    }

    // Verify uniqueness of email for NEW users
    const emailExists = users.some(u => u.email.toLowerCase() === formData.email.toLowerCase() && (!editingUser || u.id !== editingUser.id));
    if (emailExists) {
      setFormError('Este correo electrónico ya está registrado por otro usuario.');
      return;
    }

    if (editingUser) {
      onEditUser({
        ...editingUser,
        ...formData
      });
    } else {
      onAddUser(formData);
    }

    handleCloseForm();
  };

  const getRoleBadgeColor = (r: UserRole) => {
    switch(r) {
      case 'Administrador': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Analista': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Programador': return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  const getAvatarColors = (role: UserRole) => {
    switch(role) {
      case 'Administrador': return 'bg-emerald-500 text-white';
      case 'Analista': return 'bg-amber-500 text-white';
      case 'Programador': return 'bg-sky-500 text-white';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="users-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">Administración de Usuarios</h1>
          <p className="text-slate-500 mt-1">
            Gestión de roles de acceso, credenciales y estados operativos para el equipo.
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm cursor-pointer"
            id="btn-add-user"
          >
            <Plus size={16} />
            Crear Usuario
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-xs font-mono">
            <Lock size={13} />
            RN-001: Solo Administradores
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center" id="users-filters">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white text-sm"
          />
        </div>

        <div className="flex gap-2">
          {['todos', 'Administrador', 'Analista', 'Programador'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                selectedRole === role 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {role === 'todos' ? 'Todos' : role}
            </button>
          ))}
        </div>
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="users-grid">
        {filteredUsers.map((user) => {
          const isCurrentUserCard = user.id === currentUser.id;
          return (
            <div 
              key={user.id}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                user.estado === 'Inactivo' ? 'opacity-60 bg-slate-50/50' : 'hover:shadow-md'
              } ${isCurrentUserCard ? 'ring-2 ring-slate-900' : 'border-slate-200'}`}
              id={`user-card-${user.id}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-inner uppercase ${getAvatarColors(user.rol)}`}>
                      {user.nombre.substring(0,1)}{user.apellido.substring(0,1)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight font-sans">
                        {user.nombre} {user.apellido}
                        {isCurrentUserCard && <span className="ml-1.5 text-[9px] font-mono text-slate-400 bg-slate-100 px-1 py-0.2 border rounded">Tú</span>}
                      </h3>
                      <p className="text-slate-400 text-[11px] font-mono flex items-center gap-1 mt-0.5">
                        <Mail size={11} />
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${getRoleBadgeColor(user.rol)}`}>
                    {user.rol}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Estado</span>
                    <span className={`font-bold inline-flex items-center gap-1 ${user.estado === 'Activo' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.estado === 'Activo' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      {user.estado}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Contraseña</span>
                    <span className="text-slate-600 text-[11px]">••••••••</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Admins */}
              {isAdmin && (
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-sans">
                  {/* Toggle Active/Inactive */}
                  <button
                    onClick={() => handleToggleState(user)}
                    disabled={isCurrentUserCard}
                    className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                      isCurrentUserCard 
                        ? 'text-slate-300 cursor-not-allowed' 
                        : 'text-slate-500 hover:text-slate-900 cursor-pointer'
                    }`}
                    title={isCurrentUserCard ? 'No puedes desactivarte a ti mismo' : 'Cambiar estado'}
                  >
                    {user.estado === 'Activo' ? (
                      <>
                        <ToggleRight size={18} className="text-emerald-500" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={18} className="text-slate-400" />
                        Activar
                      </>
                    )}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded transition-all cursor-pointer font-medium"
                    >
                      Editar
                    </button>
                    {!isCurrentUserCard && (
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className="px-2 py-1 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded transition-all cursor-pointer font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT USER FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="user-form-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg font-sans flex items-center gap-2">
                <UserPlus size={20} className="text-slate-700" />
                {editingUser ? 'Modificar Usuario (RN-001)' : 'Crear Colaborador Nuevo'}
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
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-start gap-2" id="user-form-error">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <div>{formError}</div>
                </div>
              )}

              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-mono block">Nombre *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Juan"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-mono block">Apellido *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Pérez"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Correo Electrónico (Email) *</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@sistemas-austral.com.ar"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Contraseña *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 5 caracteres"
                    value={formData.contrasena}
                    onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Rol de Acceso */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Rol de Permisos *</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Administrador">Administrador (Control total)</option>
                  <option value="Analista">Analista (Requerimientos y asignaciones)</option>
                  <option value="Programador">Programador (Desarrollo y Comentarios)</option>
                </select>
              </div>

              {/* Estado Operativo */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono block">Estado Operativo</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as UserStatus })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
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
                  className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  {editingUser ? 'Actualizar Usuario' : 'Crear Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
