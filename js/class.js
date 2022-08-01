class Interpreter{
  _code = undefined;
  _variables = {};
  _skip_mode = false;

  _for_counter = undefined; // this counter set for number and decremented while > 0
  _for_instruction = []; // add ther for body.
  _else_skip = false;

  constructor(code) {
    document.body.style.cursor = 'wait';
    this._code = code.split('\n');
    this.line_reader();
    document.body.style.cursor = 'default';
  }
  
  syntax_analysis(line) {
    const first_elem = line[0];
    
    if (first_elem == '}' || first_elem == 'else')  return true;
    if ((first_elem == 'num' || first_elem == 'str' || first_elem == 'bool') && line.length == 3)  return true;
    if (first_elem == 'if' && line.length == 4)  return true;
    if (first_elem == 'for' && line.length == 2)  return true;
    if (first_elem == 'output')  return true;
    if (this.find_variable(first_elem)) return true;

    return false;
  }

  line_reader() { // line counter is there "i"
    for (let i = 0; i < this._code.length; ++i) {
      const line = this.tockenizing(this._code[i]);
      if (this._skip_mode == true && line[0] != '}') {
        continue;
      }else{
        this._skip_mode = false;
      }

      if (this._for_counter != undefined && line != '}') {
        this._for_instruction.push(line);
      }

      if (line == '') {
        continue;
      }

      if (!this.syntax_analysis(line)) {
        c(`syntax error in line: ${+i + 1}`, 2);
        return;
      } 

      if (!this.line_runner(line)) {
        c(`run time error in line: ${+i + 1}`, 2);
        return;
      } 
    }
  }

  tockens_type = ['new_var', 'if', 'if_else', 'for', 'use_var', 'output', 'scope'];
  
  what_is_type(tocken) {
    if (tocken == 'num' || tocken == 'str' || tocken == 'bool') return this.tockens_type[0];
    if (tocken == 'if')             return this.tockens_type[1];
    if (tocken == 'else')           return this.tockens_type[2];
    if (tocken == 'for')            return this.tockens_type[3];
    if (this.find_variable(tocken)) return this.tockens_type[4];
    if (tocken == 'output')         return this.tockens_type[5];
    if (tocken == '}')              return this.tockens_type[6];

    return undefined;
  }
  
  line_runner(line) {

    // use info for type than how to use line
    const type = this.what_is_type(line[0]); 
    
    switch(type) {
      case this.tockens_type[0]: { // new var
        if (!this.add_variable(line[1], line[2], line[0])) {
          return false;
        }
        break;
      }
      case this.tockens_type[1]: { // if
        this.if_worked(line);
        break;
      }
      case this.tockens_type[2]: { // if_else
        this.if_else();
        break;
      }
      case this.tockens_type[3]: { // for
        this.for_worked(line);
        break;
      }
      case this.tockens_type[4]: { // use_var
        if (!this.use_var(line)) {
          return false;
        }
        break;
      }
      case this.tockens_type[5]: { // output
        this.output(line[1]);
        break;
      }
      case this.tockens_type[6]: { // scope
        this.scope(line);
        break;
      }
      default: {
        c(`undefined tocken \ntocken: ${type}`, 2);
        return false;
      }
    }

    return true;
  }

  scope(line) {
    if (this._skip_mode) {
      !this._skip_mode;
    }

    if (this._else_skip) {
      c('else skip worked');
      !this._else_skip;
    }

    if (this._for_counter != undefined) {
      this.for_run();
      this._for_counter = undefined;
    }
  }

  for_run() {
    for (let i = this._for_counter; i > 1; --i) {
      for (let j = 0; j < this._for_instruction.length; ++j) {
        this.line_runner(this._for_instruction[j]);
      }
    }

    this._for_counter = undefined;
    this._for_instruction = undefined;
  }

  get_value_is_tocken(tocken) {
    let tmp = this.find_variable(tocken);
    if (tmp != false) {
      return tmp.var_value;
    }

    if (Number.isInteger(+tocken)) {
      return +tocken;
    }

    return false;
  } 

  use_var(line) {
    let left_operand = this.find_variable(line[0]);
    if (left_operand == false) {
      c('is not a variable', 2);
      return;
    }

    if (line[1] == '=') {
      let num_1 = this.get_value_is_tocken(line[2]);
      let num_2 = this.get_value_is_tocken(line[4]);

      if (num_1 == false || num_2 == false) {
        c('is not a number', 2);
        return false;
      }

      if (typeof +num_1 == "number" && typeof +num_1 == "number") {
        // +, -, *, /
        const sym = line[3];

        switch(sym) {
          case '+': {
            left_operand.var_value = +num_1 + +num_2;
            break;
          }
          case '-': {
            left_operand.var_value = +num_1 - +num_2;
            break;
          }
          case '*': {
            left_operand.var_value = +num_1 * +num_2;
            break;
          }
          case '/': {
            left_operand.var_value = +num_1 / +num_2;
            break;
          }
        }

      } else {
        c('typeof two arguments != number', 2);
        return false;
      }
    }else{
      c('undefined symbol', 2);
      return false;
    }

    return true;
  }
  
  for_worked(line) {
    if (Number.isInteger(+line[1])) {
      this._for_counter = +line[1];
      return;
    } 

    let tmp = this.find_variable(line[1]);
    if (tmp != undefined) {
      this._for_counter = tmp.var_value;
    } else {
      c('undefined tocken', 2);
    }
  }

  if_worked(line) {
    c(line);
    const cmp = line[2]; // >, <, ==
    let var_left = Number(this.find_variable(line[1]).var_value || line[1]);
    let var_right = Number(this.find_variable(line[3]).var_value || line[3]);
    
    let ret_bool = true;

    switch(cmp) {
      case '==': {
        ret_bool = (var_left == var_right);  
        break;
      }
      case '>': {
        ret_bool = (var_left > var_right);  
        break;
      }      
      case '<': {
        ret_bool = (var_left < var_right);  
        break;
      }
    }

    if (ret_bool) {
      this._else_skip = true;
    }else {
      this._skip_mode = true;
    }

    c(ret_bool);
    return ret_bool;
  }

  if_else() {
    if (this._else_skip) {
      this._skip_mode = true;
    }
  }

  output(text) { const result = ID('result');
    const output = document.createElement('p');
    const value = this.find_variable(text);

    if (value == false) {
      output.textContent = text;
    }else{
      output.textContent = value.var_value;
    }
    output.classList.add('output');
    result.appendChild(output);
  }

  tockenizing(line) {
    let tmp = line.split(' ');

    for(let i = 0; i < tmp.length;) {
      if (tmp[i] == '') {
        tmp.splice(i, 1);
        continue;
      }
      
      ++i;
    }

    if (tmp[0] == '//') {
      return '';
    }

    if (tmp[0] == 'output' && tmp.length > 2) {
      let t = [];
      t.push(tmp[0]);
      t.push(tmp[1]);
      
      for (let i = 2; i < tmp.length; ++i) {
        t[1] += ' ' + tmp[i];
      }

      tmp = t;
    } 

    return tmp;
  }

  add_variable(variable, value, type) {
    if (!this.find_variable(variable)) {
      let tmp = {
        var_type: type,
        var_value: value
      };
      this._variables[variable] = tmp;
      return true;
    }
    return false;
  }

  find_variable(variable) {
    return this._variables[variable] == undefined ? false : this._variables[variable];
  }
};