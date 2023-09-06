const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");
const sudoku_model = require("./Models/Sudoku_Model");
const eights_puzzle_model = require("./Models/Eights_Puzzle_Model");
const feedback_model = require("./Models/Feedback_Model");
const puzzleSolvedModel = require("./Models/PuzzleSolved");
const hashi_model = require("./Models/Hashi_Model");

dotenv.config({ path: "./config.env" });

const port = process.env.PORT;
const DB = process.env.DB_URL;
const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
    await mongoose.connect(DB, {
        useNewUrlParser: true,
    });
    console.log("DB connection successful!");
    console.log("searching");

    let options = {
        allowDiskUse: true
    };
    var pipeline = [
        {
            "$project": {
                "_id": 0,
                "hashis": "$$ROOT"
            }
        },
        {
            "$lookup": {
                "localField": "hashis._id",
                "from": "feedbacks",
                "foreignField": "puzzle-id",
                "as": "feedbacks"
            }
        },
        {
            "$unwind": {
                "path": "$feedbacks",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$match": {
                "feedbacks.rating": {
                    "$ne": 0
                },
                "hashis.creator-id": "G26-63d03e097c18bdc5d95a3e2e"
            }
        },
        {
            "$group": {
                "_id": "$hashis",
                "average": {
                    "$avg": "$feedbacks.rating"
                }
            }
        },
        {
            "$project": {
                "hashis": "$_id",
                "AVG": "$average",
                "_id": 0
            }
        },
        {
            "$sort": {
                "hashis.difficulty": -1
            }
        },
        {
            "$skip": 0
        },
        {
            "$limit": 15
        }
    ];
    // let result = await new Promise((resolve, reject) => {
    //     sudoku_model.aggregate(pipeline, options).exec((err, result) => {
    //         if (err) {
    //             reject(err);
    //         } else {
    //             resolve(result)
    //         }
    //     })
    // }).then(res => res)
    console.log("here")
    let result = await hashi_model.aggregate(pipeline, options);
    console.log(result)


    console.log("finished search");
    console.log("disconnecting");
    // await mongoose.disconnect();
    console.log("disconected")
}
main();