sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, Fragment, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("webstore.webstore.controller.View1", {
        onInit() {

        },
        onAfterRendering: function () {
            const oTable = this.byId("storesTable");

            // update count when data comes
            oTable.attachUpdateFinished(this._updateStoreCount, this);

            // first call also
            this._updateStoreCount();
        },

        onSearch(oEvent) {
            const sQuery = (oEvent.getParameter("newValue") || oEvent.getParameter("query") || "").trim();
            const oTable = this.byId("storesTable");
            const oBinding = oTable.getBinding("items");
            if (!oBinding) return;

            const aFilters = [];
            if (sQuery) {
                aFilters.push(new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery));
            }
            oBinding.filter(aFilters);
        },

        _updateStoreCount() {
            const oTable = this.byId("storesTable");
            const oBinding = oTable.getBinding("items");
            if (!oBinding) return;

            const iCount = oBinding.getLength(); // server-side length (may be growing as pages load)
            this.byId("storesTitle").setText(`Stores (${iCount})`);
        },
        _oCreateDialog: null,

        onCreateStore: async function () {
            const oView = this.getView();
            const oUI = oView.getModel("ui");
            oUI.setProperty("/newStoreName", "");
            oUI.setProperty("/companyCode", "");
            oUI.setProperty("/salesOrg", "");
            oUI.setProperty("/distChan", "");
            oUI.setProperty("/divsion", "");
            if (!this._oCreateDialog) {
                this._oCreateDialog = await Fragment.load({
                    id: oView.getId(),
                    name: "webstore.webstore.view.fragments.CreateStoreDialog",
                    controller: this
                });
                oView.addDependent(this._oCreateDialog);
            }
            this._oCreateDialog.open();
        },

        onCancelCreateStore: function () {
            this._oCreateDialog.close();
        },
        onConfirmCreateStore: async function () {
            const oView = this.getView();
            const oModel = oView.getModel();
            const sName = (oView.getModel("ui").getProperty("/newStoreName") || "").trim();
            const sCompanyCode = (oView.getModel("ui").getProperty("/companyCode") || "").trim();
            const sSalesOrg = (oView.getModel("ui").getProperty("/salesOrg") || "").trim();
            const sDistch = (oView.getModel("ui").getProperty("/distChan") || "").trim();
            const sDivsion = (oView.getModel("ui").getProperty("/divsion") || "").trim();
            if (!sName) {
                MessageBox.warning("Please enter a store name");
                return;
            }

            try {
                const oTable = this.byId("storesTable");
                const oListBinding = oTable.getBinding("items");
               // 1) create transient context (queued in updateGroupId "changes")
                const oCtx = oListBinding.create({
                    name: sName,
                    companyCode: sCompanyCode,
                    salesOrg: sSalesOrg,
                    distributionChannel: sDistch,
                    division: sDivsion,
                    active: true
                });
              // 2) send batch (this is REQUIRED with updateGroupId:"changes")
                await oModel.submitBatch("changes");

             // 3) now wait until the created context is persisted
                await oCtx.created();

                oListBinding.refresh();

                this._oCreateDialog.close();
                oView.getModel("ui").setProperty("/newStoreName", "");

                MessageToast.show("Store created");
            } catch (e) {
                MessageBox.error(e.message || "Create failed");
            }
        },


        onDeleteStore: async function () {
            const oTable = this.byId("storesTable");
            const aItems = oTable.getSelectedItems();   // sap.m.ColumnListItem[]

            if (!aItems.length) {
                sap.m.MessageToast.show("Select at least one store to delete.");
                return;
            }

            const oModel = this.getView().getModel();

            try {
                aItems.forEach((oItem) => {
                    const oCtx = oItem.getBindingContext(); // default OData V4 model
                    if (oCtx) {
                        oCtx.delete("changes"); // uses updateGroupId = $auto (your manifest)
                    }
                });

                await oModel.submitBatch("changes");

                oTable.removeSelections(true);
                sap.m.MessageToast.show("Deleted selected store(s).");

            } catch (e) {
                sap.m.MessageBox.error(e.message || "Delete failed");
            }
        },


        onSave: async function () {
            const oModel = this.getView().getModel();
            try {
                await oModel.submitBatch("changes");
                MessageToast.show("Saved");
            } catch (e) {
                MessageBox.error(e.message || "Save failed");
            }
        },
        onStorePress: function (oEvent) {
            const oItem = oEvent.getSource().getParent(); // ColumnListItem
            const oCtx = oItem.getBindingContext();
            const sId = oCtx.getProperty("ID");

            this.getOwnerComponent().getRouter().navTo("store", { ID: sId });
        }
    });
});