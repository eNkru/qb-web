import type { VNode } from 'vue';

declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Element extends VNode {}
    interface ElementClass {
      $props: any;
    }
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
