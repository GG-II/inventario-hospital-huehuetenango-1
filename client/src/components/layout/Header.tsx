import { useAuth } from '../../contexts/AuthContext';
import { Icons } from '../common/Icon';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-12 bg-primary-600 text-white flex items-center justify-between px-4 shadow-md fixed top-0 left-0 right-0 z-50">
      {/* Lado izquierdo */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-primary-700 rounded transition-colors"
          aria-label="Toggle menu"
        >
          <Icons.Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <Icons.Package className="w-5 h-5 text-primary-600" />
          </div>
          <span className="font-semibold text-sm hidden md:block">
            Sistema de Inventario
          </span>
        </div>
      </div>

      {/* Lado derecho */}
      <div className="flex items-center space-x-4">
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium">{user?.nombre}</p>
          <p className="text-xs text-blue-100">{user?.rol}</p>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-2 px-3 py-1.5 hover:bg-primary-700 rounded transition-colors"
          title="Cerrar sesión"
        >
          <Icons.LogOut className="w-4 h-4" />
          <span className="text-sm hidden lg:block">Salir</span>
        </button>
      </div>
    </header>
  );
}