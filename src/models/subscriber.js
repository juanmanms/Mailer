const MailerLite = require('@mailerlite/mailerlite-nodejs').default;
require('dotenv').config();



const mailerlite = new MailerLite({
  api_key: process.env.API_KEY,
});

class Subscriber {
  constructor(email) {
    this.email = email;
  }


  save() {
    return new Promise((resolve, reject) => {
      const params = {
        email: this.email,
        groups: [process.env.Group_ID_Default],
        status: 'active',
      };

      mailerlite.subscribers
        .createOrUpdate(params)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error.response) reject(error.response.data);
        });
    });
  }
}

module.exports = Subscriber;