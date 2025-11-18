import { useState, useEffect } from 'react';
import { catalogoService } from '../../services/catalogoService';
import { Area } from '../../types/equipo';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Icons } from '../../components/common/Icon';

export function AreasList() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<Area | null>(null);
  const [formData, setFormData] = useState({ nombre: '', jefe: '' });

  useEffect(() => {
    cargarAreas();
  }, []);

  const cargarAreas = async () => {
    try {
      setIsLoading(true);
      const data = await catalogoService.listarAreas();
      setAreas(data);
    } catch (err) {
      setError('Error al cargar áreas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editando) {
        await catalogoService.actualizarArea(editando.id, formData);
        setSuccess('Área actualizada exitosamente');
      } else {
        await catalogoService.crearArea(formData);
        setSuccess('Área creada exitosamente');
      }
      
      setFormData({ nombre: '', jefe: '' });
      setMostrarFormulario(false);
      setEditando(null);
      cargarAreas();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al guardar área');
    }
  };

  const handleEditar = (area: Area) => {
    setEditando(area);
    setFormData({ nombre: area.nombre, jefe: area.jefe || '' });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta área?')) return;

    try {
      await catalogoService.eliminarArea(id);
      setSuccess('Área eliminada exitosamente');
      cargarAreas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al eliminar área');
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setEditando(null);
    setFormData({ nombre: '', jefe: '' });
    setError('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Áreas del Hospital</h1>
          <p className="text-neutral-600 mt-1">Gestión de áreas y servicios</p>
        </div>
        {!mostrarFormulario && (
          <Button
            onClick={() => setMostrarFormulario(true)}
            variant="primary"
          >
            Nueva Área
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
              {editando ? 'Editar Área' : 'Nueva Área'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nombre del Área *"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                placeholder="Ej: Emergencia"
              />
              <Input
                label="Jefe del Área"
                value={formData.jefe}
                onChange={(e) => setFormData({ ...formData, jefe: e.target.value })}
                placeholder="Ej: Dr. Juan Pérez"
              />
              <div className="flex justify-end space-x-3">
                <Button type="button" onClick={handleCancelar} variant="ghost">
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
              <p className="mt-4 text-neutral-600">Cargando áreas...</p>
            </div>
          ) : areas.length === 0 ? (
            <div className="p-12 text-center">
              <Icons.Building2 className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No hay áreas registradas</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {areas.map((area) => (
                <div key={area.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{area.nombre}</p>
                      {area.jefe && (
                        <p className="text-sm text-neutral-600 mt-1">
                          Jefe: {area.jefe}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEditar(area)}
                        variant="ghost"
                        size="sm"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleEliminar(area.id)}
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
        Total: {areas.length} áreas registradas
      </p>
    </div>
  );
}