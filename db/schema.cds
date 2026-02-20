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

entity StoreCapabilities : cuid, managed {
  store : Association to Stores;
  storeName : String(80); 
  CultureId                              : Integer;
  CompatibilityLevel                     : String(20);

  SupportsPersistedBaskets               : Boolean;
  SupportsShippingMethods                : Boolean;
  SupportsShippingOrigin                 : Boolean;
  SupportsPromotableQuotes               : Boolean;
  OrderCommentLineMaxLength              : Integer;
  SupportsInvoicePayment                 : Boolean;
  SupportsDocFreeRma                     : Boolean;
  SupportsDocBasedRma                    : Boolean;
  SupportsRmaSplitLines                  : Boolean;
  SupportsRetailOffers                   : Boolean;
  SupportsShippingAddressesManagement    : Boolean;
  SupportsSalesDocumentAttachmentsUpload : Boolean;
  SupportsShippingAddressExtraFields     : Boolean;
  SanaConnectorVersion                   : String(20);
  SupportsDocumentEntityFields           : Boolean;
  SupportsStoreLocations                 : Boolean;
  SupportsSubscriptionOrderIdentification: Boolean;
  SupportsCustomerSpecificProductIds     : Boolean;
  SupportsPaymentCostPercentage          : Boolean;
  SupportsMultiLocationStock             : Boolean;
  SupportsBackorderLines                 : Boolean;
  SupportsCalculatedInfoPerVariant       : Boolean;
  SupportsCheckoutItemLineComments       : Boolean;
  SupportsCheckoutStock                  : Boolean;
  SupportsEstimatedAvailabilityDates     : Boolean;
  SupportsProductDiscounts               : Boolean;
  SupportsFeatures                       : Boolean;
  SupportsStockInfoInventoryPrecision    : Boolean;
  SupportsSalesLineEntityFields          : Boolean;
  SupportsMultipleSalesAgreements        : Boolean;
}
