import { Transform3D, Vec3 } from '@chemistry/math';
import { ICamera } from './ICamera.js';

const radStep = 0.012;

export class Camera implements ICamera {
  private element: HTMLElement;
  /**
   * RootationMatrix
   */
  private rootation: Transform3D;

  /**
   * TranSlation Matrix
   */
  private translation: Transform3D;

  // projection matrix
  private projectionMatrix!: Transform3D;
  // unproject matrix
  private unprojectionMatrix!: Transform3D;

  // Mose click captured ?
  private mouseCapture: boolean;
  // Click mouse position;
  private mouseBegin!: number[];
  // Mouse position of last transformation
  private mouseLast!: number[];
  // mouse current position
  private mouseCurrent!: number[];
  // mouse btn click flag
  private mouseClick: boolean;

  private width: number;
  private height: number;

  private onRedrawCallBack: () => void;
  private onClickCallBack: (x: number, y: number) => void;

  private boundMouseDown: (event: MouseEvent) => void;
  private boundMouseUp: (event: MouseEvent) => void;
  private boundMouseLeave: (event: MouseEvent) => void;
  private boundMouseMove: (event: MouseEvent) => void;
  private boundWheel: (event: WheelEvent) => void;

  constructor(options: {
    element: HTMLElement;
    onRedraw: () => void;
    onClick: (x: number, y: number) => void;
  }) {
    this.element = options.element;
    const scale = 20;
    const center = new Vec3(0, 0, 0);
    this.mouseCapture = false;
    this.mouseClick = false;

    this.rootation = Transform3D.fromScale(scale);
    this.translation = Transform3D.fromTranslation(center);

    // viewport size
    this.width = this.element.clientWidth;
    this.height = this.element.clientHeight;

    this.onRedrawCallBack = options.onRedraw;
    this.onClickCallBack = options.onClick;

    // Create bound handlers for proper cleanup
    this.boundMouseDown = (event: MouseEvent) => {
      this._mousedown(event);
    };
    this.boundMouseUp = (event: MouseEvent) => {
      this._mouseup(event);
    };
    this.boundMouseLeave = (event: MouseEvent) => {
      this._mouseleave(event);
    };
    this.boundMouseMove = (event: MouseEvent) => {
      this._mousemove(event);
    };
    this.boundWheel = (event: WheelEvent) => {
      this._mousewheel(event);
    };

    // Attach liseners
    this.attachLiseners();

    this.initMatrixes();
  }

  public onInit(): void {
    // Attach liseners
    this.attachLiseners();
    this.initMatrixes();
  }

  public onDestroy(): void {
    this.detachLiseners();
  }

  /**
   * Transform from 3D coordinates to Screen coordinates
   */
  public project(position: Vec3): Vec3 {
    return this.projectionMatrix.project(position);
  }

  /**
   * Transform screen coordinates to 3D coords
   */
  public unproject(position: Vec3): Vec3 {
    return this.unprojectionMatrix.project(position);
  }

  public extractScale(): number {
    return this.rootation.extractScale();
  }

  /**
   * Set Transformation scale and Rootation center
   */
  public setCameraView(scale: number, center: Vec3) {
    this.rootation = Transform3D.fromScale(scale);
    this.translation = Transform3D.fromTranslation(center.scale(-1));

    // reset projection matrix
    this.initMatrixes();
  }

  private attachLiseners() {
    this.element.addEventListener('mousedown', this.boundMouseDown);
    this.element.addEventListener('mouseup', this.boundMouseUp);
    this.element.addEventListener('mouseleave', this.boundMouseLeave);
    this.element.addEventListener('mousemove', this.boundMouseMove);
    this.element.addEventListener('wheel', this.boundWheel);
  }

  private _mousedown(event: MouseEvent) {
    this.mouseCapture = true;
    this.mouseClick = true;
    this.mouseBegin = [event.offsetX, event.offsetY];
    this.mouseCurrent = [event.offsetX, event.offsetY];
    this.mouseLast = [event.offsetX, event.offsetY];
  }

  private _mouseup(event: MouseEvent) {
    if (!this.mouseCapture) {
      return;
    }
    this.mouseCapture = false;
    this.mouseCurrent = [event.offsetX, event.offsetY];
    if (this.mouseClick) {
      this.processMouseClick(event.offsetX, event.offsetY, event.which);
    } else {
      this.processMouseMove(event.shiftKey, event.ctrlKey, event.which);
    }
    this.mouseLast = [event.offsetX, event.offsetY];
    this.mouseClick = false;
  }

  private _mouseleave(event: MouseEvent) {
    if (!this.mouseCapture) {
      return;
    }
    this.mouseCapture = false;
    this.mouseCurrent = [event.offsetX, event.offsetY];
    this.processMouseMove(event.shiftKey, event.ctrlKey, event.which);
    this.mouseLast = [event.offsetX, event.offsetY];
  }

