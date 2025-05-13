// import { createProduct,  getProduct, getProducts, getSlugByURL }from "./wooproducts.js";
import { getSlugByURL } from "./utils.js";
import slugify from 'slugify';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config(); 

// For resolving __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
export const cloneProductWithNewName = async (productURL, newProductData, sourceWPClient, targetWPClient=sourceWPClient) => {

  const productName = newProductData.name;
  if(!productName){
    throw new Error("product name is required");
  }
  const slug = getSlugByURL(productURL);
  if(!slug) throw new Error("Invalid product URL");

  // get the product by slug
  const response = await sourceWPClient.getProducts({slug: slug, context:"edit"});
  if(!response || !response?.[0]) throw new Error("Failed to get product by slug");
  const oldData = response?.[0];
  const old_meta_data = oldData.meta_data;


  // copy the old product meta_data to the new product meta_data, if there is any meta_data in the new product data, overwrite the old one
  if(newProductData.meta_data && newProductData.meta_data.length > 0){
    for (let index = 0; index < newProductData.meta_data.length; index++) {
      const this_meta_data = newProductData.meta_data[index];
      let find_old_meta_item = old_meta_data.find(i=>i.key === this_meta_data.key);
      if(find_old_meta_item){
        find_old_meta_item.value = this_meta_data.value
      }else{
        old_meta_data.push(this_meta_data)
      }
    }
  }

  newProductData.meta_data = old_meta_data;
  if(!newProductData.description){
    newProductData.description = oldData.description; // copy the old product description to the new product data


    // 如果 description 有外部资源，上传资源到本站并替换
    if(newProductData.description){


      // Define path to mapping file
      const mappingFilePath = path.join(__dirname, 'data', 'media-mapping.json');
      let mediaMap = {};
      try {
        const file = await fs.readFile(mappingFilePath, 'utf-8');
        mediaMap = JSON.parse(file);
      } catch {
        console.log('Mapping file not found, initializing new map.');
      }

      // this is the file name for the new image in the new site, will add random number to the end of the file name
      let fileName = newProductData.overwrite_images_fileName || slugify(newProductData.name, {
        lower: true,      // convert to lowercase
        strict: true,     // remove special characters
        trim: true,
      });


      let description = newProductData.description;
      const urlRegex = /https?:\/\/[^"' )>]+?\.(jpg|jpeg|png|gif|webp|mp4|svg|webm|pdf)/gi;
      const matches = [...description.matchAll(urlRegex)];
      const uniqueUrls = [...new Set(matches.map(m => m[0]))];

      let TARGET_SITE_URL = targetWPClient===sourceWPClient ? process.env.SITE_URL : process.env.TARGET_SITE_URL;
      for (const oldUrl of uniqueUrls) {
        if (oldUrl.startsWith(TARGET_SITE_URL)) continue; // already hosted on new site


        let newUrl = mediaMap[oldUrl];
        if (!newUrl) {
          try {
             newUrl = await targetWPClient.downloadAndUploadMedia(oldUrl, fileName);
             mediaMap[oldUrl] = newUrl;

              await fs.mkdir(path.dirname(mappingFilePath), { recursive: true });
              await fs.writeFile(mappingFilePath, JSON.stringify(mediaMap, null, 2));
          } catch (error) {
            console.error(`✖ Failed to upload ${oldUrl}`, err);
            continue;
          }
        }else {
          console.log(`✔ Reused from map: ${oldUrl} → ${newUrl}`);
        }

        description = description.split(oldUrl).join(newUrl);
        console.log(`✔ Replaced: ${oldUrl} → ${newUrl}`);
      }
      newProductData.description = description;
    }
  }


  if(!newProductData.short_description){
    newProductData.short_description = oldData.short_description; // copy the old product short description to the new product data
  }
  // categories
  if(!newProductData.categories){
    newProductData.categories = oldData.categories; // copy the old product categories to the new product data
  }

  if((!newProductData.images || newProductData.images.length === 0) && oldData.images && oldData.images.length > 0){

    let alt = newProductData.overwrite_images_alt || newProductData.name;
    let fileName = newProductData.overwrite_images_fileName || slugify(newProductData.name, {
      lower: true,      // convert to lowercase
      strict: true,     // remove special characters
      trim: true,
    });
    newProductData.images = oldData.images.map((i, index)=>{
      return {
        url: i.src,
        alt: alt,
        fileName: `${fileName}-${index+1}`
      }
    });
  }

  const createRes = await targetWPClient.createProduct(newProductData);
  console.log("✅ Product created:", createRes.data);
  return createRes


}
  
