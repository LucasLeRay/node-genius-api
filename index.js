const axios = require('axios');
const cheerio = require('cheerio');

function handleError(err) {
  switch (err.response.status) {
    case 401:
      return new Error('Invalid access token');
    case 404:
      return new Error('Entity not found');
    default:
      return new Error(err.message);
  }
}

module.exports = class Genius {
  constructor({ accessToken }) {
    if (!accessToken) throw new Error('No Genius API access token provided');
    this.instance = axios.create({
      baseURL: 'https://api.genius.com',
      headers: {
        common: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }

  song(id) {
    return new Promise((resolve, reject) => {
      this.instance.get(`/songs/${id}`).then((res) => {
        resolve(res.data.response.song);
      }).catch((err) => reject(handleError(err)));
    });
  }

  search(q) {
    return new Promise((resolve, reject) => {
      this.instance.get('/search', {
        params: { q },
      }).then((res) => {
        resolve(res.data.response.hits);
      }).catch((err) => reject(handleError(err)));
    });
  }

  artist(id) {
    return new Promise((resolve, reject) => {
      this.instance.get(`/artists/${id}`).then((res) => {
        resolve(res.data.response.artist);
      }).catch((err) => reject(handleError(err)));
    });
  }

  artistSongs(id, { sort, count, page } = {}) {
    return new Promise((resolve, reject) => {
      this.instance.get(`/artists/${id}/songs`, {
        params: {
          sort,
          per_page: count,
          page,
        },
      }).then((res) => {
        resolve(res.data.response.songs);
      }).catch((err) => reject(handleError(err)));
    });
  }

  referents({
    user, song, webPage, format, count, page,
  }) {
    return new Promise((resolve, reject) => {
      if (song && webPage) {
        reject(new Error('Cannot specify a song and a web page.'));
      }
      this.instance.get('/referents', {
        params: {
          created_by_id: user,
          song_id: song,
          web_page_id: webPage,
          text_format: format,
          per_page: count,
          page,
        },
      }).then((res) => {
        resolve(res.data.response.referents);
      }).catch((err) => reject(handleError(err)));
    });
  }

  annotation(id, format) {
    return new Promise((resolve, reject) => {
      this.instance.get(`/annotations/${id}`, {
        params: {
          text_format: format,
        },
      }).then((res) => {
        resolve(res.data.response.annotation);
      }).catch((err) => reject(handleError(err)));
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async lyrics(id) {
    let lyrics;
    while (!lyrics) {
      // eslint-disable-next-line no-await-in-loop
      const page = await axios.get(`https://genius.com/${id}`);
      const $ = cheerio.load(page.data);
      lyrics = $('div[class="lyrics"]').text().trim();
    }

    return lyrics.split('\n\n').map((p) => {
      const [part, ...content] = p.split('\n');
      return ({ part: part.replace(/\[|\]/g, ''), content });
    });
  }
};
