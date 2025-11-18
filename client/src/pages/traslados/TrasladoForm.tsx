import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { trasladoService } from '../../services/trasladoService';
import { equipoService } from '../../services/equipoService';
import { catalogoService } from '../../services/catalogoService';
import { Equipo, Area } from '../../types/equipo';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Icons } from '../../components/common/Icon';

export function TrasladoForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const equipoIdParam = searchParams.get('equipoId');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Catálogos
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Equipo seleccionado
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null);

  // Formulario
  const [formData, setFormData] = useState({
    equipoId: equipoIdParam ? Number(equipoIdParam) : 0,
    areaDestinoId: 0,
    observaciones: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (formData.equipoId && equipos.length > 0) {
      const equipo = equipos.find(e => e.id === formData.equipoId);
      setEquipoSeleccionado(equipo || null);
    }
  }, [formData.equipoId, equipos]);

  const cargarDatos = async () => {
    try {
      setLoadingData(true);
      
      const [equiposData, areasData] = await Promise.all([
        equipoService.listar({ limit: 1000 }),
        catalogoService.listarAreas(),
      ]);

      // Solo equipos activos (no dados de baja)
      const equiposActivos = equiposData.data.filter(e => 
        e.estado.nombre !== 'Dado de baja' && e.estado.nombre !== 'De baja (pendiente)'
      );

      setEquipos(equiposActivos);
      setAreas(areasData);

      // Si viene equipoId en la URL, cargar ese equipo
      if (equipoIdParam) {
        const equipo = equiposActivos.find(e => e.id === Number(equipoIdParam));
        setEquipoSeleccionado(equipo || null);
      }
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'equipoId' || name === 'areaDestinoId' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.equipoId) {
      setError('Debes seleccionar un equipo');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.areaDestinoId) {
      setError('Debes seleccionar un área de destino');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validar que no sea la misma área
    if (equipoSeleccionado && equipoSeleccionado.area.id === formData.areaDestinoId) {
      setError('El equipo ya está en esa área. Selecciona un área diferente.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);

    try {
      await trasladoService.crear({
        equipoId: formData.equipoId,
        areaDestinoId: formData.areaDestinoId,
        observaciones: formData.observaciones || undefined,
      });

      setSuccess('Traslado registrado exitosamente');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        navigate('/traslados');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Error al crear traslado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/traslados')}
          className="p-2 hover:bg-neutral-100 rounded transition-colors"
        >
          <Icons.ArrowRightLeft className="w-5 h-5 rotate-180" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Nuevo Traslado
          </h1>
          <p className="text-neutral-600 mt-1">
            Registra el movimiento de un equipo entre áreas
          </p>
        </div>
      </div>

      {/* Mensajes flotantes */}
      {error && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4">
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 shadow-lg flex items-start">
            <div className="flex-shrink-0 mr-3">
              <Icons.X className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-900 mb-1">Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="flex-shrink-0 ml-4 text-red-600 hover:text-red-800"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 shadow-lg flex items-start">
            <div className="flex-shrink-0 mr-3">
              <Icons.ArrowRightLeft className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-900 mb-1">¡Éxito!</p>
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Información del Traslado</h2>
          </CardHeader>
          <CardBody className="space-y-6 p-6">
            {/* Seleccionar Equipo */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Equipo a Trasladar *
              </label>
              <select
                name="equipoId"
                value={formData.equipoId}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Selecciona un equipo</option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.codigoSICOIN} - {equipo.descripcion}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                {equipos.length} equipos disponibles para traslado
              </p>
            </div>

            {/* Info del equipo seleccionado */}
            {equipoSeleccionado && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Icons.Package className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900 mb-1">
                      Equipo Seleccionado
                    </p>
                    <p className="text-sm text-blue-800 mb-1">
                      {equipoSeleccionado.descripcion}
                    </p>
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Ubicación actual:</span>{' '}
                      {equipoSeleccionado.area.nombre}
                    </p>
                    {equipoSeleccionado.marca && (
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Marca:</span>{' '}
                        {equipoSeleccionado.marca} {equipoSeleccionado.modelo}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Área de destino */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Área de Destino *
              </label>
              <select
                name="areaDestinoId"
                value={formData.areaDestinoId}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Selecciona el área de destino</option>
                {areas
                  .filter(area => !equipoSeleccionado || area.id !== equipoSeleccionado.area.id)
                  .map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.nombre}
                      {area.jefe && ` (${area.jefe})`}
                    </option>
                  ))}
              </select>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="Motivo del traslado, solicitud, etc. (opcional)"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Ejemplo: "Traslado por necesidad del servicio", "Solicitud del Dr. García"
              </p>
            </div>

            {/* Nota informativa */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icons.FileText className="w-5 h-5 text-neutral-600 mt-0.5" />
                <div className="flex-1 text-sm text-neutral-700">
                  <p className="font-medium mb-1">Información importante:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Se generará automáticamente un folio de conocimiento</li>
                    <li>La ubicación del equipo se actualizará automáticamente</li>
                    <li>El traslado quedará registrado en el historial del equipo</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardBody>

          <CardFooter className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => navigate('/traslados')}
              variant="ghost"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !formData.equipoId || !formData.areaDestinoId}
            >
              {isLoading ? 'Registrando...' : 'Registrar Traslado'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}