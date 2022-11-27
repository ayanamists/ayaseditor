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

function DecideIndent(list: IndentListEle[]) {
  let fisrt = list[0];
  if (fisrt.type === IndentEleType.SExpression) {
    return fisrt.offset;
  } else {
    return TypicalDecide(list);
  }
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