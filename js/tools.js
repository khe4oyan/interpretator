function ID(id) {
  return document.getElementById(id);
}

function c(text, color = 0) {
  if (color == 2) {
    const res = ID('result');

    const err = document.createElement('p');
    err.classList.add('err');

    err.textContent = text;
    res.appendChild(err);
  }

  switch (color) {
    case 1: 
      console.log('%c' + text, 'background-color: green; padding: 0 4px;');
      break;
    case 2: 
      console.log('%c' + text, 'background-color: red; padding: 0 4px;');
      break;
    case 3: 
      console.log('%c' + text, 'background-color: yellow; color: black; padding: 0 4px;');
      break;
    default:{
      if (Number.isInteger(color)) {
        console.log(text);
      }else{
        console.log('%c' + text, `background-color: black; color: ${color}; padding: 0 4px;`);
      }
      break;
    }
  }
}