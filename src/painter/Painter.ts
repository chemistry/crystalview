import { Vec3 } from "@chemistry/math";
import { ICamera } from "../camera/ICamera";
import { Marker } from "../molecule3d/Marker";
import { Molecule3D } from "../molecule3d/Molecule3D";
import { CanvasContext } from "./CanvasContext";

const ATOM_RADIUS_FACTOR = 0.25;

export class Painter {

    private context: CanvasContext;

    private options: {
        bgcolor: string,
        showUnitCell: boolean;
        showMarkers: boolean;
        showLabels: boolean;
    };
    private zBuffer: any[];

    constructor(context: CanvasRenderingContext2D, options: {
        bgcolor: string,
        showUnitCell: boolean;
        showMarkers: boolean;
        showLabels: boolean;
    }) {
        this.context = new CanvasContext(context);
        this.options = options;
    }

    public draw(molecule: Molecule3D, camera: ICamera) {
        const context = this.context;
        this.zBuffer = [];

        context.save();
        context.clear(this.options.bgcolor);
        context.center();

        this.prepareAtoms(molecule, camera);
        this.prepareBonds(molecule, camera);

        if (this.options.showMarkers) {
            this.prepareMarkers(molecule, camera);
            this.prepareMarkersContacts(molecule, camera);
        }

        if (this.options.showUnitCell) {
            this.prepareUnitCell(molecule, camera);
        }

        if (this.options.showLabels) {
            this.prepareLabels(molecule, camera);
        }

        this.zBuffer.sort((i1, i2) => {
            return i1.z - i2.z;
        });
        this.drawZBuffer();

        context.restore();
        this.zBuffer = [];
    }

    public uprojectToMarker(data: { molecule: Molecule3D, camera: ICamera, x: number, y: number }): Marker {
        const context = this.context;
        const currentZ = -Infinity;
        const camera = data.camera;
        const molecule = data.molecule;
        let currentMarker = null;
        const tx = data.x - context.getCenterX();
        const ty = data.y - context.getCenterY();
        const clickR = 9;
        const clickR2 = clickR * clickR;

        for (const marker of molecule.markers) {
            const projection = camera.project(marker.position);

            if (Math.abs(projection.x - tx) < clickR && Math.abs(projection.y - ty) < clickR) {
                const length = Math.sqrt((projection.x - tx) * (projection.x - tx)
                  + (projection.y - ty) * (projection.y - ty));

                if (length < clickR2 && currentZ < projection.z) {
                    currentMarker = marker;
                }
            }
        }

        return currentMarker;
    }

    private drawZBuffer() {

        const context = this.context;
        for (const item of this.zBuffer) {

            switch (item.type) {
                case "atom":
                    this.drawAtom(context, item);
                    break;
                case "label":
                    this.drawLabel(context, item);
                    break;
                case "bond-line":
                    this.drawBondLine(context, item);
                    break;
                case "marker":
                    this.drawMarker(context, item);
                    break;
                case "marker-contact":
                    this.drawMarkerContact(context, item);
                    break;
                case "unit-cell-line":
                    this.unitCellLine(context, item);
                    break;
                default:
                break;
            }
        }
    }

    private unitCellLine(context: CanvasContext, obj: any) {
        context.line(obj.x1, obj.y1, obj.x2, obj.y2, obj.color);
    }

    private drawBondLine(context: CanvasContext, obj: any) {
        context.line(obj.x1, obj.y1, obj.x2, obj.y2, obj.color);
    }

    private drawAtom(context: CanvasContext, obj: any) {
        context.circle(obj.x, obj.y, obj.r, obj.color);
    }

    private drawMarker(context: CanvasContext, obj: any) {
        context.circle(obj.x, obj.y, 3, "#ffda4d");
    }

    private drawMarkerContact(context: CanvasContext, obj: any) {
        context.linedashed(obj.x1, obj.y1, obj.x2, obj.y2, "#ffda4d", [4, 7]);
    }

    private drawLabel(context: CanvasContext, obj: any) {
        context.text(obj.label, obj.x, obj.y, "#ffffff", "12px Arial");
    }

    private prepareMarkers(molecule: Molecule3D, camera: ICamera) {
        const context = this.context;
        const scale = camera.extractScale();
        const zBuffer = this.zBuffer;

        for (const marker of molecule.markers) {
            const projection = camera.project(marker.position);

            zBuffer.push({
                type: "marker",
                x: projection.x,
                y: projection.y,
                z: projection.z,
            });
        }
    }

    private prepareLabels(molecule: Molecule3D, camera: ICamera) {
        const context = this.context;
        const scale = camera.extractScale() * ATOM_RADIUS_FACTOR;
        const zBuffer = this.zBuffer;

        for (const atom of molecule.atoms) {
            const projection = camera.project(atom.position);
            const r = atom.parent.element.RCow * scale;
            const label = atom.parent.label;
            if (label) {
                zBuffer.push({
                    label,
                    r: atom.parent.element.RCow * scale,
                    type: "label",
                    x: projection.x + r + 3,
                    y: projection.y - r,
                    z: projection.z,
                });
            }
        }
    }

