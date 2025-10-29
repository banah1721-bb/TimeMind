import { useTheme } from '@/react-app/hooks/useTheme';

export default function AnimatedBackground() {
  const { theme } = useTheme();
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient Orbs */}
      <div 
        className={`absolute top-0 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-20 animate-pulse ${
          theme === 'light' 
            ? 'bg-gradient-to-br from-pink-300 to-rose-300' 
            : 'bg-gradient-to-br from-blue-500 to-indigo-500'
        }`}
        style={{ animationDuration: '8s' }}
      />
      <div 
        className={`absolute bottom-0 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-20 animate-pulse ${
          theme === 'light' 
            ? 'bg-gradient-to-br from-purple-300 to-pink-300' 
            : 'bg-gradient-to-br from-indigo-500 to-purple-500'
        }`}
        style={{ animationDuration: '10s', animationDelay: '2s' }}
      />
      <div 
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full blur-3xl opacity-10 animate-pulse ${
          theme === 'light' 
            ? 'bg-gradient-to-br from-rose-300 to-orange-300' 
            : 'bg-gradient-to-br from-cyan-500 to-blue-500'
        }`}
        style={{ animationDuration: '12s', animationDelay: '4s' }}
      />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: theme === 'light'
            ? 'linear-gradient(rgba(236, 72, 153, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(236, 72, 153, 0.3) 1px, transparent 1px)'
            : 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}
