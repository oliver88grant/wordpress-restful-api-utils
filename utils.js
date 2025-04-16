import axios from 'axios';
import crypto from 'crypto';

export const getSlugByURL = (url) => {
	try {
		const { pathname } = new URL(url);
		const segments = pathname.split('/').filter(Boolean);

		// Assuming slug is the last part after /product/
		const productIndex = segments.indexOf('product');
		if (productIndex !== -1 && segments[productIndex + 1]) {
			return segments[productIndex + 1];
		}

		return null; // Not a valid product URL
	} catch (error) {
		console.error('❌ Error extracting slug from URL:', error.message);
	}
}


export async function getImageMD5FromURL(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    const hash = crypto.createHash('md5').update(response.data).digest('hex');
    return hash;
  } catch (err) {
    console.error(`Failed to fetch or hash image: ${err.message}`);
    return null;
  }
}