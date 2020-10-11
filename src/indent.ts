import * as vscode from 'vscode';
import * as Parser from "./parser";
import { isSpecialKey, isSelectKey } from "./lang";

export { DecideIndent, IndentEleType, IndentListEle };

enum IndentEleType {
  Id = 0,
  SExpression = 1
}

class IndentListEle {
  public type: IndentEleType;
  public offset: number;
  public value: string;
  public line: number;
  public constructor(type: IndentEleType, line: number, offset: number, value: string) {
    this.type = type;
    this.line = line;
    this.offset = offset;
    this.value = value;
  }
}

function TypicalDecide(list: IndentListEle[]) {
  let fisrt = list[0];
  if (isSpecialKey(fisrt.value)) {
    return IndentSchemeSpecial(list);
  }
  else if (isSelectKey(fisrt.value)) {
    return IndentSchemeSelect(list);
  }
  else {
    return IndentSchemeNormal(list);
  }

}

function CheckIndentType(params: IndentListEle[], intent: number) {
  for (var i = 2; i < params.length; ++i) {
    if (params[i].offset !== intent) {
      return false;
    }
  }
  return true;
}

function DecideIndent(list: IndentListEle[]) {
  let fisrt = list[0];
  if (fisrt.type === IndentEleType.SExpression) {
    return fisrt.offset;
  } else {
    let typicalResult = TypicalDecide(list);
    let success = CheckIndentType(list, typicalResult);
    if (success) {
      return typicalResult;
    } else {
      return IndentScheme4(list);
    }
  }
}

function NOCALL_GetIndentTypeCache(params: string) {
}

// 一般情况：
// 如果是括号后的第二个，则与第一个统一缩进
// 其他情况则与第二个统一缩进
// (+ 1
//    2)
// (+
//  1
//  2)
function IndentSchemeNormal(list: IndentListEle[]) {
  if (list.length === 1) {
    return list[0].offset;
  } else {
    return list[1].offset;
  }
}

// define let等等关键字的情况：
// 关键字+1
// (define a
//   10
// )
// 注意不能直接把FULB+2，因为有类似情况：
// (
//   define a
//    10
// )
function IndentSchemeSpecial(list: IndentListEle[]) {
  return list[0].offset + 1;
}

// if cond 等等（对称）选择关键字的情况：
// 如果是第二个，则关键字 + 1
// 如果不是第二个，则与第二个统一缩进
// (cond
//   ((= a 10) 1)
//   ((= a 11) 2))
// (cond ((= a 10) 1)
//       ((= a 11) 2))
function IndentSchemeSelect(list: IndentListEle[]) {
  if (list.length === 1) {
    return list[0].offset + 1;
  } else {
    return list[1].offset;
  }
}

// 从第二个开始，寻找最新的有效缩进
// 有效缩进指
// id 是某一行的第一个
//   (+ 1
//      2)
// 这里2也是有效缩进
function IndentScheme4(list: IndentListEle[]) {
  var formalReg = list[list.length - 1];
  var nowPosReg;
  nowPosReg = list.length - 2;
  while (nowPosReg > 0) {
    let now = list[nowPosReg];
    if (now.line !== formalReg.line) {
      return formalReg.offset;
    } else {
      formalReg = now;
    }
  }
  return formalReg.offset;
}