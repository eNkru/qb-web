import type { Directive, DirectiveBinding } from 'vue';

const MIN_WIDTH = 40;

export interface ResizableColumnsOptions {
  onResize: (colKey: string, width: number) => void;
  getWidth: (colKey: string) => number | undefined;
  getHeaderKeys: () => string[];
}

const setupDone = new WeakSet<HTMLElement>();
let isApplying = false;

function getHeaderCells(table: HTMLTableElement): HTMLTableCellElement[] {
  return Array.from(table.querySelectorAll('thead th'));
}

function recalcTableWidth(table: HTMLTableElement) {
  const ths = getHeaderCells(table);
  let total = 0;
  ths.forEach((th) => {
    total += th.getBoundingClientRect().width;
  });
  table.style.width = `${total}px`;
}

function applyWidths(table: HTMLTableElement, getWidth: (colKey: string) => number | undefined) {
  if (isApplying) return;
  isApplying = true;

  const ths = getHeaderCells(table);
  const colgroup = table.querySelector('colgroup');
  let totalWidth = 0;

  ths.forEach((th, i) => {
    const key = (th as HTMLElement).dataset.colKey;
    if (!key) {
      totalWidth += th.getBoundingClientRect().width;
      return;
    }
    const w = getWidth(key);
    if (w != null) {
      (th as HTMLElement).style.width = `${w}px`;
      totalWidth += w;
      if (colgroup?.children[i]) {
        (colgroup.children[i] as HTMLTableColElement).style.width = `${w}px`;
      }
    } else {
      totalWidth += th.getBoundingClientRect().width;
    }
  });

  if (totalWidth > 0) {
    table.style.width = `${totalWidth}px`;
  }

  requestAnimationFrame(() => { isApplying = false; });
  setTimeout(() => { isApplying = false; }, 100);
}

function measureContentWidth(table: HTMLTableElement, colIndex: number): number {
  // Temporarily remove the fixed width on this column to let content determine natural width
  const ths = getHeaderCells(table);
  const th = ths[colIndex] as HTMLElement;
  const colgroup = table.querySelector('colgroup');

  // Save current values
  const savedThWidth = th.style.width;
  const savedColWidth = colgroup?.children[colIndex]
    ? (colgroup.children[colIndex] as HTMLElement).style.width
    : '';
  const savedTableWidth = table.style.width;
  const savedTableLayout = table.style.tableLayout;

  // Temporarily switch to auto layout for natural measurement
  th.style.width = 'auto';
  if (colgroup?.children[colIndex]) {
    (colgroup.children[colIndex] as HTMLElement).style.width = 'auto';
  }
  table.style.tableLayout = 'auto';
  table.style.width = 'auto';

  // Measure the header and all body cells in this column to find the max natural width
  let maxWidth = th.scrollWidth;

  const rows = table.querySelectorAll('tbody tr');
  rows.forEach((row) => {
    const cells = row.children;
    if (cells[colIndex]) {
      const cellWidth = (cells[colIndex] as HTMLElement).scrollWidth;
      if (cellWidth > maxWidth) {
        maxWidth = cellWidth;
      }
    }
  });

  // Add some padding for comfortable reading
  maxWidth += 16;

  // Restore original values
  th.style.width = savedThWidth;
  if (colgroup?.children[colIndex]) {
    (colgroup.children[colIndex] as HTMLElement).style.width = savedColWidth;
  }
  table.style.tableLayout = savedTableLayout;
  table.style.width = savedTableWidth;

  return Math.max(MIN_WIDTH, maxWidth);
}

function setupHandles(el: HTMLElement, options: ResizableColumnsOptions) {
  const table = el.querySelector('table') as HTMLTableElement | null;
  if (!table) return false;

  const ths = getHeaderCells(table);
  if (!ths.length) return false;

  const keys = options.getHeaderKeys();
  if (!keys.length || keys.length !== ths.length) return false;

  // Set table-layout: fixed so columns respect explicit widths
  table.style.tableLayout = 'fixed';

  // Create colgroup to propagate widths to data cells
  let colgroup = table.querySelector('colgroup');
  if (!colgroup) {
    colgroup = document.createElement('colgroup');
    table.insertBefore(colgroup, table.firstChild);
  }
  while (colgroup.children.length < ths.length) {
    colgroup.appendChild(document.createElement('col'));
  }

  ths.forEach((th, i) => {
    const thEl = th as HTMLElement;
    if (thEl.dataset.colKey) return;

    thEl.dataset.colKey = keys[i];
    thEl.style.position = 'relative';

    const handle = document.createElement('div');
    handle.classList.add('col-resizer');

    // Double-click to auto-fit column width to content
    handle.addEventListener('dblclick', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const colKey = keys[i];
      const naturalWidth = measureContentWidth(table, i);

      // Apply the measured width
      thEl.style.width = `${naturalWidth}px`;
      if (colgroup?.children[i]) {
        (colgroup.children[i] as HTMLTableColElement).style.width = `${naturalWidth}px`;
      }
      recalcTableWidth(table);

      // Persist the new width
      options.onResize(colKey, naturalWidth);
    });

    // Drag to resize
    handle.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = th.getBoundingClientRect().width;
      const colKey = keys[i];

      // Compute current total table width from all ths
      let currentTotal = 0;
      ths.forEach((t) => {
        currentTotal += t.getBoundingClientRect().width;
      });

      let prevWidth = startWidth;

      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;cursor:col-resize;z-index:99999;';
      document.body.appendChild(overlay);

      const onMouseMove = (e: MouseEvent) => {
        const newWidth = Math.max(MIN_WIDTH, startWidth + (e.clientX - startX));

        // Update total table width by the delta (avoids reflow)
        currentTotal += (newWidth - prevWidth);
        prevWidth = newWidth;

        thEl.style.width = `${newWidth}px`;
        table.style.width = `${currentTotal}px`;

        if (colgroup?.children[i]) {
          (colgroup.children[i] as HTMLTableColElement).style.width = `${newWidth}px`;
        }
      };

      const onMouseUp = (e: MouseEvent) => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        if (overlay.parentNode) overlay.remove();

        const finalWidth = Math.max(MIN_WIDTH, startWidth + (e.clientX - startX));
        options.onResize(colKey, finalWidth);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    th.appendChild(handle);
  });

  applyWidths(table, options.getWidth);
  return true;
}

const vResizableColumns: Directive<HTMLElement, ResizableColumnsOptions> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<ResizableColumnsOptions>) {
    const trySetup = () => {
      if (setupDone.has(el)) return;
      if (setupHandles(el, binding.value)) {
        setupDone.add(el);
      }
    };

    const observer = new MutationObserver(() => {
      const table = el.querySelector('table');
      if (table && table.querySelector('thead th') && !setupDone.has(el)) {
        observer.disconnect();
        trySetup();
      }
    });
    observer.observe(el, { childList: true, subtree: true });

    setTimeout(trySetup, 200);
  },

  updated(el: HTMLElement, binding: DirectiveBinding<ResizableColumnsOptions>) {
    if (isApplying) return;
    const table = el.querySelector('table');
    if (table && setupDone.has(el)) {
      applyWidths(table, binding.value.getWidth);
    }
  },

  unmounted(el: HTMLElement) {
    setupDone.delete(el);
  },
};

export default vResizableColumns;
