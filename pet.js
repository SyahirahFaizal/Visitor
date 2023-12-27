let pet;

class Pet {
	static async injectDB(conn) {
		pet = await conn.db("ISSASSIGNMENT").collection("pet")
	}

	static async register(petno, name, species,  age, gender, characteristic) {
		// TODO: Check if Petno exists
		const res = await Pet.findOne({ Petno: petno })

			if (res){
				return { status: "duplicate Petno"}
			}
			// TODO: Save pet to database
			inmate.insertOne({
              "Petno": petno,
							"Name": name,
							"Species": species,
							"Age": age,
							"Gender": gender,
							"Characteristic": characteristic,						
            });
            return { status: "Succesfully register pet"}
	}

		static async update( name, species,  age, gender, characteristic){
				pet.updateOne({Petno: pet},{$set:{
                    "Name": name,
                    "Species": species,
                    "Age": age,
                    "Gender": gender,
                    "Characteristic": characteristic, }})
							return { status: "Information updated"}
		}

		static async delete(petno) {
			pet.deleteOne({Petno: petno})
			return { status: "Pet deleted!" }
		}

    static async find(petno) {
			return pet.findOne({Petno: petno})
		}

	}

module.exports = Pet;