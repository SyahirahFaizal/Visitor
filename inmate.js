let inmate;

class Inmate {
	static async injectDB(conn) {
		inmate = await conn.db("Prison_VMS").collection("inmate")
	}

	static async register(inmateno, firstname, lastname,  age, gender, guilty) {
		// TODO: Check if Inmateno exists
		const res = await inmate.findOne({ Inmateno: inmateno })

			if (res){
				return { status: "duplicate Inmateno"}
			}
			// TODO: Save inmate to database
			inmate.insertOne({
              "Inmateno": inmateno,
							"Firstname": firstname,
							"Lastname": lastname,
							"Age": age,
							"Gender": gender,
							"Guilty": guilty,						
            });
            return { status: "Succesfully register inmate"}
	}

		static async update(inmateno, firstname, lastname,  age, gender, guilty){
				inmate.updateOne({Inmateno: inmateno},{$set:{
              "Firstname": firstname,
              "Lastname": lastname,
              "Age": age,
              "Gender": gender,		
			  "Guilty": guilty, }})
							return { status: "Information updated"}
		}

		static async delete(inmateno) {
			inmate.deleteOne({Inmateno: inmateno})
			return { status: "Inmate deleted!" }
		}

    static async find(inmateno) {
			return inmate.findOne({Inmateno: inmateno})
		}

	}

module.exports = Inmate;