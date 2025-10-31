import Parser from 'rss-parser';

interface FeedConfig {
  name: string;
  url: string;
}

interface FeedsConfig {
  feeds: FeedConfig[];
}

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  creator?: string;
}

async function fetchRSSFeeds() {
  const parser = new Parser();

  // Load feed configuration
  const configFile = Bun.file('./feeds.json');
  const config: FeedsConfig = await configFile.json();

  // Load existing CSV to check for duplicates
  const csvFile = Bun.file('./output.csv');
  let existingLinks = new Set<string>();

  if (await csvFile.exists()) {
    const csvContent = await csvFile.text();
    const lines = csvContent.split('\n').slice(1); // Skip header
    lines.forEach(line => {
      const match = line.match(/"([^"]+)"/g);
      if (match && match[1]) {
        // Extract URL from second column
        const url = match[1].replace(/"/g, '');
        existingLinks.add(url);
      }
    });
  }

  const allItems: Array<{ feedName: string; item: RSSItem }> = [];

  // Calculate 24 hours ago
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Fetch all feeds
  for (const feedConfig of config.feeds) {
    try {
      console.log(`Fetching feed: ${feedConfig.name}`);
      const feed = await parser.parseURL(feedConfig.url);

      for (const item of feed.items) {
        // Parse publication date
        const pubDate = item.pubDate ? new Date(item.pubDate) : null;

        // Check if item is new, not duplicate, and published within last 24 hours
        if (item.link &&
            !existingLinks.has(item.link) &&
            pubDate &&
            pubDate >= oneDayAgo) {
          allItems.push({ feedName: feedConfig.name, item });
        }
      }

      console.log(`  Found ${allItems.filter(i => i.feedName === feedConfig.name).length} new items from last 24 hours`);
    } catch (error) {
      console.error(`Error fetching feed ${feedConfig.name}:`, error);
    }
  }

  if (allItems.length === 0) {
    console.log('No new items found.');
    return;
  }

  console.log(`Found ${allItems.length} new items`);

  // Convert to CSV
  const csvLines: string[] = [];

  // Add header if file doesn't exist
  if (!await csvFile.exists()) {
    csvLines.push('Feed,URL,Title,Published,Content');
  }

  for (const { feedName, item } of allItems) {
    const escapeCsv = (str: string | undefined) => {
      if (!str) return '""';
      // Escape quotes and wrap in quotes
      return `"${str.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '')}"`;
    };

    const line = [
      escapeCsv(feedName),
      escapeCsv(item.link),
      escapeCsv(item.title),
      escapeCsv(item.pubDate),
      escapeCsv(item.contentSnippet || '')
    ].join(',');

    csvLines.push(line);
  }

  // Append to CSV file
  const newContent = csvLines.join('\n') + '\n';

  if (await csvFile.exists()) {
    const existingContent = await csvFile.text();
    await Bun.write('./output.csv', existingContent + newContent);
  } else {
    await Bun.write('./output.csv', newContent);
  }

  console.log(`Added ${allItems.length} new items to output.csv`);
}

// Run the script
fetchRSSFeeds().catch(console.error);
