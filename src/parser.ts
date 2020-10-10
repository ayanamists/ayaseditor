import * as vscode from "vscode";

export {
  ParseResult, ParseSExp, ParseIds,
  ParseId, CharStream, isLeftB, isRightB
};

class CharStream {
  private targetStr: String;
  private offset: number;
  private line: number;
  private row: number;
  public constructor(targetStr: string) {
    this.targetStr = targetStr;
    this.offset = 0;
    this.line = 0;
    this.row = 0;
  }

  public peekChar() {
    if (this.offset >= this.targetStr.length) {
      throw new Error("eof");
    }
    return this.targetStr[this.offset];
  }

  public move1() {
    let offset = this.offset;
    if (this.targetStr[offset] === '\n') {
      this.line = this.line + 1;
      this.row = 0;
    } else {
      this.row = this.row + 1;
    }

    this.offset = offset + 1;
  }

  public getChar() {
    let char = this.peekChar();
    this.move1();
    return char;
  }

  public getState(): [number, number, number] {
    return [this.offset, this.line, this.row];
  }

  public backTrack(state: [number, number, number]) {
    this.offset = state[0];
    this.line = state[1];
    this.row = state[2];
  }
}

class ParseResult {
  private success: boolean;
  private type: number; //Id is 0, s-expresion is 1
  private state: [number, number, number];
  private value: any;
  public constructor(ss: boolean,
    type: number,
    state: [number, number, number],
    value: any) {
    this.success = ss;
    this.type = type;
    this.state = state;
    this.value = value;
  }
  public isSuccess() {
    return this.success;
  }
  public getType() {
    return this.type;
  }
  public getState() {
    return this.state;
  }
  public getValue() {
    return this.value;
  }
}

function isWhite(c: string) {
  return c === '\n' || c === '\r' || c === ' ' || c === '\t';
}

function isLeftB(c: string) {
  return c === '(' || c === '[' || c === '{';
}

function isRightB(c: string) {
  return c === ')' || c === ']' || c === '}';
}

function isComment(c: string) {
  return c === ';';
}

function isId(c: string) {
  return !isWhite(c) && !isLeftB(c) && !isRightB(c) && !isComment(c);
}

function skipWhite(stream: CharStream) {
  try {
    if (!isWhite(stream.peekChar())) {
      return new ParseResult(false, -1, [0, 0, 0], null);
    }
  }
  catch (e) {
    return new ParseResult(false, -1, [0, 0, 0], null);
  }

  try {
    while (isWhite(stream.peekChar())) {
      stream.getChar();
    }
  }
  catch (e) {
    return new ParseResult(true, -1, [0, 0, 0], null);
  }
  return new ParseResult(true, -1, [0, 0, 0], null);
}

function skipComment(stream: CharStream) {
  try {
    if (!isComment(stream.peekChar())) {
      return new ParseResult(false, -1, [0, 0, 0], null);
    }
  }
  catch (e) {
    return new ParseResult(false, -1, [0, 0, 0], null);
  }
  try {
    while (stream.peekChar() !== '\n') {
      stream.getChar();
    }
    stream.getChar();
  }
  catch (e) {
    return new ParseResult(true, -1, [0, 0, 0], null);
  }
  return new ParseResult(true, -1, [0, 0, 0], null);
}


type Parser = (arg0: CharStream) => ParseResult;

function ParseOr(parser1: Parser, parser2: Parser) {
  let newParser = function (stream: CharStream) {
    let state = stream.getState();
    let res1 = parser1(stream);
    if (res1.isSuccess()) {
      return res1;
    } else {
      let stateNow = stream.getState();
      if (stateNow[0] === state[0]) {
        return parser2(stream);
      }
      else {
        return res1;
      }
    }
  };
  return newParser;
}

function ParseId(stream: CharStream) {
  try {
    let now = stream.peekChar();
  }
  catch {
    return new ParseResult(false, 0, [0, 0, 0], null);
  }
  let state = stream.getState();
  let s = "";
  try {
    while (isId(stream.peekChar())) {
      s = s.concat(stream.getChar());
    }
    if (s.length === 0) {
      return new ParseResult(false, 0, state, null);
    }
    else {
      return new ParseResult(true, 0, state, s);
    }
  } catch (e) {
    return new ParseResult(true, 0, state, s);
  }
}

let ParseEle = ParseOr(ParseId, ParseSExp);

function ParseIds(stream: CharStream) {
  let ParseUnit = ParseOr(skipWhite, skipComment);
  let list = [];
  let state = stream.getState();
  var continu = true;
  while (continu) {
    while (ParseUnit(stream).isSuccess()) { }
    let now = ParseEle(stream);
    if (now.isSuccess()) {
      list.push(now);
    }
    else {
      continu = false;
    }
  }
  while (ParseUnit(stream).isSuccess()) { }
  return new ParseResult(true, 2, state, list);
}

function ParseSExp(stream: CharStream) {
  try {
    let state = stream.getState();
    let now1 = stream.peekChar();
    if (isLeftB(now1)) {
      stream.getChar();
    } else {
      return new ParseResult(false, 1, state, null);
    }

    let res = ParseIds(stream);

    let now2 = stream.peekChar();
    if (isRightB(now2)) {
      stream.getChar();
      return new ParseResult(true, 1, state, res.getValue());
    }
    else {
      return new ParseResult(false, 1, state, null);
    }
  }
  catch (e) {
    return new ParseResult(false, 1, [0, 0, 0], null);
  }
}

