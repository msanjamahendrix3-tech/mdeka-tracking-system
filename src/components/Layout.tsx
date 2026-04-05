import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserPlus, 
  Home as HomeIcon, 
  ClipboardList, 
  Users, 
  ShieldCheck, 
  Calendar, 
  Stethoscope, 
  Building2,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ConnectionStatus from './ConnectionStatus';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  if (!isAuthenticated || location.pathname === '/login') {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon, roles: ['ADMIN', 'CLINICAL', 'CHW'] },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'CLINICAL', 'CHW'] },
    { name: 'Patients', path: '/patients', icon: Users, roles: ['ADMIN', 'CLINICAL'] },
    { name: 'Add Patient', path: '/add-patient', icon: UserPlus, roles: ['ADMIN', 'CLINICAL'] },
    { name: 'Follow Up', path: '/follow-up', icon: ClipboardList, roles: ['ADMIN', 'CLINICAL', 'CHW'] },
    { name: 'Community', path: '/community', icon: Users, roles: ['ADMIN', 'CLINICAL', 'CHW'] },
    { name: 'Admin', path: '/admin', icon: ShieldCheck, roles: ['ADMIN'] },
  ];

  const secondaryNav = [
    { name: 'Appointments', path: '/appointments', icon: Calendar, roles: ['ADMIN', 'CLINICAL'] },
    { name: 'Clinics', path: '/clinics', icon: Building2, roles: ['ADMIN', 'CLINICAL'] },
    { name: 'Doctors', path: '/doctors', icon: Stethoscope, roles: ['ADMIN', 'CLINICAL'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));
  const filteredSecondaryNav = secondaryNav.filter(item => item.roles.includes(user?.role || ''));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <ConnectionStatus />
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-full z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <Stethoscope size={20} />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-slate-800 text-lg tracking-tight truncate">
              Mdeka Health
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <div className="mb-4">
            {isSidebarOpen && <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>}
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                  location.pathname === item.path 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} className={cn(
                  "shrink-0 transition-colors",
                  location.pathname === item.path ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            ))}
          </div>

          {filteredSecondaryNav.length > 0 && (
            <div>
              {isSidebarOpen && <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Services</p>}
              {filteredSecondaryNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                    location.pathname === item.path 
                      ? "bg-blue-50 text-blue-600 font-medium" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon size={20} className={cn(
                    "shrink-0 transition-colors",
                    location.pathname === item.path ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        isSidebarOpen ? "ml-64" : "ml-20"
      )}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search patient, doctor, clinic..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-xl text-sm w-64 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                {user?.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

