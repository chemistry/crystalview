export interface Painter {
    clear: (backgroundColor: string) => void;
    center: () => void;
    circle: (x: number, y: number, r: number, color: string) => void;
    line: (x1: number, y1: number, x2: number, y2: number, color: string) => void;
}

export function getPainter(context: CanvasRenderingContext2D): Painter {
    const save = () => {
        context.save();
    }
    const restore = () => {
        context.restore();
    }

    const getCenterY = (): number => {
        return (context.canvas.height / 2);
    }
    const getCenterX = (): number  => {
        return (context.canvas.width / 2);
    }

    const center = () => {
        context.translate(getCenterX(),getCenterY());
    }

    const clear = (backgroundColor: string) => {
        const width = (context.canvas.width);
        const height = (context.canvas.height);

        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, width, height);
    }

    const circle = (x: number, y: number, r: number, color: string) => {
        context.beginPath();
        context.arc(x, y, r, 0, 2 * Math.PI, true);
        context.closePath();
        context.fillStyle = color;
        context.fill();
    }

    const line = (x1: number, y1: number, x2: number, y2: number, color: string)=> {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = color;
        context.lineWidth = 1;
        context.stroke();
    }

    return {
        clear,
        center,
        circle,
        line
    }
}
