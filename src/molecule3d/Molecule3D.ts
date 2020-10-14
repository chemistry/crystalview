import { Vec3 } from "@chemistry/math";
import { Atom } from "./Atom";
import { Bond } from "./Bond";
import { CellAtom } from "./CellAtom";
import { IMoleculeReader } from "./io/IMoleculeReader";
import { MoleculeReaderJCIF } from "./io/MoleculeReaderJCIF";
import { Marker } from "./Marker";
import { MarkerContact } from "./MarkerContact";
import { MoleculeBuilder } from "./MoleculeBuilder";
import { MoleculeConnector } from "./MoleculeConnector";
import { UnitCell } from "./UnitCell";

export class Molecule3D {

    public title: string;
    public unitCell: UnitCell;

    public cellAtoms: CellAtom[];
    public atoms: Atom[];
    public bonds: Bond[];
    public markers: Marker[];
    public markersContacts: MarkerContact[];

    private reader: IMoleculeReader;
    private builder: MoleculeBuilder;
    private connector: MoleculeConnector;

    private initConnectivity: boolean;
    private center: Vec3;
    private radius: number;

    constructor() {
        this.reader = new MoleculeReaderJCIF();
        this.title = "";
        this.cellAtoms = [];
        this.atoms = [];
        this.bonds = [];
        this.markers = [];
        this.markersContacts = [];

        this.initConnectivity = false;
        this.builder = new MoleculeBuilder(this);
        this.connector = new MoleculeConnector(this);

        this.center = null;
        this.radius = 0;
    }

    public load(input: object) {
        this.reader.loadMolecule(this, input);

        // Connect atoms
        this.buildConnectivity();

        // Add unique Atoms
        this.builder.addUniqueAtoms();
    }

    public buildConnectivity() {
        if (!this.initConnectivity) {
            this.connector.buildConnectivity();
            this.initConnectivity = true;
        }
    }

    public clear() {
        this.title = "";
        this.cellAtoms = [];
        this.atoms = [];
        this.bonds = [];
        this.markers = [];
        this.markersContacts = [];

        this.center = null;
        this.radius = 0;
    }

    public addCellAtom(data: { type: string, label: string, x: number,
        y: number, z: number, occupancy: number, uiso: number, assembly: string, group: string }) {

        const o = data as { id: number, unitCell: UnitCell, type: string, label: string, x: number,
            y: number, z: number, occupancy: number, uiso: number, assembly: string, group: string };

        o.id = this.cellAtoms.length + 1;
        o.unitCell = this.unitCell;

        const atom = new CellAtom(o);

        this.cellAtoms.push(atom);
    }

    public addAtom(atom: Atom) {
        this.atoms.push(atom);

        this.center = null;
        this.radius = 0;
    }

    /**
     * Rerutn molecule center
     */
    public getCenter(): Vec3 {
        if (this.center) {
            return this.center;
        }
        if (this.atoms.length === 0) {
            return new Vec3(0, 0, 0);
        }
        if (this.atoms.length === 1) {
            return new Vec3(this.atoms[0].position.x, this.atoms[0].position.y, this.atoms[0].position.z);
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let minZ = Infinity;
        let maxY = -Infinity;
        let maxZ = -Infinity;

        const n = this.atoms.length;
        for (let i = this.atoms.length - 1; i >= 0; i--) {
            const p = this.atoms[i].position;
            if (minX > p.x) { minX = p.x; }
            if (minY > p.y) { minY = p.y; }
            if (minZ > p.z) { minZ = p.z; }
            if (maxX < p.x) { maxX = p.x; }
            if (maxY < p.y) { maxY = p.y; }
            if (maxZ < p.z) { maxZ = p.z; }
        }
        this.center = new Vec3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
        return this.center;
    }

    public getRadius(): number {
        if (this.radius !== 0 && this.radius !== undefined) {
            return this.radius;
        }

        this.radius = 0;
        const center = this.getCenter();
        let r2 = 0; // Radius squared

        if (this.atoms.length === 0 || this.atoms.length === 1) {
            return 0;
        }

        for (let i = this.atoms.length - 1; i >= 0; i--) {
            const p = this.atoms[i].position;
            const dx = (p.x - center.x);
            const dy = (p.y - center.y);
            const dz = (p.z - center.z);
            const r1 = dx * dx + dy * dy + dz * dz;
            if (r1 > r2) { r2 = r1; }
        }

        this.radius = Math.sqrt(r2);
        return this.radius;
    }

    public extendByMarker(makers: Marker): void {
        this.builder.extendByMarker(makers);
    }
}
