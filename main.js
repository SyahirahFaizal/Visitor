const MongoClient = require("mongodb").MongoClient;
const User = require("./user");
const Visitor = require("./visitor.js");
const Inmate = require("./inmate");
const Visitorlog = require("./visitorlog")


MongoClient.connect(
	// TODO: Connection 
	"mongodb+srv://hasmininanthan:Sabrena11@cluster0.etswca6.mongodb.net/ ", 
	{ useNewUrlParser: true },
).catch(err => {
	console.error(err.stack)
	process.exit(1)
}).then(async client => {
	console.log('Connected to MongoDB');
	User.injectDB(client);
	Visitor.injectDB(client);
	Inmate.injectDB(client);
	Visitorlog.injectDB(client);
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
			title: 'Prison Visitor Management System group4',
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

app.post('/login/user', async (req, res) => {
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
 * /register/Visitorlog:
 *   post:
 *     security:
 *      - jwt: []
 *     description: Create Visitorlog
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
 *               inmateno: 
 *                 type: string
 *               dateofvisit:
 *                 type: string
 *               timein:
 *                 type: string
 *               timeout:
 *                 type: string
 *               purpose:
 *                 type: string
 *               officerno:
 *                 type: string

 *     responses:
 *       200:
 *         description: Successful registered
 *       401:
 *         description: There is an error during registration , Please try again
 */


 app.post('/register/visitorlog', async (req, res) => {
	console.log(req.body);

	if (req.user.rank == "officer" || "security"){
		const reg = await Visitorlog.register(req.body.logno, req.body.username, req.body.inmateno, req.body.dateofvisit, req.body.timein, req.body.timeout, req.body.purpose, req.body.officerno);
		res.status(200).send(reg)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /register/inmate:
 *   post:
 *     security:
 *      - jwt: []
 *     description: Inmate Registration
 *     tags:
 *     - Registration 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               inmateno: 
 *                 type: string
 *               firstname: 
 *                 type: string
 *               lastname: 
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *               guilty:
 *                 type: string
 *              
 *     responses:
 *       200:
 *         description: Successful registered
 *       401:
 *         description: There is an error during registration , Please try again
 */

 app.post('/register/inmate', async (req,res)=>{
	console.log(req.body)

	if (req.user.rank == "officer"){
		const reg = await Inmate.register(req.body.inmateno, req.body.firstname, req.body.lastname, req.body.age, req.body.gender, req.body.guilty );
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
 * /inmate/update:
 *   patch:
 *     security:
 *      - jwt: []
 *     description: Inmate Update
 *     tags:
 *     - Modification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               inmateno: 
 *                 type: string
 *               firstname: 
 *                 type: string
 *               lastname: 
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *               guilty:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful updated
 *       401:
 *         description: There is an error during updating , Please try again
 */

 app.patch('/inmate/update', async (req, res) => {
	console.log(req.body);
	if (req.user.rank == "officer"){
		const update = await Inmate.update( req.body.inmateno, req.body.firstname, req.body.lastname, req.body.age, req.body.gender, req.body.guilty);
		res.status(200).send(update)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /visitorlog/update:
 *   patch:
 *     security:
 *      - jwt: []
 *     description: Visitorlog Update
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
 *               inmateno: 
 *                 type: string
 *               dateofvisit:
 *                 type: string
 *               timein:
 *                 type: string
 *               timeout:
 *                 type: string
 *               purpose:
 *                 type: string
 *               officerno:
 *                 type: string

 *     responses:
 *       200:
 *         description: Successful updated
 *       401:
 *         description: There is an error during updating , Please try again
 */

 app.patch('/visitorlog/update', async (req, res) => {
	console.log(req.body);

	if (req.user.username == req.body.username){
		const update = await Visitorlog.update(req.body.logno, req.body.inmateno, req.body.dateofvisit, req.body.timein, req.body.timeout, req.body.purpose, req.body.officerno);
		res.status(200).send(update)
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
 * /delete/Inmate:
 *   delete:
 *     security:
 *      - jwt: []
 *     description: Delete Inmate
 *     tags:
 *     - Remove(delete)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               inmateno: 
 *                 type: string
 *               
 *     responses:
 *       200:
 *         description: Successful deleted
 *       401:
 *         description: There is an error during deleting , Please try again
 */

 app.delete('/delete/inmate', async (req, res) => {
	if (req.user.rank == "officer"){
		const del = await Inmate.delete(req.body.inmateno)
		res.status(200).send(del)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /delete/visitorlog:
 *   delete:
 *     security:
 *      - jwt: []
 *     description: Delete Visitorlog
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

 app.delete('/delete/visitorlog', async (req, res) => {
	if (req.user.rank == "officer" || "security"){
		const del = await Visitorlog.delete(req.body.logno)
		res.status(200).send(del)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})