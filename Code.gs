/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Start', 'showSidebar')
      .addToUi();
}

/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens a sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
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
  //text.setBold(false);
  return term;
}

/**
 * Gets the text the user has selected. If there is no selection,
 * this function displays an error message.
 *
 * @return {Array.<string>} The selected text.
 */
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

/**
 * Gets the user-selected text and translates it from the origin language to the
 * destination language. The languages are notated by their two-letter short
 * form. For example, English is 'en', and Spanish is 'es'. The origin language
 * may be specified as an empty string to indicate that Google Translate should
 * auto-detect the language.
 *
 * @param {string} origin The two-letter short form for the origin language.
 * @param {string} dest The two-letter short form for the destination language.
 * @param {boolean} savePrefs Whether to save the origin and destination
 *     language preferences.
 * @return {Object} Object containing the original text and the result of the
 *     translation.
 */
function getExtractedCards(origin, dest, savePrefs) {
  var doc = DocumentApp.getActiveDocument();
  var docName = doc.getName() + '.txt';
  var cards = getCards();
  
  var ankiString = objToString(cards);
  var file = DriveApp.getFileById(doc.getId());
  var folder = file.getParents().next();
  
  folder.createFile(docName, ankiString);
  return {
    text: ankiString
  };
}
