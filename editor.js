var newButton, openButton, saveButton;
var editor;
var menu;
var fileEntry;
var hasWriteAccess;

var remote = require('remote');
var Menu = remote.require('menu');
var MenuItem = remote.require('menu-item');
var dialog = remote.require('dialog');
var fs = require("fs");
var clipboard = require('clipboard');

function handleDocumentChange(title) {
  var mode = "haskell";
  var modeName = "Haskell";
  if (title) {
    title = title.match(/[^/]+$/)[0];
    document.getElementById("title").innerHTML = title;
    document.title = title;
    if (title.match(/.hs$/)) {
      mode = {name: "haskell"};
      modeName = "Haskell";
    } else if (title.match(/.html$/)) {
      mode = "htmlmixed";
      modeName = "HTML";
    } else if (title.match(/.css$/)) {
      mode = "css";
      modeName = "CSS";
    }
  } else {
    document.getElementById("title").innerHTML = "[no document loaded]";
  }
  // editor.setOption("mode", mode);
  document.getElementById("mode").innerHTML = modeName;
}

function newFile() {
  fileEntry = null;
  hasWriteAccess = false;
  // handleDocumentChange(null);
}

function setFile(theFileEntry, isWritable) {
  fileEntry = theFileEntry;
  hasWriteAccess = isWritable;
}

function readFileIntoEditor(theFileEntry) {
  fs.readFile(theFileEntry.toString(), function (err, data) {
    if (err) {
      console.log("Read failed: " + err);
    }

    // handleDocumentChange(theFileEntry);
    editor.setValue(String(data));
  });
}

function writeEditorToFile(theFileEntry) {
  var str = editor.getValue();
  fs.writeFile(theFileEntry, editor.getValue(), function (err) {
    if (err) {
      console.log("Write failed: " + err);
      return;
    }

    // handleDocumentChange(theFileEntry);
    console.log("Write completed.");
  });
}

var onChosenFileToOpen = function(theFileEntry) {
  console.log(theFileEntry);
  setFile(theFileEntry, false);
  readFileIntoEditor(theFileEntry);
};

var onChosenFileToSave = function(theFileEntry) {
  setFile(theFileEntry, true);
  writeEditorToFile(theFileEntry);
};

function handleNewButton() {
  if (true) {
    newFile();
    editor.setValue("");
  } else {
    window.open('file://' + __dirname + '/index.html');
  }
}

function handleOpenButton() {
  dialog.showOpenDialog({properties: ['openFile']}, function(filename) {
      onChosenFileToOpen(filename.toString()); });
}

function handleSaveButton() {
  if (fileEntry && hasWriteAccess) {
    writeEditorToFile(fileEntry);
  } else {
    dialog.showSaveDialog(function(filename) {
       onChosenFileToSave(filename.toString(), true);
    });
  }
}

function initContextMenu() {
  menu = new Menu();
  menu.append(new MenuItem({
    label: 'Copy',
    click: function() {
      clipboard.writeText(editor.getSelection(), 'copy');
    }
  }));
  menu.append(new MenuItem({
    label: 'Cut',
    click: function() {
      clipboard.writeText(editor.getSelection(), 'copy');
      editor.replaceSelection('');
    }
  }));
  menu.append(new MenuItem({
    label: 'Paste',
    click: function() {
      editor.replaceSelection(clipboard.readText('copy'));
    }
  }));

  window.addEventListener('contextmenu', function(ev) {
    ev.preventDefault();
    menu.popup(remote.getCurrentWindow(), ev.x, ev.y);
  }, false);
}


onload = function() {
  initContextMenu();

  // newButton = document.getElementById("new");
  // openButton = document.getElementById("open");
  // saveButton = document.getElementById("save");
  //
  // newButton.addEventListener("click", handleNewButton);
  // openButton.addEventListener("click", handleOpenButton);
  // saveButton.addEventListener("click", handleSaveButton);

  editor = CodeMirror(
      document.getElementById("editor"),
      {
        mode: {name: "haskell"},
        lineNumbers: true,
        gutters: ["CodeMirror-linenumbers", "bookmarks"],
        theme: "lesser-dark",
        viewportMargin: Infinity,
        autofocus: true,
        autoCloseBrackets: true,
        scrollbarStyle: "native",
        extraKeys: {
          "Cmd-S": function(instance) { handleSaveButton() },
          "Ctrl-S": function(instance) { handleSaveButton() },
        }
      });

  editor.setSize(600, 600);

  //newFile();
  readFileIntoEditor('/Users/jwin/haskell/rpar.hs');
  onresize();

  editor.on("gutterClick", function(cm, n) {
    var info = cm.lineInfo(n);
    cm.setGutterMarker(n, "bookmarks", info.gutterMarkers ? null : makeMarker());
  });

  function makeMarker() {
    var marker = document.createElement("div");
    marker.style.color = "#822";
    marker.innerHTML = '\u2022';
    return marker;
  }
};

onresize = function() {
  var container = document.getElementById('editor');
  var containerWidth = container.offsetWidth;
  var containerHeight = container.offsetHeight;

  var scrollerElement = editor.getScrollerElement();
  scrollerElement.style.width = containerWidth + 'px';
  scrollerElement.style.height = containerHeight + 'px';

  editor.refresh();
}
