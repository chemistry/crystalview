import { describe, it, expect } from 'vitest';
import { Vec3 } from '@chemistry/math';
import { Molecule3D } from './Molecule3D.js';

describe('Molecule3D', () => {
  it('should create empty molecule', () => {
    const mol = new Molecule3D();
    expect(mol.atoms).toEqual([]);
    expect(mol.bonds).toEqual([]);
    expect(mol.cellAtoms).toEqual([]);
    expect(mol.markers).toEqual([]);
    expect(mol.title).toBe('');
  });

  it('should clear molecule', () => {
    const mol = new Molecule3D();
    mol.title = 'test';
    mol.clear();
    expect(mol.title).toBe('');
    expect(mol.atoms).toEqual([]);
    expect(mol.bonds).toEqual([]);
  });

  describe('getCenter', () => {
    it('should return origin for empty molecule', () => {
      const mol = new Molecule3D();
      const center = mol.getCenter();
      expect(center.x).toBe(0);
      expect(center.y).toBe(0);
      expect(center.z).toBe(0);
    });
  });

  describe('getRadius', () => {
    it('should return 0 for empty molecule', () => {
      const mol = new Molecule3D();
      expect(mol.getRadius()).toBe(0);
    });
  });

  describe('load', () => {
    it('should load a simple JCIF structure', () => {
      const mol = new Molecule3D();
      const jcif = {
        a: 5.0,
        b: 5.0,
        c: 5.0,
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
              ['O', 'O1', '0.5', '0.5', '0.5', '1.0', '0.01'],
            ],
          },
        ],
      };
      mol.load(jcif);
      expect(mol.cellAtoms.length).toBe(2);
      expect(mol.atoms.length).toBe(2);
    });

    it('should throw on missing space group', () => {
      const mol = new Molecule3D();
      const jcif = {
        a: 5.0,
        b: 5.0,
        c: 5.0,
        alpha: 90,
        beta: 90,
        gamma: 90,
        loops: [],
      };
      expect(() => mol.load(jcif)).toThrow();
    });

    it('should throw on invalid unit cell params', () => {
      const mol = new Molecule3D();
      const jcif = {
        a: 'invalid',
        b: 5.0,
        c: 5.0,
        alpha: 90,
        beta: 90,
        gamma: 90,
        sg: 'P 1',
        loops: [],
      };
      expect(() => mol.load(jcif)).toThrow('Wrong Unit Cell Params');
    });
  });
});
