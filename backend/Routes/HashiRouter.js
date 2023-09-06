const authController = require("../Controllers/authController");
const hashi_router = require("express").Router();
const mongoose = require("mongoose");
const findDifficultyHashi = require("../supporting_functions/hashi_difficulty");
const checkContentHashi = require("../supporting_functions/hashi_content_check");
const hashi_model = require("../Models/Hashi_Model");
const HashiSolverMain = require("../AI/HashiSolver")
const jwt = require("jsonwebtoken");
//Protecting routes so that they can not be accessed without authorisation
hashi_router.use(authController.protect);
//Getting puzzle depending on difficulty
hashi_router.post("/get_hashi_puzzle/", async (req, res) => {
  let difficulty = req.body.difficulty;
  console.log(difficulty);
  //If difficulty requested is medium
  if (difficulty == "medium") {
    //Get game from database
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
        "$match": {
          "$and": [
            {
              "hashis.difficulty": { "$gte": 4 }
            },
            {
              "hashis.difficulty": { "$lte": 7 }
            },
            {
              "hashis.active": true
            }
          ]
        }
      },
      {
        "$project": {
          "hashis": "$hashis",
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
          "hashi": {
            "$mergeObjects": [
              "$hashis",
              {
                "average_rating": {
                  "$avg": "$feedbacks.rating"
                }
              }
            ]
          }
        }
      }
    ];
    // let result = await new Promise((resolve, reject) => {
    //   hashi_model.aggregate(pipeline, options).exec((err, result) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(result)
    //     }
    //   })
    // }).then(res => res)
    let result = await hashi_model.aggregate(pipeline,options)
    //Sending random puzzle of given difficulty
    if (result.length != 0) {
      res.json({ "found": true, "game": result[Math.floor(Math.random() * result.length)].hashi });
    } else {
      res.json({ "found": false, "game": null });
    }
  } else if (difficulty == "hard") {
    //Same as above
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
        "$match": {
          "$and": [
            {
              "hashis.difficulty": { "$gte": 8 }
            },
            {
              "hashis.difficulty": { "$lte": 10 }
            },
            {
              "hashis.active": true
            }
          ]
        }
      },
      {
        "$project": {
          "hashis": "$hashis",
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
          "hashi": {
            "$mergeObjects": [
              "$hashis",
              {
                "average_rating": {
                  "$avg": "$feedbacks.rating"
                }
              }
            ]
          }
        }
      }
    ];
    // let result = await new Promise((resolve, reject) => {
    //   hashi_model.aggregate(pipeline, options).exec((err, result) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(result)
    //     }
    //   })
    // }).then(res => res)
    let result = await hashi_model.aggregate(pipeline,options)

    if (result.length != 0) {
      res.json({ "found": true, "game": result[Math.floor(Math.random() * result.length)].hashi });
    } else {
      res.json({ "found": false, "game": null });
    }
  } else {
    //Same as above
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
        "$match": {
          "$and": [
            {
              "hashis.difficulty": { "$gte": 1 }
            },
            {
              "hashis.difficulty": { "$lte": 3 }
            },
            {
              "hashis.active": true
            }
          ]
        }
      },
      {
        "$project": {
          "hashis": "$hashis",
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
          "hashi": {
            "$mergeObjects": [
              "$hashis",
              {
                "average_rating": {
                  "$avg": "$feedbacks.rating"
                }
              }
            ]
          }
        }
      }
    ];
    // let result = await new Promise((resolve, reject) => {
    //   hashi_model.aggregate(pipeline, options).exec((err, result) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(result)
    //     }
    //   })
    // }).then(res => res)
    let result = await hashi_model.aggregate(pipeline,options)

    if (result.length != 0) {
      res.json({ "found": true, "game": result[Math.floor(Math.random() * result.length)].hashi });
    } else {
      res.json({ "found": false, "game": null });
    }
  }
});

