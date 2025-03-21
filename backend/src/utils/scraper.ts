import axios from 'axios';
import * as cheerio from 'cheerio';

 async function scrapeArticle(url: string) {
    // 1. Add 8-second timeout to prevent hanging
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
  
    try {
      // 2. Spoof Chrome user agent
      const response = await axios.get(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
  
      // 3. Force UTF-8 encoding
      const html = Buffer.from(response.data, 'binary').toString('utf-8');
      const $ = cheerio.load(html);
  
      // 4. Add fallback title extraction
      const title = $('meta[property="og:title"]').attr('content') 
        || $('title').first().text() 
        || $('h1').first().text().slice(0, 100);
  
      // 5. Resolve relative URLs properly
      const baseUrl = new URL(url).origin;
      const resolveUrl = (path: string) => 
        path.startsWith('http') ? path : new URL(path, baseUrl).href;
  
      return {
        title: title.trim(),
        description: $('meta[property="og:description"]').attr('content') 
          || $('meta[name="description"]').attr('content') 
          || $('p').first().text().slice(0, 200),
        image: resolveUrl(
          $('meta[property="og:image"]').attr('content') 
          || $('img').first().attr('src') 
          || ''
        ),
        url,
        favicon: resolveUrl(
          $('link[rel="icon"]').attr('href') 
          || $('link[rel="shortcut icon"]').attr('href') 
          || '/favicon.ico'
        )
      };
  
    } catch (error) {
      // 6. Degrade gracefully
      return {
        title: url,
        description: '',
        image: '',
        url,
        favicon: ''
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  export default scrapeArticle