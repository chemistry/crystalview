import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContextMenu } from './ContextMenu.js';
import { ContextMenuItem } from './ContextMenuItem.js';

describe('ContextMenu', () => {
  it('should create context menu with items', () => {
    const items = [new ContextMenuItem({ type: 'item', title: 'Test', command: () => {} })];
    const menu = new ContextMenu(items);
    expect(menu).toBeDefined();
  });

  it('should initialize and attach to element', () => {
    const items = [new ContextMenuItem({ type: 'item', title: 'Test', command: () => {} })];
    const menu = new ContextMenu(items);
    const el = document.createElement('div');
    menu.onInit(el);
    expect(el.style.position).toBe('relative');
  });

  it('should show and hide menu', () => {
    const items = [new ContextMenuItem({ type: 'item', title: 'Test', command: () => {} })];
    const menu = new ContextMenu(items);
    const el = document.createElement('div');
    document.body.appendChild(el);
    menu.onInit(el);
    menu.show(100, 200);
    menu.hide();
    document.body.removeChild(el);
  });

  it('should handle contextmenu event', () => {
    const items = [new ContextMenuItem({ type: 'item', title: 'Test', command: () => {} })];
    const menu = new ContextMenu(items);
    const el = document.createElement('div');
    document.body.appendChild(el);
    menu.onInit(el);

    const event = new MouseEvent('contextmenu', {
      clientX: 50,
      clientY: 50,
      bubbles: true,
    });
    el.dispatchEvent(event);
    document.body.removeChild(el);
  });

  it('should hide all menus on body click', () => {
    const items = [new ContextMenuItem({ type: 'item', title: 'Test', command: () => {} })];
    const menu = new ContextMenu(items);
    const el = document.createElement('div');
    document.body.appendChild(el);
    menu.onInit(el);
    menu.show(10, 10);

    document.body.click();
    document.body.removeChild(el);
  });

  it('should hide on Escape key', () => {
    const items = [new ContextMenuItem({ type: 'item', title: 'Test', command: () => {} })];
    const menu = new ContextMenu(items);
    const el = document.createElement('div');
    document.body.appendChild(el);
    menu.onInit(el);
    menu.show(10, 10);

    const escEvent = new KeyboardEvent('keyup', { key: 'Escape' });
    document.body.dispatchEvent(escEvent);
    document.body.removeChild(el);
  });

  it('should destroy menu and clean up', () => {
    const items = [new ContextMenuItem({ type: 'item', title: 'Test', command: () => {} })];
    const menu = new ContextMenu(items);
    const el = document.createElement('div');
    document.body.appendChild(el);
    menu.onInit(el);
    menu.onDestroy();
    document.body.removeChild(el);
  });

  it('should handle multiple instances', () => {
    const items1 = [new ContextMenuItem({ type: 'item', title: 'A' })];
    const items2 = [new ContextMenuItem({ type: 'item', title: 'B' })];
    const menu1 = new ContextMenu(items1);
    const menu2 = new ContextMenu(items2);
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    document.body.appendChild(el1);
    document.body.appendChild(el2);
    menu1.onInit(el1);
    menu2.onInit(el2);
    menu1.onDestroy();
    menu2.onDestroy();
    document.body.removeChild(el1);
    document.body.removeChild(el2);
  });

  it('should do nothing when show called without onInit', () => {
    const items = [new ContextMenuItem({ type: 'item', title: 'Test', command: () => {} })];
    const menu = new ContextMenu(items);
    // show without calling onInit — widget is null
    menu.show(10, 10);
    // Should not throw
  });

  it('should handle mouseenter and mouseleave on shown menu', () => {
    vi.useFakeTimers();
    const items = [new ContextMenuItem({ type: 'item', title: 'Test', command: () => {} })];
    const menu = new ContextMenu(items);
    const el = document.createElement('div');
    document.body.appendChild(el);
    menu.onInit(el);
    menu.show(10, 10);

    // Find the dropdown menu view
    const view = el.querySelector('.jcmolview-dropdown-menu') as HTMLElement;
    expect(view).not.toBeNull();

    // Trigger mouseleave to start hide timeout
    view.dispatchEvent(new MouseEvent('mouseleave'));
    // Trigger mouseenter to clear the timeout
    view.dispatchEvent(new MouseEvent('mouseenter'));

    // Trigger mouseleave again and let timeout fire
    view.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(400);

    menu.onDestroy();
    document.body.removeChild(el);
    vi.useRealTimers();
  });

  it('should hide when calling hide with no intervalID', () => {
    const items = [new ContextMenuItem({ type: 'item', title: 'Test', command: () => {} })];
    const menu = new ContextMenu(items);
    const el = document.createElement('div');
    document.body.appendChild(el);
    menu.onInit(el);
    // hide without show — no intervalID set
    menu.hide();
    menu.onDestroy();
    document.body.removeChild(el);
  });

  it('should handle contextmenu on body to hide menus', () => {
    const items = [new ContextMenuItem({ type: 'item', title: 'Test', command: () => {} })];
    const menu = new ContextMenu(items);
    const el = document.createElement('div');
    document.body.appendChild(el);
    menu.onInit(el);
    menu.show(10, 10);

    const event = new MouseEvent('contextmenu', { bubbles: true });
    document.body.dispatchEvent(event);

    menu.onDestroy();
    document.body.removeChild(el);
  });
});

