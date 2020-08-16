import { createSlice } from '@reduxjs/toolkit';
import { SpaceGroup } from "@chemistry/space-groups";

const moleculeSlice = createSlice({
    name: 'molecule',
    initialState: {
        cell: {
            "a": 1,
            "b": 1,
            "c": 1,
            "alpha": 90,
            "beta": 90,
            "gamma": 90,
            "sg": 'P 1'
        },
        details: {
            "id": 1000004,
            "wRref": "",
            "wRobs": "",
            "Robs": "",
            "Rall": "",
            "calcformula": "",
            "formula": "",
            "chemname": "",
            "commonname": "",
            "wavelength": "",
            "radType": "",
        },
        atoms: [{
            type: '',
            label: '',
            x: 0,
            y: 0,
            z: 0,
            occupancy: 0,
            uiso: 0,
        }],
        error: ''
    },
    reducers: {
        loadMolecule: (state, action) => {
            const data: any = action.payload;

            const a  = parseFloat((data as any)["a"]);
            const b = parseFloat((data as any)["b"]);
            const c = parseFloat((data as any)["c"]);
            const alpha = parseFloat((data as any)["alpha"]);
            const beta = parseFloat((data as any)["beta"]);
            const gamma = parseFloat((data as any)["gamma"]);

            if (!isFinite(a) || !isFinite(b) || !isFinite(c) || !isFinite(alpha) || !isFinite(beta) || !isFinite(gamma)) {
                state.error = "Wrong Unit Cell Params";
                return;
            }

            if (!(data as any)["sgHall"] && !(data as any)["sg"]) {
                state.error = "Space Group is not provided";
                return;
            }

            let spaceGroup = null;
            if ((data as any)["sgHall"]) {
                spaceGroup = SpaceGroup.getByHallName((data as any)["sgHall"]);
            }
            if (! spaceGroup && (data as any)["sg"]) {
                spaceGroup = SpaceGroup.getByHMName((data as any)["sg"]);
            }

            if (!spaceGroup) {
                state.error = 'Space Group not founnd';
                return;
            }
            const hmName = spaceGroup['hm'];

            const {
                id ='', wRref= '', wRobs = '', Robs ='', Rall='', calcformula= '',
                formula= '', chemname ='', commonname ='', wavelength ='', radType =''
            } = data;
            state.details = {
                id, wRref, wRobs, Robs, Rall, calcformula,
                formula, chemname, commonname, wavelength, radType
            }

            state.cell = {
                a,
                b,
                c,
                alpha,
                beta,
                gamma,
                sg: hmName
            }

            const coordLoop = extractCoordLoop(data);

            let newAtoms: Array<{ type: string, label: string, x: number,
                y: number, z: number, occupancy: number, uiso: number /*, assembly: string, group: string */}> = [];
            if (coordLoop && coordLoop.length) {
                newAtoms = remapCoordLoop(coordLoop[0]);
            }
            state.atoms = newAtoms;
        }
    }
});

function extractCoordLoop(data: any): any[] {
    let atomLoop = [];
    if (Array.isArray(data.loops)) {
        const loops = (data.loops) as any[];
        atomLoop = loops.filter((loopItem) => {
            return loopItem.columns.indexOf("_atom_site_fract_x") !== -1;
        });
    }
    return atomLoop;
}

function remapCoordLoop(data: any): Array<{ type: string, label: string, x: number,
    y: number, z: number, occupancy: number, uiso: number /*, assembly: string, group: string */}> {
    const colsMap = {
        _atom_site_U_iso_or_equiv: -1,
        _atom_site_disorder_assembly: -1,
        _atom_site_disorder_group: -1,
        _atom_site_fract_x: -1,
        _atom_site_fract_y: -1,
        _atom_site_fract_z: -1,
        _atom_site_label: -1,
        _atom_site_occupancy: -1,
        _atom_site_type_symbol: -1,
    } as any;

    // Set position
    Object.keys(colsMap).forEach((key) => {
          colsMap[key] = data.columns.indexOf(key);
    });

    function getData(code: string, row: any): string {
        if (typeof colsMap[code] === "number" && colsMap[code] !== -1 ) {
            return row[colsMap[code]];
        }
    }

    function getDataNum(code: string, row: any, defaultValue: number): number {
        const valueStr = getData(code, row);
        const value = parseFloat(valueStr);

        if (!isFinite(value)) {
            return defaultValue;
        }
        return value;
    }

    let atomRows = [];
    if (Array.isArray(data.data)) {
        atomRows = data.data.map((row: any) => {

            const type  = getData("_atom_site_type_symbol", row) || "Q";

            return {
                // assembly: getData("_atom_site_disorder_assembly", row) || "",
                // group: getData("_atom_site_disorder_group", row) || "",
                label: getData("_atom_site_label", row) || type,
                occupancy: getDataNum("_atom_site_occupancy", row, 1),
                type,
                uiso:  getDataNum("_atom_site_U_iso_or_equiv", row, 0),
                x: getDataNum("_atom_site_fract_x", row, 0),
                y: getDataNum("_atom_site_fract_y", row, 0),
                z: getDataNum("_atom_site_fract_z", row, 0),
            };
        });
    }

    return atomRows;
}


export const { loadMolecule } = moleculeSlice.actions;

export const moleculeReducer =  moleculeSlice.reducer;
