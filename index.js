// import modules
import express from 'express';
import {add, read} from './jsonFileStorage.js';

// Setup
const PORT = 3004;
const app = express();
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }));

// Define routes/ middleware 
app.get('/sighting', (request, response) => {
  response.render('sightings');
})

app.post('/sighting', (request, response) => {
  const newData = request.body;
  console.log(request.body);
  add('data.json', "sightings", newData, (data, error) =>{
    console.log('added');
    const newIndex = data.sightings.length;
    console.log(`/sighting/${newIndex}`);
    response.redirect(`/sighting/0`);
  });
})

app.get('/', (request, response) => {
  console.log('incoming request');
  read('data.json', (data, error) => {
    response.render('main', data);
  })
})

app.get('/sighting/:index', (request, response) => {
  console.log('being redirected');
  const index = request.params.index;
  read('data.json', (data, error) =>{
    const sightingObj = data.sightings[index]
    response.render('sighting-page', {sightingObj});
  })
})



// Start the server
app.listen(PORT);