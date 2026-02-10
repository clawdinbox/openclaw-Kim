#!/usr/bin/env node
/**
 * Brand Portal Image Source
 * 
 * Reference data for brand press portals and media centers.
 * Used for manual image sourcing when covering specific brands.
 * 
 * Future enhancement: Automated scrapers for each portal.
 */

export const BRAND_PORTALS = {
  // Luxury Groups
  lvmh: {
    name: 'LVMH',
    portalUrl: 'https://www.lvmh.com/news-newsroom/',
    rssUrl: 'https://www.lvmh.com/news-newsroom?format=feed&type=rss',
    mediaLogin: true,
    imageQuality: 'high',
    access: 'press-login',
    description: 'Official LVMH newsroom with press releases and media kits',
    brands: ['Louis Vuitton', 'Dior', 'Fendi', 'Givenchy', 'Celine', 'Loewe', 'Bulgari'],
  },
  
  kering: {
    name: 'Kering',
    portalUrl: 'https://www.kering.com/en/news/',
    rssUrl: 'https://www.kering.com/en/news/?format=feed&type=rss',
    mediaLogin: false,
    imageQuality: 'high',
    access: 'public',
    description: 'Kering group news and press releases',
    brands: ['Gucci', 'Saint Laurent', 'Bottega Veneta', 'Balenciaga', 'Alexander McQueen'],
  },
  
  richemont: {
    name: 'Richemont',
    portalUrl: 'https://www.richemont.com/news/',
    rssUrl: null,
    mediaLogin: true,
    imageQuality: 'high',
    access: 'press-login',
    description: 'Richemont press releases and financial news',
    brands: ['Cartier', 'Van Cleef & Arpels', 'Jaeger-LeCoultre', 'IWC', 'Panerai'],
  },
  
  hermes: {
    name: 'Hermès',
    portalUrl: 'https://www.hermes.com/us/en/story/',
    rssUrl: null,
    mediaLogin: false,
    imageQuality: 'high',
    access: 'public',
    description: 'Hermès official news and stories',
    brands: ['Hermès'],
  },
  
  // Sportswear
  nike: {
    name: 'Nike',
    portalUrl: 'https://news.nike.com/',
    rssUrl: 'https://news.nike.com/feed',
    mediaLogin: false,
    imageQuality: 'high',
    access: 'public',
    description: 'Nike official newsroom with product releases and campaigns',
    brands: ['Nike', 'Jordan Brand', 'Converse'],
  },
  
  adidas: {
    name: 'Adidas',
    portalUrl: 'https://news.adidas.com/',
    rssUrl: 'https://news.adidas.com/rss-feed',
    mediaLogin: false,
    imageQuality: 'high',
    access: 'public',
    description: 'Adidas Group newsroom',
    brands: ['Adidas', 'Reebok', 'TaylorMade'],
  },
  
  puma: {
    name: 'Puma',
    portalUrl: 'https://about.puma.com/en/newsroom',
    rssUrl: 'https://about.puma.com/en/newsroom?format=feed&type=rss',
    mediaLogin: false,
    imageQuality: 'medium',
    access: 'public',
    description: 'Puma press releases and news',
    brands: ['Puma'],
  },
  
  // Fashion/Streetwear
  vfCorp: {
    name: 'VF Corporation',
    portalUrl: 'https://www.vfc.com/news',
    rssUrl: null,
    mediaLogin: false,
    imageQuality: 'medium',
    access: 'public',
    description: 'VF Corp news (Vans, Supreme, The North Face, Timberland)',
    brands: ['Vans', 'Supreme', 'The North Face', 'Timberland', 'Dickies'],
  },
  
  authenticBrands: {
    name: 'Authentic Brands Group',
    portalUrl: 'https://authentic.com/news/',
    rssUrl: null,
    mediaLogin: true,
    imageQuality: 'medium',
    access: 'press-login',
    description: 'ABG news (Reebok, Hunter Boots, Nine West)',
    brands: ['Reebok', 'Hunter Boots', 'Nine West', 'Forever 21'],
  },
  
  // Other Major Brands
  zara: {
    name: 'Inditex (Zara)',
    portalUrl: 'https://www.inditex.com/en/investors/press',
    rssUrl: null,
    mediaLogin: false,
    imageQuality: 'medium',
    access: 'public',
    description: 'Inditex press releases (Zara, Massimo Dutti, Bershka)',
    brands: ['Zara', 'Massimo Dutti', 'Bershka', 'Pull&Bear'],
  },
  
  hM: {
    name: 'H&M Group',
    portalUrl: 'https://hmgroup.com/news/',
    rssUrl: 'https://hmgroup.com/news/?format=feed&type=rss',
    mediaLogin: false,
    imageQuality: 'medium',
    access: 'public',
    description: 'H&M Group news and press releases',
    brands: ['H&M', 'COS', 'Arket', '& Other Stories'],
  },
  
  uniqlo: {
    name: 'Uniqlo (Fast Retailing)',
    portalUrl: 'https://www.fastretailing.com/eng/news/',
    rssUrl: 'https://www.fastretailing.com/eng/news/rss.xml',
    mediaLogin: false,
    imageQuality: 'high',
    access: 'public',
    description: 'Fast Retailing/Uniqlo news',
    brands: ['Uniqlo', 'Theory', 'Helmut Lang'],
  },
  
  prada: {
    name: 'Prada Group',
    portalUrl: 'https://www.pradagroup.com/en/news.html',
    rssUrl: null,
    mediaLogin: false,
    imageQuality: 'high',
    access: 'public',
    description: 'Prada Group press releases',
    brands: ['Prada', 'Miu Miu', 'Church\'s', 'Car Shoe'],
  },
  
  capriHoldings: {
    name: 'Capri Holdings',
    portalUrl: 'https://www.capriholdings.com/news',
    rssUrl: null,
    mediaLogin: false,
    imageQuality: 'medium',
    access: 'public',
    description: 'Capri Holdings news (Versace, Michael Kors, Jimmy Choo)',
    brands: ['Versace', 'Michael Kors', 'Jimmy Choo'],
  },
  
  tapestry: {
    name: 'Tapestry',
    portalUrl: 'https://www.tapestry.com/news/',
    rssUrl: null,
    mediaLogin: false,
    imageQuality: 'medium',
    access: 'public',
    description: 'Tapestry news (Coach, Kate Spade, Stuart Weitzman)',
    brands: ['Coach', 'Kate Spade', 'Stuart Weitzman'],
  },
  
  // Watch/Jewelry
  swatchGroup: {
    name: 'Swatch Group',
    portalUrl: 'https://www.swatchgroup.com/en/news/',
    rssUrl: null,
    mediaLogin: false,
    imageQuality: 'high',
    access: 'public',
    description: 'Swatch Group press releases',
    brands: ['Omega', 'Longines', 'Tissot', 'Swatch', 'Breguet'],
  },
  
  rolex: {
    name: 'Rolex',
    portalUrl: 'https://www.rolex.com/world-of-rolex.html',
    rssUrl: null,
    mediaLogin: true,
    imageQuality: 'high',
    access: 'press-login',
    description: 'Rolex official news (limited access)',
    brands: ['Rolex'],
  },
};

