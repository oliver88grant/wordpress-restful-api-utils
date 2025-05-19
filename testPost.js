import { createWPClient } from "./wooproducts.js";
import dotenv from 'dotenv';
import moment from 'moment';
import _ from 'lodash';
dotenv.config(); 

(async () => {
    try {

        let SITE_URL = process.env.SITE_URL;
        if(!SITE_URL.startsWith("http")){
            SITE_URL = "https://" + SITE_URL;
        }
        const wpClient = createWPClient({
            SITE_URL, 
            consumerKey: process.env.consumerKey, 
            consumerSecret: process.env.consumerSecret, 
            WP_USERNAME: process.env.WP_USERNAME || 'admin', // or real username (not recommended)
            WP_APP_PASSWORD: process.env.WP_APP_PASSWORD, // or real password (not recommended)
        });


        let subtract_minutes = _.random(0, 120)
        let postdate = moment().subtract(subtract_minutes, 'minutes').format();

        const postData = {
            title: 'Post title 1148',
            content: 'Image uploaded via REST API 1148',
            status: 'publish',
            data: postdate
        };

        console.log("postData", postData);

        let postResponse = await wpClient.createPost(postData);
        if(!postResponse || !postResponse?.id){
            console.error("❌ Failed to create post");
            return null;
        } else {
            console.log("✅ Post created:", postResponse.id);
        }
      
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
    }
  })();