describe('ContextMenuItem', () => {
  it('should create item type view', () => {
    const item = new ContextMenuItem({
      type: 'item',
      title: 'Click Me',
      command: vi.fn(),
    });
    const view = item.getView();
    expect(view.tagName).toBe('A');
    expect(view.textContent).toBe('Click Me');
    expect(view.className).toBe('jcmolview-dropdown-item');
  });

  it('should create divider type view', () => {
    const item = new ContextMenuItem({
      type: 'delimer',
      title: '----',
    });
    const view = item.getView();
    expect(view.tagName).toBe('DIV');
    expect(view.className).toBe('jcmolview-dropdown-divider');
  });

  it('should create checkbox type view', () => {
    const item = new ContextMenuItem({
      type: 'checkbox',
      title: 'Show Labels',
      isChecked: () => true,
      command: vi.fn(),
    });
    const view = item.getView();
    expect(view.tagName).toBe('DIV');
    const checkbox = view.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeDefined();
    expect(checkbox.checked).toBe(true);
  });

  it('should toggle checkbox state', () => {
    let checked = true;
    const item = new ContextMenuItem({
      type: 'checkbox',
      title: 'Toggle',
      isChecked: () => checked,
      command: () => {
        checked = !checked;
      },
    });
    const view = item.getView();
    view.click();
    const checkbox = view.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('should return same view on repeated calls', () => {
    const item = new ContextMenuItem({
      type: 'item',
      title: 'Test',
    });
    const view1 = item.getView();
    const view2 = item.getView();
    expect(view1).toBe(view2);
  });

  it('should handle fallback type', () => {
    const item = new ContextMenuItem({
      type: 'unknown',
      title: '',
    });
    const view = item.getView();
    expect(view.tagName).toBe('DIV');
  });

  it('should call command on item click', () => {
    const command = vi.fn();
    const item = new ContextMenuItem({
      type: 'item',
      title: 'Clickable',
      command,
    });
    const view = item.getView();
    view.click();
    expect(command).toHaveBeenCalled();
  });

  it('should handle destroy', () => {
    const item = new ContextMenuItem({
      type: 'item',
      title: 'Test',
    });
    item.getView();
    item.onDestroy();
  });

  it('should handle destroy without view', () => {
    const item = new ContextMenuItem({
      type: 'item',
      title: 'Test',
    });
    item.onDestroy(); // should not throw
  });
});
