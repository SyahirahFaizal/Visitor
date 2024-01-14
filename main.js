const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { checkAccountLockout, verifyToken } = require('./middleware');
const User = require('./user');
const Visitor = require('./visitor.js');
const VisitorInfo = require('./visitorinfo');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB Connection
MongoClient.connect(
    'mongodb://syahirahmfaizal:241018atz@ac-zp8a4we-shard-00-00.szywh0c.mongodb.net:27017,ac-zp8a4we-shard-00-01.szywh0c.mongodb.net:27017,ac-zp8a4we-shard-00-02.szywh0c.mongodb.net:27017/?replicaSet=atlas-i0x38w-shard-0&ssl=true&authSource=admin',
).catch((err) => {
    console.error(err.stack);
    process.exit(1);
}).then(async (client) => {
    console.log('Connected to MongoDB');
    User.injectDB(client);
    Visitor.injectDB(client);
    VisitorInfo.injectDB(client);
});

// Swagger Documentation Configuration
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Visitor Management System',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                jwt: {
                    type: 'http',
                    scheme: 'bearer',
                    in: 'header',
                    bearerFormat: 'JWT',
                },
            },
            security: [{
                jwt: [],
            }],
        },
    },
    apis: ['./main.js','./user.js', './visitor.js', './visitorinfo.js'],
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /login/user:
 *   post:
 *     description: User Login
 *     tags:
 *     - Authentication
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

app.post('/login/user', checkAccountLockout, async (req, res) => {
	console.log(req.body);

	let user = await User.login(req.body.username, req.body.password);
	
	if (user.status == ("invalid username" || "invalid password")) {
		res.status(401).send("invalid username or password");
		return
	}


	res.status(200).json({
		username: user.username,
		name: user.Name,
		officerno: user.officerno,
		rank: user.Rank,
		phone: user.Phone,
		token: generateAccessToken({ rank: user.Rank })

	});
})

// /**
//  * @swagger
//  * /login/visitor:
//  *   post:
//  *     description: Visitor Login
//  *     tags:
//  *     - Authentication
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               username: 
//  *                 type: string
//  *               password: 
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Successful login
//  *       401:
//  *         description: Invalid username or password
//  */

// app.post('/login/visitor', async (req, res) => {
// 	console.log(req.body);

// 	let user = await Visitor.login(req.body.username, req.body.password);

// 	if (user.status == ("invalid username" || "invalid password")) {
// 		res.status(401).send("invalid username or password");
// 		return
// 	}

// 	res.status(200).json({
// 		username: user.username,
// 		name: user.Name,
// 		age: user.Age,
// 		gender: user.Gender,
// 		relation: user.Relation,
// 		token: generateAccessToken({ username: user.username })
// 	});
// })

/**
 * @swagger
 * /register/user:
 *   post:
 *     description: User Registration
 *     tags:
 *     - Registration
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
	console.log(req.body);
	
	const reg = await User.register(req.body.username, req.body.password, req.body.name, req.body.officerno, req.body.rank, req.body.phone);
	console.log(reg);

	res.json({reg})
})

/**
 * @swagger
 * /register/visitor:
 *   post:
 *     description: Visitor Registration
 *     tags:
 *     - Registration
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
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *               relation:
 *                 type: string
 *               telno:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful registered
 *       401:
 *         description: There is an error during registration , Please try again
 */

app.post('/register/visitor', async (req, res) => {
	console.log(req.body);

		const reg = await Visitor.register(req.body.username, req.body.password, req.body.name, req.body.age, req.body.gender, req.body.relation, req.body.telno);
		console.log(reg);
	
	res.json({reg})
})

app.use(verifyToken);

