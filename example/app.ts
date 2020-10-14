import { Mol3DView }  from '../src/mol3dview';
import structure from './1518815';
// import structure from './1000009';

$(() => {
    let viewer = new Mol3DView({
        bgcolor: "#2b303b"
    });
    var element = document.getElementById('app');
    viewer.append(element);
    viewer.onInit();

    try {
        viewer.load(structure);
        // viewer.addUnique();
    } catch(e) {
    }
});
