import { Vec3 } from "@chemistry/math";
import { Matrix3x4 } from "@chemistry/math";
import { CellAtom } from "./CellAtom";

export class Link {
    public atom: CellAtom;
    public symetry: Matrix3x4;
    public order: number;
    /**
     * Calc position of atom
     * @type {Vec3}
     */
    public fractional: Vec3;

    constructor(atom: CellAtom, symetry: Matrix3x4, order?: number) {
        this.atom = atom;
        this.symetry = symetry;
        this.order = order || 1;
        this.fractional = symetry.project(atom.fractional);
    }
}
