import * as React from 'react';
import { combineReducers, createStore } from 'redux';
import { useSelector, Provider } from 'react-redux';
import { optionsReducer } from './store';

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

export const CrystalView = () => {
    const store = createStore(combineReducers({
        options: optionsReducer
    }));
    return (
        <Provider store={store}>
            <App />
        </Provider>
    )
}
