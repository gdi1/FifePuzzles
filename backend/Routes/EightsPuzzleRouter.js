const authController = require("../Controllers/authController");
const eights_puzzle_router = require("express").Router();
const mongoose = require("mongoose");
const sudoku_model = require("../Models/Sudoku_Model");
const eights_puzzle_model = require("../Models/Eights_Puzzle_Model");
const NextMoveEightsPuzzle = require("../AI/NextMoveEightsPuzzle");
const EightsSolverMain = require("../AI/EightsSolver");
const checkContent8sPuzzle = require("../supporting_functions/eights_content_check");
const jwt = require("jsonwebtoken");
eights_puzzle_router.use(authController.protect);
eights_puzzle_router.post("/get_eights_puzzle/", async (req, res) => {
  let difficulty = req.body.difficulty;
  if (difficulty == "medium") {
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
        "$match": {
          "$and": [
            {
              "eights_puzzles.difficulty": { "$gte": 4 }
            },
            {
              "eights_puzzles.difficulty": { "$lte": 7 }
            },
            {
              "eights_puzzles.active": true
            }
          ]
        }
      },
      {
        "$project": {
          "eights_puzzles": "$eights_puzzles",
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
          "eights_puzzle": {
            "$mergeObjects": [
              "$eights_puzzles",
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
    //   eights_puzzle_model.aggregate(pipeline, options).exec((err, result) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(result)
    //     }
    //   })
    // }).then(res => res)
    let result=await eights_puzzle_model.aggregate(pipeline,options)
    if (result.length != 0) {
      res.json({ "found": true, "game": result[Math.floor(Math.random() * result.length)].eights_puzzle });
    } else {
      res.json({ "found": false, "game": null });
    }
  } else if (difficulty == "hard") {
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
        "$match": {
          "$and": [
            {
              "eights_puzzles.difficulty": { "$gte": 8 }
            },
            {
              "eights_puzzles.difficulty": { "$lte": 10 }
            },
            {
              "eights_puzzles.active": true
            }
          ]
        }
      },
      {
        "$project": {
          "eights_puzzles": "$eights_puzzles",
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
          "eights_puzzle": {
            "$mergeObjects": [
              "$eights_puzzles",
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
    //   eights_puzzle_model.aggregate(pipeline, options).exec((err, result) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(result)
    //     }
    //   })
    // }).then(res => res)
    let result=await eights_puzzle_model.aggregate(pipeline,options)

    if (result.length != 0) {
      res.json({ "found": true, "game": result[Math.floor(Math.random() * result.length)].eights_puzzle });
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
        "$match": {
          "$and": [
            {
              "eights_puzzles.difficulty": { "$gte": 1 }
            },
            {
              "eights_puzzles.difficulty": { "$lte": 3 }
            },
            {
              "eights_puzzles.active": true
            }
          ]
        }
      },
      {
        "$project": {
          "eights_puzzles": "$eights_puzzles",
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
          "eights_puzzle": {
            "$mergeObjects": [
              "$eights_puzzles",
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
    //   eights_puzzle_model.aggregate(pipeline, options).exec((err, result) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(result)
    //     }
    //   })
    // }).then(res => res)
    let result=await eights_puzzle_model.aggregate(pipeline,options)

    if (result.length != 0) {
      res.json({ "found": true, "game": result[Math.floor(Math.random() * result.length)].eights_puzzle });
    } else {
      res.json({ "found": false, "game": null });
    }
  }
});

eights_puzzle_router.post("/get_next_move/", async (req, res) => {
  let puzzleState = req.body.puzzle_state;
  console.log(puzzleState);
  let result = NextMoveEightsPuzzle(puzzleState);
  console.log(result);
  if (result[0]) {
    // let yNeeded=null;
    // let xNeeded=null;
    // for(let y=0;y<3;y=y+1){
    //   for(let x=0;x<3;x=x+1){
    //     if(puzzleState[y][x]==result[0]){
    //       xNeeded=x;
    //       yNeeded=y;
    //     }
    //   }
    // }
    res.json({ x: result[0][1], y: result[0][0] });
  }
});

//This method add sudoku puzzle from upload file
eights_puzzle_router.post("/add_8s_puzzle_from_upload/", async (req, res) => {
  let userID = jwt.decode(req.cookies.jwt).userID;
  //Receiving file content
  let puzzle_file = req.body.puzzle_file;
  console.log("yuuiysdcyugsuycgsudgycsduygcusdgy");
  //Checking validity of content against protocol
  if (!checkContent8sPuzzle(puzzle_file)) {
    res.json({
      puzzle_exists: false,
      added: false,
      message: "File contents are invalid.",
    });
  } else {
    let puzzle_exists = await eights_puzzle_model
      .find({
        values: puzzle_file.values,
      })
      .then((result) => result.length !== 0);
    if (puzzle_exists) {
      let puzzle_found = await eights_puzzle_model
        .find({
          values: puzzle_file.values,
        })
        .then((result) => result);
      res.json({
        puzzle_exists: puzzle_exists,
        added: false,
        message: "Such puzzle already exists",
        new_puzzle: puzzle_found[0],
      });
    } else {
      let solvable = EightsSolverMain(puzzle_file.values);
      if (!solvable) {
        res.json({
          puzzle_exists: puzzle_exists,
          added: false,
          message: "This puzzle is unsolvable",
        });
      } else {
        let number_of_moves = NextMoveEightsPuzzle(puzzle_file.values).length;
        let difficulty = 1;
        if (number_of_moves > 0 && number_of_moves <= 3) {
          difficulty = 1;
        } else if (number_of_moves > 3 && number_of_moves <= 6) {
          difficulty = 2;
        } else if (number_of_moves > 6 && number_of_moves <= 9) {
          difficulty = 3;
        } else if (number_of_moves > 9 && number_of_moves <= 12) {
          difficulty = 4;
        } else if (number_of_moves > 12 && number_of_moves <= 15) {
          difficulty = 5;
        } else if (number_of_moves > 15 && number_of_moves <= 18) {
          difficulty = 6;
        } else if (number_of_moves > 18 && number_of_moves <= 21) {
          difficulty = 7;
        } else if (number_of_moves > 21 && number_of_moves <= 24) {
          difficulty = 8;
        } else if (number_of_moves > 24 && number_of_moves <= 27) {
          difficulty = 9;
        } else if (number_of_moves > 27) {
          difficulty = 10;
        }
        const eightsPuzzle = {
          "puzzle-type": "8s_puzzle",
          values: puzzle_file.values,
          "creator-id": userID,
          difficulty: difficulty,
        };
        let puzzle_to_upload = new eights_puzzle_model(eightsPuzzle);
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
              new_puzzle: eightsPuzzle,
            });
          }
        });
      }
    }
  }
});

eights_puzzle_router.use(authController.restrictTo("creator", "administrator"));
eights_puzzle_router.post("/add_eights_puzzle/", async (req, res) => {
  let userID = jwt.decode(req.cookies.jwt).userID;
  let values = req.body.values;
  console.log(values);
  //Checking existance
  let puzzle_exists = await eights_puzzle_model
    .find({
      values: values,
    })
    .then((result) => result.length !== 0);
  if (puzzle_exists) {
    res.json({
      puzzle_exists: puzzle_exists,
      added: false,
      message: "Such puzzle already exists",
    });
  } else {
    let solvable = EightsSolverMain(values);
    console.log(values);
    if (solvable) {
      let number_of_moves = NextMoveEightsPuzzle(values).length;
      let difficulty = 1;
      if (number_of_moves > 0 && number_of_moves <= 3) {
        difficulty = 1;
      } else if (number_of_moves > 3 && number_of_moves <= 6) {
        difficulty = 2;
      } else if (number_of_moves > 6 && number_of_moves <= 9) {
        difficulty = 3;
      } else if (number_of_moves > 9 && number_of_moves <= 12) {
        difficulty = 4;
      } else if (number_of_moves > 12 && number_of_moves <= 15) {
        difficulty = 5;
      } else if (number_of_moves > 15 && number_of_moves <= 18) {
        difficulty = 6;
      } else if (number_of_moves > 18 && number_of_moves <= 21) {
        difficulty = 7;
      } else if (number_of_moves > 21 && number_of_moves <= 24) {
        difficulty = 8;
      } else if (number_of_moves > 24 && number_of_moves <= 27) {
        difficulty = 9;
      } else if (number_of_moves > 27) {
        difficulty = 10;
      }
      //Saving puzzle
      const eightsPuzzle = {
        "puzzle-type": "8s_puzzle",
        values: values,
        "creator-id": userID,
        difficulty: difficulty,
      };
      let puzzle_to_upload = new eights_puzzle_model(eightsPuzzle);
      puzzle_to_upload.save(function (err) {
        if (err) {
          res.json({
            puzzle_exists: puzzle_exists,
            added: false,
            message: "Error on server side.",
          });
        } else {
          difficulty = difficulty * 10;
          eightsPuzzle.difficulty = difficulty;
          res.json({
            puzzle_exists: puzzle_exists,
            added: true,
            message: "Upload successfull.",
            new_puzzle: eightsPuzzle,
          });
        }
      });
    } else {
      res.json({
        puzzle_exists: puzzle_exists,
        added: false,
        message: "This puzzle is unsolvable",
      });
    }
  }
});
eights_puzzle_router.post("/get_difficulty/", async (req, res) => {
  let puzzleState = req.body.puzzle_state;

  let result = NextMoveEightsPuzzle(puzzleState);
  let number_of_moves = result.length;

  let difficulty = 1;
  if (number_of_moves > 0 && number_of_moves <= 3) {
    difficulty = 1;
  } else if (number_of_moves > 3 && number_of_moves <= 6) {
    difficulty = 2;
  } else if (number_of_moves > 6 && number_of_moves <= 9) {
    difficulty = 3;
  } else if (number_of_moves > 9 && number_of_moves <= 12) {
    difficulty = 4;
  } else if (number_of_moves > 12 && number_of_moves <= 15) {
    difficulty = 5;
  } else if (number_of_moves > 15 && number_of_moves <= 18) {
    difficulty = 6;
  } else if (number_of_moves > 18 && number_of_moves <= 21) {
    difficulty = 7;
  } else if (number_of_moves > 21 && number_of_moves <= 24) {
    difficulty = 8;
  } else if (number_of_moves > 24 && number_of_moves <= 27) {
    difficulty = 9;
  } else if (number_of_moves > 27) {
    difficulty = 10;
  }
  res.json({ difficulty: difficulty });
});
module.exports = eights_puzzle_router;
