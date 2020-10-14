import { Matrix3x4, Vec3 } from "@chemistry/math";
import { CellAtom } from "./CellAtom";
import { UnitCell } from "./UnitCell";

export class Atom {
    public fractional: Vec3;
    public position: Vec3;
    public parent: CellAtom;
    public symetry: Matrix3x4;

    constructor(parent: CellAtom, symetry: Matrix3x4) {

        this.parent = parent;
        this.fractional = symetry.project(parent.fractional);
        this.symetry = symetry;
        this.position = parent.unitCell.fractToOrth(this.fractional);
    }

    /**
     * Return color of the element
     */
    public getColor() {
        return this.parent.element.color;
    }
}
