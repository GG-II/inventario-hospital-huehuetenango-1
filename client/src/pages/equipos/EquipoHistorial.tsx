import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { equipoService } from '../../services/equipoService';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Icons } from '../../components/common/Icon';

interface MovimientoHistorial {
  id: number;
  tipo: string;
  areaOrigen: { nombre: string };
  areaDestino: { nombre: string };
  folioConocimiento: string;
  fechaMovimiento: string;
  usuario: { nombre: string };
  observaciones?: string;
}


export function EquipoHistorial() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [movimientos, setMovimientos] = useState<MovimientoHistorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [codigoEquipo, setCodigoEquipo] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, [id]);

  const cargarHistorial = async () => {
    try {
      setIsLoading(true);
      
      // Cargar equipo para obtener código
      const equipo = await equipoService.obtenerPorId(Number(id));
      setCodigoEquipo(equipo.codigoSICOIN);
      
      // Cargar historial
      const historial = await equipoService.obtenerHistorial(Number(id));
      setMovimientos(historial.movimientos || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar historial');
    } finally {
      setIsLoading(false);
    }
  };

  const formatoFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">{error}</p>
        </div>
        <Button onClick={() => navigate(`/equipos/${id}`)} variant="ghost">
          Volver al equipo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/equipos/${id}`)}
          className="p-2 hover:bg-neutral-100 rounded transition-colors"
        >
          <Icons.ArrowRightLeft className="w-5 h-5 rotate-180" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Historial del Equipo
          </h1>
          <p className="text-neutral-600 mt-1">
            {codigoEquipo}
          </p>
        </div>
      </div>

      {/* Traslados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Traslados y Movimientos
            </h2>
            <span className="text-sm text-neutral-600">
              {movimientos.length} registros
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {movimientos.length === 0 ? (
            <div className="p-12 text-center">
              <Icons.ArrowRightLeft className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No hay traslados registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {movimientos.map((mov) => (
                <div key={mov.id} className="p-6 hover:bg-neutral-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Icons.ArrowRightLeft className="w-5 h-5 text-primary-600" />
                        <span className="font-mono text-sm font-medium text-primary-600">
                          {mov.folioConocimiento}
                        </span>
                      </div>
                      <p className="text-neutral-900 mb-1">
                        De <span className="font-medium">{mov.areaOrigen.nombre}</span> a{' '}
                        <span className="font-medium">{mov.areaDestino.nombre}</span>
                      </p>
                      {mov.observaciones && (
                        <p className="text-sm text-neutral-600 mt-2">
                          {mov.observaciones}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-neutral-900">
                        {mov.usuario.nombre}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {formatoFecha(mov.fechaMovimiento)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

    </div>
  );
}