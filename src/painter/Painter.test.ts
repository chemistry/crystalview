import { describe, it, expect, vi } from 'vitest';
import { Vec3 } from '@chemistry/math';
import { Molecule3D } from '../molecule3d/Molecule3D.js';
import { Painter } from './Painter.js';
import { Camera } from '../camera/Camera.js';

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

function createCamera() {
  const el = {
    clientWidth: 800,
    clientHeight: 600,
    addEventListener: () => {},
    removeEventListener: () => {},
  } as unknown as HTMLElement;

  return new Camera({
    element: el,
    onRedraw: () => {},
    onClick: () => {},
  });
}

describe('Painter', () => {
  it('should draw empty molecule without error', () => {
    const ctx = createMockContext();
    const painter = new Painter(ctx, {
      bgcolor: '#000',
      showLabels: false,
      showMarkers: false,
      showUnitCell: false,
    });
    const mol = new Molecule3D();
    const camera = createCamera();
    painter.draw(mol, camera);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('should draw loaded molecule', () => {
    const ctx = createMockContext();
    const painter = new Painter(ctx, {
      bgcolor: '#000',
      showLabels: true,
      showMarkers: true,
      showUnitCell: true,
    });
    const mol = new Molecule3D();
    mol.load({
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
          ],
        },
      ],
    });
    const camera = createCamera();
    painter.draw(mol, camera);
    expect(ctx.beginPath).toHaveBeenCalled();
  });

  it('should return null for uprojectToMarker with no markers', () => {
    const ctx = createMockContext();
    const painter = new Painter(ctx, {
      bgcolor: '#000',
      showLabels: false,
      showMarkers: true,
      showUnitCell: false,
    });
    const mol = new Molecule3D();
    const camera = createCamera();
    const result = painter.uprojectToMarker({
      molecule: mol,
      camera,
      x: 100,
      y: 100,
    });
    expect(result).toBeNull();
  });

  it('should draw with showMarkers=false and showUnitCell=false and showLabels=false', () => {
    const ctx = createMockContext();
    const painter = new Painter(ctx, {
      bgcolor: '#000',
      showLabels: false,
      showMarkers: false,
      showUnitCell: false,
    });
    const mol = new Molecule3D();
    mol.load({
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
          data: [['C', 'C1', '0.0', '0.0', '0.0', '1.0', '0.01']],
        },
      ],
    });
    const camera = createCamera();
    painter.draw(mol, camera);
    // Should draw atoms and bonds but not markers/labels/unitcell
    expect(ctx.save).toHaveBeenCalled();
  });

  it('should draw with showLabels=true on atoms with labels', () => {
    const ctx = createMockContext();
    const painter = new Painter(ctx, {
      bgcolor: '#000',
      showLabels: true,
      showMarkers: false,
      showUnitCell: false,
    });
    const mol = new Molecule3D();
    mol.load({
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
          data: [['C', 'C1', '0.0', '0.0', '0.0', '1.0', '0.01']],
        },
      ],
    });
    const camera = createCamera();
    painter.draw(mol, camera);
    expect(ctx.fillText).toHaveBeenCalled();
  });

  it('should draw with showUnitCell=true on molecule with unit cell', () => {
    const ctx = createMockContext();
    const painter = new Painter(ctx, {
      bgcolor: '#000',
      showLabels: false,
      showMarkers: false,
      showUnitCell: true,
    });
    const mol = new Molecule3D();
    mol.load({
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
          data: [['C', 'C1', '0.0', '0.0', '0.0', '1.0', '0.01']],
        },
      ],
    });
    const camera = createCamera();
    painter.draw(mol, camera);
    // Should draw unit cell lines
    expect(ctx.moveTo).toHaveBeenCalled();
  });

  it('should skip prepareUnitCell when unitCell is null', () => {
    const ctx = createMockContext();
    const painter = new Painter(ctx, {
      bgcolor: '#000',
      showLabels: false,
      showMarkers: false,
      showUnitCell: true,
    });
    const mol = new Molecule3D();
    // Don't load anything — unitCell is undefined
    const camera = createCamera();
    painter.draw(mol, camera);
    expect(ctx.save).toHaveBeenCalled();
  });
});
