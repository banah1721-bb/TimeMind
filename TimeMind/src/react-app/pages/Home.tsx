import { useAuth } from "@getmocha/users-service/react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "@/react-app/hooks/useLanguage";
import AnimatedBackground from "@/react-app/components/AnimatedBackground";
import { 
  Brain, 
  Clock, 
  Target, 
  Bell, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  TrendingUp 
} from "lucide-react";

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  useEffect(() => {
    if (user && !isPending) {
      navigate("/dashboard");
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="animate-spin">
          <Clock className="w-8 h-8 text-pink-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('home.hero.badge')}
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-pink-600 to-rose-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {t('home.hero.title')}
              </span>
              <br />
              {t('home.hero.subtitle')}
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('home.hero.description')}
            </p>
            
            <button
              onClick={redirectToLogin}
              className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 dark:from-blue-600 dark:to-indigo-600 text-white text-lg font-semibold hover:from-pink-600 hover:to-rose-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {t('home.hero.cta')}
              <ArrowRight className="w-5 h-5 mr-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 dark:from-blue-500 dark:to-indigo-500 rounded-2xl mb-4 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">10K+</div>
            <div className="text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'مستخدم نشط' : 'Active Users'}
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">95%</div>
            <div className="text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'معدل الرضا' : 'Satisfaction Rate'}
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-4 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">1M+</div>
            <div className="text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'مهمة منجزة' : 'Tasks Completed'}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('home.features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 hover:shadow-lg transition-shadow duration-300 border border-pink-200/50 dark:border-pink-700/50">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('home.features.tasks.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('home.features.tasks.description')}
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:shadow-lg transition-shadow duration-300 border border-purple-200/50 dark:border-purple-700/50">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('home.features.ai.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('home.features.ai.description')}
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-lg transition-shadow duration-300 border border-green-200/50 dark:border-green-700/50">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('home.features.scheduling.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('home.features.scheduling.description')}
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 hover:shadow-lg transition-shadow duration-300 border border-orange-200/50 dark:border-orange-700/50">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('home.features.notifications.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('home.features.notifications.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-pink-500 to-rose-500 dark:from-blue-600 dark:to-indigo-600 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-pink-100 dark:text-blue-100 mb-8">
            {t('home.cta.description')}
          </p>
          <button
            onClick={redirectToLogin}
            className="inline-flex items-center px-8 py-4 rounded-xl bg-white text-pink-600 dark:text-blue-600 text-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            {t('home.cta.button')}
            <ArrowRight className="w-5 h-5 mr-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
