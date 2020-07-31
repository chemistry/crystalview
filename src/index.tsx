import * as React from 'react';
import { combineReducers, createStore, Store } from 'redux';
import { useSelector, Provider } from 'react-redux';
import { optionsReducer, setBackground } from './store';

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

export const CrystalViewMethodsFactory = ({ store }: { store: Store<any, any> }) => {
    return {
        setBackground: (color) => {
            store.dispatch(setBackground(color))
        }
    }
}

export const CrystalView = React.forwardRef((props, ref) => {
    const store = createStore(combineReducers({
        options: optionsReducer
    }));

    React.useImperativeHandle(ref, () => (CrystalViewMethodsFactory({ store })));


    return (
        <Provider store={store}>
            <App />
        </Provider>
    )
})
