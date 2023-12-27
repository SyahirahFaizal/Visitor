let visitorlog;

class Visitorlog {
	static async injectDB(conn) {
		visitorlog = await conn.db("Prison_VMS").collection("visitorlog")
	}

	static async register(logno, username, inmateno, dateofvisit, timein, timeout, purpose, officerno) {
		// TODO: Check if Logno exists
		const res = await visitorlog.findOne({ Logno: logno })

			if (res){
				return { status: "duplicate Logno"}
			}

			// TODO: Save inmate to database
				visitorlog.insertOne({
              "Logno": logno,
              "username": username,
							"InmateNo": inmateno,
							"Dateofvisit": dateofvisit,
							"Timein": timein,
							"Timeout": timeout,			
              "Purpose": purpose,
              "Insert By (OfficeNo)":officerno
			
            });
            return { status: "Succesfully register visitorlog"}
	}

		static async update(logno,  dateofvisit, timein, timeout, purpose, officerno){
				return visitorlog.updateOne({ Logno: logno },{$set:{
					"InmateNo": inmateno,
							"Dateofvisit": dateofvisit,
							"Timein": timein,
							"Timeout": timeout,			
              "Purpose": purpose,
              "Insert By (OfficeNo)":officerno
		}})
		}

		static async delete(logno) {
			visitorlog.deleteOne({Logno: logno})
			return { status: "VisitorLog deleted!" }
		}

    static async find( logno ) {
			return visitorlog.findOne({Logno: logno})
		}

	}


module.exports = Visitorlog;