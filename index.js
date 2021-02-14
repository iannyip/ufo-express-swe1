// import modules
import express from 'express';
import {add, read, write} from './jsonFileStorage.js';
import methodOverride from 'method-override';

// Setup
const PORT = 3004;
const app = express();
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public")); // Allows you to use external stylesheets in "public" (or custom folder name)
app.use(methodOverride('_method'));
let sortStatus = true;
let sortCity = true;

// Define helper function
const validateEmptyFields = (res, objToValidate, index) => {
  for (const property in objToValidate){
    if (objToValidate[property] === ""){
      console.log(`${property} is blank!!`);
      res.redirect(`/sighting/${index}/edit`);
    }
  }
}

// Define routes/ middleware 
app.get('/sighting', (request, response) => {
  response.render('sightings');
})

app.post('/sighting', (request, res) => {
  const newData = request.body;
  
  console.log("newData: ", newData);
  
  add('data.json', "sightings", newData, (data, error) =>{
    if (error){
      console.log("error",error);
    }
    const newIndex = data.sightings.length - 1;
    validateEmptyFields(res, newData, newIndex);
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
  console.log("sort Index is: ", request.query.sortIndex)
  console.log("sort City is: ", request.query.sortCity)
  read('data.json', (data, error) => {
    for (let i = 0; i < data.sightings.length; i += 1){
      data.sightings[i].index = i+1;
    }
    if(request.query.sortIndex==="true" && sortStatus === true){
      data.sightings.reverse();
      sortStatus = false;
    } else{
      sortStatus = true;
    }
    if (request.query.sortCity ==="true" && sortCity === true){
      data.sightings.sort((obj1, obj2) =>{
        if (obj1.city > obj2.city) return 1;
        if (obj1.city < obj2.city) return -1;
        return 0;
      })
      sortCity = false;
    } else if (request.query.sortCity ==="true" && sortCity === false) {
      data.sightings.sort((obj1, obj2) =>{
        if (obj1.city < obj2.city) return 1;
        if (obj1.city > obj2.city) return -1;
        return 0;
      })
      sortCity = true;
    }
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

app.delete("/sighting/:index/delete", (request, response) => {
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