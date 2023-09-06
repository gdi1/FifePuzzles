const authController = require("../Controllers/authController");
const manage_puzzles_creator_router = require("express").Router();
const mongoose = require("mongoose");
const SudokuDFSmain = require("../AI/SudokuSolver");
const findDifficulty = require('../supporting_functions/sodoku_difficulty')
const checkContent = require('../supporting_functions/sodoku_content_check')
const sudoku_model = require("../Models/Sudoku_Model")
const eights_puzzle_model = require("../Models/Eights_Puzzle_Model")
const hashi_model = require("../Models/Hashi_Model")
const feedback_model = require("../Models/Feedback_Model")
const puzzleSolvedModel = require("../Models/PuzzleSolved")
const jwt = require("jsonwebtoken");

//Protecting routes so that they can not be accessed without authorisation
manage_puzzles_creator_router.use(authController.protect);
manage_puzzles_creator_router.use(authController.restrictTo("creator", "administrator"));
manage_puzzles_creator_router.post("/get_created_sudokus/", async (req, res) => {
    let token = userID = jwt.decode(req.cookies.jwt).userID;
    let skip_val = req.body.current_length;
    
    var options = {
        allowDiskUse: true
    };

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
                "sudokus.creator-id": token
            }
        },
        {
            "$group": {
                "_id": "$sudokus",
                "average": {
                    "$avg": "$feedbacks.rating"
                }
            }
        },
        {
            "$project": {
                "sudokus": "$_id",
                "AVG": "$average",
                "_id": 0
            }
        },
        {
            "$sort": {
                "sudokus.difficulty": -1
            }
        },
        {
            "$skip": skip_val
        },
        {
            "$limit": 15
        }
    ];
    // let puzzles_created = await new Promise((resolve, reject) => {
    //     sudoku_model.aggregate(pipeline, options).exec((err, result) => {
    //         if (err) {
    //             reject(err);
    //         } else {
    //             resolve(result)
    //         }
    //     })
    // }).then(res => res)
    let puzzles_created=await sudoku_model.aggregate(pipeline, options);
    console.log("//////////////////////////READING//////////////////////////")
    res.json({ "puzzles_created": puzzles_created });
});
manage_puzzles_creator_router.post("/get_created_eights_puzzles/", async (req, res) => {
    let token = userID = jwt.decode(req.cookies.jwt).userID;
    let skip_val = req.body.current_length;

    var options = {
        allowDiskUse: true
    };

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
                "eights_puzzles.creator-id": token
            }
        },
        {
            "$group": {
                "_id": "$eights_puzzles",
                "average": {
                    "$avg": "$feedbacks.rating"
                }
            }
        },
        {
            "$project": {
                "eights_puzzles": "$_id",
                "AVG": "$average",
                "_id": 0
            }
        },
        {
            "$sort": {
                "eights_puzzles.difficulty": -1
            }
        },
        {
            "$skip": skip_val
        },
        {
            "$limit": 15
        }
    ];
    // let puzzles_created = await new Promise((resolve, reject) => {
    //     eights_puzzle_model.aggregate(pipeline, options).exec((err, result) => {
    //         if (err) {
    //             reject(err);
    //         } else {
    //             resolve(result)
    //         }
    //     })
    // }).then(res => res)
    let puzzles_created=await eights_puzzle_model.aggregate(pipeline, options);
    console.log("//////////////////////////READING//////////////////////////")
    res.json({ "puzzles_created": puzzles_created });
});
manage_puzzles_creator_router.post("/get_created_hashi_puzzles/", async (req, res) => {
    let token = userID = jwt.decode(req.cookies.jwt).userID;
    let skip_val = req.body.current_length;

    var options = {
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
                "hashis.creator-id": token
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
            "$skip": skip_val
        },
        {
            "$limit": 15
        }
    ];
    // let puzzles_created = await new Promise((resolve, reject) => {
    //     hashi_model.aggregate(pipeline, options).exec((err, result) => {
    //         if (err) {
    //             reject(err);
    //         } else {
    //             resolve(result)
    //         }
    //     })
    // }).then(res => res)
    let puzzles_created=await hashi_model.aggregate(pipeline, options);
    console.log("//////////////////////////READING//////////////////////////")
    res.json({ "puzzles_created": puzzles_created });
});

