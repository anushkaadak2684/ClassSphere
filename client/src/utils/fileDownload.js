/**
 * Universal file download utility that fetches remote cross-origin assets
 * as binary blobs to guarantee proper filename, extension, and content type.
 *
 * @param {string} url - The remote or Cloudinary file URL
 * @param {string} fallbackFilename - Filename with extension (e.g. "Assignment_1.pdf")
 */
export const downloadFile = async (url, fallbackFilename = 'downloaded_file') => {
  if (!url) {
    console.error('[Download Helper] No URL provided for download.');
    return;
  }

  try {
    // If the URL already contains a valid PDF or binary resource, fetch as blob
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;

    // Determine download filename
    let downloadName = fallbackFilename;
    if (!downloadName.includes('.')) {
      // Try to infer extension from mime type
      if (blob.type === 'application/pdf') {
        downloadName += '.pdf';
      } else if (blob.type === 'application/zip') {
        downloadName += '.zip';
      } else if (blob.type.startsWith('image/png')) {
        downloadName += '.png';
      } else if (blob.type.startsWith('image/jpeg')) {
        downloadName += '.jpg';
      }
    }

    a.download = downloadName;
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 200);
  } catch (error) {
    console.warn('[Download Helper Fallback] Blob fetch failed, opening directly:', error);
    const fallbackLink = document.createElement('a');
    fallbackLink.href = url;
    fallbackLink.target = '_blank';
    fallbackLink.rel = 'noopener noreferrer';
    fallbackLink.download = fallbackFilename;
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    setTimeout(() => {
      document.body.removeChild(fallbackLink);
    }, 200);
  }
};

export default downloadFile;
