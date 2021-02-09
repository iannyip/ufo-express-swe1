// import modules
import express from 'express';
import {add, read} from './jsonFileStorage.js';

// Setup
const PORT = 3004;
const app = express();
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public")); // Allows you to use external stylesheets in "public" (or custom folder name)

// Define routes/ middleware 
app.get('/sighting', (request, response) => {
  response.render('sightings');
})

app.post('/sighting', (request, res) => {
  const newData = request.body;
  add('data.json', "sightings", newData, (data, error) =>{
    if (error){
      console.log("error",error);
    }
    const newIndex = data.sightings.length - 1;
    const sightingObj = data.sightings[newIndex]
    res.redirect(`/sighting/${newIndex}`);
  });
})

app.get('/sighting/:index', (request, response) => {
  console.log('being redirected');
  const index = request.params.index;
  read('data.json', (data, error) =>{
    const sightingObj = data.sightings[index]
    response.render('sighting-page', {sightingObj});
  })
})

app.get('/', (request, response) => {
  console.log('incoming request');
  read('data.json', (data, error) => {
    response.render('main', data);
  })
})

app.get("/sighting/:index/edit", (request, response) => {
  const index = request.params.index;

  read("data.json", (data, error) => {
    const sightingObj = data.sightings[index];
    console.log(sightingObj);
    response.render("sighting-edit", {sightingObj});
  })
})

// Start the server
app.listen(PORT);