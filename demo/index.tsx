import * as React from "react";
import * as ReactDOM from "react-dom";
import { CrystalView } from '../src';
import Structure1000004 from './1000004';

const Viewer = () => {
    const childRef = React.useRef();

    return (
        <div>
            <div style={{ width: '600px' }}>
                <CrystalView ref={childRef} />
            </div>
            <button onClick={() => childRef.current.setBackground('#770000')} >Red</button>
            <button onClick={() => childRef.current.load(Structure1000004)} >Load Molecule</button>
        </div>
    )
}

ReactDOM.render(
    <Viewer />,
    document.getElementById("app"),
);
