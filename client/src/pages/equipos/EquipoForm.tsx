import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { equipoService } from '../../services/equipoService';
import { catalogoService } from '../../services/catalogoService';
import { CrearEquipoRequest, Area, Estado, Subgrupo, Proveedor } from '../../types/equipo';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Icons } from '../../components/common/Icon';

export function EquipoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Catálogos
  const [areas, setAreas] = useState<Area[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [subgrupos, setSubgrupos] = useState<Subgrupo[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  // Estados para foto
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  // Formulario
  const [formData, setFormData] = useState<CrearEquipoRequest & { fotoUrl?: string }>({
    codigoSICOIN: '',
    descripcion: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    precioUnitario: 0,
    estadoId: 1,
    areaId: 0,
    subgrupoId: 0,
    proveedorId: undefined,
    numeroFactura: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    observaciones: '',
    garantiaHasta: '',
    vidaUtilAnios: undefined,
    fotoUrl: '',
  });

  useEffect(() => {
    cargarCatalogos();
    if (isEditing) {
      cargarEquipo();
    }
  }, [id]);

  const cargarCatalogos = async () => {
    try {
      const [areasData, estadosData, subgruposData, proveedoresData] = await Promise.all([
        catalogoService.listarAreas(),
        catalogoService.listarEstados(),
        catalogoService.listarSubgrupos(),
        catalogoService.listarProveedores(),
      ]);

      setAreas(areasData);
      setEstados(estadosData);
      setSubgrupos(subgruposData);
      setProveedores(proveedoresData);
    } catch (err) {
      setError('Error al cargar catálogos');
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const cargarEquipo = async () => {
    try {
      setIsLoading(true);
      const equipo = await equipoService.obtenerPorId(Number(id));
      
      setFormData({
        codigoSICOIN: equipo.codigoSICOIN,
        descripcion: equipo.descripcion,
        marca: equipo.marca || '',
        modelo: equipo.modelo || '',
        numeroSerie: equipo.numeroSerie || '',
        precioUnitario: equipo.precioUnitario / 100,
        estadoId: equipo.estado.id,
        areaId: equipo.area.id,
        subgrupoId: equipo.subgrupo.id,
        proveedorId: equipo.proveedor?.id,
        numeroFactura: equipo.numeroFactura || '',
        fechaIngreso: equipo.fechaIngreso,
        observaciones: equipo.observaciones || '',
        garantiaHasta: equipo.garantiaHasta || '',
        vidaUtilAnios: equipo.vidaUtilAnios,
        fotoUrl: equipo.fotoUrl || '',
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar equipo');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La foto no debe superar los 5MB');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validar tipo
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Solo se permiten archivos JPG o PNG');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setFotoFile(file);
    
    // Si estamos editando, subir inmediatamente al backend
    if (isEditing && id) {
      try {
        setUploadProgress(10);
        const result = await equipoService.subirFoto(Number(id), file);
        setUploadProgress(100);
        
        setFormData(prev => ({ 
          ...prev, 
          fotoUrl: result.fotoUrl 
        }));
        
        setSuccess('Foto subida exitosamente');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          setSuccess('');
          setUploadProgress(0);
        }, 3000);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Error al subir foto');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setUploadProgress(0);
      }
    } else {
      // Si es nuevo, solo crear preview temporal
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, fotoUrl: reader.result as string }));
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : 0) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { fotoUrl, ...dataWithoutFoto } = formData;

      const dataToSend = {
        ...dataWithoutFoto,
        precioUnitario: Math.round(formData.precioUnitario * 100),
        marca: formData.marca || undefined,
        modelo: formData.modelo || undefined,
        numeroSerie: formData.numeroSerie?.trim() || undefined,
        proveedorId: formData.proveedorId || undefined,
        numeroFactura: formData.numeroFactura || undefined,
        observaciones: formData.observaciones || undefined,
        garantiaHasta: formData.garantiaHasta || undefined,
        vidaUtilAnios: formData.vidaUtilAnios || undefined,
      };

      let equipoId: number;

      if (isEditing) {
        await equipoService.actualizar(Number(id), dataToSend);
        equipoId = Number(id);
        setSuccess('Equipo actualizado exitosamente');
      } else {
        const nuevoEquipo = await equipoService.crear(dataToSend);
        equipoId = nuevoEquipo.id;
        
        // Subir foto si hay archivo para equipo nuevo
        if (fotoFile) {
          try {
            await equipoService.subirFoto(equipoId, fotoFile);
          } catch (err) {
            console.error('Error al subir foto:', err);
          }
        }
        
        setSuccess('Equipo creado exitosamente');
      }

      // Scroll al top para ver el mensaje
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        navigate('/equipos');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Error al guardar equipo');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingCatalogos) {
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/equipos')}
          className="p-2 hover:bg-neutral-100 rounded transition-colors"
        >
          <Icons.ArrowRightLeft className="w-5 h-5 rotate-180" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {isEditing ? 'Editar Equipo' : 'Nuevo Equipo'}
          </h1>
          <p className="text-neutral-600 mt-1">
            {isEditing ? 'Actualiza la información del equipo' : 'Registra un nuevo equipo en el inventario'}
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
              <Icons.Package className="w-6 h-6 text-green-600" />
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
            <h2 className="text-lg font-semibold">Información del Equipo</h2>
          </CardHeader>
          <CardBody className="space-y-8 p-8">
            {/* Sección 1: Identificación */}
            <div>
              <h3 className="text-md font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Identificación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Código SICOIN *"
                  name="codigoSICOIN"
                  value={formData.codigoSICOIN}
                  onChange={handleChange}
                  placeholder="Ej: 323-001-2025"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Subgrupo SICOIN *
                  </label>
                  <select
                    name="subgrupoId"
                    value={formData.subgrupoId}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="">Selecciona un subgrupo</option>
                    {subgrupos.map((subgrupo) => (
                      <option key={subgrupo.id} value={subgrupo.id}>
                        {subgrupo.codigo} - {subgrupo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 2: FOTOGRAFÍA */}
            <div>
              <h3 className="text-md font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Fotografía del Equipo
              </h3>
              
              {/* Preview de foto actual */}
              {formData.fotoUrl && (
                <div className="mb-4">
                  <p className="text-sm text-neutral-600 mb-2">Foto actual:</p>
                  <div className="relative inline-block">
                    <img 
                      src={formData.fotoUrl} 
                      alt="Foto del equipo" 
                      className="w-48 h-48 object-cover rounded border border-neutral-200"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (isEditing && id) {
                          try {
                            await equipoService.eliminarFoto(Number(id));
                            setFormData(prev => ({ ...prev, fotoUrl: '' }));
                            setSuccess('Foto eliminada exitosamente');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setTimeout(() => setSuccess(''), 3000);
                          } catch (err: any) {
                            setError(err.response?.data?.error?.message || 'Error al eliminar foto');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        } else {
                          setFormData(prev => ({ ...prev, fotoUrl: '' }));
                          setFotoFile(null);
                        }
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      title="Eliminar foto"
                    >
                      <Icons.X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Input para subir foto - solo si NO hay foto */}
              {!formData.fotoUrl && (
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    id="foto"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="foto"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Icons.Package className="w-12 h-12 text-neutral-400 mb-3" />
                    <p className="text-sm font-medium text-neutral-700 mb-1">
                      Haz clic para subir una foto
                    </p>
                    <p className="text-xs text-neutral-500">
                      JPG, PNG (máx. 5MB)
                    </p>
                  </label>
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
                    <span>Subiendo foto...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sección 3: Descripción */}
            <div>
              <h3 className="text-md font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Descripción
              </h3>
              <Input
                label="Descripción *"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción detallada del equipo"
                required
              />
            </div>

            {/* Sección 4: Detalles del Fabricante */}
            <div>
              <h3 className="text-md font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Detalles del Fabricante
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Marca"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  placeholder="Ej: Stryker"
                />
                <Input
                  label="Modelo"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  placeholder="Ej: Prime Series"
                />
                <Input
                  label="Número de Serie"
                  name="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={handleChange}
                  placeholder="Ej: STR-2025-001"
                />
              </div>
            </div>

            {/* Sección 5: Ubicación y Estado */}
            <div>
              <h3 className="text-md font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Ubicación y Estado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Área *
                  </label>
                  <select
                    name="areaId"
                    value={formData.areaId}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="">Selecciona un área</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Estado *
                  </label>
                  <select
                    name="estadoId"
                    value={formData.estadoId}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    {estados.map((estado) => (
                      <option key={estado.id} value={estado.id}>
                        {estado.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 6: Información Financiera */}
            <div>
              <h3 className="text-md font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Información Financiera
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Precio Unitario (Q) *"
                  name="precioUnitario"
                  type="number"
                  step="0.01"
                  value={formData.precioUnitario}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Proveedor
                  </label>
                  <select
                    name="proveedorId"
                    value={formData.proveedorId || ''}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Selecciona un proveedor</option>
                    {proveedores.map((proveedor) => (
                      <option key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombreComercial}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Input
                  label="Número de Factura"
                  name="numeroFactura"
                  value={formData.numeroFactura}
                  onChange={handleChange}
                  placeholder="FAC-2025-001"
                />
                <Input
                  label="Fecha de Ingreso *"
                  name="fechaIngreso"
                  type="date"
                  value={formData.fechaIngreso}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Sección 7: Información Adicional */}
            <div>
              <h3 className="text-md font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Información Adicional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Garantía Hasta"
                  name="garantiaHasta"
                  type="date"
                  value={formData.garantiaHasta}
                  onChange={handleChange}
                />
                <Input
                  label="Vida Útil (años)"
                  name="vidaUtilAnios"
                  type="number"
                  value={formData.vidaUtilAnios || ''}
                  onChange={handleChange}
                  placeholder="10"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows={4}
                  className="input"
                  placeholder="Observaciones adicionales sobre el equipo..."
                />
              </div>
            </div>
          </CardBody>

          <CardFooter className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => navigate('/equipos')}
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
              {isLoading ? 'Guardando...' : isEditing ? 'Actualizar Equipo' : 'Crear Equipo'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}