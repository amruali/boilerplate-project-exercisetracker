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



function DateChecker(date, from, to){
    return date >= from && date <= to
}


app.post('/api/users/:_id/exercises', (req, res) => {
    // find user by id

    let exercises;
    if (req.body.date){
        exercises = new Exercises({
            description : req.body.description,
            date : String(new Date(req.body.date).toDateString()),
            duration : parseInt(req.body.duration)
        })
    }else{
        exercises = new Exercises({
            description : req.body.description,
            date : String(new Date().toDateString()),
            duration : parseInt(req.body.duration)
        })
    }
   
    

    User.findByIdAndUpdate(req.params._id , {$push: {log:exercises}}, {new : true}, (err, user) => {
        if(err) return res.json(err)

        let  response = {
            username : user.username,
            description : exercises.description,
            duration : exercises.duration,
            date : exercises.date,       
             _id : user.id           
        }
     
        res.json(response);
    });
});


app.get('/api/users/:_id/logs', (req, res) => {
    User.findById(req.params._id, (err, user) => {

        let ress = {
            username : user.username,
            count : user.log.length,
            _id : user.id,         
            log : user.log
        }

        let from, to;
        if(req.query.form){
            from = new Date(req.query.from);
        }else{
            from = new Date(0);
        }
        if(req.query.to){
            to = new Date(req.query.to);
        }else{
            to = new Date();
        }

        console.log(from, to)

        ress.log.forEach( log => {
            delete log['_id']
            log.date = new Date(log.date).toDateString() //String(new Date(log.date).toDateString())
        })


        // Use Filter
        ress.logs = ress.log.filter( log => {
            //let logDate = new Date(log.date).toISOString().substring(0, 10)
            log.date >= from
        })

        /*
        ress.log.filter( log => {
            //let logDate = new Date(log.date).toISOString().substring(0, 10)
            log.date <= to
        })


        */

         // Apply Limit
        if(req.query.limit){
            ress.log.slice(0, parseInt(req.query.limit));
        }


        ress.count = ress.log.length

        console.log(ress);
        res.json(ress)
        //res.send({count : user.log.length})
    })
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
