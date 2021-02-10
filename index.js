// import modules
import express from 'express';
import {add, read, write} from './jsonFileStorage.js';

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
    sightingObj["index"] = index;
    console.log(sightingObj);
    response.render("sighting-edit", {sightingObj});
  })
})

// Needs help
app.put("/sighting/:index/edit", (request, response) => {
  console.log('banana');
  const index = request.params.index;
  read("data.json", (data, error) => {
    data.sightings[index] = request.body;
    write("data.json", data, (doneData, error) => {
      response.redirect("/");
    })
  })
})

// Needs help
app.get("/sighting/:index/delete", (request, response) => {
  console.log('entered delete route');
  const index = request.params.index;
  console.log(index);
  read("data.json", (data, error) => {
    data.sightings.splice(index, 1);
    write("data.json", data, (donedata, error) => {
      response.redirect("/");
    })
  })
})

app.get("/shapes", (request, response) => {
  console.log('getting shapes list');
  const shapesObj = {};
  read("data.json", (data, error) => {
    data.sightings.forEach(sight => {
      console.log(sight.shape);
      if (sight.shape in shapesObj){
        shapesObj[sight.shape] += 1;
      }
      else{
        shapesObj[sight.shape] = 1;
      }
    })
    console.log(shapesObj);
    // response.send('yay');
    response.render("shapes", {shapesObj});
  })
})

app.get("/shapes/:shape", (request, response) => {
  const shape = request.params.shape;
  console.log(shape);
  const shapeObjArr = [];
  read("data.json", (data, error) => {
    data.sightings.forEach(sight => {
      if (sight.shape === shape){
        shapeObjArr.push(sight);
      }
    })
    console.log(shapeObjArr);
    // response.send("yay");
    response.render("shapes-result", {shapeObjArr});

  })
})

// Start the server
app.listen(PORT);