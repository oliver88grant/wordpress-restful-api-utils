import { cloneProductWithNewName } from "./cloneProductWithNewName.js";
import { createWPClient } from "./wooproducts.js";
import dotenv from 'dotenv';
dotenv.config(); 

(async () => {
    try {

      let productURL = "";

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
          name: "plastic collapsible milk crate",
          overwrite_images_alt: "plastic collapsible milk crate",
          overwrite_images_fileName: "plastic-collapsible-milk-crate",
          type: "simple",
        //   regular_price: "89.99",
          // description: "",
          // short_description: "",
          // images: [
          //   // {
          //   //   url: "https://sc04.alicdn.com/kf/Hb4b18a7e14554d71b11065dafd8c000d6.jpg", // Online image URL
          //   //   alt: "plastic collapsible milk crate​",
          //   //   fileName: "plastic-collapsible-milk-crate-1",
          //   // },
          //   // {
          //   //   url: "https://s.alicdn.com/@sc04/kf/Ha5900e5fe7804620ade3db39faea99475.jpg", // Online image URL
          //   //   alt: "plastic collapsible milk crate​",
          //   //   fileName: "plastic-collapsible-milk-crate-2",
          //   // },
          //   // {
          //   //   url: "https://sc04.alicdn.com/kf/HTB1mwvLXizxK1Rjy1zkq6yHrVXam.jpg", // Online image URL
          //   //   alt: "plastic collapsible milk crate​",
          //   //   fileName: "plastic-collapsible-milk-crate-3",
          //   // },
          //   // {
          //   //   url: "https://sc04.alicdn.com/kf/HTB1CqDLXjzuK1RjSspeq6ziHVXaT.jpg", // Online image URL
          //   //   alt: "plastic collapsible milk crate​",
          //   //   fileName: "plastic-collapsible-milk-crate-4",
          //   // },
          //   // {
          //   //   url: "https://sc04.alicdn.com/kf/HTB1s06LXozrK1RjSspmq6AOdFXaA.jpg", // Online image URL
          //   //   alt: "plastic collapsible milk crate​",
          //   //   fileName: "plastic-collapsible-milk-crate-5",
          //   // },
          // ],
          // advanced custom fields (ACF) data
          meta_data: [
            // { key: 'custome_one', value: 'value A 5' },
            // { key: 'custome_two', value: 'value B 5' },
            { key: '_yoast_wpseo_title', value: 'plastic collapsible milk crate​ %%sep%% %%sitename%%' }, // title 里面一般含有模板
            // { key: '_yoast_wpseo_metadesc', value: 'This is a description 4161621' }, // meta description 也可以让Google自动抓取
            // { key: '_yoast_wpseo_focuskw', value: 'keyword 4161621' }
          ],
          categories: [
            { id: 17 } // Replace with your category ID
          ]
        };

        if(process.env.TARGET_SITE_URL){
          const targetWPclient = createWPClient({
            SITE_URL: process.env.TARGET_SITE_URL, 
            consumerKey: process.env.TARGET_consumerKey, 
            consumerSecret: process.env.TARGET_consumerSecret, 
            WP_USERNAME: process.env.TARGET_WP_USERNAME || 'admin', // or real username (not recommended)
            WP_APP_PASSWORD: process.env.TARGET_WP_APP_PASSWORD, // or real password (not recommended)
          });
          cloneProductWithNewName(productURL, productData, wpClient, targetWPclient)
        } else {
          cloneProductWithNewName(productURL, productData, wpClient);
        }
  
  
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
    }
  })();