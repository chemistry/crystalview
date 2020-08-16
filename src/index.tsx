import * as React from 'react';
import { combineReducers, configureStore, createReducer, EnhancedStore, getDefaultMiddleware} from "@reduxjs/toolkit";
import { useSelector, Provider } from 'react-redux';
import { optionsReducer, setBackground, loadMolecule, moleculeReducer } from './store';

const App = () => {
    const ref = React.useRef();
    const backgroundColor = useSelector(state => state.options.backgroundColor);

    return (
        <div style={{ "background-color": backgroundColor, "dispaly": "block" }} className="crystal-view">
        <style dangerouslySetInnerHTML={{__html: `
            .crystal-view { }
            .crystal-view:after {
                content: "";
                display: block;
                padding-bottom: 75%;
            }
        `}}/>
        <canvas ref={ref}/>
    </div>
    )
}

export interface CrystalViewMethods {
    setBackground(color: string);
}

// create reducer as singletone
const reducer = combineReducers({
    options: optionsReducer,
    molecule: moleculeReducer
});
export type RootState = ReturnType<typeof reducer>;


export const CrystalViewMethodsFactory = ({ store }: { store: EnhancedStore<RootState> }) => {
    const { dispatch } = store;
    return {
        setBackground: (color) => {
            dispatch(setBackground(color))
        },
        load: (jmol) => {
            dispatch(loadMolecule(jmol))
        }
    }
}

const createStore = () => {
    const isDevelopment = (process.env.NODE_ENV !== "production");
    const middleware = getDefaultMiddleware();
    return configureStore({
        reducer,
        middleware,
        devTools: !isDevelopment,
    });
}

export const CrystalView = React.forwardRef((props, ref) => {
    const store = createStore();
    React.useImperativeHandle(ref, () => (CrystalViewMethodsFactory({ store })));

    return (
        <Provider store={store}>
            <App />
        </Provider>
    )
})
