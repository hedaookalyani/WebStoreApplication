sap.ui.define([
    "sap/ui/core/UIComponent",
    "webstore/webstore/model/models",
    "sap/ui/model/json/JSONModel"
], (UIComponent, models, JSONModel) => {
    "use strict";

    return UIComponent.extend("webstore.webstore.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {

            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();
            // model for dialog input
            this.setModel(new JSONModel({
                newStoreName: "",
                newAttrKey: "",
                newAttrValue: ""
            }), "ui");

           
        }
    });
});