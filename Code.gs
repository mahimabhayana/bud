var ankiString = "";
var cardFile;

function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Start', 'showSidebar')
      .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('sidebar')
      .setTitle('Flash cards');
  DocumentApp.getUi().showSidebar(ui);
}

function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + '; ' + obj[p] + ';\n';
        }
    }
    return str;
}

function boldTerm(paraString, paraText) {
  var text = paraText;
  var startBold = 0;
  var term = null;
  var bold = false; 
  for (var i = 0; i < paraString.length; i++) {
    if (paraString[i] && paraString[i] !== ' ') {
      if (text.isBold(i) && !bold) {
        startBold = i;
        bold = true;
      }
      else if (!text.isBold(i) && bold) {
        bold = false;
        term = paraString.slice(startBold, i-1);
      }
    }
  }
  
  if (bold) {
    term = paraString.slice(startBold, i-1);
  }  

  return term;
}


function getCards() {
  var doc = DocumentApp.getActiveDocument().getBody();
  var paras = doc.getParagraphs();
  var cards = {};
  
  for (var i = 0; i < paras.length; i++) {
    var para = paras[i];
    var paraString = para.getText(); 
    if (paraString) {
      var t = para.editAsText();
      var s = paraString.split(" - ");
      if (t.isBold(0) && s.length > 1 && !t.isUnderline(0)) {
        cards[s[0]] = s[1];
      } else if (!t.isUnderline(0)){
        var term = boldTerm(paraString, t);
        if (term) {
          cards[term] = paraString;
        }
        
      }
    }
  }
  return cards;
}

function getExtractedCards() {
  var doc = DocumentApp.getActiveDocument();
  var docName = doc.getName() + '.txt';
  var cards = getCards();
  
  ankiString = objToString(cards);

  var currentFile = DriveApp.getFileById(doc.getId());
  var folder = file.getParents().next();
  folder.createFile(docName, ankiString);
  cardFile = folder.getFilesByName(docName).next();

  if (!cardFile) {
    folder.createFile(docName, ankiString);
  } else {
    cardFile.setContent(ankiString);
  }
  return {
    text: ankiString
  };
}


