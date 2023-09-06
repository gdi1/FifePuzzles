# Contents
- backend - contains all files related to backend express server app and it contains tests folder for backend testing.
- frontend - contains all files related to frontend react app.

## To start the database on host
- ssh to cs3099user26 host as cs3099user26 user.
- cd ~/Documents/database2/mongodb6/
- ./mongodb

## To start express server on host 
- ssh to cs3099user26 host as cs3099user26 user.
- cd /cs/home/cs3099user26/Documents/project-code/backend
- npm install forever -g
- npm install
- forever server.js

## To start frontend react on host
- ssh to cs3099user26 host as cs3099user26 user.
- cd /cs/home/cs3099user26/Documents/project-code/frontend/fife_puzzles
- npm install --global yarn
- npm install (some installments will fail)
- yarn install
- npm run build
- copy all contents from build folder to /cs/home/cs3099user26/nginx_default/

## Website Admin Credentials
- Login: gdi1@st-andrews.ac.uk
- Password: pass1234

## Website Creator Credentials
- Login: ln60@st-andrews.ac.uk
- Password: test12345