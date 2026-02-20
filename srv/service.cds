using {config as db} from '../db/schema';

using { API_COUNTRY_SRV as external } from './external/API_COUNTRY_SRV';
@requires: 'Read'
service ConfigService {
  entity Stores        as projection on db.Stores;
  entity StoreSettings as projection on db.StoreSettings;
  entity StoreCapabilities as projection on db.StoreCapabilities;
  entity CountryVH as select from external.A_Country as c
    left join external.A_CountryText as t
      on  t.Country = c.Country
      and t.Language = 'EN'
  {
      key c.Country     as Country,
          max(t.CountryName) as CountryName : String(60),
          'v2_join' as DeployedMarker : String(20)
  }
  where t.CountryName is not null
    and t.CountryName <> ''
    group by c.Country ;
}
