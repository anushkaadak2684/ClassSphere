const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

/**
 * Upload a memory buffer to Cloudinary using Node.js native Readable stream
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Target folder in Cloudinary
 * @param {string} originalName - Original filename
 * @returns {Promise<{secureUrl: string, publicId: string, resourceType: string, fileSize: number}>}
 */
const uploadBufferToCloudinary = (buffer, folder = 'classsphere_materials', originalName = '') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary is not configured with real credentials, return simulated upload for dev
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your-cloudinary-api-key') {
      console.warn('[Cloudinary Service] Cloudinary credentials not set. Using dev simulated upload.');
      return resolve({
        secureUrl: `https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=60`,
        publicId: `dev_placeholder_${Date.now()}`,
        resourceType: 'auto',
        fileSize: buffer.length,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        public_id: `${Date.now()}_${originalName.replace(/[^a-zA-Z0-9]/g, '_')}`,
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]:', error);
          return reject(error);
        }
        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type || 'raw',
          fileSize: result.bytes || buffer.length,
        });
      }
    );

    // Pipe the buffer into Cloudinary upload stream using native stream.Readable.from
    Readable.from(buffer).pipe(uploadStream);
  });
};

/**
 * Delete an asset from Cloudinary by public ID
 * @param {string} publicId
 * @param {string} resourceType
 * @returns {Promise<object>}
 */
const deleteCloudinaryAsset = async (publicId, resourceType = 'raw') => {
  try {
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your-cloudinary-api-key') {
      return { result: 'ok' };
    }
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error('[Cloudinary Delete Error]:', error);
    throw error;
  }
};

module.exports = {
  uploadBufferToCloudinary,
  deleteCloudinaryAsset,
};