/**
 * Get brand portal info by brand name
 */
export function getPortalByBrand(brandName) {
  const lowerBrand = brandName.toLowerCase();
  
  for (const [key, portal] of Object.entries(BRAND_PORTALS)) {
    if (portal.name.toLowerCase() === lowerBrand) return portal;
    
    for (const brand of portal.brands) {
      if (brand.toLowerCase() === lowerBrand) return portal;
    }
  }
  
  return null;
}

/**
 * Get all portals with RSS feeds (for automated monitoring)
 */
export function getRSSPortals() {
  return Object.entries(BRAND_PORTALS)
    .filter(([_, portal]) => portal.rssUrl)
    .map(([key, portal]) => ({ key, ...portal }));
}

/**
 * Get all publicly accessible portals
 */
export function getPublicPortals() {
  return Object.entries(BRAND_PORTALS)
    .filter(([_, portal]) => portal.access === 'public')
    .map(([key, portal]) => ({ key, ...portal }));
}

/**
 * Search for brand references in text
 */
export function findBrandsInText(text) {
  const found = [];
  const lowerText = text.toLowerCase();
  
  for (const [key, portal] of Object.entries(BRAND_PORTALS)) {
    // Check portal name
    if (lowerText.includes(portal.name.toLowerCase())) {
      found.push({ portal: key, brand: portal.name, match: 'name' });
      continue;
    }
    
    // Check individual brands
    for (const brand of portal.brands) {
      if (lowerText.includes(brand.toLowerCase())) {
        found.push({ portal: key, brand, match: 'brand' });
      }
    }
  }
  
  return found;
}

/**
 * CLI helper for looking up brand portals
 */
function main() {
  const query = process.argv[2];
  
  if (!query) {
    console.log('📋 Brand Portal Reference');
    console.log('\nUsage: node brand-source.js "brand-name"');
    console.log('       node brand-source.js --list');
    console.log('       node brand-source.js --rss\n');
    console.log('All portals:');
    
    Object.entries(BRAND_PORTALS).forEach(([key, portal]) => {
      console.log(`\n${portal.name}`);
      console.log(`  URL: ${portal.portalUrl}`);
      console.log(`  RSS: ${portal.rssUrl || 'None'}`);
      console.log(`  Access: ${portal.access}`);
      console.log(`  Brands: ${portal.brands.join(', ')}`);
    });
    return;
  }
  
  if (query === '--list') {
    console.log('📋 All Brand Portals:\n');
    Object.entries(BRAND_PORTALS).forEach(([key, portal]) => {
      console.log(`${portal.name}`);
      console.log(`  URL: ${portal.portalUrl}`);
      console.log(`  Brands: ${portal.brands.slice(0, 3).join(', ')}${portal.brands.length > 3 ? '...' : ''}`);
      console.log('');
    });
    return;
  }
  
  if (query === '--rss') {
    console.log('📡 Portals with RSS feeds:\n');
    getRSSPortals().forEach(portal => {
      console.log(`${portal.name}: ${portal.rssUrl}`);
    });
    return;
  }
  
  const portal = getPortalByBrand(query);
  
  if (portal) {
    console.log(`\n📸 ${portal.name} Press Portal`);
    console.log(`URL: ${portal.portalUrl}`);
    console.log(`RSS: ${portal.rssUrl || 'Not available'}`);
    console.log(`Access: ${portal.access}`);
    console.log(`Media Login Required: ${portal.mediaLogin ? 'Yes' : 'No'}`);
    console.log(`\nBrands: ${portal.brands.join(', ')}`);
    console.log(`\nDescription: ${portal.description}`);
  } else {
    console.log(`❌ No portal found for "${query}"`);
    console.log('\nTry searching for: ');
    const suggestions = Object.values(BRAND_PORTALS)
      .flatMap(p => [p.name, ...p.brands.slice(0, 2)])
      .slice(0, 10);
    console.log(suggestions.join(', '));
  }
}

if (process.argv[1] === import.meta.url.slice(7)) {
  main();
}

export default { BRAND_PORTALS, getPortalByBrand, getRSSPortals, findBrandsInText };
