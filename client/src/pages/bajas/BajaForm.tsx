import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bajaService } from '../../services/bajaService';
import { equipoService } from '../../services/equipoService';
import { Equipo } from '../../types/equipo';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Icons } from '../../components/common/Icon';

export function BajaForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const equipoIdParam = searchParams.get('equipoId');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null);

  const [formData, setFormData] = useState({
    equipoId: equipoIdParam ? Number(equipoIdParam) : 0,
    motivo: '' as 'IRREPARABLE' | 'OBSOLETO' | 'PERDIDA_TOTAL' | 'ROBO' | '',
    observaciones: '',
  });

  useEffect(() => {
    cargarEquipos();
  }, []);

  useEffect(() => {
    if (formData.equipoId && equipos.length > 0) {
      const equipo = equipos.find(e => e.id === formData.equipoId);
      setEquipoSeleccionado(equipo || null);
    }
  }, [formData.equipoId, equipos]);

  const cargarEquipos = async () => {
    try {
      setLoadingData(true);
      const response = await equipoService.listar({ limit: 1000 });
      
      // Solo equipos activos
      const equiposActivos = response.data.filter(e => 
        e.estado.nombre === 'Activo' || 
        e.estado.nombre === 'En reparación' ||
        e.estado.nombre === 'Inactivo'
      );

      setEquipos(equiposActivos);

      if (equipoIdParam) {
        const equipo = equiposActivos.find(e => e.id === Number(equipoIdParam));
        setEquipoSeleccionado(equipo || null);
      }
    } catch (err) {
      setError('Error al cargar equipos');
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
      [name]: name === 'equipoId' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.equipoId || !formData.motivo || !formData.observaciones) {
      setError('Todos los campos son obligatorios');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);

    try {
      await bajaService.crear({
        equipoId: formData.equipoId,
        motivo: formData.motivo as any,
        observaciones: formData.observaciones,
      });

      setSuccess('Solicitud de baja registrada exitosamente');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        navigate('/bajas');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Error al crear baja');
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
          onClick={() => navigate('/bajas')}
          className="p-2 hover:bg-neutral-100 rounded transition-colors"
        >
          <Icons.ArrowRightLeft className="w-5 h-5 rotate-180" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Solicitar Baja de Equipo</h1>
          <p className="text-neutral-600 mt-1">
            Registra una solicitud de baja para aprobación
          </p>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4">
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 shadow-lg flex items-start">
            <Icons.X className="w-6 h-6 text-red-600 mr-3" />
            <div className="flex-1">
              <p className="font-medium text-red-900 mb-1">Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-600">
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 shadow-lg flex items-start">
            <Icons.Trash2 className="w-6 h-6 text-green-600 mr-3" />
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
            <h2 className="text-lg font-semibold">Información de la Baja</h2>
          </CardHeader>
          <CardBody className="space-y-6 p-6">
            {/* Seleccionar Equipo */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Equipo *
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
            </div>

            {/* Info del equipo */}
            {equipoSeleccionado && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Icons.Package className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900 mb-1">Equipo Seleccionado</p>
                    <p className="text-sm text-blue-800 mb-1">{equipoSeleccionado.descripcion}</p>
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Ubicación:</span> {equipoSeleccionado.area.nombre}
                    </p>
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Estado:</span> {equipoSeleccionado.estado.nombre}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Motivo de Baja *
              </label>
              <select
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Selecciona un motivo</option>
                <option value="IRREPARABLE">Irreparable</option>
                <option value="OBSOLETO">Obsoleto</option>
                <option value="PERDIDA_TOTAL">Pérdida Total</option>
                <option value="ROBO">Robo</option>
              </select>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Observaciones / Justificación *
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={5}
                required
                className="input"
                placeholder="Describe detalladamente el motivo de la baja..."
              />
              <p className="text-xs text-neutral-500 mt-1">
                Ejemplo: "El equipo presenta daños irreparables en el sistema hidráulico..."
              </p>
            </div>

            {/* Nota */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icons.FileText className="w-5 h-5 text-neutral-600 mt-0.5" />
                <div className="text-sm text-neutral-700">
                  <p className="font-medium mb-1">Información:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>La solicitud quedará en estado PENDIENTE</li>
                    <li>Debe ser aprobada por Admin o Inventarios</li>
                    <li>El equipo pasará a "De baja (pendiente)"</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardBody>

          <CardFooter className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => navigate('/bajas')}
              variant="ghost"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Solicitar Baja'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}