//This method add sudoku puzzle from upload file
hashi_router.post("/add_hashi_from_upload/", async (req, res) => {
  let userID = jwt.decode(req.cookies.jwt).userID;
  //Receiving file content
  let puzzle_file = req.body.puzzle_file;
  //Checking validity of content against protocol
  if (!checkContentHashi(puzzle_file)) {
    res.json({
      puzzle_exists: false,
      added: false,
      message: "File contents are invalid.",
    });
  } else {
    let solution = puzzle_file.solution;
    let values = puzzle_file.values;
    //Checking existance of puzzle
    let puzzle_exists = await hashi_model
      .find({
        $and: [{ solution: solution }, { values: values }],
      })
      .exec()
      .then((result) => result.length !== 0);
    if (puzzle_exists) {
      //Sending back existent puzzle
      let puzzle_found = await hashi_model
        .find({
          $and: [{ solution: solution }, { values: values }],
        })
        .exec()
        .then((result) => result);
      res.json({
        puzzle_exists: puzzle_exists,
        added: false,
        message: "Such puzzle already exists",
        new_puzzle: puzzle_found[0],
      });
    } else {
      //If puzzle doesn't exists, check validity of puzzle with DFS solver
      let DFSResult = HashiSolverMain(values.map(row=>row.map(cell=>{
        if(cell==null){
          return 0;
        }else{
          return cell
        }
      })), solution.map(row=>row.map(cell=>{
        if(cell==null){
          return 0;
        }else{
          return cell
        }
      })));
      if (!DFSResult.valid) {
        //If puzzle is invalid
        res.json({
          puzzle_exists: puzzle_exists,
          added: false,
          message: DFSResult.errorMessage,
        });
      } else {
        //Assinging difficulty to 
        let valuesPrev = values.map(row => row.map(x => x))
        let puzzle_difficulty = findDifficultyHashi(values);
        const hashiPuzzle = {
          "puzzle-type": "sudoku",
          values: valuesPrev,
          solution: solution,
          "creator-id": userID,
          difficulty: puzzle_difficulty,
        };
        let puzzle_to_upload = new hashi_model(hashiPuzzle);
        //Saving puzzle and sending result of save
        puzzle_to_upload.save(function (err) {
          if (err) {
            res.json({
              puzzle_exists: puzzle_exists,
              added: false,
              message: "Error on server side.",
            });
          } else {
            res.json({
              puzzle_exists: puzzle_exists,
              added: true,
              message: "Upload successfull.",
              new_puzzle: hashiPuzzle,
            });
          }
        });
      }
    }
  }
});

//Restricting creation of puzzle to creator and administartor
hashi_router.use(authController.restrictTo("creator", "administrator"));
hashi_router.post("/add_hashi_puzzle/", async (req, res) => {
  let userID = jwt.decode(req.cookies.jwt).userID;

  let solution = req.body.solution;
  let values = req.body.values;
  //Checking existance
  let puzzle_exists = await hashi_model
    .find({
      $and: [{ solution: solution }, { values: values }],
    })
    .exec()
    .then((result) => result.length !== 0);
  if (puzzle_exists) {
    res.json({
      puzzle_exists: puzzle_exists,
      added: false,
      message: "Such puzzle already exists",
    });
  } else {
    //If doesn't exist, check validity of puzzle with DFS
    let DFSResult = HashiSolverMain(values.map(row=>row.map(cell=>{
      if(cell==null){
        return 0;
      }else{
        return cell
      }
    })), solution.map(row=>row.map(cell=>{
      if(cell==null){
        return 0;
      }else{
        return cell
      }
    })));
    console.log("kkkkkkkkkkkkkkkk",DFSResult)
    if (!DFSResult.valid) {
      //Send error if puzzle doesn''t exist
      res.json({
        puzzle_exists: puzzle_exists,
        added: false,
        message: DFSResult.errorMessage,
      });
    } else {
      //If puzzle is valid and doesn't exist
      let prevValues = values.map(row => row.map(x => x))
      let puzzle_difficulty = findDifficultyHashi(values);
      console.log("bbb", puzzle_difficulty)
      //Saving puzzle
      const hashiPuzzle = {
        "puzzle-type": "hashi",
        values: prevValues,
        solution: solution,
        "creator-id": userID,
        difficulty: puzzle_difficulty,
      };
      let puzzle_to_upload = new hashi_model(hashiPuzzle);
      puzzle_to_upload.save(function (err) {
        if (err) {
          res.json({
            puzzle_exists: puzzle_exists,
            added: false,
            message: "Error on server side.",
          });
        } else {
          //sending save result
          puzzle_difficulty = puzzle_difficulty * 10;
          hashiPuzzle.difficulty = puzzle_difficulty;
          res.json({
            puzzle_exists: puzzle_exists,
            added: true,
            message: "Upload successfull.",
            new_puzzle: hashiPuzzle,
          });
        }
      });
    }
  }
});

module.exports = hashi_router;
