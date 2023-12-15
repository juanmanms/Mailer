const express = require('express');
const app = express();
app.use(express.json());



const subscribersRouter = require('./routes/subscribers');

app.use('/subscribers', subscribersRouter);
app.get('/', (req, res) => {
  res.send('Hello World!');
}
);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
  console.log('http://localhost:3000');
});

  