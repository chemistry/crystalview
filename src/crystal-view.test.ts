import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Mol3DView } from './crystal-view.js';

describe('Mol3DView', () => {
  it('should be defined', () => {
    expect(Mol3DView).toBeDefined();
  });

  it('should create with default options', () => {
    const view = new Mol3DView({});
    expect(view).toBeDefined();
  });

  it('should create with custom bgcolor', () => {
    const view = new Mol3DView({ bgcolor: '#ffffff' });
    expect(view).toBeDefined();
  });

  describe('append', () => {
    it('should append view to element', () => {
      const view = new Mol3DView({});
      const container = document.createElement('div');
      view.append(container);
      expect(container.querySelector('.jcmolview')).not.toBeNull();
      expect(container.querySelector('canvas')).not.toBeNull();
    });

    it('should throw when append called twice', () => {
      const view = new Mol3DView({});
      const container = document.createElement('div');
      view.append(container);
      expect(() => view.append(container)).toThrow('append or init were alredy done');
    });

    it('should set background color on the view element', () => {
      const view = new Mol3DView({ bgcolor: '#ff0000' });
      const container = document.createElement('div');
      view.append(container);
      const viewEl = container.querySelector('.jcmolview') as HTMLDivElement;
      expect(viewEl.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });
  });

  describe('onInit', () => {
    it('should throw if append not called first', () => {
      const view = new Mol3DView({});
      expect(() => view.onInit()).toThrow('append has to be called first');
    });

    it('should initialize successfully', () => {
      const view = new Mol3DView({});
      const container = document.createElement('div');
      view.append(container);
      view.onInit();
      // should not throw
    });

    it('should throw if called twice', () => {
      const view = new Mol3DView({});
      const container = document.createElement('div');
      view.append(container);
      view.onInit();
      expect(() => view.onInit()).toThrow('Init has to be called once');
    });
  });

  describe('load', () => {
    it('should load a JCIF structure', () => {
      const view = new Mol3DView({});
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 800 });
      Object.defineProperty(container, 'clientHeight', { value: 600 });
      view.append(container);
      view.onInit();

      const jcif = {
        a: 5,
        b: 5,
        c: 5,
        alpha: 90,
        beta: 90,
        gamma: 90,
        sg: 'P 1',
        loops: [
          {
            columns: [
              '_atom_site_type_symbol',
              '_atom_site_label',
              '_atom_site_fract_x',
              '_atom_site_fract_y',
              '_atom_site_fract_z',
              '_atom_site_occupancy',
              '_atom_site_U_iso_or_equiv',
            ],
            data: [
              ['C', 'C1', '0.0', '0.0', '0.0', '1.0', '0.01'],
              ['O', 'O1', '0.3', '0.0', '0.0', '1.0', '0.01'],
              ['N', 'N1', '0.5', '0.5', '0.5', '1.0', '0.01'],
            ],
          },
        ],
      };
      view.load(jcif);
      // Should not throw
    });
  });

  describe('onDestroy', () => {
    it('should clean up subscriptions', () => {
      const view = new Mol3DView({});
      const container = document.createElement('div');
      view.append(container);
      view.onInit();
      view.onDestroy();
      // Should not throw
    });
  });

  describe('center', () => {
    it('should center molecule', () => {
      const view = new Mol3DView({});
      const container = document.createElement('div');
      view.append(container);
      view.onInit();
      view.center(); // should not throw even with no molecule loaded
    });
  });
});
