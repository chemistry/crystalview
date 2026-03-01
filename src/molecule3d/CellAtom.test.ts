import { describe, it, expect } from 'vitest';
import { Matrix3x4, Vec3 } from '@chemistry/math';
import { SpaceGroup } from '@chemistry/space-groups';
import { CellAtom } from './CellAtom.js';
import { UnitCell } from './UnitCell.js';

function createUnitCell() {
  const sg = SpaceGroup.getByHMName('P 1')!;
  return new UnitCell(10, 10, 10, 90, 90, 90, sg);
}

describe('CellAtom', () => {
  it('should create atom with correct properties', () => {
    const uc = createUnitCell();
    const atom = new CellAtom({
      id: 1,
      unitCell: uc,
      type: 'C',
      label: 'C1',
      x: 0.1,
      y: 0.2,
      z: 0.3,
      occupancy: 1.0,
      uiso: 0.01,
      assembly: '',
      group: '',
    });
    expect(atom.id).toBe(1);
    expect(atom.label).toBe('C1');
    expect(atom.element.symbol).toBe('C');
    expect(atom.fractional.x).toBeCloseTo(0.1);
    expect(atom.fractional.y).toBeCloseTo(0.2);
    expect(atom.fractional.z).toBeCloseTo(0.3);
    expect(atom.occupancy).toBe(1.0);
    expect(atom.children).toEqual([]);
    expect(atom.links).toEqual([]);
  });

  it('should throw for invalid element', () => {
    const uc = createUnitCell();
    expect(
      () =>
        new CellAtom({
          id: 1,
          unitCell: uc,
          type: 'InvalidElement',
          label: 'X1',
          x: 0,
          y: 0,
          z: 0,
          occupancy: 1,
          uiso: 0,
          assembly: '',
          group: '',
        })
    ).toThrow('Wrong Element Name or ID');
  });

  it('should compute orthogonal position from fractional', () => {
    const uc = createUnitCell();
    const atom = new CellAtom({
      id: 1,
      unitCell: uc,
      type: 'C',
      label: 'C1',
      x: 0.5,
      y: 0,
      z: 0,
      occupancy: 1,
      uiso: 0,
      assembly: '',
      group: '',
    });
    expect(atom.position.x).toBeCloseTo(5.0);
  });

  describe('children management', () => {
    it('should report hasChild false when empty', () => {
      const uc = createUnitCell();
      const atom = new CellAtom({
        id: 1,
        unitCell: uc,
        type: 'C',
        label: 'C1',
        x: 0,
        y: 0,
        z: 0,
        occupancy: 1,
        uiso: 0,
        assembly: '',
        group: '',
      });
      expect(atom.hasChild(new Vec3(0, 0, 0))).toBe(false);
    });

    it('should create atom and find it as child', () => {
      const uc = createUnitCell();
      const catom = new CellAtom({
        id: 1,
        unitCell: uc,
        type: 'C',
        label: 'C1',
        x: 0.1,
        y: 0.2,
        z: 0.3,
        occupancy: 1,
        uiso: 0,
        assembly: '',
        group: '',
      });
      const identity = UnitCell.getMatrixFromSymetry('x,y,z');
      const child = catom.createAtom(identity, true);
      expect(catom.children.length).toBe(1);
      expect(catom.hasChild(child.fractional)).toBe(true);
      expect(catom.getChild(child.fractional)).toBe(child);
    });

    it('should return null for missing child', () => {
      const uc = createUnitCell();
      const catom = new CellAtom({
        id: 1,
        unitCell: uc,
        type: 'C',
        label: 'C1',
        x: 0.1,
        y: 0.2,
        z: 0.3,
        occupancy: 1,
        uiso: 0,
        assembly: '',
        group: '',
      });
      expect(catom.getChild(new Vec3(9, 9, 9))).toBeNull();
    });
  });

  describe('links', () => {
    it('should add and retrieve links', () => {
      const uc = createUnitCell();
      const atom1 = new CellAtom({
        id: 1,
        unitCell: uc,
        type: 'C',
        label: 'C1',
        x: 0,
        y: 0,
        z: 0,
        occupancy: 1,
        uiso: 0,
        assembly: '',
        group: '',
      });
      const atom2 = new CellAtom({
        id: 2,
        unitCell: uc,
        type: 'O',
        label: 'O1',
        x: 0.1,
        y: 0.1,
        z: 0.1,
        occupancy: 1,
        uiso: 0,
        assembly: '',
        group: '',
      });
      const identity = UnitCell.getMatrixFromSymetry('x,y,z');
      atom1.addLink(atom2, identity);
      expect(atom1.getLinks().length).toBe(1);
      expect(atom1.getLinks()[0].atom).toBe(atom2);
    });
  });
});
