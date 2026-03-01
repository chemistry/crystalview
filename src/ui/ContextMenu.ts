import { ContextMenuItem } from './ContextMenuItem.js';

export class ContextMenu {
  private static initDone: boolean;
  private static instances: ContextMenu[];
  private static subscription: (() => void) | null;

  private static getInstances(): ContextMenu[] {
    return ContextMenu.instances;
  }

  private static init() {
    if (ContextMenu.initDone) {
      return;
    }
    ContextMenu.initDone = true;
    ContextMenu.instances = [];

    // hide all menu on Mouse Click or Esc
    const hideAll = () => {
      ContextMenu.hideAll();
    };
    document.body.addEventListener('click', hideAll);
    document.body.addEventListener('contextmenu', hideAll);
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        ContextMenu.hideAll();
      }
    };
    document.body.addEventListener('keyup', escHandler);

    ContextMenu.subscription = () => {
      document.body.removeEventListener('click', hideAll);
      document.body.removeEventListener('contextmenu', hideAll);
      document.body.removeEventListener('keyup', escHandler);
    };
  }

  private static off() {
    if (ContextMenu.instances?.length) {
      return;
    }
    ContextMenu.initDone = false;
    if (ContextMenu.subscription) {
      ContextMenu.subscription();
      ContextMenu.subscription = null;
    }
  }

  // hide all opened context menus
  private static hideAll() {
    for (const menu of ContextMenu.getInstances()) {
      menu.hide();
    }
  }

  private static addInstance(menu: ContextMenu) {
    ContextMenu.instances.push(menu);
  }

  private static removeInstance(menu: ContextMenu) {
    const instances = ContextMenu.instances;
    const idx = instances.indexOf(menu);
    if (idx > -1) {
      instances.splice(idx, 1);
    }
  }

  private widget: HTMLElement | null;
  private view: HTMLDivElement | null;
  private intervalID: ReturnType<typeof setTimeout> | null;
  private menuItems: ContextMenuItem[] | null;

  constructor(menuItems: ContextMenuItem[]) {
    this.widget = null;
    this.view = null;
    this.intervalID = null;
    this.menuItems = menuItems;
  }

  public onInit(element: HTMLElement) {
    ContextMenu.init();
    ContextMenu.addInstance(this);
    this.attach(element);

    this.view = this.getView();
  }

  public onDestroy() {
    ContextMenu.removeInstance(this);
    if (!ContextMenu.getInstances().length) {
      ContextMenu.off();
    }
    this.menuItems?.forEach((item) => {
      item.onDestroy();
    });
    this.menuItems = null;
    if (this.view?.parentNode) {
      this.view.parentNode.removeChild(this.view);
    }

    this.widget = null;
  }

  public hide() {
    if (this.intervalID) {
      clearTimeout(this.intervalID);
    }
    if (this.view) {
      this.view.style.display = 'none';
    }
  }

  public show(posX: number, posY: number) {
    const view = this.view;
    if (!view || !this.widget) {
      return;
    }
    this.widget.appendChild(view);
    view.style.display = 'block';
    view.style.position = 'absolute';
    view.style.left = posX - 8 + 'px';
    view.style.top = posY - 8 + 'px';

    view.addEventListener('mouseenter', () => {
      if (this.intervalID) {
        clearTimeout(this.intervalID);
      }
    });
    view.addEventListener('mouseleave', () => {
      if (this.intervalID) {
        clearTimeout(this.intervalID);
      }
      this.intervalID = setTimeout(() => {
        this.hide();
      }, 300);
    });
  }

  private attach(widget: HTMLElement) {
    this.widget = widget;
    widget.style.position = 'relative';

    widget.addEventListener('contextmenu', (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const rect = widget.getBoundingClientRect();
      const x = Math.max(event.clientX - rect.left, 0);
      const y = Math.max(event.clientY - rect.top, 0);
      this.show(x, y);
    });
  }

  private getView(): HTMLDivElement {
    if (this.view) {
      return this.view;
    }

    const view = document.createElement('div');
    view.className = 'jcmolview-dropdown-menu';

    if (this.menuItems) {
      this.menuItems.forEach((menuItem) => {
        const itemView = menuItem.getView();
        view.appendChild(itemView);
      });
    }

    return view;
  }
}
