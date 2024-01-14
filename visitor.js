const bcrypt = require("bcrypt");

let visitors;

class Visitor {
    static async injectDB(conn) {
        visitors = await conn.db("VISITOR").collection("visitor");
    }

    // static async register(username, password, name, age, gender, relation, telno) {
    //     const res = await visitors.findOne({ username: username });

    //     if (res) {
    //         return { status: "duplicate username" };
    //     }

    //     const salt = await bcrypt.genSalt(10);
    //     const hash = await bcrypt.hash(password, salt);

    //     visitors.insertOne({
    //         "username": username,
    //         "Password": password,
    //         "HashedPassword": hash,
    //         "Name": name,
    //         "Age": age,
    //         "Gender": gender,
    //         "Relation": relation,
    //         "PhoneNo": telno
    //     });
    //     return { status: "Successfully register Visitor" };
    // }

    static async login(username, password) {
        const result = await visitors.findOne({ username: username });

        if (!result) {
            return { status: "invalid username" };
        }

        const com = await bcrypt.compare(password, result.HashedPassword);
        if (!com) {
            return { status: "invalid password" };
        }

        return result;
    }

    // static async update(username, name, age, gender, relation, telno) {
    //     visitors.updateOne({ username: username }, {
    //         $set: {
    //             "Name": name,
    //             "Age": age,
    //             "Gender": gender,
    //             "Relation": relation,
    //             "PhoneNo": telno
    //         }
    //     });
    //     return { status: "Information updated" };
    // }

    // static async delete(username) {
    //     visitors.deleteOne({ username: username });
    //     return { status: "Visitor deleted!" };
    // }

    static async viewAll() {
        try {
            const allVisitors = await visitors.find().toArray();
            return allVisitors;
        } catch (error) {
            console.error(error);
            return { status: "An error occurred while fetching visitors" };
        }
    }

	// static async issuePass(username, issuedBy, validUntil) {
    //     try {
    //         const visitorPasses = db.collection('visitor');

    //         const newPass = {
    //             visitorId: username, // Assuming 'username' is the visitorId
    //             issuedBy,
    //             validUntil,
    //             issuedAt: new Date(),
    //         };

    //         // Insert the new pass into the 'visitorpasses' collection
    //         await visitorPasses.insertOne(newPass);

    //         // Update the visitor document with the issued pass details
    //         await visitors.updateOne({ username: username }, { $set: { passDetails: newPass } });

    //         return { status: "Pass issued successfully" };
    //     } catch (error) {
    //         console.error(error);
    //         return { status: "An error occurred while issuing pass", details: error.message };
    //     }
    // }

	// static async retrievePass(username) {
    //     try {
    //         const visitorPasses = db.collection('visitor');

    //         // Retrieve the pass for the given visitor
    //         const pass = await visitorPasses.findOne({ visitorId: username });

    //         if (!pass) {
    //             return { status: "Pass not found for the visitor" };
    //         }

    //         return pass;
    //     } catch (error) {
    //         console.error(error);
    //         return { status: "An error occurred while retrieving pass", details: error.message };
    //     }
    // }
}

module.exports = Visitor;
