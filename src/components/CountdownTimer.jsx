import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar, Plane, MapPin } from 'lucide-react';
import { getCountdown, formatDate } from '../utils/dateUtils';

export function CountdownTimer({
  targetDate,
  label = '',
  showSeconds = true,
  size = 'md',
  variant = 'default',
  onComplete,
  className = '',
}) {
  const [countdown, setCountdown] = useState(() => getCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdown = getCountdown(targetDate);
      setCountdown(newCountdown);

      if (newCountdown.isPast && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  const sizeClasses = {
    sm: {
      container: 'gap-1',
      box: 'w-10 h-10',
      number: 'text-lg',
      label: 'text-[9px]',
    },
    md: {
      container: 'gap-2',
      box: 'w-14 h-14',
      number: 'text-2xl',
      label: 'text-[10px]',
    },
    lg: {
      container: 'gap-3',
      box: 'w-20 h-20',
      number: 'text-3xl',
      label: 'text-xs',
    },
  };

  const variantClasses = {
    default: {
      box: 'bg-white border border-gray-200 shadow-sm',
      number: 'text-gray-900',
      label: 'text-gray-500',
    },
    primary: {
      box: 'bg-primary-50 border border-primary-200',
      number: 'text-primary-700',
      label: 'text-primary-500',
    },
    dark: {
      box: 'bg-gray-900',
      number: 'text-white',
      label: 'text-gray-400',
    },
  };

  const sizes = sizeClasses[size] || sizeClasses.md;
  const variants = variantClasses[variant] || variantClasses.default;

  if (countdown.isPast) {
    return (
      <div className={`text-center ${className}`}>
        {label && <p className="text-sm text-gray-500 mb-2">{label}</p>}
        <p className="text-lg font-medium text-gray-600">Event has started!</p>
      </div>
    );
  }

  const timeUnits = [
    { value: countdown.days, label: 'Days' },
    { value: countdown.hours, label: 'Hours' },
    { value: countdown.minutes, label: 'Mins' },
  ];

  if (showSeconds) {
    timeUnits.push({ value: countdown.seconds, label: 'Secs' });
  }

  return (
    <div className={`text-center ${className}`}>
      {label && <p className="text-sm text-gray-500 mb-3">{label}</p>}
      <div className={`flex items-center justify-center ${sizes.container}`}>
        {timeUnits.map((unit, index) => (
          <React.Fragment key={unit.label}>
            <div
              className={`${sizes.box} ${variants.box} rounded-lg flex flex-col items-center justify-center`}
            >
              <span className={`${sizes.number} ${variants.number} font-bold leading-none`}>
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className={`${sizes.label} ${variants.label} uppercase tracking-wide mt-1`}>
                {unit.label}
              </span>
            </div>
            {index < timeUnits.length - 1 && (
              <span className={`${sizes.number} ${variants.number} font-light opacity-30`}>:</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function MiniCountdown({ targetDate, prefix = '', className = '' }) {
  const [countdown, setCountdown] = useState(() => getCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [targetDate]);

  if (countdown.isPast) {
    return <span className={`text-gray-500 ${className}`}>Started</span>;
  }

  let display = '';
  if (countdown.days > 0) {
    display = `${countdown.days}d ${countdown.hours}h`;
  } else if (countdown.hours > 0) {
    display = `${countdown.hours}h ${countdown.minutes}m`;
  } else {
    display = `${countdown.minutes}m`;
  }

  return (
    <span className={`font-medium ${className}`}>
      {prefix}{display}
    </span>
  );
}

export function TripCountdown({ trip, className = '' }) {
  const startDate = trip?.startDate;
  const endDate = trip?.endDate;

  const status = useMemo(() => {
    if (!startDate) return 'no-date';

    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (now < start) return 'upcoming';
    if (end && now > end) return 'completed';
    return 'active';
  }, [startDate, endDate]);

  if (status === 'no-date') {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <Calendar className="w-4 h-4" />
        <span className="text-sm">No dates set</span>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <MapPin className="w-4 h-4" />
        <span className="text-sm">Trip completed</span>
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className={`flex items-center gap-2 text-success-600 ${className}`}>
        <Plane className="w-4 h-4 animate-bounce-soft" />
        <span className="text-sm font-medium">Trip in progress!</span>
      </div>
    );
  }

  // Upcoming
  const countdown = getCountdown(startDate);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="w-4 h-4 text-primary-500" />
      <span className="text-sm">
        <span className="text-gray-600">Starts in </span>
        <span className="font-semibold text-primary-600">
          {countdown.days > 0 && `${countdown.days} days `}
          {countdown.hours > 0 && `${countdown.hours} hours`}
          {countdown.days === 0 && countdown.hours === 0 && `${countdown.minutes} minutes`}
        </span>
      </span>
    </div>
  );
}

export function EventCountdown({ event, compact = false, className = '' }) {
  const [countdown, setCountdown] = useState(() => getCountdown(event.datetime));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(event.datetime));
    }, 1000);

    return () => clearInterval(interval);
  }, [event.datetime]);

  if (countdown.isPast) {
    if (compact) {
      return <span className={`text-xs text-gray-400 ${className}`}>Started</span>;
    }
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Event has started
      </div>
    );
  }

  // Determine urgency
  const isUrgent = countdown.days === 0 && countdown.hours < 1;
  const isSoon = countdown.days === 0 && countdown.hours < 24;

  if (compact) {
    let text = '';
    if (countdown.days > 0) {
      text = `${countdown.days}d`;
    } else if (countdown.hours > 0) {
      text = `${countdown.hours}h`;
    } else {
      text = `${countdown.minutes}m`;
    }

    return (
      <span
        className={`text-xs font-medium ${
          isUrgent ? 'text-danger-600' : isSoon ? 'text-warning-600' : 'text-gray-600'
        } ${className}`}
      >
        {text}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
        isUrgent
          ? 'bg-danger-100 text-danger-700'
          : isSoon
          ? 'bg-warning-100 text-warning-700'
          : 'bg-gray-100 text-gray-700'
      } ${className}`}
    >
      <Clock className="w-3 h-3" />
      {countdown.days > 0 && `${countdown.days}d `}
      {countdown.hours > 0 && `${countdown.hours}h `}
      {countdown.minutes}m
    </div>
  );
}

export default CountdownTimer;
