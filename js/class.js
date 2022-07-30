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
    c(this._variables);
    document.body.style.cursor = 'default';
  }
  
  syntax_analysis(line) {
    const first_elem = line[0];
    
    if (first_elem == '}' || first_elem == 'else')  return true;
    if ((first_elem == 'num' || first_elem == 'str' || first_elem == 'bool') && line.length == 3)  return true;
    if (first_elem == 'if' && line.length == 4)  return true;
    if (first_elem == 'for' && line.length == 2)  return true;
    if (first_elem == 'output' && line.length == 2)  return true;
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

    c('tocken: ' + tocken);
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

  use_var(line) {
    c('use_var() started', '#789900');

    c(line);
    let variable = this.find_variable(line[0]);
    if (variable == false) {
      return false;
    }
    c(variable);
    if (line[1] == '=') {
      if (typeof +line[2] == "number" && typeof +line[4] == "number") {
        // +, -, *, /
        const sym = line[3];
        //not working because line[2] or line[4] maybe will be variable.
        // if (sym == '+') variable.var_value = (+line[2] + line[4]);
        // if (sym == '-') variable.var_value = (+line[2] - line[4]);
        // if (sym == '*') variable.var_value = (+line[2] * line[4]);
        // if (sym == '/') variable.var_value = (+line[2] / line[4]);
        this.output('arithmetoc operations in developing');
      }
    }else{
      c('undefined symbol' ,2);
      return false;
    }

    c('ended use_var()', '#789900');
    return true;
  }
  
  for_worked(line) {
    this._for_counter = +line[1];
  }

  if_worked(line) {
    const cmp = line[2]; // >, <, ==
    let val_left = (this.find_variable(line[1]).var_value || line[1]);
    let val_right = (this.find_variable(line[3]).var_value || line[3]);
    c(val_left);

    if (Number.isInteger(+val_left) != Number.isInteger(+val_right)) { // cmp types
      this._skip_mode = true;
    }else{
      this._else_skip = true;
      if (Number.isInteger(+val_left) == Number.isInteger(+val_right)) {
        if (cmp == '==') return (+val_left == +val_right);
        if (cmp == '>') return (+val_left > +val_right);
        if (cmp == '<') return (+val_left < +val_right);
      }
      
      return (val_left == val_right);
    }
  }

  if_else() {
    if (this._else_skip) {
      this._skip_mode = true;
    }
  }

  output(text) {
    const result = ID('result');
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
    line = line.split(' ');

    for(let i = 0; i < line.length;) {
      if (line[i] == '') {
        line.splice(i, 1);
        continue;
      }
      
      ++i;
    }

    if (line[0] == '//') {
      return '';
    }

    return line;
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