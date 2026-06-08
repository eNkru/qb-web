import 'vue';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $store: any;
    $t: (key: string, ...args: any[]) => string;
    $formatSize: (value: number) => string;
    $size: (value: number) => string;
    $formatDuration: (value: number, options?: any) => string;
    $formatTimestamp: (timestamp: number | null) => string;
    $formatAsDuration: (timestamp: number, options?: any) => string;
    $progress: (progress: number) => string;
    $parseDate: (str: string) => number | null;
    $formatNetworkSpeed: (speed: number) => string | null;
  }
}
