const MongoClient = require("mongodb").MongoClient;
const User = require("./user");
const Visitor = require("./visitor.js");

const VisitorInfo = require("./visitorinfo")
const {checkAccountLockout} = require("./middleware");


MongoClient.connect(
	// TODO: Connection 
	"mongodb://syahirahmfaizal:241018atz@ac-zp8a4we-shard-00-00.szywh0c.mongodb.net:27017,ac-zp8a4we-shard-00-01.szywh0c.mongodb.net:27017,ac-zp8a4we-shard-00-02.szywh0c.mongodb.net:27017/?replicaSet=atlas-i0x38w-shard-0&ssl=true&authSource=admin", 
	
).catch(err => {
	console.error(err.stack)
	process.exit(1)
}).then(async (client) => {
	console.log('Connected to MongoDB');
	User.injectDB(client);
	Visitor.injectDB(client);
	VisitorInfo.injectDB(client);
})

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const jwt = require ('jsonwebtoken');
function generateAccessToken(payload){
	return jwt.sign(payload, "secretcode", { expiresIn: '7d' });
}

function verifyToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (token == null) return res.sendStatus(401)

	jwt.verify(token, "secretcode", (err, user) => {
		console.log(err);

		if (err) return res.sendStatus(403)

		req.user = user

		next()
	})
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))


const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Group 4 Apartment Visiting System',
			version: '1.0.0',
		},
		components:{
			securitySchemes:{
				jwt:{
					type: 'http',
					scheme: 'bearer',
					in: "header",
					bearerFormat: 'JWT'
				}
			},
		security:[{
			"jwt": []
		}]
		}
	},
	apis: ['./main.js'], 
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

/**
 * @swagger
 * /login/visitor:
 *   post:
 *     description: Visitor Login
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

app.post('/login/visitor', async (req, res) => {
	console.log(req.body);

	let user = await Visitor.login(req.body.username, req.body.password);

	if (user.status == ("invalid username" || "invalid password")) {
		res.status(401).send("invalid username or password");
		return
	}

	res.status(200).json({
		username: user.username,
		name: user.Name,
		age: user.Age,
		gender: user.Gender,
		relation: user.Relation,
		token: generateAccessToken({ username: user.username })
	});
})

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

/**
 * @swagger
 * /visitor/update:
 *   patch:
 *     security:
 *      - jwt: []
 *     description: Visitor Update
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
 *         description: Successful updated
 *       401:
 *         description: There is an error during updating , Please try again
 */

