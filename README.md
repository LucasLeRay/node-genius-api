# Genius API Node client

## Setup

```bash
npm install node-genius-api

# Or with yarn
yarn add node-genius-api
```

## Initialization

Instantiate Genius by calling the constructor with your `accessToken` (You can get it [here](https://genius.com/api-clients)).

```javascript
// Instantiate Genius
const Genius = require('./index');
const client = new Genius(process.env.GENIUS_ACCESS_TOKEN);

// Get infos of song with ID=378195
client.song('378195').then((song) => {
  console.log('The song is:', song.full_title)
}).catch(console.error);
```

## Examples

```javascript
// Get data for a specific song.
client.song('378195').then(console.log).catch(console.error);

// Get lyrics of a specific song.
client.lyrics('378195').then(console.log).catch(console.error);

// Search songs.
client.search('Redemption song').then(console.log).catch(console.error);

// Get data for a specific artist.
client.artist('16775').then(console.log).catch(console.error);

// Get songs of an artist.
client.artistSongs('16775', {
  sort: 'popularity',
  count: 20,
  page: 1
}).then(console.log).catch(console.error);

// Get referents by content item or user responsible for an included annotation.
client.referents({
  webPage: '10347',
  format: 'plain'
}).then(console.log).catch(console.error);

// Get data for a specific annotation.
client.annotation('10225840', 'plain').then(console.log).catch(console.error);
```
