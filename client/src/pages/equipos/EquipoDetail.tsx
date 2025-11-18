import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { equipoService } from '../../services/equipoService';
import { Equipo } from '../../types/equipo';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Icons } from '../../components/common/Icon';
import QRCode from 'qrcode';
import { useAuth } from '../../contexts/AuthContext';

export function EquipoDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
const [generandoQr, setGenerandoQr] = useState(false);

  useEffect(() => {
  cargarEquipo();
  generarQR();
}, [id]);

  const cargarEquipo = async () => {
    try {
      setIsLoading(true);
      const data = await equipoService.obtenerPorId(Number(id));
      
      setEquipo(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar equipo');
    } finally {
      setIsLoading(false);
    }
  };

  const generarQR = async () => {
  try {
    setGenerandoQr(true);
    
    // Datos del QR: URL del equipo o JSON con info
    const qrData = JSON.stringify({
      id: id,
      tipo: 'equipo',
      url: `${window.location.origin}/equipos/${id}`,
    });

    // Generar QR
    const dataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    setQrDataUrl(dataUrl);
  } catch (err) {
    console.error('Error al generar QR:', err);
  } finally {
    setGenerandoQr(false);
  }
};

const descargarQR = () => {
  if (!qrDataUrl || !equipo) return;

  const link = document.createElement('a');
  link.download = `QR-${equipo.codigoSICOIN}.png`;
  link.href = qrDataUrl;
  link.click();
};

  const formatoPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(precio / 100);
  };

  const formatoFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEstadoColor = (color: string) => {
    const colores: Record<string, string> = {
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colores[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const canEdit = user?.rol === 'Admin' || user?.rol === 'Inventarios';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Cargando equipo...</p>
        </div>
      </div>
    );
  }

  if (error || !equipo) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">{error || 'Equipo no encontrado'}</p>
        </div>
        <Button onClick={() => navigate('/equipos')} variant="ghost">
          Volver a equipos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/equipos')}
            className="p-2 hover:bg-neutral-100 rounded transition-colors"
          >
            <Icons.ArrowRightLeft className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Detalle del Equipo
            </h1>
            <p className="text-neutral-600 mt-1">
              {equipo.codigoSICOIN}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {canEdit && (
            <Button
              onClick={() => navigate(`/equipos/${equipo.id}/editar`)}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <Icons.Package className="w-4 h-4" />
              <span>Editar</span>
            </Button>
          )}
          <Button
            onClick={() => navigate(`/traslados/nuevo?equipoId=${equipo.id}`)}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Icons.ArrowRightLeft className="w-4 h-4" />
            <span>Trasladar</span>
          </Button>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda - Foto y Estado */}
        <div className="space-y-6">
          {/* Foto */}
          <Card>
            <CardBody className="p-6">
              {equipo.fotoUrl ? (
                <img
                  src={equipo.fotoUrl}
                  alt={equipo.descripcion}
                  className="w-full h-64 object-cover rounded"
                />
              ) : (
                <div className="w-full h-64 bg-neutral-100 rounded flex items-center justify-center">
                  <div className="text-center">
                    <Icons.Package className="w-16 h-16 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">Sin foto</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Estado y Ubicación */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Estado y Ubicación</h3>
            </CardHeader>
            <CardBody className="space-y-6 p-6">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Estado</p>
                <span className={`badge ${getEstadoColor(equipo.estado.color)} border px-3 py-1.5`}>
                  {equipo.estado.nombre}
                </span>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Ubicación Actual</p>
                <p className="font-medium text-neutral-900">{equipo.area.nombre}</p>
                {equipo.area.jefe && (
                  <p className="text-sm text-neutral-600 mt-1">
                    Jefe: {equipo.area.jefe}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Subgrupo SICOIN</p>
                <p className="text-sm font-mono text-neutral-900">{equipo.subgrupo.codigo}</p>
                <p className="text-sm text-neutral-600">{equipo.subgrupo.nombre}</p>
              </div>
            </CardBody>
          </Card>

          {/* QR Code */}
<Card>
  <CardHeader>
    <h3 className="font-semibold">Código QR</h3>
  </CardHeader>
  <CardBody className="text-center p-6">
    {generandoQr ? (
      <div className="py-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-3"></div>
        <p className="text-sm text-neutral-600">Generando QR...</p>
      </div>
    ) : qrDataUrl ? (
      <div>
        <div className="bg-white p-4 rounded inline-block border-2 border-neutral-200 mb-3">
          <img 
            src={qrDataUrl} 
            alt="Código QR" 
            className="w-64 h-64"
          />
        </div>
        <p className="text-sm font-medium text-neutral-900 mb-1">
          {equipo.codigoSICOIN}
        </p>
        <p className="text-xs text-neutral-600 mb-4">
          Escanea para ver detalles del equipo
        </p>
        <Button
          variant="primary"
          className="w-full"
          onClick={descargarQR}
        >
          Descargar QR
        </Button>
      </div>
    ) : (
      <div className="py-8">
        <Icons.Package className="w-16 h-16 text-neutral-300 mx-auto mb-3" />
        <p className="text-sm text-neutral-600">Error al generar QR</p>
        <Button
          variant="ghost"
          className="mt-3"
          onClick={generarQR}
        >
          Reintentar
        </Button>
      </div>
    )}
  </CardBody>
</Card>
        </div>

        {/* Columna Derecha - Información Detallada */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Información General</h3>
            </CardHeader>
            <CardBody className="space-y-6 p-6">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Descripción</p>
                <p className="text-neutral-900">{equipo.descripcion}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Marca</p>
                  <p className="font-medium text-neutral-900">{equipo.marca || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Modelo</p>
                  <p className="font-medium text-neutral-900">{equipo.modelo || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-neutral-600 mb-1">Número de Serie</p>
                <p className="font-mono text-sm text-neutral-900">{equipo.numeroSerie || 'N/A'}</p>
              </div>
            </CardBody>
          </Card>

          {/* Información Financiera */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Información Financiera</h3>
            </CardHeader>
            <CardBody className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Precio Unitario</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatoPrecio(equipo.precioUnitario)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Proveedor</p>
                  <p className="font-medium text-neutral-900">
                    {equipo.proveedor?.nombreComercial || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Número de Factura</p>
                  <p className="font-mono text-sm text-neutral-900">{equipo.numeroFactura || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Fecha de Ingreso</p>
                  <p className="text-neutral-900">{formatoFecha(equipo.fechaIngreso)}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Información Adicional</h3>
            </CardHeader>
            <CardBody className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Garantía Hasta</p>
                  <p className="text-neutral-900">
                    {equipo.garantiaHasta ? formatoFecha(equipo.garantiaHasta) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Vida Útil</p>
                  <p className="text-neutral-900">
                    {equipo.vidaUtilAnios ? `${equipo.vidaUtilAnios} años` : 'N/A'}
                  </p>
                </div>
              </div>

              {equipo.observaciones && (
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Observaciones</p>
                  <p className="text-neutral-900">{equipo.observaciones}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Metadatos */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Información del Registro</h3>
            </CardHeader>
            <CardBody className="space-y-4 p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Creado por:</span>
                <span className="font-medium text-neutral-900">{equipo.creadoPor.nombre}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Fecha de creación:</span>
                <span className="text-neutral-900">{formatoFecha(equipo.createdAt)}</span>
              </div>
              {equipo.updatedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Última actualización:</span>
                  <span className="text-neutral-900">{formatoFecha(equipo.updatedAt)}</span>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Acciones adicionales */}
      <Card>
        <CardBody className="flex items-center justify-between p-6">
          <div>
            <p className="font-medium text-neutral-900">Acciones disponibles</p>
            <p className="text-sm text-neutral-600">Gestiona este equipo</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
  variant="ghost"
  onClick={() => navigate(`/equipos/${equipo.id}/historial`)}
>
  Ver Historial
</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}