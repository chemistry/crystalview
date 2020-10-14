import { Vec3 } from "@chemistry/math";
import { Atom } from "./Atom";

export class Bond {
    public atom1: Atom;
    public atom2: Atom;
    public order: number;

    constructor(atom1: Atom, atom2: Atom, order?: number) {
        this.atom1 = atom1;
        this.atom2 = atom2;
        this.order = order || 1;
    }
}
