"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var molview_1 = require("../src/molview");
var _1000009_1 = require("./1000009");
$(function () {
    var viewer = new molview_1.default({
        bgcolor: "#2b303b"
    });
    var element = document.getElementById('app');
    viewer.append(element);
    viewer.onInit();
    try {
        viewer.load(_1000009_1.default);
    }
    catch (e) {
    }
});
//# sourceMappingURL=app.js.map