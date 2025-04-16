import { createProduct, uploadImageFromURL, getProduct, updateProduct, getProducts }from "./wooproducts.js";



// Product data with external image and alt text
const productData = {
  name: "My New Product name five",
  type: "simple",
  regular_price: "9.99",
  description: "A great product description five.",
  short_description: "A great product short description five.",
  images: [
    {
      url: "https://osscom.santak.com/1637747665055-ckt-%E6%8A%A0%E5%9B%BERobust%20Series.png?1639039264815", // Online image URL
      alt: "ups battery one",
      fileName: "ups-battery-one-1",
    },
    {
      url: "https://osscom.santak.com/1637745370803-ckt-%E6%8A%A0%E5%9B%BEBlazer%20Pro%20Series.png?1639038636126", // Online image URL
      alt: "ups battery two",
      fileName: "ups-battery-one-2",
    },
    {
      url: "https://osscom.santak.com/1637747878399-ckt-%E6%8A%A0%E5%9B%BE.png?1639113337856", // Online image URL
      alt: "ups battery three",
      fileName: "ups-battery-one-3",
    },
  ],
  // advanced custom fields (ACF) data
  meta_data: [
    { key: 'custome_one', value: 'value A 5' },
    { key: 'custome_two', value: 'value B 5' },
    { key: '_yoast_wpseo_title', value: 'Custom SEO Title for Product' },
    { key: '_yoast_wpseo_metadesc', value: 'This is a well-optimized meta description for SEO.' },
    { key: '_yoast_wpseo_focuskw', value: 'ups battery' }
  ],
  categories: [
    { id: 26 } // Replace with your category ID
  ]
};

(async () => {
  try {
    // const response = await createProduct(productData);
    // console.log("✅ Product created:", response.data);


    // const response = await getProduct('1560');

    // console.log("✅ Product retrieved:", response.data);
    

    // const a = await uploadImageFromURL("https://www.globalpwr.com/wp-content/uploads/product/main/6029_main.jpg", "ups-battery-two", "ups battery two");




    // get all products example
    const data = await getProducts();

    // filter by example
    // {
    //   category: '12,34',             // include products in category 12 or 34
    //   category_exclude: '56,78'      // exclude products in category 56 or 78
    //   stock_status: 'instock',       // filter by stock status (instock, outofstock, onbackorder)
    //   search: 'search item',          // search for products by name
    // }
    // const data = await getProducts({
    //   category: 26,
    // });

    
    console.log("✅ Products retrieved:", data);



    // // update product example
    // const response = await updateProduct("1639", {
    //   name: "My Updated Product name fff",
    //   description: "An updated product description.fff",
    //   short_description: "An updated product short description.fff",
    //   meta_data: [
    //     { key: 'my_updated_for', value: 'translate_description' },
    //   ],
    // });

    // console.log("✅ Product updated:", response.data);

  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
})();