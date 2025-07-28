// update-product.mjs or any .js file with type:module
import axios from 'axios';
import qs from 'qs';
import FormData from 'form-data';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';



export function createWPClient({ SITE_URL, consumerKey, consumerSecret, WP_USERNAME, WP_APP_PASSWORD }) {

  const baseURL = `${SITE_URL}/wp-json/wc/v3/`;
  // Encode basic auth
  const BASIC_AUTH = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64');
  // Construct auth query string
  const authParams = {
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
  };

  async function uploadImageFromURL(imageUrl, fileName, altText) {
    try {
      // 1. Fetch image as buffer
      const imageResponse = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'image/jpeg,image/png,image/jpg;q=0.9,image/*;q=0.8'
        }
      });

      // Determine file extension and MIME type
    const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      // 'image/webp': '.webp',
    };

    const urlExtension = imageUrl.match(/\.([0-9a-z]+)$/i)?.[1].toLowerCase();
    const fileExtension = mimeToExt[contentType] || (urlExtension ? `.${urlExtension}` : '.jpg');

    const uploadFileName = `${fileName}${fileExtension}`;
    console.log(`Uploading image: ${uploadFileName} (${contentType})`);

  
      // 2. Upload to WP media
      const form = new FormData();
      form.append('file', imageResponse.data, {
        filename: uploadFileName,
      });
      form.append('alt_text', altText);
  
      const mediaUpload = await axios.post(`${SITE_URL}/wp-json/wp/v2/media`, form, {

        headers: {
            ...form.getHeaders(), // Include FormData headers
            Authorization: `Basic ${BASIC_AUTH}`,
        },
      });

      console.info(`get image success for(${imageUrl})`)
  
      return {
        id: mediaUpload.data.id,
        alt: altText,
        url: mediaUpload.data.source_url,
      };
    } catch (err) {
      console.error(`❌ Image upload failed: ${imageUrl}`, err.response?.data || err.message);
      return null;
    }
  }


  async function createPost(postData) {
    try {
      const response = await axios.post(
        `${SITE_URL}/wp-json/wp/v2/posts`,
        postData,
        {
          headers: {
            Authorization: `Basic ${BASIC_AUTH}`,
          },
        }
      );
      console.log('✅ Post created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating post:', error.response?.data || error.message);
    }
  }

    /**
   * Upload media to WordPress with optional new filename.
   * @param {string} url - The original media URL.
   * @param {string} [slug] - Optional slug for new filename (e.g., 'product-name').
   * @returns {Promise<string>} - The new media URL or the original URL on failure.
   */

  async function downloadAndUploadMedia(url, slug) {
    try {
      const originalFilename = path.basename(url.split('?')[0]);
      const fileExt = path.extname(originalFilename);
      const randomId = crypto.randomBytes(3).toString('hex'); // 6 characters

      const newFilename = slug
      ? `${slug}-${randomId}${fileExt}`
      : originalFilename;


      // const fileRes = await fetch(url);
      // const arrayBuffer = await fileRes.arrayBuffer();
      // const file = Buffer.from(arrayBuffer);
      // const form = new FormData();

      // Download with progress
      const response = await axios.get(url, { responseType: 'stream' });
      const totalLength = Number(response.headers['content-length']);
      let downloaded = 0;

      const chunks = [];
      response.data.on('data', (chunk) => {
        downloaded += chunk.length;
        chunks.push(chunk);
        if (totalLength) {
          const percent = ((downloaded / totalLength) * 100).toFixed(2);
          process.stdout.write(`\rDownloading ${newFilename}: ${percent}%`);
        }
      });

      await new Promise((resolve, reject) => {
        response.data.on('end', () => {
          process.stdout.write('\n');
          resolve();
        });
        response.data.on('error', reject);
      });

      const file = Buffer.concat(chunks);

      const form = new FormData();

      form.append('file', file, newFilename);
  
      const res = await axios.post(`${SITE_URL}/wp-json/wp/v2/media`, form, {
        headers: {
          ...form.getHeaders(),
          'Content-Disposition': `attachment; filename="${newFilename}"`,
          Authorization: `Basic ${BASIC_AUTH}`,
        }
      });
  
      return res.data.source_url;
    } catch (error) {
      console.error(`Failed to upload: ${url}`, error.message);
      return url; // fallback to original
    }
  }


  return {

// Upload external image to WordPress Media Library
/**
 * 
 * @param {*} imageUrl 
 * @param {*} fileName fileName without extension, for example: "test-one"
 * @param {*} altText 
 * @returns 
 */
    uploadImageFromURL,
    downloadAndUploadMedia,
    createPost,
    deleteImageById: async (imageId, data={force: true}) => {
      try {
        const response = await axios.delete(
          `${SITE_URL}/wp-json/wp/v2/media/${imageId}`,
            {
              headers:{
                Authorization: `Basic ${BASIC_AUTH}`,
              },
              data
            }
          );
          console.log('✅ image deleted:', response.data);
          return response;
        } catch (error) {
          console.error('❌ Error to delete image:', error.response?.data || error.message);
        }
    
    },
    createProduct: async (productData) => {
      try {
        
        let uploadedImages = [];
    
        let images = productData.images || [];
    
        if (images.length > 0) {
          for (let index = 0; index < images.length; index++) {
            const thisImage = images[index];
            let res = await uploadImageFromURL(thisImage.url, thisImage.fileName, thisImage.alt)
            uploadedImages.push(res)
          }
          // Filter out failed uploads
          uploadedImages = uploadedImages.filter(img => img !== null);
          
    
          productData.images = uploadedImages.map(img => ({
            id: img.id,
            alt: img.alt
          }));
        }
    
        if (images.length > 0 && productData.images.length != images.length) {
            console.error(`❌ Some images failed to upload: for ${product.name}, returned`, productData.images.length, images.length);
            return null;
        }
    
    
        const product = await axios.post(
            `${SITE_URL}/wp-json/wc/v3/products?${qs.stringify(authParams)}`,
            productData
          );
      
          console.log('✅ Product created: id=', product?.data?.id);
          return product;
    
      } catch (error) {
        console.error('❌ Error creating product:', error.response?.data || error.message);
      }
    },
    getProduct: async (productId) => {
      try {
        const response = await axios.get(
          `${baseURL}products/${productId}?${qs.stringify(authParams)}`
        );
        console.log('✅ Product fetched:', JSON.stringify(response.data));
        return response
      } catch (error) {
        console.error('❌ Error fetching product:', error.response?.data || error.message);
      }
    },
    deleteProduct: async (productId, data={}) => {
      try {
        const response = await axios.delete(
          `${baseURL}products/${productId}?${qs.stringify(authParams)}`,
          { data } // force=true means permanently delete
        );
        console.log('✅ Product deleted:', response.data);
        return response
      } catch (error) {
        console.error('❌ Error deleting product:', error.response?.data || error.message);
      }
    },
    updateProduct: async (productId, data={}) => {
      try {
        const response = await axios.put(
          `${baseURL}products/${productId}?${qs.stringify(authParams)}`,
          data 
        );
        console.log('✅ Product update:', response.data);
        return response
      } catch (error) {
        console.error('❌ Error updating product:', error.response?.data || error.message);
      }
    },
    getProducts: async (filters = {}) => {

      let page = 1;
      let allProducts = [];
      let hasMore = true;
    
      while (hasMore) {
        const query = {
          ...authParams,
          per_page: 100,
          page,
          ...filters // add filters like category, search, stock_status
        };
    
        const { data } = await axios.get(`${baseURL}products?${qs.stringify(query)}`);
        allProducts = allProducts.concat(data);
        hasMore = data.length === 100;
        page++;
      }
    
      return allProducts;
    
    },
    getProductCategories: async (filters = {}) => {
      let page = 1;
      let allCategories = [];
      let hasMore = true;
    
      while (hasMore) {
        const query = {
          ...authParams,
          per_page: 100,
          page,
          ...filters // add filters like category, search, stock_status
        };
    
        const { data } = await axios.get(`${baseURL}products/categories?${qs.stringify(query)}`);
        allCategories = allCategories.concat(data);
        hasMore = data.length === 100;
        page++;
      }
    
      return allCategories;
    
    }
  };
}


