export { isSpecialKey, isSelectKey };

function isSpecialKey(str: string) {
  let regex = /^((define.*)|(.*let.*)|syntax-rules|begin|call\/cc|(.*lambda.*)|(.*λ.*)|library|(.*case.*)|unless|(.*match.*))|λ$/;
  return regex.test(str);
}

function isSelectKey(str: string) {
  let regex = /^(.*cond.*)|(.*if.*)$/;
  return regex.test(str);
}