export class ContextMenuItem {
  private type: string;
  private title: string;
  private isChecked: (() => boolean) | undefined;
  private command: ((event: Event) => void) | undefined;

  private view: HTMLElement | null;
  private checkbox: HTMLInputElement | null;

  constructor(options: {
    type: string;
    title: string;
    isChecked?: () => boolean;
    command?: (event: Event) => void;
  }) {
    this.type = options.type;
    this.title = options.title;
    this.isChecked = options.isChecked;
    this.command = options.command;
    this.view = null;
    this.checkbox = null;
  }

  public onDestroy() {
    if (this.view?.parentNode) {
      this.view.parentNode.removeChild(this.view);
    }
  }

  public getView(): HTMLElement {
    if (this.view) {
      return this.view;
    }

    if (this.type === 'delimer' || this.title === '----') {
      const view = document.createElement('div');
      view.className = 'jcmolview-dropdown-divider';
      this.view = view;
      return view;
    }

    if (this.type === 'item') {
      const view = document.createElement('a');
      view.className = 'jcmolview-dropdown-item';
      view.textContent = this.title || '';
      this.view = view;

      this.view.addEventListener('click', (event: Event) => {
        if (this.command) {
          this.command(event);
        }
      });
      return view;
    }

    if (this.type === 'checkbox') {
      const view = document.createElement('div');
      view.className = 'jcmolview-dropdown-item';
      this.checkbox = document.createElement('input');
      this.checkbox.type = 'checkbox';
      this.checkbox.checked = true;
      this.updateCheckBox();
      view.appendChild(this.checkbox);
      view.appendChild(document.createTextNode(this.title || ''));

      view.addEventListener('click', (event: Event) => {
        if (this.command) {
          this.command(event);
        }
        this.updateCheckBox();
      });

      this.view = view;
      return view;
    }

    const fallback = document.createElement('div');
    this.view = fallback;
    return fallback;
  }

  private updateCheckBox() {
    if (this.isChecked && this.checkbox) {
      const checked = this.isChecked();
      this.checkbox.checked = checked;
    }
  }
}
