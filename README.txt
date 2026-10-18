GARAGE — Offline Car Maintenance Tracker

Open index.html in an iPhone HTML viewer or a browser that executes local JavaScript.
Keep bootstrap.min.css in the same folder as index.html.
The iOS Files app preview may not run JavaScript.

All data is saved in localStorage when supported by the viewer/browser.
Storage can be lost if the viewer or iOS clears website data, or if you change viewers.
Use Settings & backup > Export JSON backup frequently and save it to Files.
Import replaces current data. CSV export contains service history only.

No network requests, accounts or servers are needed.

V3 workshop services and other costs
Each maintenance record can contain multiple workshop jobs, alongside Items & products.
Each job has a name, workshop, address, date, original/paid price, and notes.
Other costs contain a name, the entity paid, and original/discounted prices.
The final cost sums products, workshop jobs, and other costs.

JSON backups include version: 3 and use garage-backup-v3-YYYY-MM-DD.json.
V1 and v2 JSON backups remain importable and are never modified.
Each v1 service's workshop details become its first nested workshop service.
Each existing delivery fee becomes the first Other costs entry named Delivery fees.
The entity is initially blank because earlier records did not store who was paid.
Migration preserves totals and does not duplicate entries on subsequent loads.

Existing browser data migrates automatically into garage-tracker-v3, preferring
v2 data over v1 when both exist. The original v1 and v2 storage is kept.
No reimport is needed when opening the updated app in the same browser.
CSV exports include workshop services and other costs as JSON and their totals.

Run migration and workflow checks with: node --test tests/workshop-services.test.cjs
