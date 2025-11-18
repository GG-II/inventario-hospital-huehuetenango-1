import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { equipoService } from '../../services/equipoService';
import { catalogoService } from '../../services/catalogoService';
import { Equipo, Area, Estado, Subgrupo } from '../../types/equipo';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Icons } from '../../components/common/Icon';

export function EquiposList() {
  const navigate = useNavigate();
  
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [subgrupos, setSubgrupos] = useState<Subgrupo[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [areaId, setAreaId] = useState<number | undefined>();
  const [estadoId, setEstadoId] = useState<number | undefined>();
  const [subgrupoId, setSubgrupoId] = useState<number | undefined>();
  
  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    cargarCatalogos();
  }, []);

  useEffect(() => {
    cargarEquipos();
  }, [page, busqueda, areaId, estadoId, subgrupoId]);

  const cargarCatalogos = async () => {
    try {
      const [areasData, estadosData, subgruposData] = await Promise.all([
        catalogoService.listarAreas(),
        catalogoService.listarEstados(),
        catalogoService.listarSubgrupos(),
      ]);
      
      setAreas(areasData);
      setEstados(estadosData);
      setSubgrupos(subgruposData);
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
    }
  };

  const cargarEquipos = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await equipoService.listar({
        page,
        limit: 20,
        busqueda: busqueda || undefined,
        areaId,
        estadoId,
        subgrupoId,
      });

      setEquipos(response.data);
      setTotalPages(response.pagination.pages);
      setTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar equipos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuscar = (valor: string) => {
    setBusqueda(valor);
    setPage(1);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setAreaId(undefined);
    setEstadoId(undefined);
    setSubgrupoId(undefined);
    setPage(1);
  };

  const getEstadoColor = (color: string) => {
    const colores: Record<string, string> = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
    };
    return colores[color] || 'bg-gray-100 text-gray-800';
  };

  const formatoPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(precio / 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Equipos</h1>
          <p className="text-neutral-600 mt-1">
            Gestión de equipos médicos y mobiliario
          </p>
        </div>
        <Button
          onClick={() => navigate('/equipos/nuevo')}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Icons.Package className="w-4 h-4" />
          <span>Nuevo Equipo</span>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">  {/* Cambiar de 5 a 6 columnas */}
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <Input
                placeholder="Buscar por código, descripción, marca..."
                value={busqueda}
                onChange={(e) => handleBuscar(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Área */}
            <div>
              <select
                value={areaId || ''}
                onChange={(e) => {
                  setAreaId(e.target.value ? Number(e.target.value) : undefined);
                  setPage(1);
                }}
                className="input"
              >
                <option value="">Todas las áreas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <select
                value={estadoId || ''}
                onChange={(e) => {
                  setEstadoId(e.target.value ? Number(e.target.value) : undefined);
                  setPage(1);
                }}
                className="input"
              >
                <option value="">Todos los estados</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Subgrupo - AGREGAR ESTO */}
            <div>
              <select
                value={subgrupoId || ''}
                onChange={(e) => {
                  setSubgrupoId(e.target.value ? Number(e.target.value) : undefined);
                  setPage(1);
                }}
                className="input"
              >
                <option value="">Todos los subgrupos</option>
                {subgrupos.map((subgrupo) => (
                  <option key={subgrupo.id} value={subgrupo.id}>
                    {subgrupo.codigo}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón limpiar */}
            <div>
              <Button
                onClick={limpiarFiltros}
                variant="ghost"
                className="w-full"
              >
                Limpiar
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

      {/* Tabla */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-neutral-600">Cargando equipos...</p>
            </div>
          ) : equipos.length === 0 ? (
            <div className="p-12 text-center">
              <Icons.Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No se encontraron equipos</p>
              <Button
                onClick={() => navigate('/equipos/nuevo')}
                variant="primary"
                className="mt-4"
              >
                Registrar primer equipo
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                    <tr>
                        <th className="w-32">Código SICOIN</th>
                        <th className="min-w-[300px]">Descripción</th>
                        <th className="w-40">Área</th>
                        <th className="w-32">Estado</th>
                        <th className="w-32">Precio</th>
                        <th className="w-40 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {equipos.map((equipo) => (
                        <tr key={equipo.id} className="hover:bg-neutral-50">
                        <td className="align-top">
                            <span className="font-mono text-sm font-medium text-neutral-900">
                            {equipo.codigoSICOIN}
                            </span>
                        </td>
                        <td className="align-top">
                            <div>
                            <p className="font-medium text-neutral-900 mb-1">
                                {equipo.descripcion}
                            </p>
                            {equipo.marca && (
                                <p className="text-sm text-neutral-600">
                                {equipo.marca} {equipo.modelo && `- ${equipo.modelo}`}
                                </p>
                            )}
                            </div>
                        </td>
                        <td className="align-top">
                            <span className="text-sm text-neutral-700">
                            {equipo.area.nombre}
                            </span>
                        </td>
                        <td className="align-top">
                            <span className={`badge ${getEstadoColor(equipo.estado.color)}`}>
                            {equipo.estado.nombre}
                            </span>
                        </td>
                        <td className="align-top">
                            <span className="font-medium text-neutral-900 whitespace-nowrap">
                            {formatoPrecio(equipo.precioUnitario)}
                            </span>
                        </td>
                        <td className="align-top text-right">
                            <div className="flex items-center justify-end space-x-2">
                            <Button
                                onClick={() => navigate(`/equipos/${equipo.id}`)}
                                variant="ghost"
                                size="sm"
                                title="Ver detalles"
                            >
                                Ver
                            </Button>
                            <Button
                                onClick={() => navigate(`/equipos/${equipo.id}/editar`)}
                                variant="ghost"
                                size="sm"
                                title="Editar equipo"
                            >
                                Editar
                            </Button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

              {/* Paginación */}
              <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
                <p className="text-sm text-neutral-600">
                  Mostrando {equipos.length} de {total} equipos
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