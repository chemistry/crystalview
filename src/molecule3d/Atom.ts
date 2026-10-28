import { type Matrix3x4, type Vec3 } from '@chemistry/math';
import { type CellAtom } from './CellAtom.js';

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
