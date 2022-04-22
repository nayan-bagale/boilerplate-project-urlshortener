require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_URI,
           { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDb Connection Succesed.")
  })
  .catch((err) => {
    console.log(err)
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const urlSchema = new mongoose.Schema({
  original_url: String,
  urlshort: Number,
});

const urldb = mongoose.model("urldb", urlSchema)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


function learnRegExp(){
  return /^(ftp|https?):\/\/+(www\.)?[a-z0-9\-\.]{3,}\.[a-z]{3}$/.test(learnRegExp.arguments[0]);
}


async function datainsert(url){
  var shorturl = await urldb
    .find()
    .sort({urlshort:-1})
    .limit(1)
  var urlshort = 1
  if(shorturl.length != 0) urlshort = shorturl[0].urlshort + 1
  data = new urldb({
    original_url: url,
    urlshort: urlshort
  })
  
  data.save(function(err, data) {
  if (err) return console.error(err);
    console.log(null, data)
  });
  return urlshort
}

app.post('/api/shorturl', async(req, res) => {
  if(learnRegExp(req.body.url)){
    var data = await urldb.find({   
      original_url: req.body.url });
    
    if(data.length != 0) urlshort = data[0].urlshort
    else urlshort = await datainsert(req.body.url)
    
    res.json({original_url: req.body.url,
              urlshort: urlshort})
  }else{
    res.json({ error: 'invalid url' });
  }
})

app.get('/api/shorturl/:shorturl', async(req, res) => {
  var urlshort = req.params.shorturl;
  console.log(urlshort)
  if(isNaN(urlshort)) res.json({ error: "Wrong format" });
  else{
    var data = await urldb.find({   
    urlshort: urlshort });
    if(data.length != 0) res.redirect(data[0].original_url);
    else res.json({ error: "Wrong format" }); 
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
