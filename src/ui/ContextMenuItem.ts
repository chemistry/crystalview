export class ContextMenuItem {

    private type: string;
    private title: string;
    private isChecked: () => void;
    private command: (event: any) => void;

    private view: any;
    private checkbox: any;

    constructor(options: { type: string, title: string, isChecked?: () => void, command?: (event: any) => void }) {
        this.type = options.type;
        this.title = options.title;
        this.isChecked = options.isChecked;
        this.command = options.command;
    }

    public onDestroy() {
        if (this.view) {
            this.view.remove();
        }
    }

    public getView(): any {
        if (this.view) {
            return this.view;
        }

        if (this.type === "delimer" || this.title === "----") {
            const view = $('<div class="jcmolview-dropdown-divider"></div>');
            this.view = view;
            return view;
        }

        if (this.type === "item" ) {
            const view = $('<a class="jcmolview-dropdown-item"></a>');
            view.text(this.title || "");
            this.view = view;

            this.view.on("click", (event: any) => {
                if (this.command) {
                    this.command(event);
                }
            });
            return view;
        }

        if (this.type === "checkbox") {
            const view = $('<div class="jcmolview-dropdown-item"></div>');
            view.text(this.title || "");
            this.checkbox = $('<input type="checkbox" checked />');
            this.updateCheckBox();
            view.prepend(this.checkbox);

            view.on("click", (event: any) => {
                if (this.command) {
                    this.command(event);
                }
                this.updateCheckBox();
            });

            this.view = view;
            return view;
        }

        return $("<div></div>");
    }

    private updateCheckBox() {
        if (this.isChecked && this.checkbox) {
            const checked = !!this.isChecked();

            this.checkbox.prop("checked", checked);
        }
    }
}
