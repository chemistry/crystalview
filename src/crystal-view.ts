import { Camera } from "./camera/Camera";
import { ICamera } from "./camera/ICamera";
import { Molecule3D } from "./molecule3d/Molecule3D";
import { Painter } from "./painter/Painter";
import { ContextMenu } from "./ui/ContextMenu";
import { ContextMenuItem } from "./ui/ContextMenuItem";

export class Mol3DView {

    private View: any;
    private canvasElement: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private initDone: boolean;

    private width: number;
    private height: number;
    private subscriptions: Array<() => void>;
    private molecule: Molecule3D;

    private painer: Painter;
    private camera: Camera;
    private contextMenu: ContextMenu;

    private options: {
        bgcolor: string;
        showLabels: boolean;
        showMarkers: boolean;
        showUnitCell: boolean;
    };

    constructor( options: { bgcolor?: string}) {
        this.options = {
            bgcolor:  options.bgcolor || "#2b303b",
            showLabels: false,
            showMarkers: true,
            showUnitCell: false,
        };
        this.initDone = false;
        this.subscriptions = [];
        this.molecule = new Molecule3D();
    }

    public append(element: HTMLElement) {
        if (this.View || this.initDone) {
            throw new Error("append or init were alredy done");
        }

        this.View = $('<div class="jcmolview"><canvas></canvas></div>');
        this.View.css({
            "background-color": this.options.bgcolor,
            "dispaly": "block",
            "height": "100%",
            "position": "absolute",
            "width": "100%",
        });
        this.View.find("canvas").css({
            dispaly: "block",
        });

        this.View.appendTo(element);

        this.canvasElement = this.View.find("canvas").get(0) as HTMLCanvasElement;
        this.context = this.canvasElement.getContext("2d");

        this.painer = new Painter(this.context, this.options);
        this.camera = new Camera({
            element: this.canvasElement as HTMLElement,
            onClick: (x: any, y: any) => {
                if (!this.options.showMarkers) {
                    return;
                }
                const marker = this.painer.uprojectToMarker({
                    camera: this.camera,
                    molecule: this.molecule,
                    x,
                    y,
                });
                if (marker) {
                    this.molecule.extendByMarker(marker);
                    this.redraw();
                }
            },
            onRedraw: () => {
                this.redraw();
            },
        });

        this.contextMenu = new ContextMenu([
            new ContextMenuItem({
                command: () => {
                    this.center();
                },
                title: "Center Molecule",
                type: "item",
            }),
            new ContextMenuItem({
                title: "----",
                type: "delimer",
            }),
            new ContextMenuItem({
                command: () => {
                    this.options.showMarkers = !this.options.showMarkers;
                    this.redraw();
                },
                isChecked: () => {
                    return this.options.showMarkers;
                },
                title: "Show Markers",
                type: "checkbox",
            }),
            new ContextMenuItem({
                command: () => {
                  this.options.showUnitCell = !this.options.showUnitCell;
                  this.redraw();
                },
                isChecked: () => {
                    return this.options.showUnitCell;
                },
                title: "Show Unit Cell",
                type: "checkbox",
            }),
            new ContextMenuItem({
                command: () => {
                    this.options.showLabels = !this.options.showLabels;
                    this.redraw();
                },
                isChecked: () => {
                    return this.options.showLabels;
                },
                title: "Show Labels",
                type: "checkbox",
            }),
        ]);
    }

    public load(jcif: object) {
        this.molecule.clear();
        this.molecule.load(jcif);
        this.center();
    }

    public center() {
        // Center the molecule
        if (this.molecule && this.molecule.atoms && this.molecule.atoms.length > 2) {
            const center = this.molecule.getCenter();
            const scale = Math.min($(this.View).width() - 10, $(this.View).height() - 10) / this.molecule.getRadius();
            this.camera.setCameraView(scale / 2, center);
            this.redraw();
        }

        this.redraw();
    }

    public onInit() {
        if (!this.View) {
            throw new Error("append has to be called first");
        }
        if (this.initDone) {
            throw new Error("Init has to be called once");
        }
        this.camera.onInit();

        const event = () => {
            this.resizeCanvas();
        };
        $(window).on("resize", event);

        // save subscription
        this.subscriptions.push(() => {
            $(window).off("resize", event);
        });

        setTimeout(() => {
            this.resizeCanvas();
        }, 0);

        this.contextMenu.onInit(this.View);

        this.initDone = true;
    }

    public onDestroy() {
        this.camera.onDestroy();
        this.subscriptions.forEach((fn) => {
            fn();
        });
    }

    private redraw() {
        if (!this.height || !this.width) {
            return;
        }

        this.painer.draw(this.molecule, this.camera);
    }

    private resizeCanvas() {
        const width = this.View.width();
        const height = this.View.height();
        // Same width alredy seted
        if (width === this.width && height === this.height) {
            return;
        }
        this.width = width;
        this.height = height;
        this.canvasElement.width = this.width;
        this.canvasElement.height = this.height;
        this.redraw();
    }
}
