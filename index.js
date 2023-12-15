const express = require('express');
const app = express();
app.use(express.json());



const subscribersRouter = require('./src/routes/subscribers');

app.use('/subscribers', subscribersRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
  console.log('http://localhost:3000');
});

  