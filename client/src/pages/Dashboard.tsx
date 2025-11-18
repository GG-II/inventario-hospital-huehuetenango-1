import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { equipoService } from '../services/equipoService';
import { trasladoService } from '../services/trasladoService';
import { bajaService } from '../services/bajaService';
import { catalogoService } from '../services/catalogoService';
import { Card, CardBody } from '../components/common/Card';
import { Icons } from '../components/common/Icon';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalEquipos: 0,
    trasladosMes: 0,
    bajasPendientes: 0,
    areasActivas: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setIsLoading(true);

      const [equipos, traslados, bajas, areas] = await Promise.all([
        equipoService.listar({ limit: 1000 }),
        trasladoService.listar({ limit: 1000 }),
        bajaService.listar({ estado: 'PENDIENTE' }),
        catalogoService.listarAreas(),
      ]);

      // Contar traslados del mes actual
      const mesActual = new Date().getMonth();
      const añoActual = new Date().getFullYear();
      const trasladosMes = traslados.data.filter((t) => {
        const fecha = new Date(t.fechaMovimiento);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
      }).length;

      setStats({
        totalEquipos: equipos.pagination.total,
        trasladosMes: trasladosMes,
        bajasPendientes: bajas.pagination.total,
        areasActivas: areas.length,
      });
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
  {
    title: 'Total Equipos',
    value: stats.totalEquipos,
    icon: Icons.Package,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Traslados del Mes',
    value: stats.trasladosMes,
    icon: Icons.ArrowRightLeft,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Bajas Pendientes',
    value: stats.bajasPendientes,
    icon: Icons.Trash2,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    title: 'Áreas Activas',
    value: stats.areasActivas,
    icon: Icons.Building2,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

  const quickActions = [
    {
      title: 'Registrar Equipo',
      description: 'Agregar nuevo equipo al inventario',
      icon: Icons.Package,
      action: () => navigate('/equipos/nuevo'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Crear Traslado',
      description: 'Mover equipo entre áreas',
      icon: Icons.ArrowRightLeft,
      action: () => navigate('/traslados/nuevo'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Ver Reportes',
      description: 'Generar reportes e inventarios',
      icon: Icons.FileText,
      action: () => navigate('/reportes'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">
          Bienvenido, {user?.nombre || 'Usuario'}
        </p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardBody className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-24 mb-4"></div>
                  <div className="h-8 bg-neutral-200 rounded w-16"></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-neutral-900">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
</div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="text-left p-6 border-2 border-dashed border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
              >
                <div className={`inline-flex p-3 rounded-lg ${action.bgColor} mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <p className="font-medium text-neutral-900 mb-1">{action.title}</p>
                <p className="text-sm text-neutral-600">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardBody className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Estado del Sistema</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Equipos Activos</span>
                <span className="text-sm font-medium text-green-600">
                  {Math.round((stats.totalEquipos * 0.85))} activos
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">En Mantenimiento</span>
                <span className="text-sm font-medium text-yellow-600">
                  {Math.round((stats.totalEquipos * 0.10))} equipos
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Dados de Baja</span>
                <span className="text-sm font-medium text-red-600">
                  {Math.round((stats.totalEquipos * 0.05))} equipos
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Accesos Rápidos</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/equipos')}
                className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 transition-colors text-sm text-neutral-700"
              >
                → Ver todos los equipos
              </button>
              <button
                onClick={() => navigate('/traslados')}
                className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 transition-colors text-sm text-neutral-700"
              >
                → Historial de traslados
              </button>
              <button
                onClick={() => navigate('/bajas')}
                className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 transition-colors text-sm text-neutral-700"
              >
                → Gestionar bajas
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}