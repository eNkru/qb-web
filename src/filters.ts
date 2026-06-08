import { App } from 'vue';
import dayjs from 'dayjs';

 
export function toPrecision(value: number, precision: number) {
  const limit = 10 ** precision;
  if (value >= limit) {
    return value.toString();
  }
  if (value >= 1) {
    if (value >= limit - 1) {
      return limit.toString();
    }

    return value.toPrecision(precision);
  }

  return value.toFixed(precision - 1);
}

export function formatSize(value: number): string {
  const units = 'KMGTP';
  let index = value ? Math.floor(Math.log2(value) / 10) : 0;

  value = value / (1024 ** index);
  if (value >= 999) {
    value /= 1024;
    index++;
  }

  const unit = index === 0 ? 'B' : `${units[index - 1]}iB`;

  if (index === 0) {
    return `${value} ${unit}`;
  }

  return `${toPrecision(value, 3)} ${unit}`;
}

export interface DurationOptions {
  dayLimit?: number;
  maxUnitSize?: number;
  minUnit?: number;
}

export function formatDuration(value: number, options?: DurationOptions) {
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const year = day * 365;

  const durations = [year, day, hour, minute, 1];
  const units = 'ydhms';

  let index = 0;
  let unitSize = 0;
  const parts = [];

  const defaultOptions: DurationOptions = {
    maxUnitSize: 2,
    dayLimit: 0,
    minUnit: 0,
  };

  const opt = options ? Object.assign(defaultOptions, options) : defaultOptions;

  if (opt.dayLimit && value >= opt.dayLimit * day) {
    return '∞';
  }

  while ((!opt.maxUnitSize || unitSize !== opt.maxUnitSize) && index !== durations.length) {
    const duration = durations[index];
    if (value < duration) {
      index++;
      continue;
    } else if (opt.minUnit && (durations.length - index) <= opt.minUnit) {
      break
    }

    const result = Math.floor(value / duration);
    parts.push(result + units[index]);

     
    value %= duration;
    index++;
    unitSize++;
  }

  if (!parts.length) {
    return '0' + units[durations.length - 1 - opt.minUnit!];
  }

  return parts.join(' ');
}

export function formatTimestamp(timestamp: number | null) {
  if (timestamp == null || timestamp === -1) {
    return '';
  }

  const m = dayjs.unix(timestamp);
  return m.format('YYYY-MM-DD HH:mm:ss');
}

export function formatAsDuration(timestamp: number, options?: DurationOptions) {
  const duration = (Date.now() / 1000) - timestamp;
  return formatDuration(duration, options);
}

export function formatProgress(progress: number) {
   
  progress *= 100;
  return `${toPrecision(progress, 3)}%`;
}

export function parseDate(str: string) {
  if (!str) {
    return null
  }

  return Date.parse(str) / 1000
}

export function formatNetworkSpeed(speed: number) {
  if (speed === 0) {
    return null;
  }

  return `${formatSize(speed)}/s`;
}

export function registerFilters(app: App) {
  app.config.globalProperties.$formatSize = formatSize;
  app.config.globalProperties.$size = formatSize;
  app.config.globalProperties.$formatDuration = formatDuration;
  app.config.globalProperties.$formatTimestamp = formatTimestamp;
  app.config.globalProperties.$formatAsDuration = formatAsDuration;
  app.config.globalProperties.$progress = formatProgress;
  app.config.globalProperties.$parseDate = parseDate;
  app.config.globalProperties.$formatNetworkSpeed = formatNetworkSpeed;
}
