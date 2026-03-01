import { SpaceGroup } from '@chemistry/space-groups';
import { Molecule3D } from '../Molecule3D.js';
import { UnitCell } from '../UnitCell.js';
import { IMoleculeReader } from './IMoleculeReader.js';

interface JcifData {
  a: string;
  b: string;
  c: string;
  alpha: string;
  beta: string;
  gamma: string;
  sg?: string;
  sgHall?: string;
  loops?: JcifLoop[];
}

interface JcifLoop {
  columns: string[];
  data: string[][];
}

interface AtomRow {
  type: string;
  label: string;
  x: number;
  y: number;
  z: number;
  occupancy: number;
  uiso: number;
  assembly: string;
  group: string;
}

export class MoleculeReaderJCIF implements IMoleculeReader {
  public name: string;
  public extension: string[];
  public description: string;

  constructor() {
    this.name = 'jcif';
    this.extension = ['jcif'];
    this.description = 'jcif molecule format';
  }

  public loadMolecule(molecule: Molecule3D, data: object) {
    molecule.clear();

    const jcif = data as JcifData;

    const a = parseFloat(jcif.a);
    const b = parseFloat(jcif.b);
    const c = parseFloat(jcif.c);
    const alpha = parseFloat(jcif.alpha);
    const beta = parseFloat(jcif.beta);
    const gamma = parseFloat(jcif.gamma);

    if (
      !isFinite(a) ||
      !isFinite(b) ||
      !isFinite(c) ||
      !isFinite(alpha) ||
      !isFinite(beta) ||
      !isFinite(gamma)
    ) {
      throw new Error('Wrong Unit Cell Params');
    }

    if (!jcif.sgHall && !jcif.sg) {
      throw new Error('Space Group is not provided');
    }

    let spaceGroup = null;
    if (jcif.sgHall) {
      spaceGroup = SpaceGroup.getByHallName(jcif.sgHall);
    }
    if (!spaceGroup && jcif.sg) {
      spaceGroup = SpaceGroup.getByHMName(jcif.sg);
    }

    if (!spaceGroup) {
      throw new Error('Space Group not founnd');
    }

    // Create Unit Cell object
    const unitCell = new UnitCell(a, b, c, alpha, beta, gamma, spaceGroup);
    molecule.unitCell = unitCell;

    const coordLoop = this.extractCoordLoop(jcif);

    let atomRows: AtomRow[] = [];
    if (coordLoop.length > 0) {
      atomRows = this.remapCoordLoop(coordLoop[0]);
    }
    atomRows.forEach((atomData) => {
      molecule.addCellAtom(atomData);
    });
  }

  private remapCoordLoop(data: JcifLoop): AtomRow[] {
    const colsMap: Record<string, number> = {
      _atom_site_U_iso_or_equiv: -1,
      _atom_site_disorder_assembly: -1,
      _atom_site_disorder_group: -1,
      _atom_site_fract_x: -1,
      _atom_site_fract_y: -1,
      _atom_site_fract_z: -1,
      _atom_site_label: -1,
      _atom_site_occupancy: -1,
      _atom_site_type_symbol: -1,
    };

    // Set position
    Object.keys(colsMap).forEach((key) => {
      colsMap[key] = data.columns.indexOf(key);
    });

    function getData(code: string, row: string[]): string | undefined {
      if (typeof colsMap[code] === 'number' && colsMap[code] !== -1) {
        return row[colsMap[code]];
      }
      return undefined;
    }

    function getDataNum(code: string, row: string[], defaultValue: number): number {
      const valueStr = getData(code, row);
      if (valueStr === undefined) {
        return defaultValue;
      }
      const value = parseFloat(valueStr);

      if (!isFinite(value)) {
        return defaultValue;
      }
      return value;
    }

    let atomRows: AtomRow[] = [];
    if (Array.isArray(data.data)) {
      atomRows = data.data.map((row: string[]) => {
        const type = getData('_atom_site_type_symbol', row) ?? 'Q';

        return {
          assembly: getData('_atom_site_disorder_assembly', row) ?? '',
          group: getData('_atom_site_disorder_group', row) ?? '',
          label: getData('_atom_site_label', row) ?? type,
          occupancy: getDataNum('_atom_site_occupancy', row, 1),
          type,
          uiso: getDataNum('_atom_site_U_iso_or_equiv', row, 0),
          x: getDataNum('_atom_site_fract_x', row, 0),
          y: getDataNum('_atom_site_fract_y', row, 0),
          z: getDataNum('_atom_site_fract_z', row, 0),
        };
      });
    }

    return atomRows;
  }

  private extractCoordLoop(data: JcifData): JcifLoop[] {
    if (Array.isArray(data.loops)) {
      return data.loops.filter((loopItem) => {
        return loopItem.columns.includes('_atom_site_fract_x');
      });
    }
    return [];
  }
}
