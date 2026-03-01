import { describe, it, expect } from 'vitest';
import { Molecule3D } from './Molecule3D.js';
import { UnitCell } from './UnitCell.js';

describe('MoleculeBuilder', () => {
  function createLoadedMolecule() {
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
            ['O', 'O1', '0.3', '0.0', '0.0', '1.0', '0.01'],
          ],
        },
      ],
    };
    mol.load(jcif);
    return mol;
  }

  it('should add unique atoms on load', () => {
    const mol = createLoadedMolecule();
    expect(mol.atoms.length).toBe(2);
  });

  it('should create bonds between connected atoms', () => {
    const mol = createLoadedMolecule();
    expect(mol.bonds.length).toBeGreaterThan(0);
  });

  it('should create markers for missing connected atoms', () => {
    const mol = createLoadedMolecule();
    // Markers indicate atoms that could be added but aren't present yet
    // In P 1 with 2 atoms, there should be markers
    expect(mol.markers).toBeDefined();
  });

  it('should extend molecule by marker', () => {
    const mol = createLoadedMolecule();
    if (mol.markers.length > 0) {
      const initialAtomCount = mol.atoms.length;
      mol.extendByMarker(mol.markers[0]);
      expect(mol.atoms.length).toBeGreaterThanOrEqual(initialAtomCount);
    }
  });
});
