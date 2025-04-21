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
      
        // About the images


        let imageUrl = "https://s.alicdn.com/@sc04/kf/Hafc279b3fb7c4b7ab8b230ae323d474bb.png_720x720q50.jpg";
        let fileName = "euro-storage-container";
        let altText = "euro storage container";

        wpClient.uploadImageFromURL(imageUrl, fileName, altText)
  
  
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
    }
  })();


