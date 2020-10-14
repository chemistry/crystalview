import { Matrix3x3, Matrix3x4, Vec3 } from "@chemistry/math";
import { SpaceGroup } from "@crystallography/space-groups";

export class UnitCell {
    /**
     * Will construct Transformation Matrix from Crystallographic notation
     * e.g. x,y,z -x+1/2, -y, z+1/2
     */
    public static getMatrixFromSymetry(symetryCode: string): Matrix3x4 {

       function replaceAll(str: string, find: string, replace: string): string {
          return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g"), replace);
       }

       function prseSym1(str: string) {
          const res = [0, 0, 0, 0];
          const spl = str.split("+");

          // loop throught all splits
          for (const sp2 of spl) {
              const res2 = prseSym2(sp2);
              res[0] = res[0] + res2[0];
              res[1] = res[1] + res2[1];
              res[2] = res[2] + res2[2];
              res[3] = res[3] + res2[3];
          }
          return res;
     }

       function prseSym2(str: string) {
        const res = [0, 0, 0, 0];
        const spl = str.split("-");
        let res2 = [0, 0, 0, 0];

        //  -x-y, _x-z
        for (let i = 0; i < spl.length; i++) {
            if ((i === 0) && (spl[i] === "")) {
                continue;
            }
            let znak = -1;
            if (i === 0) {
                znak = 1;
            }
            res2 = prseSym3(spl[i]);
            res[0] = res[0] + (res2[0] * znak);
            res[1] = res[1] + (res2[1] * znak);
            res[2] = res[2] + (res2[2] * znak);
            res[3] = res[3] + (res2[3] * znak);
        }
        return res;
    }

    // Parse Symetry 3
       function prseSym3(str: string) {
        const res = [0, 0, 0, 0];
        if (str.indexOf("x") >= 0) {// 1/2x,0.25*x
            res[0] = prseSym5(str, "x");
        } else if (str.indexOf("y") >= 0) {
            res[1] = prseSym5(str, "y");
        } else if (str.indexOf("z") >= 0) {
           res[2] = prseSym5(str, "z");
        } else {// : 1/2 0.33  + 1
           res[3] = prseSym4(str);
        }
        return res;
      }

       function prseSym4(str: string) {
          let res;
          if (str.indexOf("/") >= 0) { // 1/2
              const xpl = str.split("/");
              res = parseFloat(xpl[0]) / parseFloat(xpl[1]);
          } else {
              const stp = str.replace(".", ",");
              res = parseFloat(stp);
          }
          return res;
     }

       function prseSym5(str: string, ch: string) {
          let res = 0;
          if (str.indexOf(ch) >= 0) {
              if (str.indexOf("*") >= 0) {
                  // 1/2x,0.25*x
                  const xpl = str.split("*");
                  res = prseSym4(xpl[0]);
                  if (xpl[1] !== ch) {
                      throw new Error("Incorect formula");
                  }
              } else {
                  if (ch === str) {
                      return 1;
                  }
                  res = prseSym4(str.replace(ch, "")); // Replace(ch.ToString(), "")
              }
          }
          return res;
      }

       const s = replaceAll(symetryCode.toLowerCase(), " ", "");
       const pils = s.split(",");
       if (pils.length !== 3) {
          throw new Error("can not parse symetry code : " + symetryCode);
      }

       const xv = prseSym1(pils[0]);
       const yv = prseSym1(pils[1]);
       const zv = prseSym1(pils[2]);

      // Double check if the matrix were parsed correctly
       for (let i = 0; i < 4; i++) {
          let r = (typeof xv[i] !== "number" || !isFinite(xv[i]));
          r = r || (typeof yv[i] !== "number" || !isFinite(yv[i]));
          r = r || (typeof zv[i] !== "number" || !isFinite(zv[i]));
          if (r) {
              throw new Error("can not parse symetry code : " + symetryCode);
          }
      }

       return new Matrix3x4([xv[0], xv[1], xv[2], xv[3],   yv[0], yv[1], yv[2], yv[3],  zv[0], zv[1], zv[2], zv[3]]);
    }

    public a: number;
    public b: number;
    public c: number;
    public alpha: number;
    public beta: number;
    public gamma: number;
    public spaceGroup: SpaceGroup;

    public volume: number;
    public symetryList: Matrix3x4[];
    private mOrthMatrix: Matrix3x3;
    private mOrthMatrixInvert: Matrix3x3;

    constructor(a: number, b: number, c: number,
                alpha: number, beta: number, gamma: number,
                spaceGroup: SpaceGroup) {

        this.a = a;
        this.b = b;
        this.c = c;
        this.alpha = alpha;
        this.beta = beta;
        this.gamma = gamma;
        this.spaceGroup = spaceGroup;

        this.init();
    }

    /**
     * Convert fractional coordinates to Orth
     */
    public fractToOrth(coord: Vec3): Vec3 {
        return this.mOrthMatrix.project(coord);
    }

    /**
     * Convert Orth coordinates to fractional
     */
    public orthToFract(coord: Vec3): Vec3 {
        return this.mOrthMatrixInvert.project(coord);
    }

