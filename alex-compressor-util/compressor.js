/* All document processing is local. A fresh worker releases native PDF memory after each file. */
globalThis.AlexCompressor = (() => {
  const workerURL = new URL('pdf-compression-worker.mjs', document.currentScript.src);
  let queue = Promise.resolve();
  const api = {
    version: 2,
    async compress(blob, type = blob.type) {
      if (type === 'application/pdf') {
        const run = queue.then(() => api.compressPdf(blob));
        queue = run.catch(() => {});
        return run;
      }
      if (!['image/jpeg', 'image/webp'].includes(type)) return blob;
      const image = await createImageBitmap(blob), canvas = document.createElement('canvas');
      try {
        const scale = Math.min(1, 2000 / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        const result = await new Promise((resolve, reject) => canvas.toBlob(result =>
          result?.type === type ? resolve(result) : reject(Error('Unsupported image encoding.')), type, 0.5));
        return result.size < blob.size ? result : blob;
      } finally { image.close(); canvas.width = canvas.height = 0; }
    },
    async compressPdf(blob) {
      const bytes = await blob.arrayBuffer();
      return new Promise((resolve, reject) => {
        const worker = new Worker(workerURL, {type: 'module'});
        const finish = (error, output) => {
          clearTimeout(timer); worker.terminate();
          error ? reject(error) : resolve(new Blob([output], {type: 'application/pdf'}));
        };
        const timer = setTimeout(() => finish(Error('PDF compression timed out.')), 180000);
        worker.onmessage = ({data}) => {
          if (data.ready) { worker.postMessage(bytes, [bytes]); return; }
          data.error ? finish(Error(data.error)) : finish(null, data.bytes);
        };
        worker.onerror = () => finish(Error('PDF engine could not load. Serve the complete alex-compressor-util folder over HTTP(S).'));
        worker.onmessageerror = () => finish(Error('Could not read the PDF engine result.'));
      });
    }
  };
  return api;
})();
