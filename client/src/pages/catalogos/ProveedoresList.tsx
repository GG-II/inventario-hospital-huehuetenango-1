import { useState, useEffect } from 'react';
import { catalogoService } from '../../services/catalogoService';
import { Proveedor } from '../../types/equipo';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Icons } from '../../components/common/Icon';

export function ProveedoresList() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<Proveedor | null>(null);
  const [formData, setFormData] = useState({
    nombreComercial: '',
    nombreFiscal: '',
    nit: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      setIsLoading(true);
      const data = await catalogoService.listarProveedores();
      setProveedores(data);
    } catch (err) {
      setError('Error al cargar proveedores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editando) {
        await catalogoService.actualizarProveedor(editando.id, formData);
        setSuccess('Proveedor actualizado exitosamente');
      } else {
        await catalogoService.crearProveedor(formData);
        setSuccess('Proveedor creado exitosamente');
      }
      
      resetForm();
      cargarProveedores();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al guardar proveedor');
    }
  };

  const handleEditar = (proveedor: Proveedor) => {
    setEditando(proveedor);
    setFormData({
      nombreComercial: proveedor.nombreComercial,
      nombreFiscal: proveedor.nombreFiscal || '',
      nit: proveedor.nit || '',
      contacto: proveedor.contacto || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
      direccion: proveedor.direccion || '',
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este proveedor?')) return;

    try {
      await catalogoService.eliminarProveedor(id);
      setSuccess('Proveedor eliminado exitosamente');
      cargarProveedores();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al eliminar proveedor');
    }
  };

  const resetForm = () => {
    setMostrarFormulario(false);
    setEditando(null);
    setFormData({
      nombreComercial: '',
      nombreFiscal: '',
      nit: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
    });
    setError('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Proveedores</h1>
          <p className="text-neutral-600 mt-1">Gestión de proveedores y empresas</p>
        </div>
        {!mostrarFormulario && (
          <Button
            onClick={() => setMostrarFormulario(true)}
            variant="primary"
          >
            Nuevo Proveedor
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
              {editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre Comercial *"
                  name="nombreComercial"
                  value={formData.nombreComercial}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Distribuidora Médica S.A."
                />
                <Input
                  label="Nombre Fiscal"
                  name="nombreFiscal"
                  value={formData.nombreFiscal}
                  onChange={handleChange}
                  placeholder="Razón social completa"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="NIT"
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  placeholder="12345678-9"
                />
                <Input
                  label="Contacto"
                  name="contacto"
                  value={formData.contacto}
                  onChange={handleChange}
                  placeholder="Nombre del contacto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Teléfono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="1234-5678"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contacto@proveedor.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Dirección
                </label>
                <textarea
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  rows={3}
                  className="input"
                  placeholder="Dirección completa"
                />
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
              <p className="mt-4 text-neutral-600">Cargando proveedores...</p>
            </div>
          ) : proveedores.length === 0 ? (
            <div className="p-12 text-center">
              <Icons.Tag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No hay proveedores registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {proveedores.map((proveedor) => (
                <div key={proveedor.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">
                        {proveedor.nombreComercial}
                      </p>
                      {proveedor.nombreFiscal && (
                        <p className="text-sm text-neutral-600 mt-1">
                          {proveedor.nombreFiscal}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-neutral-600">
                        {proveedor.nit && <span>NIT: {proveedor.nit}</span>}
                        {proveedor.contacto && <span>Contacto: {proveedor.contacto}</span>}
                        {proveedor.telefono && <span>Tel: {proveedor.telefono}</span>}
                      </div>
                      {proveedor.email && (
                        <p className="text-sm text-neutral-600 mt-1">
                          Email: {proveedor.email}
                        </p>
                      )}
                      {proveedor.direccion && (
                        <p className="text-sm text-neutral-600 mt-1">
                          {proveedor.direccion}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        onClick={() => handleEditar(proveedor)}
                        variant="ghost"
                        size="sm"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleEliminar(proveedor.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <p className="text-sm text-neutral-600">
        Total: {proveedores.length} proveedores registrados
      </p>
    </div>
  );
}