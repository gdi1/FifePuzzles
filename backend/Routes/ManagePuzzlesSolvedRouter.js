const authController = require("../Controllers/authController");
const manage_puzzles_solved_router = require("express").Router();
const mongoose = require("mongoose");
const SudokuDFSmain = require("../AI/SudokuSolver");
const findDifficulty = require('../supporting_functions/sodoku_difficulty')
const checkContent = require('../supporting_functions/sodoku_content_check')
const sudoku_model = require("../Models/Sudoku_Model")
const eights_puzzle_model = require("../Models/Eights_Puzzle_Model")
const hashi_model = require("../Models/Hashi_Model")
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

//Protecting routes so that they can not be accessed without authorisation
manage_puzzles_solved_router.use(authController.protect);
manage_puzzles_solved_router.post("/get_solved_sudokus/", async (req, res) => {
    let user = jwt.decode(req.cookies.jwt);
    let user_ID = user.userID
    let skip_val = req.body.current_length;

    let options = {
        allowDiskUse: true
    };


    let userID=await User.find({ "userID": user_ID });
    userID=userID[0]._id
    console.log(userID)
    var pipeline = [
        {
            "$project": {
                "_id": 0,
                "sudokus": "$$ROOT"
            }
        },
        {
            "$lookup": {
                "localField": "sudokus._id",
                "from": "puzzlesolveds",
                "foreignField": "puzzle",
                "as": "puzzlesolveds"
            }
        },
        {
            "$unwind": {
                "path": "$puzzlesolveds",
                "preserveNullAndEmptyArrays": false
            }
        },
        {
            "$lookup": {
                "localField": "sudokus._id",
                "from": "feedbacks",
                "foreignField": "puzzle-id",
                "as": "feedbacks"
            }
        },
        {
            "$match": {
                "puzzlesolveds.user": new mongoose.Types.ObjectId(userID)
            }
        },
        {
            "$project": {
                "sudokus": "$sudokus",
                "date_solved": "$puzzlesolveds.date",
                "feedbacks": {
                    "$filter": {
                        "input": '$feedbacks',
                        "as": 'item',
                        "cond": { "$ne": ['$$item.rating', 0] }
                    }
                }
            }
        },
        {
            "$project": {
                "sudokus": "$sudokus",
                "date_solved": "$date_solved",
                "average_rating": {
                    "$avg": "$feedbacks.rating"
                }
            }
        },
        {
            "$sort": {
                "date_solved": -1
            }
        },
        {
            "$skip": skip_val
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
    let result = await sudoku_model.aggregate(pipeline, options);
    res.json({ "puzzles_solved": result });
});
manage_puzzles_solved_router.post("/get_solved_eights_puzzles/", async (req, res) => {
    let user = jwt.decode(req.cookies.jwt);
    let user_ID = user.userID
    let skip_val = req.body.current_length;

    let options = {
        allowDiskUse: true
    };

    // console.log(user_ID)
    let userID=await User.find({ "userID": user_ID });
    userID=userID[0]._id
    console.log("aaaaaa",userID)
    var pipeline = [
        {
            "$project": {
                "_id": 0,
                "eights_puzzles": "$$ROOT"
            }
        },
        {
            "$lookup": {
                "localField": "eights_puzzles._id",
                "from": "puzzlesolveds",
                "foreignField": "puzzle",
                "as": "puzzlesolveds"
            }
        },
        {
            "$unwind": {
                "path": "$puzzlesolveds",
                "preserveNullAndEmptyArrays": false
            }
        },
        {
            "$lookup": {
                "localField": "eights_puzzles._id",
                "from": "feedbacks",
                "foreignField": "puzzle-id",
                "as": "feedbacks"
            }
        },
        {
            "$match": {
                "puzzlesolveds.user": new mongoose.Types.ObjectId(userID)
            }
        },
        {
            "$project": {
                "eights_puzzles": "$eights_puzzles",
                "date_solved": "$puzzlesolveds.date",
                "feedbacks": {
                    "$filter": {
                        "input": '$feedbacks',
                        "as": 'item',
                        "cond": { "$ne": ['$$item.rating', 0] }
                    }
                }
            }
        },
        {
            "$project": {
                "eights_puzzles": "$eights_puzzles",
                "date_solved": "$date_solved",
                "average_rating": {
                    "$avg": "$feedbacks.rating"
                }
            }
        },
        {
            "$sort": {
                "date_solved": -1
            }
        },
        {
            "$skip": skip_val
        },
        {
            "$limit": 15
        }
    ];

    // let result = await new Promise((resolve, reject) => {
    //     eights_puzzle_model.aggregate(pipeline, options).exec((err, result) => {
    //         if (err) {
    //             reject(err);
    //         } else {
    //             resolve(result)
    //         }
    //     })
    // }).then(res => res)
    // console.log(result)
    let result = await eights_puzzle_model.aggregate(pipeline, options);
    res.json({ "puzzles_solved": result });
});
manage_puzzles_solved_router.post("/get_solved_hashi_puzzles/", async (req, res) => {
    let user = jwt.decode(req.cookies.jwt);
    let user_ID = user.userID
    let skip_val = req.body.current_length;

    let options = {
        allowDiskUse: true
    };

    console.log(user_ID)
    let userID=await User.find({ "userID": user_ID });
    userID=userID[0]._id
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
                "from": "puzzlesolveds",
                "foreignField": "puzzle",
                "as": "puzzlesolveds"
            }
        },
        {
            "$unwind": {
                "path": "$puzzlesolveds",
                "preserveNullAndEmptyArrays": false
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
            "$match": {
                "puzzlesolveds.user": new mongoose.Types.ObjectId(userID)
            }
        },
        {
            "$project": {
                "hashis": "$hashis",
                "date_solved": "$puzzlesolveds.date",
                "feedbacks": {
                    "$filter": {
                        "input": '$feedbacks',
                        "as": 'item',
                        "cond": { "$ne": ['$$item.rating', 0] }
                    }
                }
            }
        },
        {
            "$project": {
                "hashis": "$hashis",
                "date_solved": "$date_solved",
                "average_rating": {
                    "$avg": "$feedbacks.rating"
                }
            }
        },
        {
            "$sort": {
                "date_solved": -1
            }
        },
        {
            "$skip": skip_val
        },
        {
            "$limit": 15
        }
    ];

    // let result = await new Promise((resolve, reject) => {
    //     hashi_model.aggregate(pipeline, options).exec((err, result) => {
    //         if (err) {
    //             reject(err);
    //         } else {
    //             resolve(result)
    //         }
    //     })
    // }).then(res => res)
    let result = await hashi_model.aggregate(pipeline, options);
    res.json({ "puzzles_solved": result });
});


module.exports = manage_puzzles_solved_router;
