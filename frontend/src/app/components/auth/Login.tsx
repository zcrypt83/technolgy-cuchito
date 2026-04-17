import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { Package, Lock, User } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      toast.error('Por favor ingrese email y contraseña');
      return;
    }

    setLoading(true);

    try {
      const success = await login(normalizedEmail, password);

      if (success) {
        toast.success('Inicio de sesión exitoso');
        navigate('/');
      } else {
        toast.error('Email o contraseña incorrectos');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Panel izquierdo - Información */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Technology Cuchito</h1>
              <p className="text-gray-600">Sistema de Control de Inventario</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Gestión Integral de Inventario
            </h2>
            <p className="text-gray-600 mb-6">
              Sistema SaaS profesional para el control total de productos, almacenes, 
              movimientos y generación de reportes en tiempo real.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Control en Tiempo Real</h3>
                  <p className="text-sm text-gray-600">Visibilidad inmediata de stock por producto y almacén</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Reportes Avanzados</h3>
                  <p className="text-sm text-gray-600">Dashboard ejecutivo con KPIs y gráficos interactivos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Seguridad Robusta</h3>
                  <p className="text-sm text-gray-600">Control de acceso basado en roles y auditoría completa</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario de login */}
        <Card className="shadow-xl border-gray-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ingrese su email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3 font-semibold">Usuarios de prueba:</p>
              <div className="space-y-2 text-xs">
                <div className="bg-blue-50 p-2 rounded border border-blue-200">
                  <p className="font-semibold text-blue-900">Administrador:</p>
                  <p className="text-blue-700">Email: <code className="bg-blue-100 px-1 rounded">admin@technologycuchito.com</code> | Contraseña: <code className="bg-blue-100 px-1 rounded">password123</code></p>
                </div>
                <div className="bg-green-50 p-2 rounded border border-green-200">
                  <p className="font-semibold text-green-900">Encargado de Almacén:</p>
                  <p className="text-green-700">Email: <code className="bg-green-100 px-1 rounded">carlos.mendoza@technologycuchito.com</code> | Contraseña: <code className="bg-green-100 px-1 rounded">password123</code></p>
                </div>
                <div className="bg-purple-50 p-2 rounded border border-purple-200">
                  <p className="font-semibold text-purple-900">Usuario Operativo:</p>
                  <p className="text-purple-700">Email: <code className="bg-purple-100 px-1 rounded">juan.perez@technologycuchito.com</code> | Contraseña: <code className="bg-purple-100 px-1 rounded">password123</code></p>
                </div>
                <div className="bg-amber-50 p-2 rounded border border-amber-200">
                  <p className="font-semibold text-amber-900">Si ejecutaste seed simple:</p>
                  <p className="text-amber-700">Email: <code className="bg-amber-100 px-1 rounded">admin@test.com</code> | Contraseña: <code className="bg-amber-100 px-1 rounded">admin123</code></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
