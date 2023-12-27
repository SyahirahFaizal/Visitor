const bcrypt = require("bcrypt")
let visitors;
// 
class Visitor {
	static async injectDB(conn) {
		visitors = await conn.db("Prison_VMS").collection("visitors")
	}

	/**
	 * @remarks
	 * This method is not implemented yet. To register a new user, you need to call this method.
	 * 
	 * @param {*} username 
	 * @param {*} password 
	 * @param {*} phone 
	 */
	static async register(username, password, name, age, gender, relation, telno) {
		// TODO: Check if username exists
		const res = await visitors.findOne({ username: username })

			if (res){
				return { status: "duplicate username"}
			}

			// TODO: Hash password
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(password, salt)

			// TODO: Save user to database
			visitors.insertOne({
							"username": username,
							"Password": password,
							"HashedPassword": hash,
							"Name": name,
							"Age": age,
							"Gender": gender,
              "Relation": relation,
			  "PhoneNo": telno
            });
			return { status: "Succesfully register Visitor"}
	}


	static async login(username, password) {
			// TODO: Check if username exists
			const result = await visitors.findOne({username: username});

				if (!result) {
					return { status: "invalid username" }
				}

			// TODO: Validate password
				const com = await bcrypt.compare(password, result.HashedPassword)
				if (!com){
					return { status: "invalid password"}
				}
			// TODO: Return user object
				return result;
				
	}
	
		static async update(username, name, age, gender, relation,telno){
				visitors.updateOne({username:username},{$set:{
				"Name": name,
				"Age": age,
				"Gender": gender,
        "Relation": relation,
		"PhoneNo": telno
	}})
				return { status: "Information updated"}
		}

		static async delete(username) {
			visitors.deleteOne({username: username})
			return { status: "Visitor deleted!"}
		}

	}


module.exports = Visitor;