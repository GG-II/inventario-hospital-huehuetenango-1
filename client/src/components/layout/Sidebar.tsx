import { NavLink } from 'react-router-dom';
import { Icons } from '../common/Icon';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: Icons.Home,
  },
  {
    name: 'Equipos',
    path: '/equipos',
    icon: Icons.Package,
  },
  {
    name: 'Traslados',
    path: '/traslados',
    icon: Icons.ArrowRightLeft,
  },
  {
    name: 'Bajas',
    path: '/bajas',
    icon: Icons.Trash2,
    roles: ['Admin', 'Inventarios', 'Mantenimiento'],
  },
  {
    name: 'Reportes',
    path: '/reportes',
    icon: Icons.FileText,
  },
  {
    name: 'Áreas',
    path: '/catalogos/areas',
    icon: Icons.Building2,
    roles: ['Admin', 'Inventarios'],
  },
  {
    name: 'Proveedores',
    path: '/catalogos/proveedores',
    icon: Icons.Tag,
    roles: ['Admin', 'Inventarios'],
  },
  {
    name: 'Usuarios',
    path: '/usuarios',
    icon: Icons.Users,
    roles: ['Admin'],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  const canAccessItem = (item: MenuItem) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.rol || '');
  };

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-12 left-0 bottom-0 w-60 bg-white border-r border-neutral-200
          transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="flex flex-col h-full p-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              if (!canAccessItem(item)) return null;

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`
                  }
                  end={item.path === '/'}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Footer del sidebar */}
          <div className="mt-auto pt-4 border-t border-neutral-200">
            <div className="px-3 py-2">
              <p className="text-xs text-neutral-500 font-medium">
                Hospital Regional de Huehuetenango
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                © 2025 - v1.0.0
              </p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}