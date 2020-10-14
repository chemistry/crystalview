import { Vec3 } from "@chemistry/math";
import { CellAtom } from "./CellAtom";
import { Molecule3D } from "./Molecule3D";

const CW_BOND_FROM = 0.4;
const CW_BOND_TO   = 1.2;

export class MoleculeConnector {

    private molecule: Molecule3D;

    constructor(molecule: Molecule3D) {
        this.molecule = molecule;
    }

    public buildConnectivity() {
        // no atoms ?
        if (this.molecule.cellAtoms.length === 0) {
            return;
        }

        // ORDER IS IMPORTANT
        // Calculate Cell Links
        this.calculateCellLinks();
    }

    private calculateCellLinks() {
        const cellAtoms = this.molecule.cellAtoms;
        const unitCell = this.molecule.unitCell;
        let maxRCow =  -Infinity;

        // get atom with bigest RcoW
        for (const atom of cellAtoms) {
              maxRCow = Math.max(atom.element.RCow, maxRCow);
        }

        // Maximal posible length
        const maxRCow2 = (maxRCow * 2 * CW_BOND_TO);
       // Detect min and Max vectors of the cell atoms
        let p1 = new Vec3(Infinity, Infinity, Infinity);
        let p2 = new Vec3(-Infinity, -Infinity, -Infinity);

        for (const atom of cellAtoms) {
          p1.x = Math.min(p1.x, atom.position.x);
          p1.y = Math.min(p1.y, atom.position.y);
          p1.z = Math.min(p1.z, atom.position.z);
          p2.x = Math.max(p2.x, atom.position.x);
          p2.y = Math.max(p2.y, atom.position.y);
          p2.z = Math.max(p2.z, atom.position.z);
      }

      // Double RVdW and fill by atoms
        const vRcow = new Vec3(2 * maxRCow, 2 * maxRCow, 2 * maxRCow);
        p1 = p1.sub(vRcow);
        p2 = p2.add(vRcow);

        const symetryList = unitCell.symetryList;
        const translations = unitCell.transactionsFromOrthBox(p1, p2);

      // Loop througt all cell atoms
        for (let i = 0; i < cellAtoms.length; i++) {
          const catom = cellAtoms[i];

          // Loop throught all Symetries
          for (const symetry of symetryList) {
              // fill unit cell
              const pre1 = symetry.project(catom.fractional);

              // The atom inside unit cell
              const pre2 = Vec3.getDecimal(pre1);

              // Translation from orign to get atom
              const transFromOrign = Vec3.sub(pre1, pre2);

              for (const tr of translations) {
                   const pre3 = Vec3.add(pre2, tr); // new fractional coordinates

                   // Orth position prediction
                   const pred = unitCell.fractToOrth(pre3);

                   const px = ((p1.x <= pred.x) && (p2.x >= pred.x));
                   const py = ((p1.y <= pred.y) && (p2.y >= pred.y));
                   const pz = ((p1.z <= pred.z) && (p2.z >= pred.z));

                   if (px && py && pz) {
                      const trans =  Vec3.sub(tr, transFromOrign);

                      for (let m = i + 1; m < cellAtoms.length; m++) {
                          const catom2 = cellAtoms[m];

                          if (!this.isSutableByAssembly(catom, catom2)) {
                              continue;
                          }

                          const disV = new Vec3(
                                  Math.abs(catom2.position.x - pred.x),
                                  Math.abs(catom2.position.y - pred.y),
                                  Math.abs(catom2.position.z - pred.z),
                          );
                          const covBond = (disV.x <= maxRCow2) && (disV.y <= maxRCow2) && (disV.z <= maxRCow2);
                          if (!covBond) {
                              continue;
                          }

                          if (this.isConnected(catom2, catom, pred)) {
                               const sym = symetry.translate(trans);
                               const symInverse = sym.inverse();

                               catom2.addLink(catom, sym);
                               catom.addLink(catom2, symInverse);
                           }
                      }
                  }
              }
          }
      }
    }

    private isSutableByAssembly(atom1: CellAtom, atom2: CellAtom) {
        if (atom1.assembly || atom2.assembly || atom1.group || atom2.group) {
            if (atom1.group && atom1.group !== "-1" && atom1.group !== "1") {
                return false;
            }
            if (atom2.group && atom2.group !== "-1" && atom2.group !== "1") {
                return false;
            }
            return true;
        }
        return true;
    }

    private isConnected(atom1: CellAtom, atom2: CellAtom, pred: Vec3): boolean {
        const disV = new Vec3(
            atom1.position.x - pred.x,
            atom1.position.y - pred.y,
            atom1.position.z - pred.z,
        );
        const l = disV.length;
        const r = atom1.element.RCow + atom2.element.RCow;
        const hasBond = (l <= r * CW_BOND_TO) && (l >= r * CW_BOND_FROM);
        return hasBond;
    }
}
