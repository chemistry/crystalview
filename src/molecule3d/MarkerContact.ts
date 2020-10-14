import { Vec3 } from "@chemistry/math";

export class MarkerContact {

    public position1: Vec3;
    public position2: Vec3;

    constructor(position1: Vec3, position2: Vec3) {
        this.position1 = position1;
        this.position2 = position2;
    }
}
