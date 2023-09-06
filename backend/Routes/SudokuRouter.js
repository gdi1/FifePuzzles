const authController = require("./../Controllers/authController");
const sudoku_router = require("express").Router();
const mongoose = require("mongoose");
const SudokuDFSmain = require("../AI/SudokuSolver");
const findDifficulty = require("../supporting_functions/sodoku_difficulty");
const checkContent = require("../supporting_functions/sodoku_content_check");
const sudoku_model = require("../Models/Sudoku_Model");
const jwt = require("jsonwebtoken");
//Protecting routes so that they can not be accessed without authorisation
sudoku_router.use(authController.protect);
//Getting puzzle depending on difficulty
sudoku_router.post("/get_sudoku_puzzle/", async (req, res) => {
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
        "$match": {
          "$and": [
            {
              "sudokus.difficulty": { "$gte": 4 }
            },
            {
              "sudokus.difficulty": { "$lte": 7 }
            },
            {
              "sudokus.active": true
            }
          ]
        }
      },
      {
        "$project": {
          "sudokus": "$sudokus",
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
          "sudoku": {
            "$mergeObjects": [
              "$sudokus",
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
    console.log("here sudoku")
    // let result = await new Promise((resolve, reject) => 
    // {
    //   console.log("started promise")
    //   console.log(pipeline);
    //   console.log(options);
    //   sudoku_model.aggregate(pipeline, options).exec((err, result) => {
    //     console.log("inside exec")
    //     if (err) {
    //       console.log("error sudoku")
    //       reject(err);
    //     } else {
    //       console.log("start resolve 1")
    //       resolve(result)
    //       console.log("end resolve 1")
    //     }
    //   })
    // }).then(res => {
    //   console.log("start resolve 2")
    //   return res
    // })
    let result= await sudoku_model.aggregate(pipeline, options);
    //Sending random puzzle of given difficulty
    if (result.length != 0) {
      res.json({ "found": true, "game": result[Math.floor(Math.random() * result.length)].sudoku });
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
        "$match": {
          "$and": [
            {
              "sudokus.difficulty": { "$gte": 8 }
            },
            {
              "sudokus.difficulty": { "$lte": 10 }
            },
            {
              "sudokus.active": true
            }
          ]
        }
      },
      {
        "$project": {
          "sudokus": "$sudokus",
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
          "sudoku": {
            "$mergeObjects": [
              "$sudokus",
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
    //   sudoku_model.aggregate(pipeline, options).exec((err, result) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(result)
    //     }
    //   })
    // }).then(res => res)
    let result= await sudoku_model.aggregate(pipeline, options);
    console.log(result);
    if (result.length != 0) {
      res.json({ "found": true, "game": result[Math.floor(Math.random() * result.length)].sudoku });
    } else {
      res.json({ "found": false, "game": null });
    }
  } else {
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
        "$match": {
          "$and": [
            {
              "sudokus.difficulty": { "$gte": 1 }
            },
            {
              "sudokus.difficulty": { "$lte": 3 }
            },
            {
              "sudokus.active": true
            }
          ],
        }
      },
      {
        "$project": {
          "sudokus": "$sudokus",
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
          "sudoku": {
            "$mergeObjects": [
              "$sudokus",
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
    //   sudoku_model.aggregate(pipeline, options).exec((err, result) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(result)
    //     }
    //   })
    // }).then(res => res)
    let result= await sudoku_model.aggregate(pipeline, options);
    if (result.length != 0) {
      res.json({ "found": true, "game": result[Math.floor(Math.random() * result.length)].sudoku });
    } else {
      res.json({ "found": false, "game": null });
    }
  }
});

//This method add sudoku puzzle from upload file
sudoku_router.post("/add_sudoku_puzzle_from_upload/", async (req, res) => {
  let userID = jwt.decode(req.cookies.jwt).userID;
  //Receiving file content
  let puzzle_file = req.body.puzzle_file;
  //Checking validity of content against protocol
  if (!checkContent(puzzle_file)) {
    res.json({
      puzzle_exists: false,
      added: false,
      message: "File contents are invalid.",
    });
  } else {
    let solution = puzzle_file.solution;
    let values = puzzle_file.values;
    //Checking existance of puzzle
    let puzzle_exists = await sudoku_model
      .find({
        $and: [{ solution: solution }, { values: values }],
      })
      .exec()
      .then((result) => result.length !== 0);
    if (puzzle_exists) {
      //Sending back existent puzzle
      let puzzle_found = await sudoku_model
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
      let DFSResult = SudokuDFSmain(values, solution);
      if (!DFSResult.valid) {
        //If puzzle is invalid
        res.json({
          puzzle_exists: puzzle_exists,
          added: false,
          message: DFSResult.errorMessage,
        });
      } else {
        //Assinging difficulty to puzzle
        let puzzle_difficulty = findDifficulty(values);
        const sudokuPuzzle = {
          "puzzle-type": "sudoku",
          values: values,
          solution: solution,
          "creator-id": userID,
          difficulty: puzzle_difficulty,
        };
        let puzzle_to_upload = new sudoku_model(sudokuPuzzle);
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
              new_puzzle: sudokuPuzzle,
            });
          }
        });
      }
    }
  }
});

//Restricting creation of puzzle to creator and administartor
sudoku_router.use(authController.restrictTo("creator", "administrator"));
sudoku_router.post("/add_sudoku_puzzle/", async (req, res) => {
  let userID = jwt.decode(req.cookies.jwt).userID;

  let solution = req.body.solution;
  let values = req.body.values;
  //Checking existance
  let puzzle_exists = await sudoku_model
    .find({
      $and: [{ solution: solution }, { values: values }],
    })
    .exec()
    .then((result) => result.length !== 0);
    console.log("herere")
  if (puzzle_exists) {
    res.json({
      puzzle_exists: puzzle_exists,
      added: false,
      message: "Such puzzle already exists",
    });
  } else {
    //If doesn't exist, check validity of puzzle with DFS
    let DFSResult = SudokuDFSmain(values, solution);
    if (!DFSResult.valid) {
      //Send error if puzzle doesn''t exist
      res.json({
        puzzle_exists: puzzle_exists,
        added: false,
        message: DFSResult.errorMessage,
      });
    } else {
      //If puzzle is valid and doesn't exist
      let puzzle_difficulty = findDifficulty(values);
      //Saving puzzle
      const sudokuPuzzle = {
        "puzzle-type": "sudoku",
        values: values,
        solution: solution,
        "creator-id": userID,
        difficulty: puzzle_difficulty,
      };
      let puzzle_to_upload = new sudoku_model(sudokuPuzzle);
      puzzle_to_upload.save(function (err) {
        console.log("aaaaaaaaaaaaa", err);
        if (err) {
          res.json({
            puzzle_exists: puzzle_exists,
            added: false,
            message: "Error on server side.",
          });
        } else {
          //sending save result
          puzzle_difficulty = puzzle_difficulty * 10;
          sudokuPuzzle.difficulty = puzzle_difficulty;
          res.json({
            puzzle_exists: puzzle_exists,
            added: true,
            message: "Upload successfull.",
            new_puzzle: sudokuPuzzle,
          });
        }
      });
    }
  }
});

module.exports = sudoku_router;
