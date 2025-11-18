import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { trasladoService } from '../../services/trasladoService';
import { Traslado } from '../../types/traslado';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Icons } from '../../components/common/Icon';

export function TrasladoDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [traslado, setTraslado] = useState<Traslado | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarTraslado();
  }, [id]);

  const cargarTraslado = async () => {
    try {
      setIsLoading(true);
      const data = await trasladoService.obtenerPorId(Number(id));
      setTraslado(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar traslado');
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
          <p className="mt-4 text-neutral-600">Cargando traslado...</p>
        </div>
      </div>
    );
  }

  if (error || !traslado) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">{error || 'Traslado no encontrado'}</p>
        </div>
        <Button onClick={() => navigate('/traslados')} variant="ghost">
          Volver a traslados
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/traslados')}
            className="p-2 hover:bg-neutral-100 rounded transition-colors"
          >
            <Icons.ArrowRightLeft className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Detalle del Traslado
            </h1>
            <p className="text-neutral-600 mt-1 font-mono text-sm">
              {traslado.folioConocimiento}
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/equipos/${traslado.equipo.id}`)}
          variant="secondary"
          className="flex items-center space-x-2"
        >
          <Icons.Package className="w-4 h-4" />
          <span>Ver Equipo</span>
        </Button>
      </div>

      {/* Información del Equipo */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Equipo Trasladado</h2>
        </CardHeader>
        <CardBody className="space-y-4 p-6">
          <div 
            className="p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors"
            onClick={() => navigate(`/equipos/${traslado.equipo.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-mono text-sm text-primary-600 mb-2">
                  {traslado.equipo.codigoSICOIN}
                </p>
                <p className="font-medium text-neutral-900 mb-1">
                  {traslado.equipo.descripcion}
                </p>
                {traslado.equipo.marca && (
                  <p className="text-sm text-neutral-600">
                    {traslado.equipo.marca}
                    {traslado.equipo.modelo && ` - ${traslado.equipo.modelo}`}
                  </p>
                )}
              </div>
              <Icons.ArrowRightLeft className="w-5 h-5 text-neutral-400" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Información del Movimiento */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Información del Movimiento</h2>
        </CardHeader>
        <CardBody className="space-y-6 p-6">
          {/* Timeline del movimiento */}
          <div className="relative">
            <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-neutral-200"></div>
            
            {/* Área Origen */}
            <div className="relative flex items-start space-x-4 mb-8">
              <div className="flex-shrink-0 w-8 h-8 bg-neutral-400 rounded-full flex items-center justify-center z-10">
                <Icons.Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-neutral-600 mb-1">Área de Origen</p>
                <p className="font-medium text-neutral-900">{traslado.areaOrigen.nombre}</p>
                {traslado.areaOrigen.jefe && (
                  <p className="text-sm text-neutral-600 mt-1">
                    Jefe: {traslado.areaOrigen.jefe}
                  </p>
                )}
              </div>
            </div>

            {/* Área Destino */}
            <div className="relative flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center z-10">
                <Icons.Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-neutral-600 mb-1">Área de Destino</p>
                <p className="font-medium text-neutral-900">{traslado.areaDestino.nombre}</p>
                {traslado.areaDestino.jefe && (
                  <p className="text-sm text-neutral-600 mt-1">
                    Jefe: {traslado.areaDestino.jefe}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {traslado.observaciones && (
            <div className="pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600 mb-2">Observaciones</p>
              <p className="text-neutral-900">{traslado.observaciones}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Información del Registro */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Información del Registro</h2>
        </CardHeader>
        <CardBody className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Folio de Conocimiento</p>
              <p className="font-mono text-sm font-medium text-neutral-900">
                {traslado.folioConocimiento}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Tipo de Movimiento</p>
              <p className="font-medium text-neutral-900">{traslado.tipo}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Registrado por</p>
              <p className="font-medium text-neutral-900">{traslado.usuario.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Fecha del Movimiento</p>
              <p className="text-neutral-900">{formatoFecha(traslado.fechaMovimiento)}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}