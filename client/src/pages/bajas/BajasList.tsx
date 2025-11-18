import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bajaService } from '../../services/bajaService';
import { Baja } from '../../types/baja';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Icons } from '../../components/common/Icon';
import { useAuth } from '../../contexts/AuthContext';

export function BajasList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [bajas, setBajas] = useState<Baja[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [estadoFiltro, setEstadoFiltro] = useState<string>('TODOS');
  const [motivoFiltro, setMotivoFiltro] = useState<string>('TODOS');
  
  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const canCreate = ['Admin', 'Inventarios', 'Mantenimiento'].includes(user?.rol || '');
  const canApprove = ['Admin', 'Inventarios'].includes(user?.rol || '');

  useEffect(() => {
    cargarBajas();
  }, [page, estadoFiltro, motivoFiltro]);

  const cargarBajas = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await bajaService.listar({
        page,
        limit: 20,
        estado: estadoFiltro !== 'TODOS' ? estadoFiltro : undefined,
        motivo: motivoFiltro !== 'TODOS' ? motivoFiltro : undefined,
      });

      setBajas(response.data);
      setTotalPages(response.pagination.pages);
      setTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar bajas');
    } finally {
      setIsLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setEstadoFiltro('TODOS');
    setMotivoFiltro('TODOS');
    setPage(1);
  };

  const getEstadoColor = (estado: string) => {
    const colores: Record<string, string> = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APROBADO: 'bg-red-100 text-red-800 border-red-200',
      RECHAZADO: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
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
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Bajas de Equipos</h1>
          <p className="text-neutral-600 mt-1">
            Gestión de solicitudes de baja de equipos
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => navigate('/bajas/nueva')}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <Icons.Trash2 className="w-4 h-4" />
            <span>Solicitar Baja</span>
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Estado */}
            <div>
              <select
                value={estadoFiltro}
                onChange={(e) => {
                  setEstadoFiltro(e.target.value);
                  setPage(1);
                }}
                className="input"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="APROBADO">Aprobadas</option>
                <option value="RECHAZADO">Rechazadas</option>
              </select>
            </div>

            {/* Motivo */}
            <div>
              <select
                value={motivoFiltro}
                onChange={(e) => {
                  setMotivoFiltro(e.target.value);
                  setPage(1);
                }}
                className="input"
              >
                <option value="TODOS">Todos los motivos</option>
                <option value="IRREPARABLE">Irreparable</option>
                <option value="OBSOLETO">Obsoleto</option>
                <option value="PERDIDA_TOTAL">Pérdida Total</option>
                <option value="ROBO">Robo</option>
              </select>
            </div>

            {/* Botón limpiar */}
            <div className="md:col-span-2">
              <Button
                onClick={limpiarFiltros}
                variant="ghost"
                className="w-full"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Resultados */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Lista */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-neutral-600">Cargando solicitudes...</p>
            </div>
          ) : bajas.length === 0 ? (
            <div className="p-12 text-center">
              <Icons.Trash2 className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No se encontraron solicitudes de baja</p>
              {canCreate && (
                <Button
                  onClick={() => navigate('/bajas/nueva')}
                  variant="primary"
                  className="mt-4"
                >
                  Solicitar primera baja
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-neutral-200">
                {bajas.map((baja) => (
  <div 
    key={baja.id} 
    className="p-6 hover:bg-neutral-50 cursor-pointer transition-colors"
    onClick={() => navigate(`/bajas/${baja.id}`)}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        {/* Estado y Motivo */}
        <div className="flex items-center space-x-3 mb-3">
          <span className={`badge border ${getEstadoColor(baja.estado)}`}>
            {baja.estado}
          </span>
          <span className="text-sm text-neutral-600">
            Motivo: {getMotivoLabel(baja.motivo)}
          </span>
        </div>

        {/* Equipo */}
        <div className="mb-2">
          <p className="font-medium text-neutral-900">
            {baja.equipo?.descripcion || 'Sin descripción'}
          </p>
          <p className="text-sm text-neutral-600">
            {baja.equipo?.codigoSICOIN || 'Sin código'}
            {baja.equipo?.marca && ` • ${baja.equipo.marca}`}
            {baja.equipo?.modelo && ` ${baja.equipo.modelo}`}
          </p>
        </div>

        {/* Observaciones */}
        {baja.observaciones && (
          <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
            {baja.observaciones}
          </p>
        )}
      </div>

      {/* Info lateral */}
      <div className="text-right ml-4">
        <p className="text-sm text-neutral-900 mb-1">
          {baja.creadoPor?.nombre || 'Desconocido'}
        </p>
        <p className="text-sm text-neutral-600">
          {formatoFecha(baja.fechaCreacion)}
        </p>
        {baja.estado === 'PENDIENTE' && canApprove && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/bajas/${baja.id}`);
            }}
            variant="primary"
            size="sm"
            className="mt-2"
          >
            Procesar
          </Button>
        )}
      </div>
    </div>
  </div>
))}
              </div>

              {/* Paginación */}
              <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
                <p className="text-sm text-neutral-600">
                  Mostrando {bajas.length} de {total} solicitudes
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    variant="ghost"
                    size="sm"
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-neutral-600">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    variant="ghost"
                    size="sm"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}