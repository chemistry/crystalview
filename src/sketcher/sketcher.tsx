import * as React from 'react';
import { useSelector } from 'react-redux';
import { getProjectionMatrix } from '../store/camera';
import { Atom } from '../entities';
import { getPainter, Painter } from './painter';
import { Transform3D, Vec3 } from '@chemistry/math';


export const SketcherContainer = React.memo(() => {
    const atoms  = useSelector(state => state.molecule.atoms);
    const projection: Transform3D = useSelector(getProjectionMatrix);
    const backgroundColor = useSelector(state => state.options.backgroundColor);

    return (<Sketcher atoms={atoms} projection={projection} backgroundColor={backgroundColor} />)
});

const Sketcher = ({
    atoms,
    projection,
    backgroundColor
}: any) => {
    const ref = React.useRef();
    if (ref && ref.current) {
        const painter = getPainter(ref.current.getContext("2d"));
        painter.clear(backgroundColor);
        painter.center();
        drawAtoms({ painter, atoms, projection });
    }

    return (<canvas style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', width: '100%', height: '100%' }} ref={ref}/>)
}

const drawAtoms = ({
    painter,
    atoms,
    projection
}: {
    painter: Painter,
    atoms: Atom[],
    projection: Transform3D
}) => {

    atoms.forEach((atom) => {
        const SCALE = 10;
        const position = projection.project(new Vec3(atom.x * SCALE, atom.y * SCALE, atom.z * SCALE));
        painter.circle(position.x, position.y, 1, 'red');
    });
}
