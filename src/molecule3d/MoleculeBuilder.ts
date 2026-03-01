import { Matrix3x4, Vec3 } from '@chemistry/math';
import { Atom } from './Atom.js';
import { Bond } from './Bond.js';
import { CellAtom } from './CellAtom.js';
import { Marker } from './Marker.js';
import { MarkerContact } from './MarkerContact.js';
import { Molecule3D } from './Molecule3D.js';
import { UnitCell } from './UnitCell.js';

export class MoleculeBuilder {
  private molecule: Molecule3D;

  constructor(molecule: Molecule3D) {
    this.molecule = molecule;
  }

  /**
   * Add Unique Atoms to Molecule
   */
  public addUniqueAtoms() {
    this.addAtomsBySymetry(['x,y,z']);
  }

  public addAtomsBySymetry(symetryList: string[]) {
    for (const catom of this.molecule.cellAtoms) {
      for (const symetryCode of symetryList) {
        const symetry = UnitCell.getMatrixFromSymetry(symetryCode);

        // Add atom with bonds
        this.addAtomWithBonds(catom, symetry);
      }
    }

    this.addMarkers();
  }

  public addAtomWithBonds(
    catom: CellAtom,
    symetry: Matrix3x4
  ): { atom: CellAtom; symetry: Matrix3x4 }[] {
    const markers: { atom: CellAtom; symetry: Matrix3x4 }[] = [];

    // build atoms connectivity
    this.molecule.buildConnectivity();

    // Predict inserted atom position
    const predictedPostion = symetry.project(catom.fractional);
    const zatom = catom.getChild(predictedPostion);

    let atom: Atom;
    // Atom with predicted position not found
    if (!zatom) {
      // Create Atom and Add it as Chield
      atom = catom.createAtom(symetry, true);
      this.molecule.addAtom(atom);
    } else {
      atom = zatom;
    }

    // let makers = [];
    // loop throught links
    const links = catom.getLinks();

    for (const link of links) {
      // connected atom
      const conAtom = link.atom;

      // connected atom predicted position
      const predicted = symetry.project(link.fractional);
      const xatom = conAtom.getChild(predicted);

      // Atom alredy exists ..
      if (xatom) {
        const bond = new Bond(atom, xatom, 1);
        this.molecule.bonds.push(bond);
      } else {
        markers.push({
          atom: conAtom,
          symetry,
        });
      }
    }

    return markers;
  }

  public extendByMarker(marker: Marker) {
    const markersList: { atom: CellAtom; symetry: Matrix3x4 }[] = [];

    markersList.push({
      atom: marker.cellAtom,
      symetry: marker.symetry,
    });

    const sym = marker.symetry;
    let j = 1000;

    while (markersList.length > 0 && j > 0) {
      j--;
      const currentMarker = markersList.shift();
      if (!currentMarker) {
        continue;
      }

      if (!currentMarker.symetry.equals(sym)) {
        continue;
      }

      {
        const markers = this.addAtomWithBonds(currentMarker.atom, currentMarker.symetry);
        markersList.push(...markers);
      }
    }

    this.addMarkers();
  }

  public addMarkers() {
    const cellAtoms = this.molecule.cellAtoms;
    const unitCell = this.molecule.unitCell;
    const markersPositions: Vec3[] = [];
    this.molecule.markers = [];
    this.molecule.markersContacts = [];

    const markers = this.molecule.markers;
    const markersContacts = this.molecule.markersContacts;

    const inList = (position: Vec3) => {
      for (const mposition of markersPositions) {
        if (mposition.equals(position)) {
          return true;
        }
      }
      return false;
    };

    // Loop througt all cell atoms
    for (const catom of cellAtoms) {
      for (const atom of catom.children) {
        const atomSymetry = atom.symetry;

        for (const link of catom.links) {
          const conAtom = link.atom;
          const symetry = link.symetry;

          const totalSymetry = atomSymetry.multiply(symetry);
          // var predicted1 = totalSymetry.multiple(conAtom.fractional);
          let predicted = symetry.project(conAtom.fractional);
          predicted = atomSymetry.project(predicted);
          const xatom = conAtom.getChild(predicted);

          if (!xatom) {
            const mPosition = unitCell.fractToOrth(predicted);
            if (!inList(mPosition)) {
              markersPositions.push(mPosition);
              markers.push(new Marker(mPosition, totalSymetry, conAtom));
              markersContacts.push(new MarkerContact(atom.position, mPosition));
            }
          }
        }
      }
    }
  }
}
