// import { createProduct,  getProduct, getProducts, getSlugByURL }from "./wooproducts.js";
import { getSlugByURL } from "./utils.js";
import slugify from 'slugify';
import dotenv from 'dotenv';
dotenv.config(); 

//**
//** 1. Create a new product with the above data and upload images from URLs 
//**
//** 2. Get the product by ID and update the meta data with the new data

// type NewProductData = {
//   name: string;
//   overwrite_images_alt?: string;
//   overwrite_images_fileName?: string;
//   type?: string;
// }
/**
 * 
 * @param {*} productURL  // "https://www.domain.com/product/som-url/"
 * @param {*} newProductData 
 * @returns 
 */
export const migrateProductAssets = async (productURL, sourceWPClient) => {

  if(!productURL) throw new Error("Product URL is required");
  const slug = getSlugByURL(productURL);
  if(!slug) throw new Error("Invalid product URL");

  // get the product by slug
  // 使用 context:"edit" 是因为有一些 shortcode 如video 等， 会渲染成html，直接替换url然后更新会出现问题
  const response = await sourceWPClient.getProducts({slug: slug, context:"edit"});
  if(!response || !response?.[0]) throw new Error("Failed to get product by slug");
  
  const oldData = response?.[0];
  const productId = oldData.id;
  // Delete product
  let description = oldData.description;


  const urlRegex = /https?:\/\/[^"' )>]+?\.(jpg|jpeg|png|gif|webp|mp4|svg|webm|pdf)/gi;
  const matches = [...description.matchAll(urlRegex)];
  const uniqueUrls = [...new Set(matches.map(m => m[0]))];

  for (const oldUrl of uniqueUrls) {
    if (oldUrl.startsWith(process.env.SITE_URL)) continue; // already hosted on new site

    const newUrl = await sourceWPClient.downloadAndUploadMedia(oldUrl);
    if (newUrl !== oldUrl) {
      description = description.split(oldUrl).join(newUrl);
      console.log(`✔ Replaced: ${oldUrl} → ${newUrl}`);
    }
  }

  let res = sourceWPClient.updateProduct(productId, {description})


  return res


}
  
