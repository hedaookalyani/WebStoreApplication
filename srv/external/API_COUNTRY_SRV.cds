/* checksum : 97e9577c30081c8eaabc2b57ae2b090f */
@cds.external : true
@m.IsDefaultEntityContainer : 'true'
@sap.message.scope.supported : 'true'
@sap.supported.formats : 'atom json xlsx'
service API_COUNTRY_SRV {
  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.content.version : '1'
  entity A_Country {
    @sap.display.format : 'UpperCase'
    @sap.label : 'Country/Region Key'
    key Country : String(3) not null;
    @sap.display.format : 'UpperCase'
    @sap.label : 'Reporting Currency'
    @sap.semantics : 'currency-code'
    CountryCurrency : String(5);
    @sap.display.format : 'UpperCase'
    @sap.label : 'Index-Based Currency'
    @sap.quickinfo : 'Currency Key of the Index-Based Currency'
    @sap.semantics : 'currency-code'
    IndexBasedCurrency : String(5);
    @sap.display.format : 'UpperCase'
    @sap.label : 'Hard Currency'
    @sap.quickinfo : 'Currency Key of the Hard Currency'
    @sap.semantics : 'currency-code'
    HardCurrency : String(5);
    @sap.display.format : 'UpperCase'
    @sap.label : 'Procedure'
    @sap.quickinfo : 'Procedure (Pricing, Output Control, Acct. Det., Costing,...)'
    TaxCalculationProcedure : String(6);
    @sap.display.format : 'UpperCase'
    @sap.label : 'ISO Code 3 Char'
    @sap.quickinfo : 'ISO Country/Region Code 3 Characters'
    CountryThreeLetterISOCode : String(3);
    @sap.display.format : 'NonNegative'
    @sap.label : 'ISO Code Num. 3'
    @sap.quickinfo : 'ISO Country/Region Code Numeric 3-Characters'
    CountryThreeDigitISOCode : String(3);
    to_Text : Association to many A_CountryText {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.content.version : '1'
  entity A_CountryText {
    @sap.display.format : 'UpperCase'
    @sap.label : 'Country/Region Key'
    key Country : String(3) not null;
    @sap.label : 'Language Key'
    key Language : String(2) not null;
    @sap.label : 'Country/Region Name'
    CountryName : String(50);
    @sap.label : 'Nationality'
    NationalityName : String(15);
    @sap.label : 'Nationality (Long)'
    @sap.quickinfo : 'Nationality (Max. 50 Characters)'
    NationalityLongName : String(50);
    to_Country : Association to A_Country {  };
  };
};

