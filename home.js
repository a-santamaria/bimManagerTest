const Dropbox = require('dropbox');
const dbx = new Dropbox({ accessToken: 'rU_jCue1NOUAAAAAAAAIwqwlEvK1i9VHsT0PHWa8gB2KgIBL1EWqWPtGbRCNVGu8' });

const electron = require('electron')
const remote = electron.remote;
const dialog = remote.dialog;
const fs = require('fs');

function connetToDropbox() {
  dbx.filesListFolder({path: ''})
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log(error);
  });
}

function uploadFile() {
  dialog.showOpenDialog(function (fileNames) {
          // fileNames is an array that contains all the selected
         if(fileNames === undefined){
              console.log("No file selected");
         }else{
              readAndUploadFile(fileNames[0]);
         }
  })
}

function readAndUploadFile(filepath){
  var path = filepath.split('/');
  // console.log(path);
  // console.log(path.length);
  var filename = path[path.length - 1];
  console.log(filename);
  fs.readFile(filepath, (err, data) => {
      if(err){
          alert("An error ocurred reading the file :" + err.message);
          return;
      }

      var params = {
        path: '/' + filename,
        contents: data,
        // mode: {
        //   ".tag": "update",
        //   "update": "1f5202d56d"
        // },
        mode: 'overwrite',
        "autorename": true,
      };

      dbx.filesUpload(params)
        .then(function(response) {
          console.log('File uploaded!');
          console.log(response);
        })
        .catch(function(error) {
          console.error(error);
        });
      return false;
  });
}

function createNewFile() {
  dialog.showSaveDialog(function (fileName) {
       if (fileName === undefined){
            console.log("You didn't save the file");
            return;
       }
       var content = '';
       // fileName is a string that contains the path and filename created in the save file dialog.
       fs.writeFile(fileName, content, function (err) {
           if(err){
               alert("An error ocurred creating the file "+ err.message)
           }

           alert("The file has been succesfully saved");
       });
});
}


function StartWatcher(path){
      var chokidar = require("chokidar");

      var watcher = chokidar.watch(path, {
          ignored: /[\/\\]\./,
          persistent: true
      });

      function onWatcherReady(){
          console.info('watcher ready!');
      }

      // Declare the listeners of the watcher
      watcher
      .on('add', function(path) {
            console.log('File', path, 'has been added');
            readAndUploadFile(path);
      })
      .on('addDir', function(path) {
            console.log('Directory', path, 'has been added');
      })
      .on('change', function(path) {
           console.log('File', path, 'has been changed');
           readAndUploadFile(path);
      })
      .on('unlink', function(path) {
           console.log('File', path, 'has been removed');
      })
      .on('unlinkDir', function(path) {
           console.log('Directory', path, 'has been removed');
      })
      .on('error', function(error) {
           console.log('Error happened', error);
      })
      .on('ready', onWatcherReady)
      .on('raw', function(event, path, details) {
           // This event should be triggered everytime something happens.
           // acá se pude bloquear cuando abren el archivo para editarlo
           console.log('Raw event info:', event, path, details);
      });
}

function setDirectory() {
  dialog.showOpenDialog({
      properties: ['openDirectory']
  },function(path){
      if(path){
          // Start to watch the selected path
          StartWatcher(path[0]);
      } else {
          console.log("No path selected");
      }
  });
}
