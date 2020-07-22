import * as React from "react";
import * as ReactDOM from "react-dom";
import { CrystalView } from '../src';

const Viewer = () => {

    return (
        <div style={{ width: '600px' }}>
            <CrystalView />
        </div>
    )
}


ReactDOM.render(
    <Viewer />,
    document.getElementById("app"),
);
