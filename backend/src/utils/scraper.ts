import axios from 'axios';
import cheerio from 'cheerio';

async function scrapeArticle(url: string) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Extract basic metadata
    const metadata = {
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      url: url,
      favicon: $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
    };
    
    return metadata;
  } catch (error) {
    console.error('Error scraping article:', error);
    return null;
  }
}

export default scrapeArticle;