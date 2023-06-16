'use strict'

const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.static('public'));
app.use(cors());

app.listen(8000, () => console.log('app started on http://localhost:8000'));
