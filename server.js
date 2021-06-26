const express = require('express')
var cors = require('cors')
const app = express()
//const save = require('instagram-save')
app.use(cors())

const fetch = require('node-fetch');

app.get('/', (req, res) => {
  
  //https://www.instagram.com/p/{name.node.shortcode}/
  const fs = require('fs')
  let obj
  const thumbnails = []

  fs.readFile('datasource.json', 'utf8', function (err, data) {
    if (err) throw err;
    obj = JSON.parse(data);

    for (let i = 0; i < obj.graphql.user.edge_owner_to_timeline_media.edges.length; i++) {
      thumbnails.push({
        url : obj.graphql.user.edge_owner_to_timeline_media.edges[i].node.thumbnail_src,
        text : obj.graphql.user.edge_owner_to_timeline_media.edges[i].node.shortcode
      })
    }
   
    Promise.all(thumbnails.map(thumbnail =>
        fetch(thumbnail.url)
        .then(res => {
          new Promise((resolve, reject) => {
            const dest = fs.createWriteStream('./img/'+thumbnail.text+'.jpg');
            res.body.pipe(dest);
            res.body.on("end", () => resolve("done"));
          })
        })
    )).then(texts => {
      res.json(obj)
    })
 });

})

app.get('/img/:id', function(req,res){
  var id = req.params.id;
  console.log(__dirname +'/img/'+id+'.jpg');
  res.sendFile(__dirname +'/img/'+id+'.jpg');
})


app.listen(9000, () => {
  console.log('Application is running on port 9000')
})