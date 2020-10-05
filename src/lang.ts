export { isSpecialKey, isSelectKey };

function isSpecialKey(str: string) {
  let regex = /^((define.*)|(.*let.*)|syntax-rules|begin|call\/cc|lambda|library|(.*case.*)|unless)|λ$/;
  return regex.test(str);
}

function isSelectKey(str: string) {
  let regex = /^(.*cond.*)|(.*if.*)$/;
  return regex.test(str);
}