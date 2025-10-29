import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';

type TimerMode = 'work' | 'break';

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [workDuration] = useState(25);
  const [breakDuration] = useState(5);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, minutes, seconds, mode, breakDuration, workDuration]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play notification sound (optional)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        mode === 'work' ? 'وقت الاستراحة!' : 'وقت العمل!',
        {
          body: mode === 'work' 
            ? 'أحسنت! حان وقت الاستراحة'
            : 'الاستراحة انتهت، لنعد إلى العمل',
          icon: '/icon.png',
        }
      );
    }

    // Switch mode
    if (mode === 'work') {
      setMode('break');
      setMinutes(breakDuration);
    } else {
      setMode('work');
      setMinutes(workDuration);
    }
    setSeconds(0);
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(mode === 'work' ? workDuration : breakDuration);
    setSeconds(0);
  };

  const handleModeSwitch = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setMinutes(newMode === 'work' ? workDuration : breakDuration);
    setSeconds(0);
  };

  const progress = mode === 'work'
    ? ((workDuration * 60 - (minutes * 60 + seconds)) / (workDuration * 60)) * 100
    : ((breakDuration * 60 - (minutes * 60 + seconds)) / (breakDuration * 60)) * 100;

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
      {/* Mode Selector */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => handleModeSwitch('work')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            mode === 'work'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          عمل
        </button>
        <button
          onClick={() => handleModeSwitch('break')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            mode === 'break'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600'
          }`}
        >
          <Coffee className="w-4 h-4" />
          استراحة
        </button>
      </div>

      {/* Timer Display */}
      <div className="relative w-64 h-64 mx-auto mb-8">
        {/* Progress Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="110"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-gray-200 dark:text-slate-700"
          />
          <circle
            cx="128"
            cy="128"
            r="110"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 110}`}
            strokeDashoffset={`${2 * Math.PI * 110 * (1 - progress / 100)}`}
            className={mode === 'work' 
              ? 'text-pink-500 dark:text-blue-500' 
              : 'text-green-500 dark:text-emerald-500'}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-900 dark:text-white" dir="ltr">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
              {mode === 'work' ? 'جلسة عمل' : 'استراحة'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleStartPause}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-white shadow-lg transform hover:scale-105 transition-all ${
            mode === 'work'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              إيقاف مؤقت
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              بدء
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-4 rounded-xl font-medium bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 shadow-lg transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          إعادة
        </button>
      </div>
    </div>
  );
}
