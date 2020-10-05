import * as assert from 'assert';
import * as fs from 'fs';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

import * as Parser from "../../parser";

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start Parser tests.');

  test(
    'id test', () => {
      let cs = new Parser.CharStream("abcd-14fa");
      let res = Parser.ParseId(cs);
      assert(res.isSuccess() === true);
    }
  );
  test('s-exp test', () => {
    let cs = new Parser.CharStream("(+ 12 2)");
    let res = Parser.ParseSExp(cs);
    let value = res.getValue();
    assert(res.isSuccess() === true);
  });
  test('ids-test', () => {
    let str = " (+ 12 (12)) 1234 ;success ";
    let res = Parser.ParseIds(new Parser.CharStream(str));
    assert(res.isSuccess());
  }
  );
  test('mutl-line', () => {
    let str = "(+ 12 (* 3 4)\n\n  ;fuck\n abcd-312d\n (+ 123)";
    let res = Parser.ParseIds(new Parser.CharStream(str));
    assert(res.isSuccess());
  }
  );
  test('real test 1', () => {
    let str = "#lang racket \
    (  let ((a 10) \
            (b 20)) \
        10) \
\
    (case x";
    let res = Parser.ParseIds(new Parser.CharStream(str));
    assert(res.isSuccess());
  }
  );
  test('real test 2', () => {
    let buffer = fs.readFileSync('C:\\main.ss');
    let str = buffer.toString();
    let res = Parser.ParseIds(new Parser.CharStream(str));
    assert(res.isSuccess());
  }
  );
});