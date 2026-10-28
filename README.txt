GARAGE — Offline Car Maintenance Tracker

Open the website in a modern browser, or open index.html in a browser that
supports local JavaScript and browser storage. Keep bootstrap.min.css, logo.png,
version.js and the complete alex-compressor-util/ folder beside index.html. Serve over
HTTP(S) for PDF compression.

Records and attached documents are saved in IndexedDB in the current browser.
Existing localStorage records migrate automatically; no reimport is needed.
Original localStorage data is left intact, but subsequent changes use IndexedDB.
Browsers without IndexedDB can still manage records using localStorage;
document attachments require IndexedDB.

Data stays in the current browser for this website and does not sync between
devices. Clearing browser data removes saved records and documents.
Use Settings > Export JSON backup regularly and keep the downloaded file.

DOCUMENTS
Add or edit a service, then choose files under Documents. Attachments are optional
and multiple files can be selected together. Supported formats are PDF, JPG, PNG
and WebP. Each file can be up to 30 MB, with up to 20 files per service and 100 MB
of original document data across all services.

Files are copied into browser storage when the service is saved. Removing a file
in the editor takes effect only after saving. Leaving without saving preserves
existing attachments. Deleting a service also removes its stored documents.
Download files from the Documents section in the service detail view.

PDFs use the MuPDF native engine in a local WebAssembly worker. Images are
re-encoded at 50% JPEG quality and downsampled to at most 2000 pixels on the
longest side. The engine decodes PDF color spaces and image codecs, retains
transparency masks, compresses streams and removes duplicate/unused resources.
PDF text, links and page layout remain intact. Signed/password-protected PDFs
are kept unchanged. Results depend on the document, its resolution and content;
there is no fixed reduction ratio or guarantee of matching PDF24 byte for byte.
JPEG and WebP uploads also use 50% quality. PNG uploads stay unchanged.
Results are retained only when smaller. Downloads contain the saved, possibly
lossy file; keep originals separately. Attachments from the earlier compressor
are upgraded automatically when read/exported, without reattachment. Current
results are marked with an engine version to prevent repeated quality loss.
Saved and original upload sizes are shown separately. Limits use original size.
Compression failures block saving/export and display an error. PDFs containing
images above 64 megapixels exceed the worker's processing limit. PDF processing
requires HTTP(S), browser module workers and WebAssembly; file:// is unsupported.
The engine is bundled in alex-compressor-util/vendor/mupdf (four files, about
10 MB), loaded only for PDF processing. Documents never leave the browser. Engine memory is released
after each file and files are processed sequentially.

A SHA-256 hash of the saved file bytes is stored alongside each attachment and
included once per document in JSON backups. The hash is checked before
downloading, exporting or restoring a hashed document.
Mismatches block the operation. Older files without a hash gain one when next
read or restored; this establishes a baseline from their current contents.
Document operations require browser Web Crypto support (HTTPS or a supported
local-file browser). Hashes detect content corruption, not the authenticity of
a backup whose contents and hashes have both been deliberately changed.

BACKUPS
A JSON backup contains every record and the actual contents of all attached
documents. Importing that single file restores the records and documents together.
Documents are compressed when smaller, then encoded as Base64 text in the backup.
Base64 adds approximately one third to the stored binary size, so overall backup
savings depend on how well the original document compresses. Existing uncompressed
attachments are also compressed when exporting, without requiring reattachment.
Import replaces current records and documents after confirmation. Invalid or
incomplete document data is rejected before replacement. A storage failure rolls
back the entire replacement. Backups can be up to 200 MB.

Record-only backups remain importable. Older attachment compression formats
are rejected. Restoring a backup with no attachments removes existing documents. New backups include
an updated internal format identifier so older app versions cannot silently
import records while losing their files. Backup filenames use
garage-bckp-YYYYMMDD-HHmm.json, using the device's local date and time at export
(24-hour hours and minutes).

CSV exports contain service data, workshop services and other costs, but do not
contain attached documents. Use JSON for a complete backup.

WORKSHOP SERVICES AND OTHER COSTS
Each maintenance record can contain multiple workshop jobs, alongside Items &
products. Each job has a name, workshop, address, date, prices and notes.
Other costs contain a name, the entity paid, and original/discounted prices.
The final cost sums products, workshop jobs and other costs. Existing records
migrate without changing their totals.

No accounts or backend services are needed. The PDF library loads from the same
website or local folder; documents stay in the browser.

DEVELOPMENT CHECKS
With Node.js 18 or later, run npm ci and then npm test.
The bundled engine is MuPDF.js 1.28.1, licensed under AGPL-3.0-or-later.
The license and source/build provenance are documented in
alex-compressor-util/vendor/mupdf/LICENSE and alex-compressor-util/vendor/README.txt.
The app uses local workers; no server compressor is needed.

The test-only fake-indexeddb dependency exercises Blob persistence, transaction
rollback, migration and complete backup restoration. It is not loaded by the app.

REUSABLE COMPRESSION MODULE
All compression code, worker modules, native engine assets, licenses and portable
tests live in alex-compressor-util/. Copy that folder into another app and follow
alex-compressor-util/README.md. Garage owns attachment storage, hashing, backup
formats and migration; the compressor has no dependency on those features.

Large sample PDFs are optional regression fixtures. Place 20MB-TESTFILE.ORG.pdf
and 5-mb-example-file.pdf in tests/fixtures/pdf/, or set GARAGE_PDF_FIXTURES_DIR
to a folder containing them when running npm test. They are not needed to copy
or test the reusable module.