app.patch('/visitor/update', async (req, res) => {
	console.log(req.body);

	if (req.user.rank == "officer"){
		const update = await Visitor.update(req.body.username, req.body.name, req.body.age, req.body.gender, req.body.relation, req.body.telno);
		res.status(200).send(update)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})



/**
 * @swagger
 * /visitorinfo/update:
 *   patch:
 *     security:
 *      - jwt: []
 *     description: VisitorInfo Update
 *     tags:
 *     - Modification
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
 *         description: Successful updated
 *       401:
 *         description: There is an error during updating , Please try again
 */

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

/**
 * @swagger
 * /delete/visitor:
 *   delete:
 *     security:
 *      - jwt: []
 *     description: Delete Visitor
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
 *         description: Successful deleted
 *       401:
 *         description: There is an error during deleting , Please try again
 */

app.delete('/delete/visitor', async (req, res) => {
	if (req.user.rank == "officer"){
		const del = await Visitor.delete(req.body.username)
		res.status(200).send(del)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})


/**
 * @swagger
 * /delete/visitorinfo:
 *   delete:
 *     security:
 *      - jwt: []
 *     description: Delete VisitorInfo
 *     tags:
 *     - Remove(delete)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               logno: 
 *                 type: integer
 *               
 *     responses:
 *       200:
 *         description: Successful delete
 *       401:
 *         description: There is an error during deleting , Please try again
 */

 app.delete('/delete/visitorinfo', async (req, res) => {
	if (req.user.rank == "officer" || "security"){
		const del = await VisitorInfo.delete(req.body.logno)
		res.status(200).send(del)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /viewvisitor:
 *   get:
 *     summary: View all visitors
 *     tags: 
 *       - Visitor
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: List of all visitors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   name:
 *                     type: string
 *                   age:
 *                     type: integer
 *                   gender:
 *                     type: string
 *                   relation:
 *                     type: string
 *                   telno:
 *                     type: string
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Error occurred while fetching visitors
 */
// Protected route for viewing visitors - token required
app.get('/viewvisitor', verifyToken, async (req, res) => {
    try {
        const visitors = req.app.locals.client.db().collection('visitor'); // Access db through req.app.locals.client
        const results = await visitors.find().toArray();
        res.json(results);
    } catch (error) {
        console.error('Error fetching visitors:', error); // Log the error
        res.status(500).json({ error: 'An error occurred while fetching visitors' });
    }
});

/**
 * @swagger
 * /issuepass:
 *   post:
 *     summary: Issue a pass to a visitor
 *     tags: 
 *       - Visitor
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               passType:
 *                 type: string
 *               duration:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pass issued successfully
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Visitor not found or invalid pass type
 *       500:
 *         description: Error occurred while issuing a pass
 */

// Protected route for issuing a pass to a visitor - token required
app.post('/issuepass', verifyToken, async (req, res) => {
    try {
        const { username, passType, duration } = req.body;

        // Check if the user issuing the pass is authorized
        if (req.user.rank !== "officer" && req.user.rank !== "security") {
            return res.status(403).json({ error: "You are unauthorized to issue a pass." });
        }

        // Check if the visitor exists
        const visitor = await Visitor.getByUsername(username);
        if (!visitor) {
            return res.status(403).json({ error: "Visitor not found." });
        }

        // Check if the pass type is valid
        const validPassTypes = ['temporary', 'permanent'];
        if (!validPassTypes.includes(passType)) {
            return res.status(403).json({ error: "Invalid pass type. Allowed types: temporary, permanent." });
        }

        // Perform pass issuance logic here (e.g., update visitor's pass information in the database)

        // Example: Update the visitor's pass information in the database
        const visitors = req.app.locals.client.db().collection('visitor');
        const updatedVisitor = await visitors.findOneAndUpdate(
            { username: username },
            { $set: { passType: passType, passDuration: duration } },
            { returnDocument: 'after' }
        );

        res.status(200).json({ message: "Pass issued successfully", visitor: updatedVisitor.value });
    } catch (error) {
        console.error('Error issuing pass:', error); // Log the error
        res.status(500).json({ error: 'An error occurred while issuing a pass' });
    }
});

/**
 * @swagger
 * /retrievepass/{logno}:
 *   get:
 *     summary: Retrieve pass for a visitor
 *     tags:
 *       - Visitor
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: logno
 *         schema:
 *           type: integer
 *         required: true
 *         description: Log number of the visitor pass
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logno:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 pettype:
 *                   type: string
 *                 dateofvisit:
 *                   type: string
 *                 timein:
 *                   type: string
 *                 timeout:
 *                   type: string
 *                 purpose:
 *                   type: string
 *                 apartmentno:
 *                   type: string
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Pass not found
 *       500:
 *         description: Error occurred while retrieving pass
 */
app.get('/retrievepass/:logno', verifyToken, async (req, res) => {
    try {
        const logNo = parseInt(req.params.logno);
        const pass = await VisitorInfo.retrievePass(logNo);

        if (pass.status) {
            return res.status(404).json({ error: pass.status });
        }

        res.json(pass);
    } catch (error) {
        console.error('Error retrieving pass:', error);
        res.status(500).json({ error: 'An error occurred while retrieving pass' });
    }
});


/**
 * @swagger
 * /viewusers:
 *   get:
 *     summary: View all users
 *     tags:
 *       - User
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   name:
 *                     type: string
 *                   officerno:
 *                     type: string
 *                   rank:
 *                     type: string
 *                   phone:
 *                     type: string
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Error occurred while fetching users
 */
app.get('/viewusers', verifyToken, async (req, res) => {
    try {
        const allUsers = await User.viewAll();
        res.json(allUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})