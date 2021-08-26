const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const {User, Exercises } = require('./models/user')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



// The most important two lines 
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());


// Connect to database
mongoose.connect(process.env['DB_URL'], { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;

// check connection
db.once('open', () => {
    console.log('connectd to mongoDB');
})

// Print error if found
db.on('error', err => console.log(err));




app.get('/api/users', (req, res) =>{
    User.find({}, (err, users) => {
        if (err) {
            return res.json(err)
        }
        //console.log(users);
        res.json(users)
    })
});


app.post('/api/users', (req, res) => {
    User.create({username : req.body.username})
    .then(user => {
        res.json(user);
    })
    .catch(err => {
        re.status(400);
    })
});






app.post('/api/users/:_id/exercises', (req, res) => {
    // find user by id

    let exercises;
    if (req.body.date){
        exercises = new Exercises({
            description : req.body.description,
            date : new Date(req.body.date),
            duration : parseInt(req.body.duration)
        })
    }else{
        exercises = new Exercises({
            description : req.body.description,
            date : new Date(),
            duration : parseInt(req.body.duration)
        })
    }
   
    console.log()
    console.log(req.params._id)

    User.findByIdAndUpdate(req.params._id , {$push: {log:exercises}}, {new : true}, (err, user) => {
        if(err) return res.json(err)

    
        //console.log(user)
        let  response = {
            description : exercises.description,
            duration : exercises.duration,
            date : exercises.date,
            
            /*_id : user.id,
            username : user.username        
            */

            user : {
                _id : user.id,
                username : user.username
            }
        }
    
        console.log(response);
        res.json(response);
    });
});


app.get('/api/users/:_id/logs', (req, res) => {
    User.findById(req.params._id, (err, user) => {

        let ress = {
            _id : user.id,
            username : user.username,
            log : user.log,
            count : user.log.length
        }
        res.json(ress)
        //res.send({count : user.log.length})
    })
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
