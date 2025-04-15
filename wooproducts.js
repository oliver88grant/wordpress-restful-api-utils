// update-product.mjs or any .js file with type:module
import axios from 'axios';
import qs from 'qs';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config(); 

// WooCommerce site and credentials
const SITE_URL = process.env.SITE_URL;
const baseURL = `${SITE_URL}/wp-json/wc/v3/`;
const consumerKey = process.env.consumerKey;
const consumerSecret = process.env.consumerSecret;

// Construct auth query string
const authParams = {
  consumer_key: consumerKey,
  consumer_secret: consumerSecret,
};

const WP_USERNAME = process.env.WP_USERNAME || 'admin'; // or real username (not recommended)
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD; // or real password (not recommended)

// Encode basic auth
const BASIC_AUTH = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64');



// Upload external image to WordPress Media Library
/**
 * 
 * @param {*} imageUrl 
 * @param {*} fileName fileName without extension, for example: "test-one"
 * @param {*} altText 
 * @returns 
 */
export async function uploadImageFromURL(imageUrl, fileName, altText) {
    try {
      // 1. Fetch image as buffer
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

      // Determine file extension and MIME type
    const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
    };

    const urlExtension = imageUrl.match(/\.([0-9a-z]+)$/i)?.[1].toLowerCase();
    const fileExtension = mimeToExt[contentType] || (urlExtension ? `.${urlExtension}` : '.jpg');

    const uploadFileName = `${fileName}${fileExtension}`;

  
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
  
      return {
        id: mediaUpload.data.id,
        alt: altText
      };
    } catch (err) {
      console.error(`❌ Image upload failed: ${imageUrl}`, err.response?.data || err.message);
      return null;
    }
  }


export const updateProduct = async (productId, updateData) => {
  try {
    const response = await axios.put(
      `${baseURL}products/${productId}?${qs.stringify(authParams)}`,
      updateData
    );
    console.log('✅ Product updated:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error updating product:', error.response?.data || error.message);
  }
}

export const createProduct = async (productData) => {
  try {
    
    let uploadedImages = [];

    let images = productData.images || [];

    if (images.length > 0) {
      uploadedImages = await Promise.all(
        images.map(img =>
          uploadImageFromURL(img.url, img.fileName, img.alt)
        )
      );

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
  
      console.log('✅ Product created:', product.data.id);
      return product;

  } catch (error) {
    console.error('❌ Error creating product:', error.response?.data || error.message);
  }
}


export const getProduct = async (productId) => {
  try {
    const response = await axios.get(
      `${baseURL}products/${productId}?${qs.stringify(authParams)}`
    );
    console.log('✅ Product fetched:', JSON.stringify(response.data));
    return response
  } catch (error) {
    console.error('❌ Error fetching product:', error.response?.data || error.message);
  }
}

export const getProducts = async (filters = {}) => {

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

}