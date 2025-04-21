
import { deleteProductWithImage } from "./deleteProductWithImage.js";
import { createWPClient } from "./wooproducts.js";
import dotenv from 'dotenv';
dotenv.config(); 

(async () => {
    try {


        const wpClient = createWPClient({
            SITE_URL: process.env.SITE_URL, 
            consumerKey: process.env.consumerKey, 
            consumerSecret: process.env.consumerSecret, 
            WP_USERNAME: process.env.WP_USERNAME || 'admin', // or real username (not recommended)
            WP_APP_PASSWORD: process.env.WP_APP_PASSWORD, // or real password (not recommended)
        });





        let productURL = "";

        deleteProductWithImage(productURL, wpClient)
  
  
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
    }
  })();