const cds = require("@sap/cds");

module.exports = (srv) => {

  const { SELECT } = cds.ql;

  srv.on("READ", "CountryVH", async (req) => {
    const s4 = await cds.connect.to("API_COUNTRY_SRV");

    // get top from request if present, else default
    const top = req.query?.SELECT?.limit?.rows?.val ?? 200;

    // Fetch more than needed to allow dedupe (buffer)
    const q = SELECT.from("API_COUNTRY_SRV.A_CountryText")
      .columns("Country", "CountryName", "Language")
      .where({ Language: "EN" })
      .limit(top + 300);
    const rows = await s4.run(q);

    // Dedupe by Country + remove blanks
    const seen = new Set();
    const result = [];

    for (const r of rows) {
      const country = r.Country;
      const name = (r.CountryName || "").trim();
      if (!country || !name) continue;
      if (seen.has(country)) continue;
      seen.add(country);
      result.push({ Country: country, CountryName: name });
      if (result.length >= top) break;
    }

    return result;
  });

  const { Stores, StoreSettings } = srv.entities;
  srv.before(["CREATE", "UPDATE"], StoreSettings, async (req) => {
    const tx = cds.tx(req);

    // 1) Resolve store id from payload (CREATE usually has it; UPDATE often not)
    let storeId =
      req.data.store_ID ||
      req.data.storeId ||
      (req.data.store && req.data.store.ID) ||
      req.data.store;

    // If UPDATE doesn't carry store info, read it from DB using the row ID
    if (!storeId && req.data.ID) {
      const existing = await tx.run(
        SELECT.one.from(StoreSettings).columns("store_ID").where({ ID: req.data.ID })
      );
      storeId = existing?.store_ID;
    }

    if (!storeId) return;

    // 2) Always populate storeName from Stores.name
    const store = await tx.run(
      SELECT.one.from(Stores).columns("name").where({ ID: storeId })
    );
    if (store?.name) req.data.storeName = store.name;

    // 3) Uniqueness checks
    let { attribute, value, ID, key1, key2 } = req.data;

    // Normalize (optional but recommended)
    attribute = (attribute || "").trim();
    value = (value ?? "").toString().trim();
    key1 = (key1 ?? "").toString().trim();
    key2 = (key2 ?? "").toString().trim();

    // Only validate when it makes sense
    if (!attribute || value === "") return;

    // For DOCUMENT_TYPE: allow multiple same value (ORDER), but prevent exact duplicates
    // uniqueness: (store, attribute, value, key1, key2)
    // For others: keep old uniqueness: (store, attribute, value)
    const where =
      attribute === "DOCUMENT_TYPE"
        ? { store_ID: storeId, attribute, value, key1, key2 }
        : { store_ID: storeId, attribute, value };

    let q = SELECT.one.from(StoreSettings).columns("ID").where(where);

    // On UPDATE: ignore the current row
    if (ID) q = q.and({ ID: { "!=": ID } });

    const exists = await tx.run(q);

    if (exists) {
      if (attribute === "DOCUMENT_TYPE") {
        req.error(
          400,
          `Mapping already exists for this store: '${value}' + '${key1}' + '${key2}'.`
        );
      } else {
        req.error(
          400,
          `Setting already exists for this store: attribute '${attribute}' with value '${value}'.`
        );
      }
    }
  });
};
