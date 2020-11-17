import { get } from 'https';
import { off } from 'process';
import * as vscode from 'vscode';
import { isSelectKey, isSpecialKey } from './lang';
import * as Parser from './parser';
import * as Indent from "./indent";

export { ReturnAction, TabAction };

function getRealPos(
  beginPos: vscode.Position,
  targetLine: number,
  targetRow: number) {

  if (targetLine === 0) {
    return beginPos.character + targetRow;
  } else {
    return targetRow;
  }

}

// 得到 pos 位置的之前的 n 个字符
function getText(position: vscode.Position,
  a: vscode.TextEditor,
  n: number):
  [vscode.Position, string] {

  let offset = a.document.offsetAt(position);
  var targetOffset = offset - n;
  if (targetOffset < 0) {
    targetOffset = 0;
  }
  let begin = a.document.positionAt(targetOffset);
  let doc = a.document.getText(new vscode.Range(begin, position));
  return [begin, doc];
}

// 在字符串中得到第一个未闭合的左括号（若不存在则返回-1）
function searchForFULB(str: string) {
  var counter_reg = 0;
  var offset_reg = -1;
  for (var i = str.length - 1; i >= 0; --i) {
    if (Parser.isRightB(str[i])) {
      counter_reg++;
    }
    else if (Parser.isLeftB(str[i])) {
      if (counter_reg === 0) {
        offset_reg = i;
        break;
      }
      else {
        counter_reg--;
      }
    }
  }
  return offset_reg;
}

// 得到第一个未闭合的左括号
function getFULB(initpos: vscode.Position, a: vscode.TextEditor):
  [string, vscode.Position] | undefined {

  let maxRead = 10000;
  let res = getText(initpos, a, maxRead);

  var str = res[1];
  var pos = searchForFULB(str);
  var end = res[0];
  var begin = end;
  var allStr = str;
  var endFlag = false;
  while (pos === -1 && !endFlag) {
    end = begin;
    var offset = a.document.offsetAt(end);
    if (offset - maxRead < 0) {
      begin = new vscode.Position(0, 0);
      endFlag = true;
    } else {
      begin = a.document.positionAt(offset - maxRead);
    }
    str = a.document.getText(new vscode.Range(begin, end));
    allStr = str.concat(allStr);
    pos = searchForFULB(allStr);
  }

  if (pos === -1) {
    return undefined;
  }

  let nowPosition = a.document.positionAt(
    a.document.offsetAt(begin) + pos + 1
  );

  return [allStr.slice(pos + 1, allStr.length), nowPosition];
}

function ParseResultToIndentAst(posAfterFULB: vscode.Position,
  data: [Parser.ParseResult]) {

  let res = [];
  for (var i = 0; i < data.length; ++i) {
    let now = data[i].getState();
    let line = now[1];
    let row = now[2];
    let resStr = (data[i].getType() === 0) ? data[i].getValue() : "";
    res.push(new Indent.IndentListEle(
      data[i].getType(),
      line,
      getRealPos(posAfterFULB, line, row),
      resStr));
  }

  return res;
}

function GetIndent(initPos: vscode.Position, te: vscode.TextEditor): number {
  let dataAfterFULB = getFULB(initPos, te);
  if (dataAfterFULB === undefined) {
    return 0;
  }
  let strAfterFULB = dataAfterFULB[0];
  let posAfterFULB = dataAfterFULB[1];
  let parseData =
    Parser.ParseIds(new Parser.CharStream(strAfterFULB));

  if (!parseData.isSuccess()) {
    throw Error("parse error!");
  }
  let value = parseData.getValue();

  if (value.length === 0) {
    return posAfterFULB.character;
  }

  return Indent.DecideIndent(ParseResultToIndentAst(posAfterFULB, value));
}

function DecideDeleteBackward(a: vscode.TextEditor) {
  let pos = a.selection.active;
  let maxSearch = 1000;
  let res = getText(pos, a, maxSearch);
  let str = res[1];
  let counter = 0;
  while (counter < str.length) {
    if (str[str.length - 1 - counter] !== ' ') {
      break;
    }
    counter++;
  }

  let deleteBeginPos = a.document.positionAt(
    a.document.offsetAt(pos) - counter
  );
  return new vscode.Selection(deleteBeginPos, pos);
}

function mergeTwoSelection(s1: vscode.Selection, s2: vscode.Selection) {
  return new vscode.Selection(s1.anchor, s2.active);
}

function ReturnAction(te: vscode.TextEditor) {
  let now = te.selection.active;
  let indent = GetIndent(now, te);
  let deleteRange = DecideDeleteBackward(te);
  let a = vscode.window.activeTextEditor;
  let end = deleteRange.anchor;
  if (a === undefined) {
    throw Error("please open an editor!");
  }

  let str = "\n" + ' '.repeat(indent);
  a.edit(
    (editor) => {
      editor.insert(end, str);
      editor.delete(deleteRange);
    }
  );
}

function DecideTabRequire(te: vscode.TextEditor):
  [vscode.Position, number] {

  let now = te.selection.active;
  let line = now.line;
  let thisLine = te.document.lineAt(line);
  let str = te.document.getText(thisLine.range);

  var counter = 0;
  while (str[counter] === ' ') { counter++; }

  let initPos = te.document.positionAt(
    te.document.offsetAt(
      thisLine.range.start) + counter);

  let indent = GetIndent(initPos, te);
  return [initPos, indent - counter];
}

function TabAction(te: vscode.TextEditor) {
  let require = DecideTabRequire(te);
  let num = require[1];
  let pos = require[0];
  let opPos = te.document.positionAt(
    te.document.offsetAt(pos) + num
  );

  if (num < 0) {
    te.edit(
      (editor) => {
        editor.delete(new vscode.Range(opPos, pos));
      }
    );
  }
  else if (num > 0) {
    te.edit(
      (editor) => {
        editor.insert(pos, ' '.repeat(num));
      }
    );
  } else { }
}