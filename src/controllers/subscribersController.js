const Subscriber = require('../models/subscriber');

exports.createSubscriber = (req, res) => {
    const email = req.params.email;
    const subscriber = new Subscriber(email);

    subscriber.save()
        .then(() => {
            res.status(201).send({ message: 'Subscriber created successfully' });
        })
        .catch((error) => {
            res.status(500).send({ error: error.message });
        });
};