const bcrypt = require("bcrypt");

let visitors;

class Visitor {
    static async injectDB(conn) {
        visitors = await conn.db("VISITOR").collection("visitor");
    }

    static async register(username, password, name, age, gender, relation, telno) {
        const res = await visitors.findOne({ username: username });

        if (res) {
            return { status: "duplicate username" };
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

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
        return { status: "Successfully register Visitor" };
    }

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

    static async update(username, name, age, gender, relation, telno) {
        visitors.updateOne({ username: username }, {
            $set: {
                "Name": name,
                "Age": age,
                "Gender": gender,
                "Relation": relation,
                "PhoneNo": telno
            }
        });
        return { status: "Information updated" };
    }

    static async delete(username) {
        visitors.deleteOne({ username: username });
        return { status: "Visitor deleted!" };
    }

    static async viewAll() {
        try {
            const visitorsCollection = visitors; // Assuming visitors is the MongoDB collection
            const allVisitors = await visitorsCollection.find().toArray();
            return allVisitors;
        } catch (error) {
            console.error(error);
            return { status: "An error occurred while fetching visitors" };
        }
    }
    
    static injectDB(client) {
        if (visitors) {
            return;
        }
        try {
            visitors = client.db().collection('visitor');
        } catch (e) {
            console.error(`Unable to establish a collection handle in visitorModel: ${e}`);
        }
    }

    static async getByUsername(username) {
        try {
            return await visitors.findOne({ username: username });
        } catch (e) {
            console.error(`Error occurred while retrieving visitor by username: ${e}`);
            return null;
        }
    }

    // Add a method to update pass information for a visitor
    static async updatePass(username, passType, duration) {
        try {
            const updatedVisitor = await visitors.findOneAndUpdate(
                { username: username },
                { $set: { passType: passType, passDuration: duration } },
                { returnDocument: 'after' }
            );
            return updatedVisitor.value;
        } catch (e) {
            console.error(`Error occurred while updating visitor pass: ${e}`);
            return null;
        }
    }
}

module.exports = Visitor;