  private _mousemove(event: MouseEvent) {
    if (!this.mouseCapture) {
      return;
    }
    this.mouseCurrent = [event.offsetX, event.offsetY];
    this.processMouseMove(event.shiftKey, event.ctrlKey, event.which);
    this.mouseLast = [event.offsetX, event.offsetY];
    event.preventDefault();
  }

  private _mousewheel(event: WheelEvent) {
    this.whellZoom(event);

    this.initMatrixes();
    this.onRedraw();
    event.preventDefault();
  }

  private processMouseClick(offsetX: number, offsetY: number, which: number) {
    if (which === 1 && this.onClickCallBack) {
      this.onClickCallBack(offsetX, offsetY);
    }
  }

  private processMouseMove(shiftKey: boolean, ctrlKey: boolean, which: number) {
    if (
      this.mouseCurrent[1] === this.mouseCurrent[0] &&
      this.mouseLast[1] === this.mouseCurrent[1]
    ) {
      return;
    }
    // skeep if it's mouse Click
    if (
      Math.abs(this.mouseBegin[0] - this.mouseCurrent[0]) < 6 &&
      Math.abs(this.mouseBegin[2] - this.mouseCurrent[2]) < 6 &&
      this.mouseClick
    ) {
      return;
    }

    this.mouseClick = false;

    switch (true) {
      case shiftKey || which === 2:
        // Translate
        this.mouseTranslate();
        break;
      case ctrlKey || which === 3:
        // zoom
        // mouseZoom.call(this);
        break;
      default:
        // Rotate 3D
        this.mouseRootate_XYZ();
      // callDefaultAction.call(this);
    }

    this.initMatrixes();
    this.onRedraw();
  }

  private mouseRootate_XYZ() {
    const dx = this.mouseLast[0] - this.mouseCurrent[0]; // = [0,0];
    const dy = this.mouseLast[1] - this.mouseCurrent[1];
    let t = Transform3D.fromScale(1);
    let axis = new Vec3(0, 1, 0);
    t = t.rotate(axis, dx * radStep);
    axis = new Vec3(1, 0, 0);
    t = t.rotate(axis, -dy * radStep);
    const m = Transform3D.fromMultiplication(this.rootation, t);
    this.rootation = m;
  }

  private mouseRootateXY() {
    const dy = this.mouseLast[1] - this.mouseCurrent[1];
    let t = Transform3D.fromScale(1);
    const axis = new Vec3(0, 0, 1);
    t = t.rotate(axis, dy * radStep);
    const m = Transform3D.fromMultiplication(this.rootation, t);
    this.rootation = m;
  }

  private mouseTranslate() {
    const u1 = this.unproject(new Vec3(this.mouseLast[0], this.mouseLast[1], 0));
    const u2 = this.unproject(new Vec3(this.mouseCurrent[0], this.mouseCurrent[1], 0));
    const tr = Vec3.sub(u2, u1);
    this.translation = this.translation.translate(tr);
  }

  private mouseZoom() {
    const dy = this.mouseLast[1] - this.mouseCurrent[1];
    let scale: number;
    if (dy > 0) {
      scale = 1 + (dy / this.height) * 4;
    } else {
      scale = 1 / (1 - (dy / this.height) * 4);
    }
    const t = Transform3D.fromScale(scale);
    this.rootation = Transform3D.fromMultiplication(this.rootation, t);
  }

  private whellZoom(event: WheelEvent) {
    const dy = (-event.deltaY / 120) * (this.height / 16);
    let scale: number;
    if (dy > 0) {
      scale = 1 + (dy / this.height) * 4;
    } else {
      scale = 1 / (1 - (dy / this.height) * 4);
    }
    const t = Transform3D.fromScale(scale);
    this.rootation = Transform3D.fromMultiplication(this.rootation, t);
  }

  private detachLiseners() {
    this.element.removeEventListener('mousedown', this.boundMouseDown);
    this.element.removeEventListener('mouseup', this.boundMouseUp);
    this.element.removeEventListener('mouseleave', this.boundMouseLeave);
    this.element.removeEventListener('mousemove', this.boundMouseMove);
    this.element.removeEventListener('wheel', this.boundWheel);
  }

  private onRedraw() {
    if (this.onRedrawCallBack) {
      this.onRedrawCallBack();
    }
  }

  /**
   * Init projection Matrixes
   */
  private initMatrixes() {
    this.projectionMatrix = Transform3D.fromMultiplication(this.translation, this.rootation);
    this.unprojectionMatrix = this.projectionMatrix.inverse();
  }
}
