import "./ContextMenu.styles";

import { ContextMenuItem } from "./ContextMenuItem";

export class ContextMenu {

    private static initDone: boolean;
    private static instances: ContextMenu[];
    private static subscription: () => void;

    private static getInstances(): ContextMenu[] {
        return ContextMenu.instances;
    }

    private static init() {
        if (ContextMenu.initDone) {
            return;
        }
        ContextMenu.initDone = true;
        ContextMenu.instances = [];

        // hide all menu on Mouse Click or Esc
        $("body").on("click", ContextMenu.hideAll);
        $("body").on("contextmenu", ContextMenu.hideAll);
        const escHandler = (e: any) => {
            if (e.which === 27) {
                ContextMenu.hideAll();
            }
        };
        $("body").on("keyup", escHandler);

        ContextMenu.subscription = () => {
            $("body").off("click", ContextMenu.hideAll);
            $("body").off("contextmenu", ContextMenu.hideAll);
            $("body").off("keyup", escHandler);
        };
    }

    private static off() {
        if (ContextMenu.instances && ContextMenu.instances.length) {
            return;
        }
        ContextMenu.initDone = false;
        if (ContextMenu.subscription) {
            ContextMenu.subscription();
            ContextMenu.subscription = null;
        }
    }

    // hide all opened context menus
    private static hideAll() {
        for (const menu of ContextMenu.getInstances()) {
            menu.hide();
        }
    }

    private static addInstance(menu: ContextMenu) {
        ContextMenu.instances.push(menu);
    }

    private static removeInstance(menu: ContextMenu) {
        const instances = ContextMenu.instances;
        const idx = instances.indexOf(menu);
        if (idx > -1) {
            instances.splice(idx, 1);
        }
    }

    private widget: JQuery;
    private view: JQuery;
    private intervalID: number;
    private menuItems: ContextMenuItem[];

    constructor(menuItems: ContextMenuItem[]) {
        this.widget = null;
        this.view = null;
        this.menuItems = menuItems;
    }

    public onInit(element: JQuery) {
        ContextMenu.init();
        ContextMenu.addInstance(this);
        this.attach(element);

        this.view = this.getView();
    }

    public onDestroy() {
        ContextMenu.removeInstance(this);
        if (!ContextMenu.getInstances().length) {
            ContextMenu.off();
        }
        if (this.menuItems) {
            this.menuItems.forEach((item) => {
                item.onDestroy();
            });
        }
        this.menuItems = null;
        this.view.remove();

        this.widget = null;
    }

    public hide() {
        if (this.intervalID) {
            clearInterval(this.intervalID);
        }
        this.view.hide();
    }

    public show(posX: number, posY: number) {
        const view = this.view;
        this.widget.append(view);
        view.show();
        view.css({
            left: posX - 8,
            position: "absolute",
            top: posY - 8,
        });

        view.hover(() => {
            if (this.intervalID) {
                clearInterval(this.intervalID);
            }
        }, () => {
            if (this.intervalID) {
                clearInterval(this.intervalID);
            }
            this.intervalID = setTimeout(() => {this.hide(); }, 300);
        });
    }

    private attach(widget: JQuery) {
        this.widget = widget;
        widget.css({
            position: "relative",
        });

        widget.on("contextmenu", (event: any) => {
            event.preventDefault();
            event.stopPropagation();
            const offset = this.widget.offset();
            const x = Math.max(event.clientX - offset.left + $(window).scrollLeft(), 0);
            const y = Math.max(event.clientY - offset.top + $(window).scrollTop(), 0);
            this.show(x, y);
        });
    }

    private getView() {
        if (this.view) {
            return this.view;
        }

        const view = $('<div class="jcmolview-dropdown-menu"></div>');

        this.menuItems.forEach((menuItem) => {
            const itemView = menuItem.getView();
            view.append(itemView);
        });

        return view;
    }
}
