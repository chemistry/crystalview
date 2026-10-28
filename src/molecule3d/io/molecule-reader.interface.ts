import { type Molecule3D } from '../molecule3d.js';

export interface IMoleculeReader {
  name: string;
  extension: string[];
  description: string;
  loadMolecule(molecule: Molecule3D, data: string | object): void;
}
