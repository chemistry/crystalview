import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { cameraReducer } from './camera';
import { moleculeReducer } from './molecule';
import { optionsReducer } from './options';

export interface CrystalViewMethods {
    setBackground(color: string);
}

// create reducer as singletone
const reducer = combineReducers({
    options: optionsReducer,
    molecule: moleculeReducer,
    camera: cameraReducer
});

export type RootState = ReturnType<typeof reducer>;
export const createStore = () => {
    const isDevelopment = (process.env.NODE_ENV !== "production");
    const middleware = getDefaultMiddleware();
    return configureStore({
        reducer,
        middleware,
        devTools: !isDevelopment,
    });
}
