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
export const deleteProductWithImage = async (productURL, sourceWPClient) => {

  if(!productURL) throw new Error("Product URL is required");
  const slug = getSlugByURL(productURL);
  if(!slug) throw new Error("Invalid product URL");

  // get the product by slug
  const response = await sourceWPClient.getProducts({slug: slug});
  if(!response || !response?.[0]) throw new Error("Failed to get product by slug");
  
  const oldData = response?.[0];
  const productId = oldData.id;
  // Delete product
  await sourceWPClient.deleteProduct(productId, {
    force: true, // force=true means permanently delete
  });
  console.log(`Product ${productId} deleted.`);

  let oldImages = oldData.images

  const imageIds = oldImages.map(img => img.id);

  for (const id of imageIds) {
    try {
      await sourceWPClient.deleteImageById(id, {
        force: true,
      });
      console.log(`Deleted image ID ${id}`);
    } catch (err) {
      console.warn(`Failed to delete image ID ${id}:`, err.response?.data);
    }
  }

  console.log(`finished deleting product ${productURL} and its images`);

  return


}
  