    private prepareMarkersContacts(molecule: Molecule3D, camera: ICamera) {
        const context = this.context;
        const zBuffer = this.zBuffer;

        for (const marker of molecule.markersContacts) {
            const p1 = camera.project(marker.position1);
            const p2 = camera.project(marker.position2);

            zBuffer.push({
                type: "marker-contact",
                x1: p1.x,
                x2: p2.x,
                y1: p1.y,
                y2: p2.y,
                z: (p1.z + p2.z) / 2,
            });
        }

    }

    private prepareAxis(p1: Vec3, p2: Vec3, color: string, num: number) {
        const zBuffer = this.zBuffer;

        const det = Vec3.sub(p2, p1).scale(1 / num);
        for (let i = 0; i < num; i++) {
            zBuffer.push({
                color,
                type: "unit-cell-line",
                x1: p1.x + det.x * i,
                x2: p1.x + det.x * (i + 1),
                y1: p1.y + det.y * i,
                y2: p1.y + det.y * (i + 1),
                z: (p1.z + det.z * i + p1.z + det.z * (i + 1)) / 2,
            });
        }
    }

    private prepareUnitCell(molecule: Molecule3D, camera: ICamera) {
        const context = this.context;
        const zBuffer = this.zBuffer;
        const uc = molecule.unitCell;

        if (!uc) {
            return;
        }

        const v000 = uc.fractToOrth(new Vec3(0, 0, 0));
        const v100 = uc.fractToOrth(new Vec3(1, 0, 0));
        const v010 = uc.fractToOrth(new Vec3(0, 1, 0));
        const v001 = uc.fractToOrth(new Vec3(0, 0, 1));
        const v101 = uc.fractToOrth(new Vec3(1, 0, 1));
        const v011 = uc.fractToOrth(new Vec3(0, 1, 1));
        const v110 = uc.fractToOrth(new Vec3(1, 1, 0));
        const v111 = uc.fractToOrth(new Vec3(1, 1, 1));

        const p000 = camera.project(v000);
        const p100 = camera.project(v100);
        const p010 = camera.project(v010);
        const p001 = camera.project(v001);
        const p101 = camera.project(v101);
        const p011 = camera.project(v011);
        const p110 = camera.project(v110);
        const p111 = camera.project(v111);

        this.prepareAxis(p000, p100, "#b00000", Math.ceil(v100.length / 4));
        this.prepareAxis(p100, p101, "#707070", Math.ceil(v001.length / 4));
        this.prepareAxis(p100, p110, "#707070", Math.ceil(v010.length / 4));
        this.prepareAxis(p010, p011, "#707070", Math.ceil(v001.length / 4));
        this.prepareAxis(p000, p010, "#00b000", Math.ceil(v010.length / 4));
        this.prepareAxis(p010, p110, "#707070", Math.ceil(v100.length / 4));
        this.prepareAxis(p000, p001, "#0000b0", Math.ceil(v100.length / 4));
        this.prepareAxis(p001, p011, "#707070", Math.ceil(v010.length / 4));
        this.prepareAxis(p001, p101, "#707070", Math.ceil(v100.length / 4));
        this.prepareAxis(p111, p101, "#707070", Math.ceil(v010.length / 4));
        this.prepareAxis(p111, p011, "#707070", Math.ceil(v100.length / 4));
        this.prepareAxis(p111, p110, "#707070", Math.ceil(v001.length / 4));
    }

    private prepareBonds(molecule: Molecule3D, camera: ICamera) {
        const context = this.context;
        const scale = camera.extractScale();
        const zBuffer = this.zBuffer;

        for (const bond of molecule.bonds) {
            const a1 = bond.atom1;
            const a2 = bond.atom2;

            const p1 = camera.project(a1.position);
            const p2 = camera.project(a2.position);

            const pmidx = (p1.x + p2.x) / 2;
            const pmidy = (p1.y + p2.y) / 2;
            const pmidz = (p1.z + p2.z) / 2;

            zBuffer.push({
                color: a1.getColor(),
                type: "bond-line",
                x1: p1.x,
                x2: pmidx,
                y1: p1.y,
                y2: pmidy,
                z: (p1.z + pmidz) / 2,
            });

            zBuffer.push({
                color: a2.getColor(),
                type: "bond-line",
                x1: p2.x,
                x2: pmidx,
                y1: p2.y,
                y2: pmidy,
                z: (p2.z + pmidz) / 2,
            });
        }
    }

    private prepareAtoms(molecule: Molecule3D, camera: ICamera) {
        const context = this.context;
        const scale = camera.extractScale() * ATOM_RADIUS_FACTOR;
        const zBuffer = this.zBuffer;

        for (const atom of molecule.atoms) {
            const projection = camera.project(atom.position);

            zBuffer.push({
                color: atom.getColor(),
                r: atom.parent.element.RCow * scale,
                type: "atom",
                x: projection.x,
                y: projection.y,
                z: projection.z,
            });
        }
    }
}
