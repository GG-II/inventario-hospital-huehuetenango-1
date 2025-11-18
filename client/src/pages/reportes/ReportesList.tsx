import { useState, useEffect } from 'react';
import { catalogoService } from '../../services/catalogoService';
import { Area } from '../../types/equipo';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Icons } from '../../components/common/Icon';
import api from '../../services/api';

export function ReportesList() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarAreas();
  }, []);

  const cargarAreas = async () => {
    try {
      const data = await catalogoService.listarAreas();
      setAreas(data);
    } catch (err) {
      console.error('Error al cargar áreas:', err);
    }
  };

  const descargarInventario = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const response = await api.get('/reportes/inventario', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventario-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess('Reporte descargado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Error al descargar el reporte de inventario');
    } finally {
      setIsLoading(false);
    }
  };

  const descargarTarjeta = async () => {
    if (!areaSeleccionada) {
      setError('Selecciona un área primero');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const response = await api.get(`/reportes/tarjeta/${areaSeleccionada}`, {
        responseType: 'blob',
      });

      const area = areas.find(a => a.id === areaSeleccionada);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tarjeta-${area?.nombre || 'area'}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess('Tarjeta de responsabilidad descargada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Error al descargar la tarjeta de responsabilidad');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Reportes</h1>
        <p className="text-neutral-600 mt-1">Genera y descarga reportes en PDF</p>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Reporte de Inventario Anual */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded">
              <Icons.FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Reporte de Inventario Anual</h2>
              <p className="text-sm text-neutral-600">Listado completo de todos los equipos</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <p className="text-neutral-700 mb-4">
            Genera un reporte en PDF con el listado completo de todos los equipos registrados
            en el sistema, incluyendo código SICOIN, descripción, área, estado y más información.
          </p>
          <div className="flex items-center space-x-3">
            <Button
              onClick={descargarInventario}
              disabled={isLoading}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <Icons.Package className="w-4 h-4" />
              <span>{isLoading ? 'Generando...' : 'Descargar Reporte'}</span>
            </Button>
            <span className="text-sm text-neutral-600">
              Formato: PDF • Fecha: {new Date().toLocaleDateString('es-GT')}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Tarjeta de Responsabilidad */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded">
              <Icons.Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Tarjeta de Responsabilidad por Área</h2>
              <p className="text-sm text-neutral-600">Equipos asignados a un área específica</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <p className="text-neutral-700 mb-4">
            Genera un documento PDF con todos los equipos asignados a un área específica,
            incluyendo espacios para las firmas del jefe del área y el departamento de inventarios.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Selecciona el Área *
              </label>
              <select
                value={areaSeleccionada}
                onChange={(e) => {
                  setAreaSeleccionada(Number(e.target.value));
                  setError('');
                }}
                className="input max-w-md"
              >
                <option value="">Selecciona un área</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre} {area.jefe && `(${area.jefe})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={descargarTarjeta}
                disabled={isLoading || !areaSeleccionada}
                variant="primary"
                className="flex items-center space-x-2"
              >
                <Icons.Building2 className="w-4 h-4" />
                <span>{isLoading ? 'Generando...' : 'Descargar Tarjeta'}</span>
              </Button>
              {areaSeleccionada > 0 && (
                <span className="text-sm text-neutral-600">
                  Área: {areas.find(a => a.id === areaSeleccionada)?.nombre}
                </span>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Información adicional */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icons.FileText className="w-5 h-5 text-neutral-600 mt-0.5" />
          <div className="flex-1 text-sm text-neutral-700">
            <p className="font-medium mb-1">Información importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Los reportes se generan con la información actualizada del sistema</li>
              <li>Los archivos se descargan en formato PDF</li>
              <li>La tarjeta de responsabilidad incluye espacios para firmas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}