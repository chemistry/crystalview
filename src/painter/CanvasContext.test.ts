import { describe, it, expect, vi } from 'vitest';
import { CanvasContext } from './CanvasContext.js';

function createMockContext() {
  const canvas = { width: 800, height: 600 };
  return {
    canvas,
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    fillStyle: '',
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    strokeStyle: '',
    lineWidth: 0,
    stroke: vi.fn(),
    setLineDash: vi.fn(),
    font: '',
    fillText: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('CanvasContext', () => {
  it('should save and restore context', () => {
    const mock = createMockContext();
    const ctx = new CanvasContext(mock);
    ctx.save();
    ctx.restore();
    expect(mock.save).toHaveBeenCalled();
    expect(mock.restore).toHaveBeenCalled();
  });

  it('should center context', () => {
    const mock = createMockContext();
    const ctx = new CanvasContext(mock);
    ctx.center();
    expect(mock.translate).toHaveBeenCalledWith(400, 300);
  });

  it('should return center coordinates', () => {
    const mock = createMockContext();
    const ctx = new CanvasContext(mock);
    expect(ctx.getCenterX()).toBe(400);
    expect(ctx.getCenterY()).toBe(300);
  });

  it('should clear with background color', () => {
    const mock = createMockContext();
    const ctx = new CanvasContext(mock);
    ctx.clear('#000000');
    expect(mock.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  it('should draw circle', () => {
    const mock = createMockContext();
    const ctx = new CanvasContext(mock);
    ctx.circle(10, 20, 5, '#ff0000');
    expect(mock.beginPath).toHaveBeenCalled();
    expect(mock.arc).toHaveBeenCalledWith(10, 20, 5, 0, 2 * Math.PI, true);
    expect(mock.fill).toHaveBeenCalled();
  });

  it('should draw line', () => {
    const mock = createMockContext();
    const ctx = new CanvasContext(mock);
    ctx.line(0, 0, 100, 100, '#00ff00');
    expect(mock.moveTo).toHaveBeenCalledWith(0, 0);
    expect(mock.lineTo).toHaveBeenCalledWith(100, 100);
    expect(mock.stroke).toHaveBeenCalled();
  });

  it('should draw dashed line', () => {
    const mock = createMockContext();
    const ctx = new CanvasContext(mock);
    ctx.linedashed(0, 0, 50, 50, '#0000ff', [4, 7]);
    expect(mock.setLineDash).toHaveBeenCalledWith([4, 7]);
    expect(mock.moveTo).toHaveBeenCalledWith(0, 0);
    expect(mock.lineTo).toHaveBeenCalledWith(50, 50);
    expect(mock.stroke).toHaveBeenCalled();
  });

  it('should draw text', () => {
    const mock = createMockContext();
    const ctx = new CanvasContext(mock);
    ctx.text('hello', 10, 20, '#ffffff', '12px Arial');
    expect(mock.fillText).toHaveBeenCalledWith('hello', 10, 20);
  });
});
