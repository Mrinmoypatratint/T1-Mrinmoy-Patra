import { useEffect, useState, useCallback, useRef } from "react";

interface TimerProps {
  totalSeconds: number;
  onTimeUp: () => void;
}

export default function Timer({ totalSeconds, onTimeUp }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;
  const firedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!firedRef.current) {
            firedRef.current = true;
            // Defer to avoid setState-during-render
            setTimeout(() => onTimeUpRef.current(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = useCallback((secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  const percentage = (remaining / totalSeconds) * 100;
  const isUrgent = remaining <= 30;
  const isWarning = remaining <= 60 && !isUrgent;

  const colorClass = isUrgent
    ? "text-red-400"
    : isWarning
    ? "text-amber-400"
    : "text-emerald-400";

  const bgClass = isUrgent
    ? "bg-red-500"
    : isWarning
    ? "bg-amber-500"
    : "bg-emerald-500";

  return (
    <div className="glass-card px-4 py-3 flex items-center gap-4 min-w-[200px]">
      {/* Circular progress indicator */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold ${colorClass}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Time display */}
      <div>
        <div className={`text-2xl font-mono font-bold tracking-wider ${colorClass} ${isUrgent ? "animate-pulse" : ""}`}>
          {formatTime(remaining)}
        </div>
        <div className="text-xs text-white/40 uppercase tracking-wide">
          Remaining
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden ml-2">
        <div
          className={`h-full ${bgClass} rounded-full transition-all duration-1000 ease-linear`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
