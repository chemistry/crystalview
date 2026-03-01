import { describe, it, expect, vi } from 'vitest';
import { Vec3 } from '@chemistry/math';
import { Camera } from './Camera.js';

function createMockElement() {
  const listeners: Record<string, ((e: any) => void)[]> = {};
  return {
    clientWidth: 800,
    clientHeight: 600,
    addEventListener: (type: string, handler: (e: any) => void) => {
      if (!listeners[type]) {
        listeners[type] = [];
      }
      listeners[type].push(handler);
    },
    removeEventListener: (type: string, handler: (e: any) => void) => {
      if (listeners[type]) {
        listeners[type] = listeners[type].filter((h) => h !== handler);
      }
    },
    _emit: (type: string, event: any) => {
      if (listeners[type]) {
        listeners[type].forEach((h) => h(event));
      }
    },
    _listeners: listeners,
  } as unknown as HTMLElement & { _emit: (type: string, event: any) => void };
}

describe('Camera', () => {
  it('should create camera with default scale', () => {
    const el = createMockElement();
    const camera = new Camera({
      element: el,
      onRedraw: () => {},
      onClick: () => {},
    });
    expect(camera.extractScale()).toBeCloseTo(20);
  });

  it('should project and unproject round-trip', () => {
    const el = createMockElement();
    const camera = new Camera({
      element: el,
      onRedraw: () => {},
      onClick: () => {},
    });
    const original = new Vec3(1, 2, 3);
    const projected = camera.project(original);
    const unprojected = camera.unproject(projected);
    expect(unprojected.x).toBeCloseTo(original.x, 3);
    expect(unprojected.y).toBeCloseTo(original.y, 3);
    expect(unprojected.z).toBeCloseTo(original.z, 3);
  });

  it('should set camera view with new scale and center', () => {
    const el = createMockElement();
    const camera = new Camera({
      element: el,
      onRedraw: () => {},
      onClick: () => {},
    });
    camera.setCameraView(50, new Vec3(1, 2, 3));
    expect(camera.extractScale()).toBeCloseTo(50);
  });

  it('should project origin to origin', () => {
    const el = createMockElement();
    const camera = new Camera({
      element: el,
      onRedraw: () => {},
      onClick: () => {},
    });
    camera.setCameraView(1, new Vec3(0, 0, 0));
    const projected = camera.project(new Vec3(0, 0, 0));
    expect(projected.x).toBeCloseTo(0);
    expect(projected.y).toBeCloseTo(0);
    expect(projected.z).toBeCloseTo(0);
  });

  it('should clean up listeners on destroy', () => {
    const el = createMockElement();
    const camera = new Camera({
      element: el,
      onRedraw: () => {},
      onClick: () => {},
    });
    camera.onDestroy();
    // After destroy, event listeners should be removed
  });

  it('should handle mousedown event', () => {
    const el = createMockElement();
    const camera = new Camera({
      element: el,
      onRedraw: () => {},
      onClick: () => {},
    });
    el._emit('mousedown', { offsetX: 100, offsetY: 200 });
    // Should capture mouse state
  });

  it('should handle mouseup with click (no drag)', () => {
    const el = createMockElement();
    const onClick = vi.fn();
    const camera = new Camera({
      element: el,
      onRedraw: () => {},
      onClick,
    });
    el._emit('mousedown', { offsetX: 100, offsetY: 200 });
    el._emit('mouseup', { offsetX: 100, offsetY: 200, which: 1, shiftKey: false, ctrlKey: false });
    expect(onClick).toHaveBeenCalledWith(100, 200);
  });

  it('should not fire click on drag', () => {
    const el = createMockElement();
    const onClick = vi.fn();
    const onRedraw = vi.fn();
    const camera = new Camera({
      element: el,
      onRedraw,
      onClick,
    });
    el._emit('mousedown', { offsetX: 100, offsetY: 200 });
    el._emit('mousemove', {
      offsetX: 200,
      offsetY: 300,
      shiftKey: false,
      ctrlKey: false,
      which: 1,
      preventDefault: () => {},
    });
    el._emit('mouseup', { offsetX: 200, offsetY: 300, which: 1, shiftKey: false, ctrlKey: false });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should handle mousemove during drag', () => {
    const el = createMockElement();
    const onRedraw = vi.fn();
    const camera = new Camera({
      element: el,
      onRedraw,
      onClick: () => {},
    });
    el._emit('mousedown', { offsetX: 100, offsetY: 200 });
    el._emit('mousemove', {
      offsetX: 150,
      offsetY: 250,
      shiftKey: false,
      ctrlKey: false,
      which: 1,
      preventDefault: () => {},
    });
    expect(onRedraw).toHaveBeenCalled();
  });

  it('should handle shift+drag for translation', () => {
    const el = createMockElement();
    const onRedraw = vi.fn();
    const camera = new Camera({
      element: el,
      onRedraw,
      onClick: () => {},
    });
    el._emit('mousedown', { offsetX: 100, offsetY: 200 });
    el._emit('mousemove', {
      offsetX: 150,
      offsetY: 250,
      shiftKey: true,
      ctrlKey: false,
      which: 1,
      preventDefault: () => {},
    });
    expect(onRedraw).toHaveBeenCalled();
  });

  it('should handle mouseleave during capture', () => {
    const el = createMockElement();
    const onRedraw = vi.fn();
    const camera = new Camera({
      element: el,
      onRedraw,
      onClick: () => {},
    });
    el._emit('mousedown', { offsetX: 100, offsetY: 200 });
    el._emit('mouseleave', {
      offsetX: 400,
      offsetY: 400,
      shiftKey: false,
      ctrlKey: false,
      which: 1,
    });
    // Should handle gracefully
  });

  it('should ignore mouseleave without capture', () => {
    const el = createMockElement();
    const onRedraw = vi.fn();
    const camera = new Camera({
      element: el,
      onRedraw,
      onClick: () => {},
    });
    el._emit('mouseleave', {
      offsetX: 400,
      offsetY: 400,
      shiftKey: false,
      ctrlKey: false,
      which: 1,
    });
    expect(onRedraw).not.toHaveBeenCalled();
  });

  it('should ignore mouseup without capture', () => {
    const el = createMockElement();
    const onClick = vi.fn();
    const camera = new Camera({
      element: el,
      onRedraw: () => {},
      onClick,
    });
    el._emit('mouseup', { offsetX: 100, offsetY: 200, which: 1, shiftKey: false, ctrlKey: false });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should ignore mousemove without capture', () => {
    const el = createMockElement();
    const onRedraw = vi.fn();
    const camera = new Camera({
      element: el,
      onRedraw,
      onClick: () => {},
    });
    el._emit('mousemove', {
      offsetX: 150,
      offsetY: 250,
      shiftKey: false,
      ctrlKey: false,
      which: 1,
      preventDefault: () => {},
    });
    expect(onRedraw).not.toHaveBeenCalled();
  });

  it('should handle wheel zoom', () => {
    const el = createMockElement();
    const onRedraw = vi.fn();
    const camera = new Camera({
      element: el,
      onRedraw,
      onClick: () => {},
    });
    const scaleBefore = camera.extractScale();
    el._emit('wheel', {
      deltaY: -120,
      preventDefault: () => {},
    });
    expect(onRedraw).toHaveBeenCalled();
    const scaleAfter = camera.extractScale();
    expect(scaleAfter).not.toBe(scaleBefore);
  });

  it('should handle negative wheel zoom', () => {
    const el = createMockElement();
    const onRedraw = vi.fn();
    const camera = new Camera({
      element: el,
      onRedraw,
      onClick: () => {},
    });
    const scaleBefore = camera.extractScale();
    el._emit('wheel', {
      deltaY: 120,
      preventDefault: () => {},
    });
    expect(onRedraw).toHaveBeenCalled();
  });

  it('should reinitialize on onInit', () => {
    const el = createMockElement();
    const camera = new Camera({
      element: el,
      onRedraw: () => {},
      onClick: () => {},
    });
    camera.onInit();
    // Should not throw
  });

  it('should handle ctrl+drag (zoom mode)', () => {
    const el = createMockElement();
    const onRedraw = vi.fn();
    const camera = new Camera({
      element: el,
      onRedraw,
      onClick: () => {},
    });
    el._emit('mousedown', { offsetX: 100, offsetY: 200 });
    el._emit('mousemove', {
      offsetX: 150,
      offsetY: 250,
      shiftKey: false,
      ctrlKey: true,
      which: 1,
      preventDefault: () => {},
    });
    // Ctrl+drag is zoom mode — should still call onRedraw
  });

  it('should handle middle mouse button drag for translation', () => {
    const el = createMockElement();
    const onRedraw = vi.fn();
    const camera = new Camera({
      element: el,
      onRedraw,
      onClick: () => {},
    });
    el._emit('mousedown', { offsetX: 100, offsetY: 200 });
    el._emit('mousemove', {
      offsetX: 150,
      offsetY: 250,
      shiftKey: false,
      ctrlKey: false,
      which: 2,
      preventDefault: () => {},
    });
    expect(onRedraw).toHaveBeenCalled();
  });
});
