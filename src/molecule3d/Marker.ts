import { Matrix3x4, Vec3 } from "@chemistry/math";
import { CellAtom } from "./CellAtom";

export class Marker {

    public position: Vec3;
    public symetry: Matrix3x4;
    public cellAtom: CellAtom;

    constructor(position: Vec3, symetry: Matrix3x4,  cellAtom: CellAtom) {
        this.position = position;
        this.symetry = symetry;
        this.cellAtom = cellAtom;
    }
}
