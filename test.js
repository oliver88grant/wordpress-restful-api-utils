import { cloneProductWithNewName } from "./cloneProductWithNewName.js";
import { createWPClient } from "./wooproducts.js";

(async () => {
    try {


        const wpClient = createWPClient({
            SITE_URL: process.env.SITE_URL, 
            consumerKey: process.env.consumerKey, 
            consumerSecret: process.env.consumerSecret, 
            WP_USERNAME: process.env.WP_USERNAME || 'admin', // or real username (not recommended)
            WP_APP_PASSWORD: process.env.WP_APP_PASSWORD, // or real password (not recommended)
        });
      
        // About the images
        // if overwrite_images_alt and overwrite_images_fileName is true, clone the old image but change the alt and fileName
        const productData = {
          name: "Wholesale Online UPS 4161621 with LCD Display",
          overwrite_images_alt: "4161621 alt",
          overwrite_images_fileName: "4161621 alt",
          type: "simple",
        //   regular_price: "89.99",
          // description: "",
          // short_description: "",
        //   images: [
        //     {
        //       url: "https://shopcdnpro.grainajz.com/category/351426/2062/590279af6bf07f80efc1a80b56d7f0fc/17.jpg", // Online image URL
        //       alt: "ups battery one 4161056",
        //       fileName: "ups-battery-4161056-1",
        //     },
        //     {
        //       url: "https://shopcdnpro.grainajz.com/category/351426/2062/3487866b8c5d0dda4733b83d71da7cd7/02.jpg", // Online image URL
        //       alt: "ups battery two 4161056",
        //       fileName: "ups-battery-4161056-2",
        //     },
        //     {
        //       url: "https://shopcdnpro.grainajz.com/category/351426/2062/2362d4698287df601b0336a3a7ce398c/14.jpg", // Online image URL
        //       alt: "ups battery three 4161056",
        //       fileName: "ups-battery-4161056-3",
        //     }
        //   ],
          // advanced custom fields (ACF) data
          meta_data: [
            // { key: 'custome_one', value: 'value A 5' },
            // { key: 'custome_two', value: 'value B 5' },
            { key: '_yoast_wpseo_title', value: 'Custom SEO Title 4161621 %%sep%% %%sitename%%' }, // title 里面一般含有模板
            { key: '_yoast_wpseo_metadesc', value: 'This is a description 4161621' }, // meta description 也可以让Google自动抓取
            { key: '_yoast_wpseo_focuskw', value: 'keyword 4161621' }
          ],
          categories: [
            { id: 27 } // Replace with your category ID
          ]
        };

        let productURL = "https://www.rhimopower.com/product/wholesale-online-ups-power-supply-208v-220v-230v-240v-ac-single-phase-with-lcd-display/";

        cloneProductWithNewName(productURL, productData, wpClient, wpClient)
  
  
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
    }
  })();