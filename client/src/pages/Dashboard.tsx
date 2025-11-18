import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Icons } from '../components/common/Icon';

export function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Total Equipos',
      value: '1,234',
      icon: Icons.Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Traslados del Mes',
      value: '45',
      icon: Icons.ArrowRightLeft,
      color: 'bg-green-500',
    },
    {
      name: 'Bajas Pendientes',
      value: '8',
      icon: Icons.Trash2,
      color: 'bg-yellow-500',
    },
    {
      name: 'Áreas Activas',
      value: '12',
      icon: Icons.Building2,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Dashboard
        </h1>
        <p className="text-neutral-600 mt-1">
          Bienvenido, {user?.nombre}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="overflow-hidden">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 font-medium">
                      {stat.name}
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-neutral-900">
            Acciones Rápidas
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
              <Icons.Package className="w-8 h-8 text-primary-600 mb-2" />
              <p className="font-medium text-neutral-900">Registrar Equipo</p>
              <p className="text-sm text-neutral-600">Agregar nuevo equipo al inventario</p>
            </button>
            <button className="p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
              <Icons.ArrowRightLeft className="w-8 h-8 text-primary-600 mb-2" />
              <p className="font-medium text-neutral-900">Crear Traslado</p>
              <p className="text-sm text-neutral-600">Mover equipo entre áreas</p>
            </button>
            <button className="p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
              <Icons.FileText className="w-8 h-8 text-primary-600 mb-2" />
              <p className="font-medium text-neutral-900">Ver Reportes</p>
              <p className="text-sm text-neutral-600">Generar reportes e inventarios</p>
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}