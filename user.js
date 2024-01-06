const bcrypt = require("bcrypt")
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

	failedLoginAttempts: {
		type: Number,
		default: 0,
	  },
	  lockoutUntil: {
		type: Date,
	  },
});

let users;
// /
class User {
	static async injectDB(conn) {
		users = await conn.db("ISSASSIGNMENT").collection("users")
	}

	/**
	 * @remarks
	 * This method is not implemented yet. To register a new user, you need to call this method.
	 * 
	 * @param {*} username 
	 * @param {*} password 
	 * @param {*} phone 
	 */
	static async register(username, password, name, officerno, rank, phone) {
		// TODO: Check if username exists
		const res = await users.findOne({ username: username })

			if (res){
				return { status: "duplicate username"}
			}

			// TODO: Hash password
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(password, salt)

			// TODO: Save user to database
			users.insertOne({
							"username": username,
							"Password": password,
							"HashedPassword": hash,
							"Name": name,
							"OfficerNo": officerno,
							"Rank": rank,
							"Phone": phone,});
			return { status: "Succesfully register user"}
	}

	static async login(username, password) {
			// // TODO: Check if username exists
			// const result = await users.findOne({username: username});

			// 	if (!result) {
			// 		return { status: "invalid username" }
			// 	}

			// // TODO: Validate password
			// 	const com = await bcrypt.compare(password, result.HashedPassword)
			// 	if (!com){
			// 		return { status: "invalid password"}
			// 	}
			// // TODO: Return user object
			// 	return result;
				
				try {
					const user = await User.findOne({ username });
				
					if (!user) {
					  return { status: "invalid username" };
					}
				
					const isValidPassword = await user.comparePassword(password);
				
					if (!isValidPassword) {
					  // Increment the failed login attempts
					  user.failedLoginAttempts += 1;
				
					  // Check if the account should be locked
					  if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
						// Set lockoutUntil to the current time plus lockout duration
						user.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION);
					  }
				
					  await user.save();
				
					  return { status: "invalid password" };
					}
				
					// If login is successful, reset the failed login attempts
					user.failedLoginAttempts = 0;
					user.lockoutUntil = null;
				
					await user.save();
				
					return { status: "success", user };
				  } catch (error) {
					console.error(error);
					return { status: "error" };
				  }
	}
	
		static async update(username, name, officerno, rank, phone){
				users.updateOne({username:username},{$set:{
				"Name": name,
				"OfficerNo": officerno,
				"Rank": rank,
				"Phone": phone,}});
				return { status: "Information updated" }
		}

		static async delete(username) {
			users.deleteOne({username: username})
			return { status: "User deleted!" }
		}

	}
const User = mongoose.model("User", userSchema);

module.exports = User;