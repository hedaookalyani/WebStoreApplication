namespace config;

using { cuid, managed } from '@sap/cds/common';

entity Stores : cuid, managed {
  name             : String(80);
  companyCode         : String(4);
  salesOrg            : String(4);
  distributionChannel : String(2);
  division            : String(2);
  active              : Boolean default true;

  settings : Composition of many StoreSettings
               on settings.store = $self;
}


entity StoreSettings : cuid, managed 
  {
  store     : Association to Stores;
  storeName : String(80);
  attribute : String(60);
  value     : String(255);
  key1        : String(60);    // e.g. Document Type (SHIPMENT, ORDER, QUOTE)
  key2        : String(60);    // e.g. Sales Doc. Type (LF, ZLF, ZOR...)
  key3        : String(60);    // e.g. Output Type (LD00...)
  isDefault   : Boolean default false;

}
