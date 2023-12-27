const express = require('express')
const app = express()
const port = 3000
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb'); // Import ObjectId



const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger set up
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prison Management API',
      version: '1.0.0',
      description: 'This is a simple CRUD API application made with Express and documented with Swagger',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
    components: {
      securitySchemes: {
        jwt:{
					type: 'http',
					scheme: 'bearer',
					in: "header",
					bearerFormat: 'JWT'
        },
      },
    },
		security:[{
			"jwt": []
  }]
},
  apis: ['./main.js'], // path to your API routes

};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))


//middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7, authHeader.length); // "Bearer " is 7 characters
      //... (rest of your verification logic)
    } else {
      return res.status(403).json({ error: 'No token provided' });
    }
  
    const token = authHeader.split(' ')[1]; // Expecting "Bearer TOKEN_STRING"
    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({ error: 'Failed to authenticate token' });
    }
  
    next();
  };
  
  
  // Secret key for JWT signing and encryption
  const secret = 'your-secret-key'; // Store this securely
  
  app.use(bodyParser.json());



/**
 * @swagger
 * /login/user:
 *   post:
 *     description: User Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               password: 
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid username or password
 */
    // Function to generate an access token
const generateAccessToken = (payload) => {
    // The payload can be any data you want to include in the token
    return jwt.sign(payload, secret, { expiresIn: '1h' }); // Adjust the expiration as needed
  };

app.post('/login/user', async (req, res) => {
    const user = db.collection('user');
  const { username, password } = req.body;

	console.log(req.body);

    const users = await user.findOne({ username, password });
	
	if (!users || users.password !== password){
		res.status(401).send("invalid username or password");
		return;
	}



    // Create token if the user was found
  const token = generateAccessToken({ userId: user._id });


	res.status(200).json({
		username: user.username,
		name: user.Name,
		officerno: user.officerno,
		rank: user.Rank,
		phone: user.Phone,
        message: 'Admin authenticated successfully',
		token: token

	});

   
})
const uri = "mongodb://anitagobinathan19:anita1923@ac-3qil6d5-shard-00-00.xmughkp.mongodb.net:27017,ac-3qil6d5-shard-00-01.xmughkp.mongodb.net:27017,ac-3qil6d5-shard-00-02.xmughkp.mongodb.net:27017/?replicaSet=atlas-smqsut-shard-0&ssl=true&authSource=admin";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("ISSASSIGNMENT").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);
let db;
let Visitorregistration;
let adminuser;



// Connect to MongoDB and initialize collections
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
    db = client.db('ISSASSIGNMENT');
    

  // Initialize collections after establishing the connection
  Visitorregistration = db.collection('visitor');
  adminuser = db.collection('user');


  // Now you can safely start your server here, after the DB connection is established
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});


// In-memory data storage (replace with a database in production)
const visitor = [];
const user = [];

app.use(express.json());


/**
 * @swagger
 * /register/user:
 *   post:
 *     description: User Registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               password: 
 *                 type: string
 *               name: 
 *                 type: string
 *               officerno:
 *                 type: string
 *               rank:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful registered
 *       401:
 *         description: There is an error during registration , Please try again
 */

app.post('/register/user', async (req, res) => {
    const user = db.collection('user');
    const { username, password, name, officerno, rank, phone } = req.body;

	console.log(req.body);
	
    const existingUser = await user.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
  
    await user.insertOne({ username, password, name, officerno, rank, phone });
    res.status(201).json({ message: 'User registered successfully' });
  });

  
/**
 * @swagger
 * /registervisitor:
 *   post:
 *     description: Register a new visitor
 *     tags: 
 *      - visitor
 *     security:   
 *      - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               password: 
 *                 type: string
 *               Name: 
 *                 type: string
 *               Age:
 *                 type: string
 *               Gender:
 *                 type: string
 *               Address:
 *                 type: string
 *               Zipcode:
 *                 type: string
 *               Relation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Visitor registered successfully
 *       500:
 *         description: Error occurred while registering the visitor
 */


// Protected route for registering a visitor - token required
app.post('/registervisitor',verifyToken, async (req, res) => {
    try {
      const visitor = db.collection('visitor');
     

       // Check if the user is authenticated (you might want to use middleware for this)
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

       const { username, password, Name, Age, Gender, Address, Zipcode, Relation } = req.body;
      await visitor.insertOne({ username, password, Name, Age, Gender, Address, Zipcode, Relation });

      res.status(201).json({ message: 'Visitor registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while registering the visitor' });
    }
  });

  /**
 * @swagger
 * /viewvisitor:
 *    get:
 *     description: View all visitors
 *     tags: 
 *      - visitor
 *     security:   
 *      - jwt: []
 *     responses:
 *       200:
 *         description: List of all visitors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/visitor'
 *       500:
 *         description: Error occurred while fetching visitors
 */


// Protected route for viewing visitors - token required
app.get('/viewvisitor', verifyToken, async (req, res) => {
    try {
      const visitor = db.collection('visitor');
      const results = await visitor.find().toArray();
  
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching visitors' });
    }
  });

  
/**
 * @swagger
 * /visitorpass:
 *   post:
 *     description: Create visitor passes
 *     tags: 
 *      - visitor
 *     security:   
 *      - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visitorId
 *               - issuedBy
 *               - validUntil
 *             properties:
 *               visitorId:
 *                 type: string
 *               issuedBy:
 *                 type: string
 *               validUntil:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Visitor pass issued successfully
 *       500:
 *         description: Error occurred while issuing the pass
 */


// Admin issue visitor pass
// Admin Issue Visitor Pass
app.post('/visitorpass', verifyToken, async (req, res) => {
    const { visitorId, issuedBy, validUntil } = req.body;
  
    try {
      const visitorpass = db.collection('visitorpass');
  
      const newPass = {
        visitorId,
        issuedBy,
        validUntil,
        issuedAt: new Date(),
      };
  
      await visitorpass.insertOne(newPass);
      res.status(201).json({ message: 'Visitor pass issued successfully' });
    } catch (error) {
      console.error('Issue Pass Error:', error.message);
      res.status(500).json({ error: 'An error occurred while issuing the pass', details: error.message });
    }
  });
  
  
/**
 * @swagger
 * /retrievepass/{visitorId}:
 *    get:
 *     description: Retrieve visitor passes
 *     tags: 
 *      - pass
 *     security:   
 *      - jwt: []
 *     parameters:
 *       - in: path
 *         name: visitorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The visitor ID
 *     responses:
 *       200:
 *         description: Visitor pass details
 *       404:
 *         description: No pass found for this visitor
 *       500:
 *         description: Error occurred while retrieving the pass
 */


//Visitor to Retrieve Their Pass
// Visitor Retrieve Pass
app.get('/retrievepass/:visitorId', async (req, res) => {
    const visitorId = req.params.visitorId;
  
    try {
      const visitorpass = db.collection('visitorpass');
      const pass = await visitorpass.findOne({ visitorId });
  
      if (!pass) {
        return res.status(404).json({ error: 'No pass found for this visitor' });
      }
  
      res.json(pass);
    } catch (error) {
      console.error('Retrieve Pass Error:', error.message);
      res.status(500).json({ error: 'An error occurred while retrieving the pass', details: error.message });
    }
  });
  
  