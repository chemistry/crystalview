import * as React from 'react';
import { useSelector, Provider } from 'react-redux';
import { EnhancedStore } from "@reduxjs/toolkit";
import { setBackground, loadMolecule, createStore, RootState } from './store';
import { SketcherContainer, Vis } from './sketcher';

const App = React.memo(() => {
    const backgroundColor = useSelector(state => state.options.backgroundColor);

    return (
        <div style={{ "background-color": backgroundColor, "dispaly": "block", position: "relative" }} className="crystal-view">
        <style dangerouslySetInnerHTML={{__html: `
            .crystal-view { }
            .crystal-view:after {
                content: "";
                display: block;
                padding-bottom: 75%;
            }
        `}}/>
        <Vis />
    </div>
    )
})

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


export const CrystalView = React.forwardRef((props, ref) => {
    const store = createStore();
    React.useImperativeHandle(ref, () => (CrystalViewMethodsFactory({ store })));

    return (
        <Provider store={store}>
            <App />
        </Provider>
    )
})
