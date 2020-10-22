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

/**
 * Genius client
 */
module.exports = class Genius {
  /**
   * Initialize Genius
   * @param {string} accessToken - Genius API access token.
   */
  constructor(accessToken) {
    if (!accessToken) throw new Error('No Genius API access token provided');
    this.API = axios.create({
      baseURL: 'https://api.genius.com',
      headers: {
        common: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
    this.WEB = axios.create({
      baseURL: 'https://genius.com',
    });
  }

  /**
   * Data for a specific song.
   * @param {string} id - ID of the song.
   */
  song(id) {
    return new Promise((resolve, reject) => {
      this.API.get(`/songs/${id}`).then((res) => {
        resolve(res.data.response.song);
      }).catch((err) => reject(handleError(err)));
    });
  }

  /**
   * Search songs hosted on Genius.
   * @param {string} q - The term to search for.
   */
  search(q) {
    return new Promise((resolve, reject) => {
      this.API.get('/search', {
        params: { q },
      }).then((res) => {
        resolve(res.data.response.hits);
      }).catch((err) => reject(handleError(err)));
    });
  }

  /**
   * Data for a specific artist.
   * @param {string} id - ID of the artist.
   */
  artist(id) {
    return new Promise((resolve, reject) => {
      this.API.get(`/artists/${id}`).then((res) => {
        resolve(res.data.response.artist);
      }).catch((err) => reject(handleError(err)));
    });
  }

  /**
   * Songs for the artist specified.
   * @param {string} id - ID of the artist.
   * @param {Object} [options] - Options for the query.
   * @param {string} [options.sort=title] - Sort results (by title or popularity).
   * @param {number} [options.count=20] - Number of results to return per request.
   * @param {number} [options.page=1] - Paginated offset.
   */
  artistSongs(id, { sort, count, page } = {}) {
    return new Promise((resolve, reject) => {
      this.API.get(`/artists/${id}/songs`, {
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

  /**
   * Referents by content item or user responsible for an included annotation.
   * @param {Object} params - Params of the query.
   * @param {string} [params.user] - ID of a user to get referents for.
   * @param {string} [params.song] - ID of a song to get referents for.
   * @param {string} [params.webPage] - ID of a web page to get referents for.
   * @param {string} [params.format=dom] - Format for text bodies of documents. (dom, plain or html)
   * @param {number} [params.count=20] - Number of results to return per request.
   * @param {number} [params.page=1] - Paginated offset.
   */
  referents({
    user, song, webPage, format, count, page,
  }) {
    return new Promise((resolve, reject) => {
      if (song && webPage) {
        reject(new Error('Cannot specify a song and a web page.'));
      } else if (!song && !user && !webPage) {
        reject(new Error('Must specify user ID, song ID or webPage ID.'));
      }
      this.API.get('/referents', {
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

  /**
   * Data for a specific annotation.
   * @param {string} [id] - ID of the annotation.
   * @param {string} [format=dom] - Format for text bodies of documents. (dom, plain or html)
   */
  annotation(id, format) {
    return new Promise((resolve, reject) => {
      this.API.get(`/annotations/${id}`, {
        params: {
          text_format: format,
        },
      }).then((res) => {
        resolve(res.data.response.annotation);
      }).catch((err) => reject(handleError(err)));
    });
  }

  /**
   * Lyrics of a specific song.
   * @param {string} [id] - ID of the song.
   */
  async lyrics(id) {
    let lyrics;
    while (!lyrics) {
      // eslint-disable-next-line no-await-in-loop
      const page = await this.WEB.get(`/songs/${id}`);
      const $ = cheerio.load(page.data);
      lyrics = $('div[class="lyrics"]').text().trim();
    }

    return lyrics.split('\n\n').map((p) => {
      const [part, ...content] = p.split('\n');
      return ({ part: part.replace(/\[|\]/g, ''), content });
    });
  }
};