    /**
     * Based on Orth box conner coordinates Return
     * posible tranactions to get evry posible dot from this box
     */
    public transactionsFromOrthBox(point1: Vec3, point2: Vec3): Vec3[] {
        // Normalize points
        const p1 = new Vec3(Math.min(point1.x, point2.x), Math.min(point1.y, point2.y), Math.min(point1.z, point2.z));
        const p2 = new Vec3(Math.max(point1.x, point2.x), Math.max(point1.y, point2.y), Math.max(point1.z, point2.z));
        // Create vectors of the box
        const v1 = new Vec3(p1.x, p1.y, p1.z);
        const v2 = new Vec3(p2.x, p1.y, p1.z);
        const v3 = new Vec3(p1.x, p2.y, p1.z);
        const v4 = new Vec3(p1.x, p1.y, p2.z);
        const v5 = new Vec3(p2.x, p2.y, p1.z);
        const v6 = new Vec3(p2.x, p1.y, p2.z);
        const v7 = new Vec3(p1.x, p2.y, p2.z);
        const v8 = new Vec3(p2.x, p2.y, p2.z);

        // VP 1 - VP2
        const vp1 = this.orthToFract(v1);
        const vp2 = this.orthToFract(v2);
        const vp3 = this.orthToFract(v3);
        const vp4 = this.orthToFract(v4);
        const vp5 = this.orthToFract(v5);
        const vp6 = this.orthToFract(v6);
        const vp7 = this.orthToFract(v7);

        const vp8 = this.orthToFract(v8);
        const MinX = Math.floor(Math.min(vp1.x, vp2.x, vp3.x, vp4.x, vp5.x, vp6.x, vp7.x, vp8.x));
        const MinY = Math.floor(Math.min(vp1.y, vp2.y, vp3.y, vp4.y, vp5.y, vp6.y, vp7.y, vp8.y));
        const MinZ = Math.floor(Math.min(vp1.z, vp2.z, vp3.z, vp4.z, vp5.z, vp6.z, vp7.z, vp8.z));
        const MaxX = Math.ceil(Math.max(vp1.x, vp2.x, vp3.x, vp4.x, vp5.x, vp6.x, vp7.x, vp8.x));
        const MaxY = Math.ceil(Math.max(vp1.y, vp2.y, vp3.y, vp4.y, vp5.y, vp6.y, vp7.y, vp8.y));
        const MaxZ = Math.ceil(Math.max(vp1.z, vp2.z, vp3.z, vp4.z, vp5.z, vp6.z, vp7.z, vp8.z));

        const res: Vec3[] = [];

        // Create range of posible translations;
        for (let i = MinX; i < MaxX; i++) {
            for (let j = MinY; j < MaxY; j++) {
                for (let k = MinZ; k < MaxZ; k++) {
                    res.push(new Vec3(i, j, k));
                }
            }
        }

        return res;
     }

     private init(): void {
         // PREPARE PROJECTION MATRIXES
         const pAlpha = this.alpha * 0.017453292519943295; // pi/180 ;
         const pBeta  = this.beta  * 0.017453292519943295;
         const pGamma = this.gamma * 0.017453292519943295;
         const v = (Math.sqrt(1 - Math.cos(pAlpha) * Math.cos(pAlpha) - Math.cos(pBeta) * Math.cos(pBeta)
           - Math.cos(pGamma) * Math.cos(pGamma) + 2 * Math.cos(pAlpha) * Math.cos(pBeta) * Math.cos(pGamma)));
         const aa = (Math.sin(pAlpha) / this.a / v);
         const bb = (Math.sin(pBeta) / this.b / v);
         const cc = (Math.sin(pGamma) / this.c / v);
         const alphaa = (Math.acos((Math.cos(pBeta) * Math.cos(pGamma)
           - Math.cos(pAlpha)) / Math.sin(pBeta) / Math.sin(pGamma)));
         const betaa = (Math.acos((Math.cos(pAlpha) * Math.cos(pGamma)
           - Math.cos(pBeta)) / Math.sin(pAlpha) / Math.sin(pGamma)));
         const gammaa = (Math.acos((Math.cos(pAlpha) * Math.cos(pBeta)
           - Math.cos(pGamma)) / Math.sin(pAlpha) / Math.sin(pBeta)));

         this.mOrthMatrix = new Matrix3x3();
         this.mOrthMatrix.set(0, 0, (this.a));
         this.mOrthMatrix.set(0, 1, (this.b * Math.cos(pGamma)));
         this.mOrthMatrix.set(0, 2, (this.c * Math.cos(pBeta)));
         this.mOrthMatrix.set(1, 0, 0);
         this.mOrthMatrix.set(1, 1, (this.b * Math.sin(pGamma)));
         this.mOrthMatrix.set(1, 2, (-this.c * Math.sin(pBeta) * Math.cos(alphaa)));
         this.mOrthMatrix.set(2, 0, 0);
         this.mOrthMatrix.set(2, 1, 0);
         this.mOrthMatrix.set(2, 2, (1 / cc));
         this.mOrthMatrixInvert = Matrix3x3.inverse(this.mOrthMatrix);
         this.volume = v;

         this.symetryList = [];
         // PREPARE Symetry LIST
         //
         for (const symStr of this.spaceGroup.symetryList) {
             const sym = UnitCell.getMatrixFromSymetry(symStr);
             this.symetryList.push(sym);
         }
     }

}
