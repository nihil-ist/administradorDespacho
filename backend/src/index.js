const express = require('express');

const mongoose = require('./db/conection');  // Importa la conexión

const app = express();
const cors = require('cors');

app.use(cors({ origin: '*' }));
app.use(express.json());

const login = require('./routes/login');
const abc = require('./routes/abc');
app.use('/', login); 
app.use('/', abc);  

app.get('/', (req, res) => {
    console.log('Bienvenido')
});

const PORT = 3000;
app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
