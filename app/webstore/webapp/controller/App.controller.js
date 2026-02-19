sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("webstore.webstore.controller.App", {
      onInit() {
        console.log("Controller App Triggered")

         var oAvatar = this.byId("userAvatar");

      if (sap.ushell && sap.ushell.Container) {
        var oUser = sap.ushell.Container.getUser();
        var sFullName = oUser.getFullName();   // Example: "Kalyani Hedaoo"

        var aNames = sFullName.split(" ");
        var sInitials = aNames[0][0] + aNames[1][0];

        oAvatar.setInitials(sInitials);
      }
     }
  });
});