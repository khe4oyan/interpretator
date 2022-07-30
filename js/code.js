const code_div = ID('code');
const run_btn = ID('run');
const clear_btn = ID('clear');

let interpreter = new Interpreter(code_div.value);

run_btn.onclick = () => {
  reset();
  new Interpreter(code_div.value);
}

clear_btn.onclick = () => {
  reset();
  code_div.value = '';
  // console.clear();
}

function reset() {
  const result = ID('result');
  result.innerText = '';
}