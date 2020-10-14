import { Vec3 } from "@chemistry/math";

export interface ICamera {
    onInit(): void;
    onDestroy(): void;

    project(position: Vec3): Vec3;
    unproject(position: Vec3): Vec3;

    extractScale(): number;
/*
    setCameraView
    setCameraCenter
    setCameraScale
    extractScale
    getDefaultAction
    setDefaultAction
*/
}
