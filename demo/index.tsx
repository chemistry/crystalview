import * as React from "react";
import * as ReactDOM from "react-dom";
import { CrystalView } from '../src';


const Viewer = () => {
    const childRef = React.useRef();

    return (
        <div>
            <div style={{ width: '600px' }}>
                <CrystalView ref={childRef} />
            </div>
            <button onClick={() => childRef.current.setBackground('#770000')} >Red</button>
        </div>
    )
}


ReactDOM.render(
    <Viewer />,
    document.getElementById("app"),
);
