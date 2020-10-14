import { Element } from "@chemistry/elements";
import { Matrix3x4, Vec3 } from "@chemistry/math";
import { Atom } from "./Atom";
import { Link } from "./Link";
import { UnitCell } from "./UnitCell";

export class CellAtom {
    /**
     * Atom ID within molecule
     */
    public id: number;

    /**
     * label
     * @type {string}
     */
    public label: string;

    /**
     * Element
     * @type {Element}
     */
    public element: Element;

    /**
     * Cartezian position of Atom
     */
    public position: Vec3;

    /**
     * Unit Cell
     */
    public unitCell: UnitCell;

    /**
     * Fractional position of Atom
     */
    public fractional: Vec3;

    /**
     * Occupancy
     */
    public occupancy: number;

    /**
     * Isotropic U
     */
    public uiso: number;

    /**
     * Disorder Assembly
     */
    public assembly: string;

    /**
     * Disorder Group
     */
    public group: string;

    /**
     * List of Atoms Created From this Cell Atom
     */
    public children: Atom[];

    /**
     * List of connected atoms
     */
    public links: Link[];

    constructor(data: {
        id: number, unitCell: UnitCell, type: string, label: string, x: number,
        y: number, z: number, occupancy: number, uiso: number,
        assembly: string, group: string,
      }) {

        const element = Element.getElementByName(data.type);
        if (!element) {
            throw new Error("Wrong Element Name or ID: " + element);
        }

        this.element = element;

        this.id = data.id;
        this.unitCell = data.unitCell as UnitCell;
        this.label = data.label || element.symbol || "";

        this.fractional = new Vec3(data.x, data.y, data.z);
        this.occupancy = data.occupancy;
        this.uiso = data.uiso;
        this.assembly = data.assembly || "";
        this.group = data.group || "";

        this.position =  this.unitCell.fractToOrth(this.fractional);

        this.children = [];
        this.links = [];
    }

    /**
     * Add link to another element
     */
    public addLink(otherAtom: CellAtom, symetry: Matrix3x4) {
        const link = new Link(otherAtom, symetry);
        this.links.push(link);
    }

    public getLinks() {
        return this.links;
    }

    /**
     * Returns true if Cell Atom has Chield with Specific position
     */
     public hasChild(position: Vec3): boolean {
         for (const ch of this.children) {
             if (ch.fractional.equal(position)) {
                  return true;
             }
         }
         return false;
    }
    /**
     * Return Chield Atom with Specifified Position or null if not found
     */
    public getChild(position: Vec3): Atom {
        for (const ch of this.children) {
            if (ch.fractional.equal(position)) {
                return ch;
            }
        }
        return null;
    }

    /**
     * Return true if has Atom with Specified symetry position
     */
     public hasChieldWithSymetry(symetry: Matrix3x4): boolean {
         // Predict inserted atom position
         const predictedPostion = symetry.project(this.fractional);
         return this.hasChild(predictedPostion);
     }

     /**
      * Return Chield Atom with Specifified symetry or similar atom liing on the same spot
      */
     public getChieldWithSymetry(symetry: Matrix3x4): Atom {
         const predictedPostion = symetry.project(this.fractional);
         return this.getChild(predictedPostion);
     }

     /**
      * Create Atom & return it based on this Cell Atom
      * and set correct settings
      */

      public createAtom(symetry: Matrix3x4, addToChields: boolean) {
          const atom = new Atom(this, symetry);
          if (addToChields) {
              this.children.push(atom);
          }
          return atom;
      }
}
