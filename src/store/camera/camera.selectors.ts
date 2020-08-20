import { Transform3D, Vec3 } from "@chemistry/math";
import { RootState } from "../store";

const DEFAULT_SCALE = 20;
const DEFAULT_CENTER = new Vec3(0,0,0);

export const getProjectionMatrix = (state: RootState)=> {
    const translation = state.camera.translation;
    const rotation = state.camera.rotation;

    return Transform3D.fromMultiplication(Transform3D.fromScale(DEFAULT_SCALE), Transform3D.fromTranslation(DEFAULT_CENTER));
}
