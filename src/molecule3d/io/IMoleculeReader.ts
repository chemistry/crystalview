import { Molecule3D } from '../Molecule3D.js';

export interface IMoleculeReader {
  name: string;
  extension: string[];
  description: string;
  loadMolecule(molecule: Molecule3D, data: string | object): void;
}
