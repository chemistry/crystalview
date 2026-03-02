import { Mol3DView } from '@chemistry/crystalview';
import { STRUCTURE_1518815, STRUCTURE_1000009 } from './data/structures.ts';
import './styles.css';

let viewer: Mol3DView | null = null;

function initViewer() {
  const container = document.getElementById('viewer')!;
  container.innerHTML = '';

  viewer = new Mol3DView({ bgcolor: '#2b303b' });
  viewer.append(container);
  viewer.onInit();
}

function loadStructure(structure: object) {
  if (!viewer) {
    initViewer();
  }
  try {
    viewer!.load(structure);
  } catch (e) {
    console.error('Failed to load structure:', e);
  }
}

function setActiveButton(activeId: string) {
  document.querySelectorAll('.actions button').forEach((btn) => {
    btn.classList.remove('active');
  });
  document.getElementById(activeId)?.classList.add('active');
}

document.getElementById('btn-1518815')!.addEventListener('click', () => {
  loadStructure(STRUCTURE_1518815);
  setActiveButton('btn-1518815');
});

document.getElementById('btn-1000009')!.addEventListener('click', () => {
  loadStructure(STRUCTURE_1000009);
  setActiveButton('btn-1000009');
});

// Load default structure
loadStructure(STRUCTURE_1518815);
setActiveButton('btn-1518815');
