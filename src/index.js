const express = require('express');
const app = express();
app.use(express.json());

//abrir cors para que se pueda acceder desde cualquier lugar
const cors = require('cors');
app.use(cors());



const subscribersRouter = require('./routes/subscribers');

app.use('/subscribers', subscribersRouter);
app.get('/', (req, res) => {
  res.send('Hello World!');
}
);

app.listen(3000, () => {
  console.log('Server is running');

});

  