sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/UIComponent",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], function (Controller, UIComponent, MessageToast, MessageBox, JSONModel) {
  "use strict";

  return Controller.extend("webstore.webstore.controller.Store", {
    onBeforeRendering: function () {

    },
    onInit() {
      this.getOwnerComponent().getRouter()
        .getRoute("store")
        .attachPatternMatched(this._onMatched, this);
      this.getView().setModel(new JSONModel({
        general: {
          DEFAULT_COUNTRY: "",
          DEFAULT_LANGUAGE: "",
          ANON_CUSTOMER: "",
          SUPPORT_QTY_STEP: false,
          ZIP_CODE_VALIDATION: false,
          // Customer tab
          BP_ROLE: "",
          CONT_BP_GRP: "",
          ACCOUNT_GROUP_MAP: "",

          // Pricing tab
          PRC_PROCEDURE: "",

          // Product tab
          WEIGHT_UNIT: "",
          DIMENSION_UNIT: "",
          STOCK_CALCULATION: "",
          CHECK_RULE: "",
          DEFAULT_PLANT_PRD: "",
          DELIVERY_PLANT: "",
          PRODUCT_STORAGE_LOCATION: ""
        }
      }), "vm");
    },

    async _loadSettingsIntoVM() {
      const oView = this.getView();
      const oVM = oView.getModel("vm");
      const oListBinding = this._getSettingsListBinding();

      const aCtx = await oListBinding.requestContexts(0, 999);
      const oCB = this.byId("cbDefaultCountry");
      oCB.setSelectedKey(oVM.getProperty("/general/DEFAULT_COUNTRY"));
      oCB.setValue("");

      const m = {};
      aCtx.forEach(c => {
        const o = c.getObject();
        m[o.attribute] = o.value;
      });

     
      oVM.setProperty("/general/DEFAULT_COUNTRY", m.DEFAULT_COUNTRY || "");
      oVM.setProperty("/general/DEFAULT_LANGUAGE", m.DEFAULT_LANGUAGE || "");
      oVM.setProperty("/general/ANON_CUSTOMER", m.ANON_CUSTOMER || "");
      oVM.setProperty("/general/SUPPORT_QTY_STEP", m.SUPPORT_QTY_STEP === "true");
      oVM.setProperty("/general/ZIP_CODE_VALIDATION", m.ZIP_CODE_VALIDATION === "true");
      // Customer
      oVM.setProperty("/general/BP_ROLE", m.BP_ROLE || "");
      oVM.setProperty("/general/CONT_BP_GRP", m.CONT_BP_GRP || "");
      oVM.setProperty("/general/ACCOUNT_GROUP_MAP", m.ACCOUNT_GROUP_MAP || "");

      // Pricing
      oVM.setProperty("/general/PRC_PROCEDURE", m.PRC_PROCEDURE || "");

      // Product
      oVM.setProperty("/general/WEIGHT_UNIT", m.WEIGHT_UNIT || "");
      oVM.setProperty("/general/DIMENSION_UNIT", m.DIMENSION_UNIT || "");
      oVM.setProperty("/general/STOCK_CALCULATION", m.STOCK_CALCULATION || "");
      oVM.setProperty("/general/CHECK_RULE", m.CHECK_RULE || "");
      oVM.setProperty("/general/DEFAULT_PLANT_PRD", m.DEFAULT_PLANT_PRD || "");
      oVM.setProperty("/general/DELIVERY_PLANT", m.DELIVERY_PLANT || "");
      oVM.setProperty("/general/PRODUCT_STORAGE_LOCATION", m.PRODUCT_STORAGE_LOCATION || "")
    },
    async _onMatched(oEvent) {
      const oView = this.getView();   // ✅ define oView first

      // reset VM
      oView.getModel("vm").setProperty("/general", {
        DEFAULT_COUNTRY: "",
        DEFAULT_LANGUAGE: "",
        ANON_CUSTOMER: "",
        SUPPORT_QTY_STEP: false,
        ZIP_CODE_VALIDATION: false,
        BP_ROLE: "",
        CONT_BP_GRP: "",
        ACCOUNT_GROUP_MAP: "",
        PRC_PROCEDURE: "",
        WEIGHT_UNIT: "",
        DIMENSION_UNIT: "",
        STOCK_CALCULATION: "",
        CHECK_RULE: "",
        DEFAULT_PLANT_PRD: "",
        DELIVERY_PLANT: "",
        PRODUCT_STORAGE_LOCATION: ""
      });

      // UI model
      oView.setModel(new sap.ui.model.json.JSONModel({
        editMode: false,
        editcus: false,
        editPrc: false,
        editOrd: false,
        editOrdLines: false,
        editModePrd: false
      }), "ui");

      const sId = oEvent.getParameter("arguments").ID;

      oView.bindElement({ path: "/Stores('" + sId + "')" });

      // ✅ wait until store context is ready
      await oView.getElementBinding().requestObject();

      // ✅ now load store-specific settings
      await this._loadSettingsIntoVM();
    },

    onNavBack() {
      UIComponent.getRouterFor(this).navTo("list");
    },

    async onSaveSettings() {
      try {
        const oView = this.getView();
        const oModel = oView.getModel();
        const oVM = oView.getModel("vm");

        const oCtx = oView.getBindingContext();
        if (!oCtx) {
          MessageBox.error("No store context bound");
          return;
        }
        const sStoreName = oCtx.getProperty("name");

        //const oListBinding = this._getSettingsListBinding();
        const oListBinding = oModel.bindList(oCtx.getPath() + "/settings", null, null, null, {
          $$updateGroupId: "changes"
        });
        const aCtx = await oListBinding.requestContexts(0, 999);

        const byAttr = {};
        aCtx.forEach(c => {
          const o = c.getObject();
          byAttr[o.attribute] = c;
        });

        const upsert = (attr, val) => {
          const sVal = (typeof val === "boolean") ? String(val) : String(val ?? "");
          const c = byAttr[attr];
          if (c) c.setProperty("value", sVal);
          else oListBinding.create({ storeName: sStoreName, attribute: attr, value: sVal });
        };

        upsert("DEFAULT_COUNTRY", oVM.getProperty("/general/DEFAULT_COUNTRY"));
        upsert("DEFAULT_LANGUAGE", oVM.getProperty("/general/DEFAULT_LANGUAGE"));
        upsert("ANON_CUSTOMER", oVM.getProperty("/general/ANON_CUSTOMER"));
        upsert("SUPPORT_QTY_STEP", oVM.getProperty("/general/SUPPORT_QTY_STEP"));
        upsert("ZIP_CODE_VALIDATION", oVM.getProperty("/general/ZIP_CODE_VALIDATION"));

        await oModel.submitBatch("changes");
        MessageToast.show("Saved");
        oView.getModel("ui").setProperty("/editMode", false);
      } catch (e) {
        MessageBox.error(e?.message || "Save failed");
      }
    },

    onEditSetting() {
      this.getView().getModel("ui").setProperty("/editMode", true);

    },
    onCancelChange: async function () {
      const oView = this.getView();
      const oModel = oView.getModel();

      try {
        oModel.resetChanges("changes"); // ✅ revert pending updates/creates in changes group only
      } catch (e) { }

      await this._loadSettingsIntoVM();
      oView.getModel("ui").setProperty("/editMode", false);
    },

    onDeleteSetting() {
      MessageToast.show("TODO: delete selected setting");
    },
    // Functions for Customer Setting
    onEditAcc() {
      this.getView().getModel("ui").setProperty("/editcus", true);
    },
    async onSaveAcc() {
      try {
        const oView = this.getView();
        const oModel = oView.getModel();
        const oVM = oView.getModel("vm");

        const oCtx = oView.getBindingContext();
        if (!oCtx) {
          MessageBox.error("No store context bound");
          return;
        }
        const sStoreName = oCtx.getProperty("name");

        const oListBinding = this._getSettingsListBinding();
        const aCtx = await oListBinding.requestContexts(0, 999);

        // Build existing map: attribute -> context
        const byAttr = {};
        aCtx.forEach(c => {
          const o = c.getObject();
          byAttr[o.attribute] = c;
        });

        const upsert = (attr, val) => {
          const sVal = (typeof val === "boolean") ? String(val) : String(val ?? "");
          const c = byAttr[attr];
          if (c) c.setProperty("value", sVal);
          else oListBinding.create({ storeName: sStoreName, attribute: attr, value: sVal });
        };
        upsert("BP_ROLE", oVM.getProperty("/general/BP_ROLE"));
        upsert("CONT_BP_GRP", oVM.getProperty("/general/CONT_BP_GRP"));
        upsert("ACCOUNT_GROUP_MAP", oVM.getProperty("/general/ACCOUNT_GROUP_MAP"));

        await oModel.submitBatch("changes");
        MessageToast.show("Saved");
        this.getView().getModel("ui").setProperty("/editcus", false);
      } catch (e) {
        MessageBox.error(e.message || "Save failed");
      }
    },
    async onCancelAcc() {
      const oView = this.getView();
      const oModel = oView.getModel();

      try {
        oModel.resetChanges("changes"); // ✅ revert pending updates/creates in changes group only
      } catch (e) { }

      await this._loadSettingsIntoVM();
      oView.getModel("ui").setProperty("/editcus", false);
    },

    //Functions for Order
    onDocTypeChange: function (oEvent) {
      const oCB = oEvent.getSource();
      const sTyped = (oCB.getValue() || "").trim();

      // Find if typed text matches any item text
      const bValid = oCB.getItems().some(oItem => oItem.getText() === sTyped);

      if (!bValid && sTyped) {
        oCB.setValueState("Error");
        oCB.setValueStateText("Choose one of: ORDER, QUOTATION, RETURN_ORDER");
        // optional: clear invalid entry
        // oCB.setValue("");
        // oCB.setSelectedKey("");
        return;
      }

      // valid
      oCB.setValueState("None");

      // Ensure selectedKey is aligned with typed text (optional but nice)
      const oMatch = oCB.getItems().find(oItem => oItem.getText() === sTyped);
      if (oMatch) {
        oCB.setSelectedKey(oMatch.getKey());
      }
    },

    onEditOty() {
      this.getView().getModel("ui").setProperty("/editOrd", true);
    },

    _getSettingsListBinding: function () {
      const oStoreCtx = this.getView().getBindingContext();
      if (!oStoreCtx) throw new Error("No store context bound");

      return this.getView().getModel().bindList(
        oStoreCtx.getPath() + "/settings",
        null, null, null,
        { $$updateGroupId: "changes" }  // ✅ ensure create/patch go into "changes"
      );
    },

    async onSaveOty() {
      const oView = this.getView();
      const oModel = oView.getModel();

      try {
        const oTable = this.byId("docTypeTable");
        const oBinding = oTable.getBinding("items");

        // Get current contexts (includes created + edited rows in the table)
        const aCtx = await oBinding.requestContexts(0, 999);

        // --- Validation (optional but recommended) ---
        //let bHasDefault = false;

        for (const ctx of aCtx) {
          const o = ctx.getObject();
          if (o.attribute !== "DOCUMENT_TYPE") continue;

          const docType = (o.value || "").trim(); // <-- ComboBox writes into "value"
          const salesTyp = (o.key1 || "").trim();
          const outType = (o.key2 || "").trim();

          if (!docType) {
            sap.m.MessageBox.error("Document Type cannot be empty.");
            return;
          }
          if (!salesTyp) {
            sap.m.MessageBox.error(`Sales Doc. Type cannot be empty for ${docType}.`);
            return;
          }
          if (!outType) {
            sap.m.MessageBox.error(`Output Type cannot be empty for ${docType}.`);
            return;
          }

          //if (o.isDefault) bHasDefault = true;
        }

        // Optional: enforce at least one default
        // if (!bHasDefault) {
        //   sap.m.MessageBox.error("Please select one row as Default.");
        //   return;
        // }

        // --- Persist ALL changes (updates + creates) ---
        await oModel.submitBatch("changes");

        // Turn off edit mode
        oView.getModel("ui").setProperty("/editOrd", false);
        oView.getModel("ui").setProperty("/editOrdLines", false);

        sap.m.MessageToast.show("Saved");
      } catch (e) {
        sap.m.MessageBox.error(e?.message || "Save failed");
      }
    },

    async onCancelOty() {

      const oView = this.getView();
      const oModel = oView.getModel();

      try {
        oModel.resetChanges("changes"); // ✅ revert pending updates/creates in changes group only
      } catch (e) { }

      oView.getModel("ui").setProperty("/editOrd", false);
      oView.getModel("ui").setProperty("/editOrdLines", false);
    },

    onAddDocTypeRow() {
      const oTable = this.byId("docTypeTable");
      const oBinding = oTable.getBinding("items");

      oBinding.create({
        attribute: "DOCUMENT_TYPE",
        value: "",     // Document Type (ComboBox selectedKey)
        key1: "",
        key2: "",
        key3: "",
        isDefault: false
      });
      this.getView().getModel("ui").setProperty("/editOrdLines", true);
      // optional: select the newly created row
    },
    onEditDocTypeRow() {
      const oTable = this.byId("docTypeTable");
      const oItem = oTable.getSelectedItem();
      if (!oItem) {
        sap.m.MessageToast.show("Select a row first");
        return;
      }
      // Inline editing is already controlled by ui>/editMode
      // You can optionally focus first field:
      const aCells = oItem.getCells();
      aCells[0].focus();
      this.getView().getModel("ui").setProperty("/editOrdLines", true);
    },
    async onDeleteDocTypeRows() {
      const oTable = this.byId("docTypeTable");
      const aItems = oTable.getSelectedItems();

      if (!aItems.length) {
        sap.m.MessageToast.show("Select at least one row to delete");
        return;
      }

      // delete selected contexts
      await Promise.all(aItems.map(it => it.getBindingContext().delete("changes")));

      oTable.removeSelections(true);
      sap.m.MessageToast.show("Deleted");
    },
    onDefaultSegChange(oEvent) {
      const oSeg = oEvent.getSource();
      const sKey = oEvent.getParameter("key"); // "YES" or "NO"
      const oCtx = oSeg.getBindingContext();

      const bYes = (sKey === "YES");
      oCtx.setProperty("isDefault", bYes);

      // If YES: ensure only one row is default
      if (bYes) {
        const oTable = this.byId("docTypeTable");
        const aCtx = oTable.getBinding("items").getContexts();

        aCtx.forEach(c => {
          if (c !== oCtx) c.setProperty("isDefault", false);
        });
      }
    },

    //Functions for Product Settings,


    onEditPrd() {
      this.getView().getModel("ui").setProperty("/editModePrd", true);
    },
    async onSavePrd() {
      try {
        const oView = this.getView();
        const oModel = oView.getModel();
        const oVM = oView.getModel("vm");

        const oCtx = oView.getBindingContext();
        if (!oCtx) {
          MessageBox.error("No store context bound");
          return;
        }
        const sStoreName = oCtx.getProperty("name");

        const oListBinding = oModel.bindList(oCtx.getPath() + "/settings", null, null, null, {
          $$updateGroupId: "changes"
        });
        const aCtx = await oListBinding.requestContexts(0, 999);

        const byAttr = {};
        aCtx.forEach(c => {
          const o = c.getObject();
          byAttr[o.attribute] = c;
        });

        const upsert = (attr, val) => {
          const sVal = String(val ?? "");
          const c = byAttr[attr];
          if (c) c.setProperty("value", sVal);
          else oListBinding.create({ attribute: attr, value: sVal }, true);
        };

        upsert("WEIGHT_UNIT", oVM.getProperty("/general/WEIGHT_UNIT"));
        upsert("DIMENSION_UNIT", oVM.getProperty("/general/DIMENSION_UNIT"));
        upsert("STOCK_CALCULATION", oVM.getProperty("/general/STOCK_CALCULATION"));
        upsert("CHECK_RULE", oVM.getProperty("/general/CHECK_RULE"));
        upsert("DEFAULT_PLANT_PRD", oVM.getProperty("/general/DEFAULT_PLANT_PRD"));
        upsert("DELIVERY_PLANT", oVM.getProperty("/general/DELIVERY_PLANT"));
        upsert("PRODUCT_STORAGE_LOCATION", oVM.getProperty("/general/PRODUCT_STORAGE_LOCATION"));

        await oModel.submitBatch("changes");
        MessageToast.show("Saved");
        this.getView().getModel("ui").setProperty("/editModePrd", false);
      } catch (e) {
        MessageBox.error(e.message || "Save failed");
      }
    },
    async onCancelPrd() {
      const oView = this.getView();
      const oModel = oView.getModel();

      try {
        oModel.resetChanges("changes"); // ✅ revert pending updates/creates in changes group only
      } catch (e) { }

      await this._loadSettingsIntoVM();
      oView.getModel("ui").setProperty("/editModePrd", false);

    },

    // Logic for Pricing Procedure
    async onSavePrc() {
      try {
        const oView = this.getView();
        const oModel = oView.getModel();
        const oVM = oView.getModel("vm");

        const oCtx = oView.getBindingContext();
        if (!oCtx) {
          MessageBox.error("No store context bound");
          return;
        }
        const sStoreName = oCtx.getProperty("name");

        //const oListBinding = this._getSettingsListBinding();
        const oListBinding = oModel.bindList(oCtx.getPath() + "/settings", null, null, null, {
          $$updateGroupId: "changes"
        });
        const aCtx = await oListBinding.requestContexts(0, 999);

        const byAttr = {};
        aCtx.forEach(c => {
          const o = c.getObject();
          byAttr[o.attribute] = c;
        });

        const upsert = (attr, val) => {
          const sVal = (typeof val === "boolean") ? String(val) : String(val ?? "");
          const c = byAttr[attr];
          if (c) c.setProperty("value", sVal);
          else oListBinding.create({ storeName: sStoreName, attribute: attr, value: sVal });
        };

        upsert("PRC_PROCEDURE", oVM.getProperty("/general/PRC_PROCEDURE"));

        await oModel.submitBatch("changes");
        MessageToast.show("Saved");
        oView.getModel("ui").setProperty("/editPrc", false);
      } catch (e) {
        MessageBox.error(e?.message || "Save failed");
      }
    },

    onEditPrc() {
      this.getView().getModel("ui").setProperty("/editPrc", true);

    },
    onCancelPrc: async function () {
      const oView = this.getView();
      const oModel = oView.getModel();

      try {
        oModel.resetChanges("changes"); // ✅ revert pending updates/creates in changes group only
      } catch (e) { }

      await this._loadSettingsIntoVM();
      oView.getModel("ui").setProperty("/editPrc", false);
    },

    onCountrySelect: function (oEvent) {
      const oItem = oEvent.getParameter("selectedItem");
      if (!oItem) return;

      // const sCountryName = oItem.getText(); // CountryName
      // this.getView().getModel("vm").setProperty("/general/DEFAULT_COUNTRY", sCountryName);
      const sCountryName = oItem.getText();
      this.getView().getModel("vm").setProperty("/general/DEFAULT_COUNTRY", sCountryName)
    }
  });
});
