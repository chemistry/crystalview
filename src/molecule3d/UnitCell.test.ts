import { describe, it, expect } from 'vitest';
import { Matrix3x4, Vec3 } from '@chemistry/math';
import { SpaceGroup } from '@chemistry/space-groups';
import { UnitCell } from './UnitCell.js';

describe('UnitCell', () => {
  describe('getMatrixFromSymetry', () => {
    it('should parse identity symmetry x,y,z', () => {
      const matrix = UnitCell.getMatrixFromSymetry('x,y,z');
      const result = matrix.project(new Vec3(0.5, 0.3, 0.7));
      expect(result.x).toBeCloseTo(0.5);
      expect(result.y).toBeCloseTo(0.3);
      expect(result.z).toBeCloseTo(0.7);
    });

    it('should parse negation symmetry -x,-y,-z', () => {
      const matrix = UnitCell.getMatrixFromSymetry('-x,-y,-z');
      const result = matrix.project(new Vec3(0.5, 0.3, 0.7));
      expect(result.x).toBeCloseTo(-0.5);
      expect(result.y).toBeCloseTo(-0.3);
      expect(result.z).toBeCloseTo(-0.7);
    });

    it('should parse symmetry with translations -x+1/2,-y,z+1/2', () => {
      const matrix = UnitCell.getMatrixFromSymetry('-x+1/2,-y,z+1/2');
      const result = matrix.project(new Vec3(0.1, 0.2, 0.3));
      expect(result.x).toBeCloseTo(0.4); // -0.1 + 0.5
      expect(result.y).toBeCloseTo(-0.2);
      expect(result.z).toBeCloseTo(0.8); // 0.3 + 0.5
    });

    it('should parse symmetry with spaces', () => {
      const matrix = UnitCell.getMatrixFromSymetry(' x , y , z ');
      const result = matrix.project(new Vec3(1, 2, 3));
      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(2);
      expect(result.z).toBeCloseTo(3);
    });

    it('should parse permuted axes y,x,z', () => {
      const matrix = UnitCell.getMatrixFromSymetry('y,x,z');
      const result = matrix.project(new Vec3(0.2, 0.8, 0.5));
      expect(result.x).toBeCloseTo(0.8);
      expect(result.y).toBeCloseTo(0.2);
      expect(result.z).toBeCloseTo(0.5);
    });

    it('should throw on invalid symmetry code', () => {
      expect(() => UnitCell.getMatrixFromSymetry('invalid')).toThrow('can not parse symetry code');
    });

    it('should throw on too few components', () => {
      expect(() => UnitCell.getMatrixFromSymetry('x,y')).toThrow('can not parse symetry code');
    });
  });

  describe('constructor', () => {
    it('should create a cubic unit cell', () => {
      const sg = SpaceGroup.getByHMName('P 1')!;
      const uc = new UnitCell(10, 10, 10, 90, 90, 90, sg);
      expect(uc.a).toBe(10);
      expect(uc.b).toBe(10);
      expect(uc.c).toBe(10);
      expect(uc.alpha).toBe(90);
      expect(uc.beta).toBe(90);
      expect(uc.gamma).toBe(90);
    });

    it('should populate symmetry list from space group', () => {
      const sg = SpaceGroup.getByHMName('P 1')!;
      const uc = new UnitCell(5, 5, 5, 90, 90, 90, sg);
      expect(uc.symetryList.length).toBeGreaterThan(0);
    });
  });

  describe('fractToOrth / orthToFract', () => {
    it('should round-trip for cubic cell', () => {
      const sg = SpaceGroup.getByHMName('P 1')!;
      const uc = new UnitCell(10, 10, 10, 90, 90, 90, sg);
      const fract = new Vec3(0.5, 0.3, 0.7);
      const orth = uc.fractToOrth(fract);
      const back = uc.orthToFract(orth);
      expect(back.x).toBeCloseTo(fract.x, 5);
      expect(back.y).toBeCloseTo(fract.y, 5);
      expect(back.z).toBeCloseTo(fract.z, 5);
    });

    it('should convert fractional to orthogonal correctly for cubic cell', () => {
      const sg = SpaceGroup.getByHMName('P 1')!;
      const uc = new UnitCell(10, 10, 10, 90, 90, 90, sg);
      const fract = new Vec3(1, 0, 0);
      const orth = uc.fractToOrth(fract);
      expect(orth.x).toBeCloseTo(10, 5);
      expect(orth.y).toBeCloseTo(0, 5);
      expect(orth.z).toBeCloseTo(0, 5);
    });

    it('should handle non-cubic cell', () => {
      const sg = SpaceGroup.getByHMName('P 1')!;
      const uc = new UnitCell(5, 6, 7, 90, 90, 90, sg);
      const fract = new Vec3(1, 1, 1);
      const orth = uc.fractToOrth(fract);
      expect(orth.x).toBeCloseTo(5, 1);
      expect(orth.y).toBeCloseTo(6, 1);
    });
  });

  describe('transactionsFromOrthBox', () => {
    it('should return translation vectors for a box', () => {
      const sg = SpaceGroup.getByHMName('P 1')!;
      const uc = new UnitCell(10, 10, 10, 90, 90, 90, sg);
      const p1 = new Vec3(-5, -5, -5);
      const p2 = new Vec3(15, 15, 15);
      const translations = uc.transactionsFromOrthBox(p1, p2);
      expect(translations.length).toBeGreaterThan(0);
      expect(translations[0]).toBeInstanceOf(Vec3);
    });
  });
});
