import { ReactNode } from "react";
import { useAuth } from "@getmocha/users-service/react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTheme } from "@/react-app/hooks/useTheme";
import { useLanguage } from "@/react-app/hooks/useLanguage";
import NotificationManager from "@/react-app/components/NotificationManager";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Settings,
  LogOut,
  Clock,
  User,
  Moon,
  Sun,
} from "lucide-react";
import AnimatedBackground from "@/react-app/components/AnimatedBackground";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: t('nav.dashboard'),
    },
    {
      path: "/tasks",
      icon: CheckSquare,
      label: t('nav.tasks'),
    },
    {
      path: "/schedule",
      icon: Calendar,
      label: t('nav.schedule'),
    },
    {
      path: "/settings",
      icon: Settings,
      label: t('nav.settings'),
    },
  ];

  return (
    <>
      <NotificationManager />
      <AnimatedBackground />
      <div className="min-h-screen flex relative">
      {/* Sidebar */}
      <div className="w-64 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl shadow-xl border-r border-pink-200/50 dark:border-blue-700/50">
        <div className="p-6 border-b border-pink-200/50 dark:border-blue-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 dark:from-blue-500 dark:to-indigo-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mr-3">{t('app.name')}</h1>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-pink-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
            </button>
          </div>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 rounded-r-2xl mx-2 ${
                  isActive
                    ? "text-white bg-gradient-to-r from-pink-500 to-rose-500 dark:from-blue-600 dark:to-indigo-600 shadow-lg transform scale-105"
                    : "text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-blue-400 hover:bg-pink-50/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <Icon className="w-5 h-5 ml-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="absolute bottom-0 w-64 p-6 border-t border-pink-200/50 dark:border-blue-700/50 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-blue-100 dark:to-indigo-100 rounded-full flex items-center justify-center">
              {user?.google_user_data.picture ? (
                <img
                  src={user.google_user_data.picture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <User className="w-5 h-5 text-pink-600 dark:text-blue-600" />
              )}
            </div>
            <div className="mr-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.google_user_data.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-200"
          >
            <LogOut className="w-4 h-4 ml-2" />
            {t('nav.logout')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
    </>
  );
}