/**
 * @swagger
 * /register/VisitorInfo:
 *   post:
 *     security:
 *      - jwt: []
 *     description: Create VisitorInfo
 *     tags:
 *     - Registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               logno:
 *                 type: integer
 *               username: 
 *                 type: string
 *               pettype: 
 *                 type: string
 *               dateofvisit:
 *                 type: string
 *               timein:
 *                 type: string
 *               timeout:
 *                 type: string
 *               purpose:
 *                 type: string
 *               apartmentno:
 *                 type: string

 *     responses:
 *       200:
 *         description: Successful registered
 *       401:
 *         description: There is an error during registration , Please try again
 */


 app.post('/register/visitorinfo', async (req, res) => {
	console.log(req.body);

	if (req.user.rank == "officer" || "security"){
		const reg = await VisitorInfo.register(req.body.logno, req.body.username, req.body.pettype, req.body.dateofvisit, req.body.timein, req.body.timeout, req.body.purpose, req.body.apartmentno);
		res.status(200).send(reg)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})


/**
 * @swagger
 * /user/update:
 *   patch:
 *     security:
 *      - jwt: []
 *     description: User Update
 *     tags:
 *     - Modification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
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
 *         description: Successful updated
 *       401:
 *         description: There is an error during updating , Please try again
 */

app.patch('/user/update', async (req, res) => {
	console.log(req.body);

	if (req.user.rank == "officer"){
		const update = await User.update(req.body.username, req.body.name, req.body.officerno, req.body.rank, req.body.phone);
		res.status(200).send(update)
	}
	else{
		res.status(403).send("You are unauthorized")
	}

})


// /**
//  * @swagger
//  * /viewuser:
//  *   get:
//  *     summary: View all visitors
//  *     tags: [User]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of all visitors
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/User'
//  *       500:
//  *         description: Error occurred while fetching visitors
//  */


// // Protected route for viewing visitors - token required
// app.get('/viewvisitor', verifyToken, async (req, res) => {
//   try {
//     const visitors = db.collection('visitors');
//     const results = await visitors.find().toArray();

//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred while fetching visitors' });
//   }
// });

  

 app.patch('/register/visitorinfo', async (req, res) => {
	console.log(req.body);

	if (req.user.rank == "officer" || "security"){
		const reg = await VisitorInfo.register(req.body.logno, req.body.username, req.body.pettype, req.body.dateofvisit, req.body.timein, req.body.timeout, req.body.purpose, req.body.apartmentno);
		res.status(200).send(reg)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /delete/user:
 *   delete:
 *     security:
 *      - jwt: []
 *     description: Delete User
 *     tags:
 *     - Remove(delete)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               
 *     responses:
 *       200:
 *         description: Successful delete
 *       401:
 *         description: There is an error during deleting , Please try again
 */

app.delete('/delete/user', async (req, res) => {
	if (req.user.rank == "officer"){
		const del = await User.delete(req.body.username)
		res.status(200).send(del)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

// /**
//  * @swagger
//  * /delete/visitor:
//  *   delete:
//  *     security:
//  *      - jwt: []
//  *     description: Delete Visitor
//  *     tags:
//  *     - Remove(delete)
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               username: 
//  *                 type: string
//  *               
//  *     responses:
//  *       200:
//  *         description: Successful deleted
//  *       401:
//  *         description: There is an error during deleting , Please try again
//  */

// app.delete('/delete/visitor', async (req, res) => {
// 	if (req.user.rank == "officer"){
// 		const del = await Visitor.delete(req.body.username)
// 		res.status(200).send(del)
// 	}
// 	else{
// 		res.status(403).send("You are unauthorized")
// 	}
// })

// /**
//  * @swagger
//  * /delete/visitorinfo:
//  *   delete:
//  *     security:
//  *      - jwt: []
//  *     description: Delete VisitorInfo
//  *     tags:
//  *     - Remove(delete)
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               logno: 
//  *                 type: integer
//  *               
//  *     responses:
//  *       200:
//  *         description: Successful delete
//  *       401:
//  *         description: There is an error during deleting , Please try again
//  */

//  app.delete('/delete/visitorinfo', async (req, res) => {
// 	if (req.user.rank == "officer" || "security"){
// 		const del = await VisitorInfo.delete(req.body.logno)
// 		res.status(200).send(del)
// 	}
// 	else{
// 		res.status(403).send("You are unauthorized")
// 	}
// })

// /**
//  * @swagger
//  * /view/user:
//  *   get:
//  *     summary: View all users
//  *     tags: 
//  *       - User
//  *     security:
//  *       - jwt: []
//  *     responses:
//  *       200:
//  *         description: List of all users
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                   properties:
//  *                     username: 
//  *                       type: string
//  *                     password: 
//  *                       type: string
//  *                     name: 
//  *                       type: string
//  *                     rank:
//  *                       type: string
//  *                     phone:
//  *                       type: string
//  *       401:
//  *         description: Unauthorized access
//  *       500:
//  *         description: Error occurred while fetching users
//  */

// // Protected route for viewing users - token required
// app.get('/view/user', verifyToken, async (req, res) => {
//     try {
//         const users = await db.collection('users').find().toArray();
//         res.json(users);
//     } catch (error) {
//         res.status(500).json({ error: 'An error occurred while fetching users' });
//     }
// });


// /**
//  * @swagger
//  * /issueuserpass:
//  *   post:
//  *     summary: Issue a visitor pass
//  *     tags: 
//  *       - Pass
//  *     security:
//  *       - jwt: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - userId
//  *               - issuedBy
//  *               - validUntil
//  *             properties:
//  *               userId:
//  *                 type: string
//  *               issuedBy:
//  *                 type: string
//  *               validUntil:
//  *                 type: string
//  *                 format: date
//  *     responses:
//  *       201:
//  *         description: Visitor pass issued successfully
//  *       500:
//  *         description: Error occurred while issuing the pass
//  */


// // Admin issue visitor pass
// // Admin Issue Visitor Pass
// app.post('/issueuserpass', verifyToken, async (req, res) => {
// 	const { userId, issuedBy, validUntil } = req.body;
  
// 	try {
// 	  const userPasses = db.collection('users');
  
// 	  const newPass = {
// 		userId,
// 		issuedBy,
// 		validUntil,
// 		issuedAt: new Date(),
// 	  };
  
// 	  await userPasses.insertOne(newPass);
// 	  res.status(201).json({ message: 'Visitor pass issued successfully' });
// 	} catch (error) {
// 	  console.error('Issue Pass Error:', error.message);
// 	  res.status(500).json({ error: 'An error occurred while issuing the pass', details: error.message });
// 	}
//   });

  
  
  

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})