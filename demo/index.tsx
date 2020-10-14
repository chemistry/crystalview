import * as React from "react";
import * as ReactDOM from "react-dom";
import { CrystalView } from '../src';
import Structure1000004 from './1000004';

const Viewer = () => {
    const childRef = React.useRef();

    const setBackground = () => {
        childRef.current.setBackground('#770000');
    }
    const loadStructure = ()=> {
        childRef.current.load(Structure1000004);
    }

    return (
        <div>
            <div style={{ width: '600px' }}>
                <CrystalView ref={childRef} />
            </div>
            <button onClick={setBackground} >Red</button>
            <button onClick={loadStructure} >Load Molecule</button>
        </div>
    )
}

ReactDOM.render(
    <Viewer />,
    document.getElementById("app"),
);
