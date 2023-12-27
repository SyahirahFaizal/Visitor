let visitorinfo;

class VisitorInfo {
	static async injectDB(conn) {
		visitorinfo = await conn.db("ISSASSIGNMENT").collection("visitorinfo")
	}

	static async register(logno, username, pettype, dateofvisit, timein, timeout, purpose, apartmentno) {
		// TODO: Check if Logno exists
		const res = await visitorinfo.findOne({ Logno: logno })

			if (res){
				return { status: "duplicate Logno"}
			}

			// TODO: Save inmate to database
				visitorinfo.insertOne({
              "Logno": logno,
              "username": username,
							"PetType": pettype,
							"Dateofvisit": dateofvisit,
							"Timein": timein,
							"Timeout": timeout,			
              "Purpose": purpose,
              "Apartment Number":apartmentno
			
            });
            return { status: "Succesfully register visitorinfo"}
	}

		static async update(logno, username, pettype, dateofvisit, timein, timeout, purpose, apartmentno){
				return visitorinfo.updateOne({ Logno: logno },{$set:{
					"PetNo": petno,
							"Dateofvisit": dateofvisit,
							"Timein": timein,
							"Timeout": timeout,			
              "Purpose": purpose,
              "Apartment Number":apartmentno
		}})
		}

		static async delete(logno) {
			visitorinfo.deleteOne({Logno: logno})
			return { status: "VisitorInfo deleted!" }
		}

    static async find( logno ) {
			return visitorinfo.findOne({Logno: logno})
		}

	}


module.exports = VisitorInfo;