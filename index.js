const axios = require('axios');

function handleError(err) {
  switch (err.response.status) {
    case 401:
      return new Error('Invalid access token');
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

  getSong(id) {
    return new Promise((resolve, reject) => {
      this.instance.get(`/songs/${id}`).then((res) => {
        resolve(res.data.response.song);
      }).catch((err) => reject(handleError(err)));
    });
  }
};
