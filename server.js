const express = require('express')
const app = express()
const port = 3000
const cors = require('cors');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
const oldurl = 'mongodb+srv://KumarDevada:KumarDevada@cluster0.kdx2brx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const url = 'mongodb+srv://kumardevada123:kumar@cluster0.xl8ujhz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
// Middleware to parse JSON and handle URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// connect to mongodb server
mongoose.connect(url, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB server...');
}).catch(err => {
    console.log('Error connecting to MongoDb: ',err);
})

const User = require('./models/User');
const MPTC = require('./models/MPTC');

// var ObjectId = require('mongodb').ObjectId;

app.post('/register', async (req, res) => {
    const { username, phoneNumber, mandalName, villageName, aadhar, password } = req.body;
  
    try {
      // Check if user already exists
      let user1 = await User.findOne({ aadhar });
      let user2 = await User.findOne({ phoneNumber });
      if (user1) {
        return res.status(400).json({ msg: 'User already exists' });
      }
      if (user2) {
        return res.status(400).json({ msg: 'User already exists' });
      }
  
      
      // Create new user
      let user = new User({
        username,
        phoneNumber,
        mandalName,
        villageName,
        aadhar,
        password,
      });
    //console.log(user);
  
      await user.save();
      res.status(201).json({ msg: 'User registered successfully' });
    //   console.log('user saved in database');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  app.post('/login', async (req, res) => {
    const { phoneNumber, password } = req.body;
  
    try {
      // Check if user exists
      let user = await User.findOne({ phoneNumber });
      if (!user) {
        return res.status(400).json({ msg: 'User not found' });
      }
  
      // Check if passwords match
      if (user.password !== password) {
        return res.status(400).json({ msg: 'Incorrect Password' });
      }
  
      // Send success response
      res.status(200).json({ msg: 'Login successful', user });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });


  app.post('/add-mptc', async (req, res) => {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ msg: 'Name is required' });
    }
  
    try {
      const mptc = new MPTC({
        name,
        queries: []
      });
      await mptc.save();
      res.status(201).json({ msg: 'MPTC added successfully', mptc });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  });


  app.post('/post-query', async (req, res) => {
    const { mptcId, username, phoneNumber, mandalName, villageName, description, date, level, mptc } = req.body;
 
    console.log('post query api called.')
    try {
        // Find the MPTC record by ID
        // console.log(req.body);
        const mptcRecord = await MPTC.findById(mongoose.Types.ObjectId.createFromHexString(mptcId));
      
      if (!mptcRecord) {
        return res.status(404).json({ msg: 'MPTC not found' });
      }
    //   console.log(mptcRecord);
  
      const newQuery = {
        username,
        phoneNumber,
        mandalName,
        villageName,
        description,
        date,
        mptc,
        level,
        resolved: false,
        upvotes: [],
      };
  
      if (!mptcRecord.queries) {
      mptcRecord.queries = [];
    }
    mptcRecord.queries.push(newQuery);

    await mptcRecord.save();
  
      res.status(201).json({ msg: 'Query added successfully', query: newQuery });
      console.log('success');
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  });

  app.get('/', (req,res) => {
    res.send('hello');
  })

  app.get('/mptc-queries/:mptcId', async (req, res) => {
    const { mptcId } = req.params;
  
    try {
      // Find the MPTC record by ID
      const mptcRecord = await MPTC.findById(mongoose.Types.ObjectId.createFromHexString(mptcId));
  
      if (!mptcRecord) {
        return res.status(404).json({ msg: 'MPTC not found' });
      }
  
      const queries = mptcRecord.queries;
      res.json(queries);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server error' });
    }
  });


  app.post('/upvote-query', async (req, res) => {
    // console.log('upvote api called ', req.body);
    const { phoneNumber, mptcId, queryId } = req.body;
  
    try {
      const mptcRecord = await MPTC.findById(mongoose.Types.ObjectId.createFromHexString(mptcId));
      if (!mptcRecord) {
        return res.status(404).json({ msg: 'MPTC not found' });
      }
  
      const query = mptcRecord.queries.id(mongoose.Types.ObjectId.createFromHexString(queryId));
      if (!query) {
        return res.status(404).json({ msg: 'Query not found' });
      }
  
      if (!query.upvotes.includes(phoneNumber)) {
        query.upvotes.push(phoneNumber);
        await mptcRecord.save();
        return res.status(200).json({ msg: 'Upvoted successfully', query });
      } else {
        return res.status(400).json({ msg: 'Already upvoted' });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  });



  app.post('/solve-query', async (req, res) => {
    const { mptcId, queryId } = req.body;
  
    try {
      const mptcRecord = await MPTC.findById(mongoose.Types.ObjectId.createFromHexString(mptcId));
      if (!mptcRecord) {
        return res.status(404).json({ msg: 'MPTC not found' });
      }
  
      const query = mptcRecord.queries.id(mongoose.Types.ObjectId.createFromHexString(queryId));
      if (!query) {
        return res.status(404).json({ msg: 'Query not found' });
      }
  
      query.resolved = true;
      await mptcRecord.save();
      return res.status(200).json({ msg: 'Query resolved successfully', query });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  });


  app.post('/next-query', async (req, res) => {
    const { mptcId, queryId } = req.body;
  
    try {
      const mptcRecord = await MPTC.findById(mongoose.Types.ObjectId.createFromHexString(mptcId));
      if (!mptcRecord) {
        return res.status(404).json({ msg: 'MPTC not found' });
      }
  
      const query = mptcRecord.queries.id(mongoose.Types.ObjectId.createFromHexString(queryId));
      if (!query) {
        return res.status(404).json({ msg: 'Query not found' });
      }
  
      if(query.level === 'MPTC') query.level = 'MPP';
      else if(query.level === 'MPP') query.level = 'MLA';
      await mptcRecord.save();
      return res.status(200).json({ msg: 'Query resolved successfully', query });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  });

// // Create
// app.post('/api/profiles', (req,res) => {
//     const {name, email, gender, status } = req.body
//     const newUser = new Users({name, email, gender, status})
//     newUser.save()
//         .then(i => {
//             res.status(201).json(i);
//         })
//         .catch(err => {
//             res.status(500).json({error: err.message})
//         })
// })

// // Read
// app.get('/api/profiles', (req,res) => {
//     Users.find({})
//         .then(i => {
//             res.status(201).json(i)
//         })
//         .catch(err => {
//             res.status(500).json({error: err.message})
//         })
// })

// // Update
// app.put('/api/profiles/:id', (req,res) =>{
//     const {id} = req.params
//     const {name, email, gender, status} = req.body
//     Users.findByIdAndUpdate(id, {name, email, gender, status}, { new: true })
//         .then(i => {
//             res.status(201).json(i)
//         })
//         .catch(err => {
//             res.status(500).json({error: err.message})
//         })
// })

// // Delete
// app.delete('/api/profiles/:id', (req,res) => {
//     const {id} = req.params
//     Users.findByIdAndDelete(id)
//         .then(i => {
//             if(!i) res.status(404).json({error: 'User not found...'})
//             else res.status(200).json(i)
//         })
//         .catch(err => {
//             res.status(500).json({error: err.message})
//         })
// })


app.listen(port, () => {
    console.log('Server is running at http://localhost:'+port);
})

