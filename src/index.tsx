import * as React from 'react';

export const CrystalView = ({ appState, onChange }) => {
    const ref = React.useRef();
    return (
        <div style={{"background-color": '#2b303b', "dispaly": "block"}} className="crystal-view">
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

export const CrystalViewState = {
    createEmpty: () => {
        return {}
    }
}
