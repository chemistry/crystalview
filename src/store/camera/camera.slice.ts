import { createSlice } from '@reduxjs/toolkit';
import { Transform3D, Vec3 } from '@chemistry/math';

const DEFAULT_SCALE = 20;
const DEFAULT_CENTER = new Vec3(0,0,0);

interface CameraState {
    rotation: number[];
    translation: number[];
}
const getDefaultState = (): CameraState  => {
    return {
        rotation: (Transform3D.fromScale(DEFAULT_SCALE)  as any).elements,
        translation: (Transform3D.fromTranslation(DEFAULT_CENTER) as any).elements
    }
}

const cameraSlice = createSlice({
  name: 'camera',
  initialState: getDefaultState(),
  reducers: {
  }
})

// export const { setBackground } = optionsSlice.actions;

export const cameraReducer =  cameraSlice.reducer;
