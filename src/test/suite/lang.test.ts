import * as assert from 'assert';
import * as fs from 'fs';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

import * as lang from '../../lang';

suite('Test Lang', () => {
  test(
    'define', () => {
      let str = 'define';
      let res = lang.isSpecialKey(str);
      assert(res);
    }
  );
  test('ndefine', () => {
    let str = 'ndefine';
    let res = lang.isSpecialKey(str);
    assert(!res);
  }
  );
}
);