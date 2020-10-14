import { Matrix3x4, Vec3 } from "@chemistry/math";
import { Atom } from "./Atom";
import { Bond } from "./Bond";
import { CellAtom } from "./CellAtom";
import { Marker } from "./Marker";
import { MarkerContact } from "./MarkerContact";
import { Molecule3D } from "./Molecule3D";
import { UnitCell } from "./UnitCell";

export class MoleculeBuilder {

    private molecule: Molecule3D;

    constructor(molecule: Molecule3D) {
        this.molecule = molecule;
    }

    /**
     * Add Unique Atoms to Molecule
     */
    public addUniqueAtoms() {
        this.addAtomsBySymetry(["x,y,z"]);
    }

    public addAtomsBySymetry(symetryList: string[]) {
        const unitCell = this.molecule.unitCell;
        for (const catom of this.molecule.cellAtoms) {
            for (const symetryCode of symetryList) {
                const symetry = UnitCell.getMatrixFromSymetry(symetryCode);

                // Add atom with bonds
                this.addAtomWithBonds(catom, symetry);
            }
        }

        this.addMarkers();
    }

    public addAtomWithBonds(catom: CellAtom, symetry: Matrix3x4): Array<{atom: CellAtom, symetry: Matrix3x4}> {
        const unitCell = this.molecule.unitCell;
        const markers: Array<{atom: CellAtom, symetry: Matrix3x4}> = [];

        // build atoms connectivity
        this.molecule.buildConnectivity();

        // Predict inserted atom position
        const predictedPostion = symetry.project(catom.fractional);
        const zatom = catom.getChild(predictedPostion);

        let atom = zatom;
        // Atom with predicted position not found
        if (!zatom) {
            // Create Atom and Add it as Chield
            atom = catom.createAtom(symetry, true);
            this.molecule.addAtom(atom);
        }

        // let makers = [];
        // loop throught links
        const links = catom.getLinks();

        for (const link of links) {
            // connected atom
            const conAtom = link.atom;

            // connected atom predicted position
            const predicted = symetry.project(link.fractional);
            const fractPosition = unitCell.fractToOrth(predicted);
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
        const markersList: Array<{atom: CellAtom, symetry: Matrix3x4 }> = [];

        markersList.push({
            atom: marker.cellAtom,
            symetry: marker.symetry,
        });

        const sym = marker.symetry;
        let j = 1000;

        while (markersList.length > 0 && j > 0) {
            j--;
            const currentMarker = markersList.shift();

            if (!currentMarker.symetry.equal(sym)) {
               continue;
            }

            if (currentMarker) {
                const markers = this.addAtomWithBonds(currentMarker.atom, currentMarker.symetry);
                markersList.push.apply(markersList, markers);
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
            for (const mposition of markersPositions)  {
                if (mposition.equal(position)) {
                    return true;
                }
            }
            return false;
        };

        // Loop througt all cell atoms
        for (const catom of  cellAtoms) {

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