manage_puzzles_creator_router.post("/delete_created_sudoku/", async (req, res) => {
    let userID = jwt.decode(req.cookies.jwt).userID;
    let sudokuID = req.body.sudoku_id;
    var options = {
        allowDiskUse: true
    };

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
                "from": "feedbacks",
                "foreignField": "puzzle-id",
                "as": "feedbacks"
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
            "$match": {
                "sudokus._id": { "$eq": new mongoose.Types.ObjectId(sudokuID) }
            }
        },
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
    console.log(result)
    let error = false;
    let creator_id_found = result[0].sudokus['creator-id']
    if (creator_id_found === userID) {
        if (result[0].sudokus != null) {
            try{
            let feedbacks_IDs = result[0].feedbacks.map((i) => i._id);
            let puzzles_solveds_IDs = result[0].puzzlesolveds.map((i) => i._id);
            await feedback_model.deleteMany({ _id: { $in: feedbacks_IDs } })
            await puzzleSolvedModel.deleteMany({ _id: { $in: puzzles_solveds_IDs } })
            await sudoku_model.deleteOne({ _id: result[0].sudokus._id })
            }catch(err){
                error=true;
            }
        } else {
            error = true
        }
        if (error) {
            res.json({ "status": 'fail', "message": "Failure at server side." });
        } else {
            res.json({ "status": 'success', message: 'Successfully deleted!' });
        }
    } else {
        console.log("error")
        res.json({ "status": 'fail', "message": 'You are not the creator of this puzzle.' });
    }
});
manage_puzzles_creator_router.post("/delete_created_eights_puzzle/", async (req, res) => {
    let userID = jwt.decode(req.cookies.jwt).userID;
    let sudokuID = req.body.sudoku_id;
    console.log(userID,sudokuID,"kkkkkkkkkkkkkkkkk")
    var options = {
        allowDiskUse: true
    };

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
                "from": "feedbacks",
                "foreignField": "puzzle-id",
                "as": "feedbacks"
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
            "$match": {
                "eights_puzzles._id": { "$eq": new mongoose.Types.ObjectId(sudokuID) }
            }
        },
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
    let result = await eights_puzzle_model.aggregate(pipeline, options);
    console.log("hiuhihuihihuiu",result)
    let error = false;
    let creator_id_found = result[0].eights_puzzles['creator-id']
    if (creator_id_found === userID) {
        if (result[0].eights_puzzles != null) {
            try{
                let feedbacks_IDs = result[0].feedbacks.map((i) => i._id);
                let puzzles_solveds_IDs = result[0].puzzlesolveds.map((i) => i._id);
                // if(feedbacks_IDs.length!=0){
                    await feedback_model.deleteMany({ _id: { $in: feedbacks_IDs } })
                // }
                // if(puzzles_solveds_IDs.length!=0){
                    await puzzleSolvedModel.deleteMany({ _id: { $in: puzzles_solveds_IDs } })
                // }
                await eights_puzzle_model.deleteOne({ _id: result[0].eights_puzzles._id })
            }catch(err){
                error=true;
            }
        } else {
            error = true
        }
        if (error) {
            res.json({ "status": 'fail', "message": "Failure at server side." });
        } else {
            res.json({ "status": 'success', message: 'Successfully deleted!' });
        }
    } else {
        console.log("error")
        res.json({ "status": 'fail', "message": 'You are not the creator of this puzzle.' });
    }
});

manage_puzzles_creator_router.post("/delete_created_hashi_puzzle/", async (req, res) => {
    let userID = jwt.decode(req.cookies.jwt).userID;
    let sudokuID = req.body.sudoku_id;

    var options = {
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
            "$lookup": {
                "localField": "hashis._id",
                "from": "puzzlesolveds",
                "foreignField": "puzzle",
                "as": "puzzlesolveds"
            }
        },
        {
            "$match": {
                "hashis._id": { "$eq": new mongoose.Types.ObjectId(sudokuID) }
            }
        },
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
    console.log(result)
    let error = false;
    let creator_id_found = result[0].hashis['creator-id']
    if (creator_id_found === userID) {
        if (result[0].hashis != null) {
            try{
            let feedbacks_IDs = result[0].feedbacks.map((i) => i._id);
            let puzzles_solveds_IDs = result[0].puzzlesolveds.map((i) => i._id);
            await feedback_model.deleteMany({ _id: { $in: feedbacks_IDs } })
            await puzzleSolvedModel.deleteMany({ _id: { $in: puzzles_solveds_IDs } })
            await hashi_model.deleteOne({ _id: result[0].hashis._id })
            }catch(err){
                error=true
            }
        } else {
            error = true
        }
        if (error) {
            res.json({ "status": 'fail', "message": "Failure at server side." });
        } else {
            res.json({ "status": 'success', message: 'Successfully deleted!' });
        }
    } else {
        console.log("error")
        res.json({ "status": 'fail', "message": 'You are not the creator of this puzzle.' });
    }
});

module.exports = manage_puzzles_creator_router;
