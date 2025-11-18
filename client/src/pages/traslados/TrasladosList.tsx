import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trasladoService } from '../../services/trasladoService';
import { equipoService } from '../../services/equipoService';
import { catalogoService } from '../../services/catalogoService';
import { Traslado } from '../../types/traslado';
import { Equipo, Area } from '../../types/equipo';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Icons } from '../../components/common/Icon';

export function TrasladosList() {
  const navigate = useNavigate();
  
  const [traslados, setTraslados] = useState<Traslado[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [busquedaEquipo, setBusquedaEquipo] = useState('');
  const [areaOrigenId, setAreaOrigenId] = useState<number | undefined>();
  const [areaDestinoId, setAreaDestinoId] = useState<number | undefined>();
  
  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    cargarAreas();
  }, []);

  useEffect(() => {
    cargarTraslados();
  }, [page, areaOrigenId, areaDestinoId]);

  const cargarAreas = async () => {
    try {
      const areasData = await catalogoService.listarAreas();
      setAreas(areasData);
    } catch (err) {
      console.error('Error al cargar áreas:', err);
    }
  };

  const cargarTraslados = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await trasladoService.listar({
        page,
        limit: 20,
        areaOrigenId,
        areaDestinoId,
      });

      setTraslados(response.data);
      setTotalPages(response.pagination.pages);
      setTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar traslados');
    } finally {
      setIsLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setAreaOrigenId(undefined);
    setAreaDestinoId(undefined);
    setPage(1);
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
          <h1 className="text-2xl font-bold text-neutral-900">Traslados</h1>
          <p className="text-neutral-600 mt-1">
            Gestión de movimientos de equipos entre áreas
          </p>
        </div>
        <Button
          onClick={() => navigate('/traslados/nuevo')}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Icons.ArrowRightLeft className="w-4 h-4" />
          <span>Nuevo Traslado</span>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Área Origen */}
            <div>
              <select
                value={areaOrigenId || ''}
                onChange={(e) => {
                  setAreaOrigenId(e.target.value ? Number(e.target.value) : undefined);
                  setPage(1);
                }}
                className="input"
              >
                <option value="">Área origen (todas)</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Área Destino */}
            <div>
              <select
                value={areaDestinoId || ''}
                onChange={(e) => {
                  setAreaDestinoId(e.target.value ? Number(e.target.value) : undefined);
                  setPage(1);
                }}
                className="input"
              >
                <option value="">Área destino (todas)</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))}
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
              <p className="mt-4 text-neutral-600">Cargando traslados...</p>
            </div>
          ) : traslados.length === 0 ? (
            <div className="p-12 text-center">
              <Icons.ArrowRightLeft className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No se encontraron traslados</p>
              <Button
                onClick={() => navigate('/traslados/nuevo')}
                variant="primary"
                className="mt-4"
              >
                Registrar primer traslado
              </Button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-neutral-200">
                {traslados.map((traslado) => (
                  <div 
                    key={traslado.id} 
                    className="p-6 hover:bg-neutral-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/traslados/${traslado.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Folio */}
                        <div className="flex items-center space-x-3 mb-3">
                          <Icons.ArrowRightLeft className="w-5 h-5 text-primary-600" />
                          <span className="font-mono text-sm font-medium text-primary-600">
                            {traslado.folioConocimiento}
                          </span>
                        </div>

                        {/* Equipo */}
                        <div className="mb-2">
                          <p className="font-medium text-neutral-900">
                            {traslado.equipo.descripcion}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {traslado.equipo.codigoSICOIN}
                            {traslado.equipo.marca && ` • ${traslado.equipo.marca}`}
                            {traslado.equipo.modelo && ` ${traslado.equipo.modelo}`}
                          </p>
                        </div>

                        {/* Movimiento */}
                        <div className="flex items-center space-x-2 text-sm text-neutral-700">
                          <span className="font-medium">{traslado.areaOrigen.nombre}</span>
                          <Icons.ArrowRightLeft className="w-4 h-4" />
                          <span className="font-medium">{traslado.areaDestino.nombre}</span>
                        </div>

                        {/* Observaciones */}
                        {traslado.observaciones && (
                          <p className="text-sm text-neutral-600 mt-2">
                            {traslado.observaciones}
                          </p>
                        )}
                      </div>

                      {/* Info lateral */}
                      <div className="text-right ml-4">
                        <p className="text-sm text-neutral-900 mb-1">
                          {traslado.usuario.nombre}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {formatoFecha(traslado.fechaMovimiento)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
                <p className="text-sm text-neutral-600">
                  Mostrando {traslados.length} de {total} traslados
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