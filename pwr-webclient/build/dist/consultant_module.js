"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Card_1 = require("material-ui/Card");
var Consultant = (function (_super) {
    __extends(Consultant, _super);
    function Consultant() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Consultant.prototype.render = function () {
        return React.createElement(Card_1.Card, null);
    };
    return Consultant;
}(React.Component));
exports.default = Consultant;
//# sourceMappingURL=consultant_module.js.map