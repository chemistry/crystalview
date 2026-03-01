import { describe, it, expect } from 'vitest';
import { Molecule3D } from './Molecule3D.js';

describe('MoleculeConnector', () => {
  it('should build connectivity for a loaded molecule', () => {
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
            ['C', 'C2', '0.3', '0.0', '0.0', '1.0', '0.01'],
          ],
        },
      ],
    };
    mol.load(jcif);
    // After load, connectivity should be built
    expect(mol.cellAtoms.length).toBe(2);
    // Check that links were established
    const hasLinks = mol.cellAtoms.some((ca) => ca.getLinks().length > 0);
    expect(hasLinks).toBe(true);
  });

  it('should handle molecule with no atoms', () => {
    const mol = new Molecule3D();
    const jcif = {
      a: 5.0,
      b: 5.0,
      c: 5.0,
      alpha: 90,
      beta: 90,
      gamma: 90,
      sg: 'P 1',
      loops: [],
    };
    mol.load(jcif);
    expect(mol.cellAtoms.length).toBe(0);
    expect(mol.bonds.length).toBe(0);
  });
});
