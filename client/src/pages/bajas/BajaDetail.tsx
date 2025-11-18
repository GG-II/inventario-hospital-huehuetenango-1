import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bajaService } from '../../services/bajaService';
import { Baja } from '../../types/baja';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Icons } from '../../components/common/Icon';
import { useAuth } from '../../contexts/AuthContext';

export function BajaDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [baja, setBaja] = useState<Baja | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [procesando, setProcesando] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [mostrarRechazo, setMostrarRechazo] = useState(false);

  const canApprove = ['Admin', 'Inventarios'].includes(user?.rol || '');

  useEffect(() => {
    cargarBaja();
  }, [id]);

  const cargarBaja = async () => {
    try {
      setIsLoading(true);
      const data = await bajaService.obtenerPorId(Number(id));
      setBaja(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar baja');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAprobar = async () => {
    if (!window.confirm('¿Estás seguro de aprobar esta baja? El equipo pasará a estado "Dado de baja".')) {
      return;
    }

    setProcesando(true);
    setError('');

    try {
      await bajaService.procesar(Number(id), { aprobado: true });
      setSuccess('Baja aprobada exitosamente');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => {
        navigate('/bajas');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al aprobar baja');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      setError('Debes proporcionar un motivo de rechazo');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setProcesando(true);
    setError('');

    try {
      await bajaService.procesar(Number(id), {
        aprobado: false,
        motivoRechazo: motivoRechazo,
      });
      setSuccess('Baja rechazada exitosamente');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => {
        navigate('/bajas');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al rechazar baja');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setProcesando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    const colores: Record<string, string> = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APROBADO: 'bg-red-100 text-red-800 border-red-200',
      RECHAZADO: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  const getMotivoLabel = (motivo: string) => {
    const labels: Record<string, string> = {
      IRREPARABLE: 'Irreparable',
      OBSOLETO: 'Obsoleto',
      PERDIDA_TOTAL: 'Pérdida Total',
      ROBO: 'Robo',
    };
    return labels[motivo] || motivo;
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
          <p className="mt-4 text-neutral-600">Cargando solicitud...</p>
        </div>
      </div>
    );
  }

  if (error && !baja) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">{error}</p>
        </div>
        <Button onClick={() => navigate('/bajas')} variant="ghost">
          Volver a bajas
        </Button>
      </div>
    );
  }

  if (!baja) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/bajas')}
            className="p-2 hover:bg-neutral-100 rounded transition-colors"
          >
            <Icons.ArrowRightLeft className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Detalle de Solicitud de Baja</h1>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`badge border ${getEstadoColor(baja.estado)}`}>
                {baja.estado}
              </span>
              <span className="text-sm text-neutral-600">
                Motivo: {getMotivoLabel(baja.motivo)}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/equipos/${baja.equipo.id}`)}
          variant="secondary"
          className="flex items-center space-x-2"
        >
          <Icons.Package className="w-4 h-4" />
          <span>Ver Equipo</span>
        </Button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Información del Equipo */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Equipo</h2>
        </CardHeader>
        <CardBody className="p-6">
          <div 
            className="p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors"
            onClick={() => navigate(`/equipos/${baja.equipo.id}`)}
          >
            <p className="font-mono text-sm text-primary-600 mb-2">{baja.equipo.codigoSICOIN}</p>
            <p className="font-medium text-neutral-900 mb-1">{baja.equipo.descripcion}</p>
            {baja.equipo.marca && (
              <p className="text-sm text-neutral-600">
                {baja.equipo.marca} {baja.equipo.modelo}
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Detalles de la Solicitud */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Detalles de la Solicitud</h2>
        </CardHeader>
        <CardBody className="space-y-4 p-6">
          <div>
            <p className="text-sm text-neutral-600 mb-1">Motivo de Baja</p>
            <p className="font-medium text-neutral-900">{getMotivoLabel(baja.motivo)}</p>
          </div>

          <div>
            <p className="text-sm text-neutral-600 mb-1">Observaciones / Justificación</p>
            <p className="text-neutral-900">{baja.observaciones}</p>
          </div>

          {baja.estado === 'RECHAZADO' && baja.motivoRechazo && (
            <div className="pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600 mb-1">Motivo de Rechazo</p>
              <p className="text-neutral-900">{baja.motivoRechazo}</p>
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
              <p className="text-sm text-neutral-600 mb-1">Solicitado por</p>
              <p className="font-medium text-neutral-900">{baja.creadoPor?.nombre || 'Desconocido'}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Fecha de Solicitud</p>
              <p className="text-neutral-900">{formatoFecha(baja.fechaCreacion)}</p>
            </div>
          </div>

          {baja.aprobadoPor && baja.fechaAprobacion && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
              <div>
                <p className="text-sm text-neutral-600 mb-1">
                  {baja.estado === 'APROBADO' ? 'Aprobado por' : 'Rechazado por'}
                </p>
                <p className="font-medium text-neutral-900">{baja.aprobadoPor.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Fecha de Decisión</p>
                <p className="text-neutral-900">{formatoFecha(baja.fechaAprobacion)}</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Acciones (solo si está pendiente y el usuario puede aprobar) */}
      {baja.estado === 'PENDIENTE' && canApprove && !mostrarRechazo && (
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900 mb-1">Procesar Solicitud</p>
                <p className="text-sm text-neutral-600">
                  Aprueba o rechaza esta solicitud de baja
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setMostrarRechazo(true)}
                  variant="ghost"
                  disabled={procesando}
                  className="text-neutral-700"
                >
                  Rechazar
                </Button>
                <Button
                  onClick={handleAprobar}
                  variant="primary"
                  disabled={procesando}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {procesando ? 'Procesando...' : 'Aprobar Baja'}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Formulario de Rechazo */}
      {mostrarRechazo && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-red-900">Rechazar Solicitud</h2>
          </CardHeader>
          <CardBody className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Motivo del Rechazo *
              </label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                rows={4}
                className="input"
                placeholder="Explica por qué se rechaza esta solicitud..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => {
                  setMostrarRechazo(false);
                  setMotivoRechazo('');
                }}
                variant="ghost"
                disabled={procesando}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRechazar}
                variant="primary"
                disabled={procesando || !motivoRechazo.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {procesando ? 'Rechazando...' : 'Confirmar Rechazo'}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}