const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const MAX_FAILED_LOGIN_ATTEMPTS = 5; // Set the maximum number of allowed failed login attempts
const LOCKOUT_DURATION = 5 * 60 * 1000; // Set the lockout duration in milliseconds (5 minutes)

const userSchema = new mongoose.Schema({
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockoutUntil: {
    type: Date,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  // Other fields...
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.hashedPassword);
};

const User = mongoose.model("User", userSchema);

let users;

class UserManager {
  static async injectDB(conn) {
    users = await conn.db("VISITOR").collection("users");
  }

  static async register(username, password, name, officerno, rank, phone) {
    const existingUser = await users.findOne({ username: username });

    if (existingUser) {
      return { status: "duplicate username" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await users.insertOne({
      username: username,
      hashedPassword: hashedPassword,
      Name: name,
      OfficerNo: officerno,
      Rank: rank,
      Phone: phone,
    });

    return { status: "Successfully register user" };
  }

  static async login(username, password) {
    try {
      const user = await users.findOne({ username });

      if (!user) {
        return { status: "invalid username" };
      }

	  // Create an instance of the User model
	  const userModel = new User(user);


      const isValidPassword = await userModel.comparePassword(password);

      if (!isValidPassword) {
        user.failedLoginAttempts += 1;

		if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
			// Set the lockout duration to one month later
			const oneMonthLater = new Date();
			oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

			user.lockoutUntil = oneMonthLater;
		}
		await user.save();

            return { status: "invalid password" };
      }

      user.failedLoginAttempts = 0;
      user.lockoutUntil = null;

      await user.save();

      return { status: "success", user: userModel };
    } catch (error) {
      console.error(error);
      return { status: "error" };
    }
  }

  static async update(username, name, officerno, rank, phone) {
    
	if (!userToUpdate) {
		return { status: "User not found" };
	  }

	await users.updateOne(
      { username: username },
      {
        $set: {
          Name: name,
          OfficerNo: officerno,
          Rank: rank,
          Phone: phone,
        },
      }
    );
    return { status: "Information updated" };
  }

  static async delete(username) {
	const result = await users.deleteOne({ username: username });
  
	if (result.deletedCount === 0) {
	  return { status: "User not found" };
	}
  
	return { status: "User deleted!" };
  }
}

module.exports = UserManager;
