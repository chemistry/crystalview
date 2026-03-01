import { describe, it, expect } from 'vitest';
import { Molecule3D } from '../Molecule3D.js';
import { MoleculeReaderJCIF } from './MoleculeReaderJCIF.js';

describe('MoleculeReaderJCIF', () => {
  it('should have correct metadata', () => {
    const reader = new MoleculeReaderJCIF();
    expect(reader.name).toBe('jcif');
    expect(reader.extension).toEqual(['jcif']);
    expect(reader.description).toBe('jcif molecule format');
  });

  it('should load molecule from valid JCIF data', () => {
    const reader = new MoleculeReaderJCIF();
    const mol = new Molecule3D();
    const data = {
      a: 10.0,
      b: 10.0,
      c: 10.0,
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
            ['C', 'C1', '0.1', '0.2', '0.3', '1.0', '0.01'],
            ['N', 'N1', '0.4', '0.5', '0.6', '0.8', '0.02'],
          ],
        },
      ],
    };
    reader.loadMolecule(mol, data);
    expect(mol.cellAtoms.length).toBe(2);
    expect(mol.cellAtoms[0].label).toBe('C1');
    expect(mol.cellAtoms[0].element.symbol).toBe('C');
    expect(mol.cellAtoms[1].label).toBe('N1');
    expect(mol.cellAtoms[1].occupancy).toBeCloseTo(0.8);
  });

  it('should throw on missing space group', () => {
    const reader = new MoleculeReaderJCIF();
    const mol = new Molecule3D();
    const data = {
      a: 5,
      b: 5,
      c: 5,
      alpha: 90,
      beta: 90,
      gamma: 90,
      loops: [],
    };
    expect(() => reader.loadMolecule(mol, data)).toThrow('Space Group is not provided');
  });

  it('should throw on invalid cell params', () => {
    const reader = new MoleculeReaderJCIF();
    const mol = new Molecule3D();
    const data = {
      a: 'bad',
      b: 5,
      c: 5,
      alpha: 90,
      beta: 90,
      gamma: 90,
      sg: 'P 1',
      loops: [],
    };
    expect(() => reader.loadMolecule(mol, data)).toThrow('Wrong Unit Cell Params');
  });

  it('should throw on unknown space group', () => {
    const reader = new MoleculeReaderJCIF();
    const mol = new Molecule3D();
    const data = {
      a: 5,
      b: 5,
      c: 5,
      alpha: 90,
      beta: 90,
      gamma: 90,
      sg: 'INVALID_SG',
      loops: [],
    };
    expect(() => reader.loadMolecule(mol, data)).toThrow('Space Group not founnd');
  });

  it('should use Hall name when sgHall is provided', () => {
    const reader = new MoleculeReaderJCIF();
    const mol = new Molecule3D();
    const data = {
      a: 5,
      b: 5,
      c: 5,
      alpha: 90,
      beta: 90,
      gamma: 90,
      sgHall: 'P 1',
      loops: [],
    };
    reader.loadMolecule(mol, data);
    expect(mol.unitCell).toBeDefined();
  });

  it('should handle empty atom data', () => {
    const reader = new MoleculeReaderJCIF();
    const mol = new Molecule3D();
    const data = {
      a: 5,
      b: 5,
      c: 5,
      alpha: 90,
      beta: 90,
      gamma: 90,
      sg: 'P 1',
      loops: [],
    };
    reader.loadMolecule(mol, data);
    expect(mol.cellAtoms.length).toBe(0);
  });

  it('should handle missing optional columns with defaults', () => {
    const reader = new MoleculeReaderJCIF();
    const mol = new Molecule3D();
    const data = {
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
            '_atom_site_fract_x',
            '_atom_site_fract_y',
            '_atom_site_fract_z',
          ],
          data: [['C', '0.0', '0.0', '0.0']],
        },
      ],
    };
    reader.loadMolecule(mol, data);
    expect(mol.cellAtoms.length).toBe(1);
    expect(mol.cellAtoms[0].occupancy).toBe(1); // default
    expect(mol.cellAtoms[0].uiso).toBe(0); // default
  });
});
