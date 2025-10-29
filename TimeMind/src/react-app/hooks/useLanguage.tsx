import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ar: {
    // App Name
    'app.name': 'TimeMind',
    'app.tagline': 'إدارة الوقت الذكية',
    'app.description': 'تطبيق إدارة الوقت المدعوم بالذكاء الاصطناعي',
    
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.tasks': 'المهام',
    'nav.schedule': 'الجدولة',
    'nav.settings': 'الإعدادات',
    'nav.logout': 'تسجيل الخروج',
    
    // Common
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.search': 'البحث',
    'common.filter': 'فلترة',
    'common.loading': 'جاري التحميل...',
    'common.saving': 'جاري الحفظ...',
    'common.saved': 'تم الحفظ',
    
    // Home Page
    'home.hero.badge': 'مدعوم بالذكاء الاصطناعي',
    'home.hero.title': 'TimeMind',
    'home.hero.subtitle': 'إدارة الوقت الذكية',
    'home.hero.description': 'تطبيق إدارة الوقت المدعوم بالذكاء الاصطناعي الذي يساعدك على تنظيم مهامك، جدولة أوقات الدراسة المثلى، وتحقيق أهدافك بكفاءة أكبر',
    'home.hero.cta': 'ابدأ الآن مجاناً',
    'home.features.title': 'ميزات TimeMind',
    'home.features.subtitle': 'كل ما تحتاجه لإدارة وقتك بذكاء',
    'home.features.tasks.title': 'إدارة المهام',
    'home.features.tasks.description': 'تذكيرات ذكية بالمهام اليومية والواجبات مع تحديد الأولويات',
    'home.features.ai.title': 'الذكاء الاصطناعي',
    'home.features.ai.description': 'اقتراحات ذكية لأفضل أوقات الدراسة بناءً على جدولك ونشاطك اليومي',
    'home.features.scheduling.title': 'جدولة تفاعلية',
    'home.features.scheduling.description': 'واجهة تفاعلية لترتيب المهام حسب الأولوية وتخصيص الوقت بكفاءة',
    'home.features.notifications.title': 'تنبيهات ذكية',
    'home.features.notifications.description': 'إشعارات ذكية للمواعيد النهائية والمهام المهمة',
    'home.cta.title': 'ابدأ رحلتك نحو إدارة أفضل للوقت',
    'home.cta.description': 'انضم إلى آلاف الطلاب الذين يحققون أهدافهم بكفاءة أكبر',
    'home.cta.button': 'سجل الدخول مع Google',
    
    // Dashboard
    'dashboard.welcome': 'مرحباً',
    'dashboard.subtitle': 'إليك نظرة عامة على يومك',
    'dashboard.addTask': 'إضافة مهمة',
    'dashboard.stats.pending': 'المهام المتبقية',
    'dashboard.stats.completion': 'معدل الإنجاز',
    'dashboard.stats.urgent': 'مهام عاجلة',
    'dashboard.stats.todaySessions': 'جلسات اليوم',
    'dashboard.urgentTasks': 'المهام العاجلة',
    'dashboard.noUrgentTasks': 'لا توجد مهام عاجلة حالياً',
    'dashboard.todaySchedule': 'جدول اليوم',
    'dashboard.noSchedule': 'لا توجد جلسات مجدولة لليوم',
    'dashboard.aiSuggestions': 'احصل على اقتراحات AI',
    'dashboard.deadline': 'موعد التسليم',
    'dashboard.priority': 'أولوية',
    'dashboard.studySession': 'جلسة دراسة',
    'dashboard.aiSuggested': 'اقتراح AI',
    
    // Tasks Page
    'tasks.title': 'إدارة المهام',
    'tasks.subtitle': 'نظم مهامك وحقق أهدافك بكفاءة',
    'tasks.addTask': 'إضافة مهمة',
    'tasks.stats.total': 'إجمالي المهام',
    'tasks.stats.completed': 'مكتملة',
    'tasks.stats.pending': 'متبقية',
    'tasks.stats.urgent': 'عاجلة',
    'tasks.search': 'البحث في المهام...',
    'tasks.filter.allStatus': 'جميع الحالات',
    'tasks.filter.pending': 'متبقية',
    'tasks.filter.completed': 'مكتملة',
    'tasks.filter.allPriorities': 'جميع الأولويات',
    'tasks.filter.allSubjects': 'جميع المواد',
    'tasks.noTasks': 'لا توجد مهام بعد',
    'tasks.noMatch': 'لا توجد مهام تطابق البحث',
    'tasks.noTasksDescription': 'ابدأ بإضافة مهمتك الأولى',
    'tasks.noMatchDescription': 'جرب تغيير معايير البحث أو الفلترة',
    'tasks.addFirstTask': 'إضافة مهمة جديدة',
    'tasks.deleteConfirm': 'هل أنت متأكد من حذف هذه المهمة؟',
    
    // Task Modal
    'taskModal.title': 'إضافة مهمة جديدة',
    'taskModal.titleLabel': 'عنوان المهمة *',
    'taskModal.titlePlaceholder': 'مثال: مراجعة الرياضيات',
    'taskModal.description': 'الوصف',
    'taskModal.descriptionPlaceholder': 'تفاصيل المهمة...',
    'taskModal.priority': 'الأولوية',
    'taskModal.duration': 'المدة (دقيقة)',
    'taskModal.deadline': 'الموعد النهائي',
    'taskModal.subject': 'المادة',
    'taskModal.subjectPlaceholder': 'مثال: الرياضيات',
    'taskModal.save': 'حفظ المهمة',
    
    // Priority Levels
    'priority.veryLow': 'منخفضة جداً',
    'priority.low': 'منخفضة',
    'priority.medium': 'متوسطة',
    'priority.high': 'عالية',
    'priority.urgent': 'عاجلة',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.subtitle': 'خصص تجربتك في TimeMind',
    'settings.saveChanges': 'حفظ التغييرات',
    'settings.notifications.title': 'التنبيهات والإشعارات',
    'settings.notifications.subtitle': 'إدارة تنبيهات المهام والجلسات',
    'settings.notifications.enable': 'تفعيل التنبيهات',
    'settings.notifications.description': 'احصل على إشعارات للمواعيد النهائية والجلسات القادمة',
    'settings.notifications.warning': '⚠️ يرجى السماح للمتصفح بإرسال الإشعارات لتفعيل هذه الميزة',
    'settings.studyTime.title': 'أوقات الدراسة المفضلة',
    'settings.studyTime.subtitle': 'حدد أفضل أوقات الدراسة لديك',
    'settings.studyTime.startTime': 'وقت البدء',
    'settings.studyTime.endTime': 'وقت الانتهاء',
    'settings.studyTime.breakDuration': 'مدة الاستراحة (دقيقة)',
    'settings.studyTime.maxDuration': 'الحد الأقصى لمدة الجلسة (دقيقة)',
    'settings.language.title': 'اللغة',
    'settings.language.subtitle': 'اختر لغة التطبيق',
    'settings.language.arabic': 'العربية',
    'settings.language.english': 'English',
    'settings.loadFailed': 'فشل في تحميل الإعدادات',
    
    // Schedule
    'schedule.title': 'الجدولة الذكية',
    'schedule.comingSoon': 'قريباً...',
    'schedule.subtitle': 'نظم جدول دراستك بذكاء مع الذكاء الاصطناعي',
    'schedule.aiSuggestions': 'اقتراحات ذكية',
    'schedule.generating': 'جاري التوليد...',
    'schedule.totalSessions': 'إجمالي الجلسات',
    'schedule.completed': 'جلسات مكتملة',
    'schedule.aiSuggested': 'اقتراحات AI',
    'schedule.weeklySchedule': 'جدول الأسبوع',
    'schedule.time': 'الوقت',
    'schedule.studySession': 'جلسة دراسة',
    'schedule.noTasks': 'لا توجد مهام للجدولة',
    'schedule.noTasksDescription': 'أضف بعض المهام أولاً للحصول على اقتراحات جدولة ذكية',
    'schedule.addTask': 'إضافة مهمة',
    
    // Time Units
    'time.minutes': 'دقيقة',
    'time.hours': 'ساعة',
  },
  en: {
    // App Name
    'app.name': 'TimeMind',
    'app.tagline': 'Smart Time Management',
    'app.description': 'AI-powered time management app',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.tasks': 'Tasks',
    'nav.schedule': 'Schedule',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.saving': 'Saving...',
    'common.saved': 'Saved',
    
    // Home Page
    'home.hero.badge': 'AI-Powered',
    'home.hero.title': 'TimeMind',
    'home.hero.subtitle': 'Smart Time Management',
    'home.hero.description': 'AI-powered time management app that helps you organize your tasks, schedule optimal study times, and achieve your goals more efficiently',
    'home.hero.cta': 'Get Started Free',
    'home.features.title': 'TimeMind Features',
    'home.features.subtitle': 'Everything you need to manage your time smartly',
    'home.features.tasks.title': 'Task Management',
    'home.features.tasks.description': 'Smart reminders for daily tasks and assignments with priority setting',
    'home.features.ai.title': 'Artificial Intelligence',
    'home.features.ai.description': 'Smart suggestions for optimal study times based on your schedule and daily activity',
    'home.features.scheduling.title': 'Interactive Scheduling',
    'home.features.scheduling.description': 'Interactive interface to arrange tasks by priority and allocate time efficiently',
    'home.features.notifications.title': 'Smart Notifications',
    'home.features.notifications.description': 'Smart notifications for deadlines and important tasks',
    'home.cta.title': 'Start Your Journey to Better Time Management',
    'home.cta.description': 'Join thousands of students achieving their goals more efficiently',
    'home.cta.button': 'Sign in with Google',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.subtitle': "Here's an overview of your day",
    'dashboard.addTask': 'Add Task',
    'dashboard.stats.pending': 'Pending Tasks',
    'dashboard.stats.completion': 'Completion Rate',
    'dashboard.stats.urgent': 'Urgent Tasks',
    'dashboard.stats.todaySessions': "Today's Sessions",
    'dashboard.urgentTasks': 'Urgent Tasks',
    'dashboard.noUrgentTasks': 'No urgent tasks at the moment',
    'dashboard.todaySchedule': "Today's Schedule",
    'dashboard.noSchedule': 'No sessions scheduled for today',
    'dashboard.aiSuggestions': 'Get AI Suggestions',
    'dashboard.deadline': 'Deadline',
    'dashboard.priority': 'Priority',
    'dashboard.studySession': 'Study Session',
    'dashboard.aiSuggested': 'AI Suggested',
    
    // Tasks Page
    'tasks.title': 'Task Management',
    'tasks.subtitle': 'Organize your tasks and achieve your goals efficiently',
    'tasks.addTask': 'Add Task',
    'tasks.stats.total': 'Total Tasks',
    'tasks.stats.completed': 'Completed',
    'tasks.stats.pending': 'Pending',
    'tasks.stats.urgent': 'Urgent',
    'tasks.search': 'Search tasks...',
    'tasks.filter.allStatus': 'All Status',
    'tasks.filter.pending': 'Pending',
    'tasks.filter.completed': 'Completed',
    'tasks.filter.allPriorities': 'All Priorities',
    'tasks.filter.allSubjects': 'All Subjects',
    'tasks.noTasks': 'No tasks yet',
    'tasks.noMatch': 'No tasks match your search',
    'tasks.noTasksDescription': 'Start by adding your first task',
    'tasks.noMatchDescription': 'Try changing your search or filter criteria',
    'tasks.addFirstTask': 'Add New Task',
    'tasks.deleteConfirm': 'Are you sure you want to delete this task?',
    
    // Task Modal
    'taskModal.title': 'Add New Task',
    'taskModal.titleLabel': 'Task Title *',
    'taskModal.titlePlaceholder': 'e.g., Review Mathematics',
    'taskModal.description': 'Description',
    'taskModal.descriptionPlaceholder': 'Task details...',
    'taskModal.priority': 'Priority',
    'taskModal.duration': 'Duration (minutes)',
    'taskModal.deadline': 'Deadline',
    'taskModal.subject': 'Subject',
    'taskModal.subjectPlaceholder': 'e.g., Mathematics',
    'taskModal.save': 'Save Task',
    
    // Priority Levels
    'priority.veryLow': 'Very Low',
    'priority.low': 'Low',
    'priority.medium': 'Medium',
    'priority.high': 'High',
    'priority.urgent': 'Urgent',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Customize your TimeMind experience',
    'settings.saveChanges': 'Save Changes',
    'settings.notifications.title': 'Notifications & Alerts',
    'settings.notifications.subtitle': 'Manage task and session notifications',
    'settings.notifications.enable': 'Enable Notifications',
    'settings.notifications.description': 'Get notifications for deadlines and upcoming sessions',
    'settings.notifications.warning': '⚠️ Please allow browser notifications to enable this feature',
    'settings.studyTime.title': 'Preferred Study Times',
    'settings.studyTime.subtitle': 'Set your preferred study times',
    'settings.studyTime.startTime': 'Start Time',
    'settings.studyTime.endTime': 'End Time',
    'settings.studyTime.breakDuration': 'Break Duration (minutes)',
    'settings.studyTime.maxDuration': 'Maximum Session Duration (minutes)',
    'settings.language.title': 'Language',
    'settings.language.subtitle': 'Choose your app language',
    'settings.language.arabic': 'Arabic',
    'settings.language.english': 'English',
    'settings.loadFailed': 'Failed to load settings',
    
    // Schedule
    'schedule.title': 'Smart Scheduling',
    'schedule.comingSoon': 'Coming soon...',
    'schedule.subtitle': 'Organize your study schedule smartly with AI',
    'schedule.aiSuggestions': 'AI Suggestions',
    'schedule.generating': 'Generating...',
    'schedule.totalSessions': 'Total Sessions',
    'schedule.completed': 'Completed',
    'schedule.aiSuggested': 'AI Suggested',
    'schedule.weeklySchedule': 'Weekly Schedule',
    'schedule.time': 'Time',
    'schedule.studySession': 'Study Session',
    'schedule.noTasks': 'No Tasks to Schedule',
    'schedule.noTasksDescription': 'Add some tasks first to get smart scheduling suggestions',
    'schedule.addTask': 'Add Task',
    
    // Time Units
    'time.minutes': 'minutes',
    'time.hours': 'hours',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
