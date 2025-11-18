import { useState, useEffect } from 'react';
import { usuarioService } from '../../services/usuarioService';
import { Usuario, Rol } from '../../types/usuario';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Icons } from '../../components/common/Icon';
import { useAuth } from '../../contexts/AuthContext';

export function UsuariosList() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    email: '',
    rolId: 0,
  });

  const canManage = user?.rol === 'Admin';

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [usuariosData, rolesData] = await Promise.all([
        usuarioService.listar(),
        usuarioService.listarRoles(),
      ]);
      setUsuarios(usuariosData);
      setRoles(rolesData);
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rolId' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editando) {
        // Al editar, solo enviar password si se proporcionó
        const dataToSend: any = {
          nombre: formData.nombre,
          email: formData.email,
          rolId: formData.rolId,
        };
        if (formData.password) {
          dataToSend.password = formData.password;
        }
        await usuarioService.actualizar(editando.id, dataToSend);
        setSuccess('Usuario actualizado exitosamente');
      } else {
        await usuarioService.crear(formData);
        setSuccess('Usuario creado exitosamente');
      }
      
      resetForm();
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al guardar usuario');
    }
  };

  const handleEditar = (usuario: Usuario) => {
    setEditando(usuario);
    setFormData({
      username: usuario.username,
      password: '', // No mostrar password actual
      nombre: usuario.nombre,
      email: usuario.email,
      rolId: usuario.rol.id,
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id: number) => {
    if (id === user?.userId) {
      setError('No puedes eliminar tu propio usuario');
      return;
    }

    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await usuarioService.eliminar(id);
      setSuccess('Usuario eliminado exitosamente');
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al eliminar usuario');
    }
  };

  const resetForm = () => {
    setMostrarFormulario(false);
    setEditando(null);
    setFormData({
      username: '',
      password: '',
      nombre: '',
      email: '',
      rolId: 0,
    });
    setError('');
  };

  const getRolColor = (rol: string) => {
    const colores: Record<string, string> = {
      Admin: 'bg-red-100 text-red-800',
      Inventarios: 'bg-blue-100 text-blue-800',
      Mantenimiento: 'bg-yellow-100 text-yellow-800',
      Consulta: 'bg-gray-100 text-gray-800',
    };
    return colores[rol] || 'bg-gray-100 text-gray-800';
  };

  if (!canManage) {
    return (
      <div className="max-w-4xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-6 text-center">
          <Icons.AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-yellow-800">
            No tienes permisos para gestionar usuarios. Solo los administradores pueden acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Usuarios del Sistema</h1>
          <p className="text-neutral-600 mt-1">Gestión de usuarios y permisos</p>
        </div>
        {!mostrarFormulario && (
          <Button
            onClick={() => setMostrarFormulario(true)}
            variant="primary"
          >
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Formulario */}
      {mostrarFormulario && (
        <Card>
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre de Usuario *"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={!!editando}
                  placeholder="usuario123"
                />
                <Input
                  label={editando ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editando}
                  placeholder={editando ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre Completo *"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Juan Pérez"
                />
                <Input
                  label="Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="juan@hospital.gob.gt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Rol *
                </label>
                <select
                  name="rolId"
                  value={formData.rolId}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                      {rol.descripcion && ` - ${rol.descripcion}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" onClick={resetForm} variant="ghost">
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  {editando ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Lista */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-neutral-600">Cargando usuarios...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="p-12 text-center">
              <Icons.Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No hay usuarios registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="font-medium text-neutral-900">{usuario.nombre}</p>
                        <span className={`badge ${getRolColor(usuario.rol.nombre)}`}>
                          {usuario.rol.nombre}
                        </span>
                        {usuario.id === user?.userId && (
                          <span className="badge bg-primary-100 text-primary-800">
                            Tú
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600">
                        Usuario: {usuario.username}
                      </p>
                      <p className="text-sm text-neutral-600">
                        Email: {usuario.email}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        onClick={() => handleEditar(usuario)}
                        variant="ghost"
                        size="sm"
                      >
                        Editar
                      </Button>
                      {usuario.id !== user?.userId && (
                        <Button
                          onClick={() => handleEliminar(usuario.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <p className="text-sm text-neutral-600">
        Total: {usuarios.length} usuarios registrados
      </p>
    </div>
  );
}