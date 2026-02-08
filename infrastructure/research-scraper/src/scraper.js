const Parser = require('rss-parser');
// No need to require node-fetch if fetch is globally available

const parser = new Parser();

const feedUrl = 'http://feeds.bbci.co.uk/news/world/rss.xml';

async function scrapeRssFeed() {
    try {
        // Use global fetch directly
        const response = await fetch(feedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }
        
        const feedText = await response.text();
        const feed = await parser.parseString(feedText);
        
        console.log('Successfully scraped feed: ' + feed.title);
        console.log('Found ' + feed.items.length + ' items.');
        
        if (feed.items && feed.items.length > 0) {
            console.log('First item title:', feed.items[0].title);
        } else {
            console.log('No items found in the feed.');
        }
        return feed;
    } catch (error) {
        console.error('Error scraping RSS feed:', error);
        throw error;
    }
}

scrapeRssFeed()
    .then(() => {
        console.log("First scrape run successful!");
    })
    .catch(err => {
        console.error("First scrape run failed.");
        process.exit(1);
    });
