import { App } from 'vue';

export function registerDirectives(app: App) {
  app.directive('class', {
    mounted(el, binding) {
      const clsName = binding.arg!;
      el.classList.toggle(clsName, binding.value);
    },
    updated(el, binding) {
      const clsName = binding.arg!;
      el.classList.toggle(clsName, binding.value);
    },
  });
}
