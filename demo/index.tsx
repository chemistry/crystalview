import * as React from "react";
import * as ReactDOM from "react-dom";
import { CrystalView, CrystalViewState } from '../src';

const Viewer = () => {
    const [appState, setAppState] = React.useState(
        () => CrystalViewState.createEmpty(),
    );

    return (<div style={{ width: '600px' }}>
        <CrystalView appState={appState} onChange={setAppState} />
    </div>)
}


ReactDOM.render(
    <Viewer />,
    document.getElementById("app"),
);
