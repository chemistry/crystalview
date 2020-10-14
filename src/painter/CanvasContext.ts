export class CanvasContext {

    private context: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
    }

    public save() {
        this.context.save();
    }
    public restore() {
      this.context.restore();
    }

    public center() {
        const ctx = this.context;
        // Change coordinates; so (0,0) :: now corespond to coordinate center
        ctx.translate(this.getCenterX(), this.getCenterY());
    }

    public getCenterX(): number {
        return (this.context.canvas.width / 2);
    }

    public getCenterY(): number {
        return (this.context.canvas.height / 2);
    }

    public clear(bgcolor: string) {
        const ctx = this.context;
        const width = (this.context.canvas.width);
        const height = (this.context.canvas.height);

        ctx.fillStyle = bgcolor;
        ctx.fillRect(0, 0, width, height);
    }

    public circle(x: number, y: number, r: number, color: string) {
        const ctx = this.context;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    public line(x1: number, y1: number, x2: number, y2: number, color: string) {
        const ctx = this.context;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    public linedashed(x1: number, y1: number, x2: number, y2: number, color: string, dash: number[]) {
        const ctx = this.context;

        ctx.save();
        if (ctx.setLineDash) {
            ctx.setLineDash(dash);
        }

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();

        this.restore();
    }

    public text(text: string, x: number, y: number, color: string, font: string) {
        const ctx = this.context;
        ctx.font = font;
        ctx.fillStyle = color;

        ctx.fillText(text, x, y);
    }

}
