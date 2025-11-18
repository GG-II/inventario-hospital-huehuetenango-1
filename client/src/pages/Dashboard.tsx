import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-card p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            ¡Bienvenido al Sistema! 🎉
          </h1>
          <div className="space-y-4">
            <p className="text-lg text-neutral-700">
              Has iniciado sesión exitosamente.
            </p>
            <div className="bg-primary-50 border border-primary-200 rounded p-4">
              <p className="text-sm text-neutral-700">
                <strong>Usuario:</strong> {user?.nombre}
              </p>
              <p className="text-sm text-neutral-700">
                <strong>Username:</strong> {user?.username}
              </p>
              <p className="text-sm text-neutral-700">
                <strong>Rol:</strong> {user?.rol}
              </p>
            </div>
            <Button onClick={logout} variant="danger">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}