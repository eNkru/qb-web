const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isPlainObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]';
}

export function safeMerge<T, U>(target: T, source: U): T & U;
export function safeMerge<T, U, V>(target: T, source1: U, source2: V): T & U & V;
export function safeMerge(target: any, ...sources: any[]): any {
  const result = { ...target };
  for (const source of sources) {
    if (!isPlainObject(source)) {
      continue;
    }
    for (const key of Object.keys(source)) {
      if (DANGEROUS_KEYS.has(key)) {
        continue;
      }
      const val = source[key];
      if (isPlainObject(val) && isPlainObject(result[key])) {
        result[key] = safeMerge(result[key], val);
      } else {
        result[key] = val;
      }
    }
  }
  return result;
}
