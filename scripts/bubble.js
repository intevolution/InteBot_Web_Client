const menuBtn = document.querySelector('.buttonBubble');
const inteBot = document.querySelector('.inteBot');
const headerInteBot = document.querySelector('.headerInteBot');
const botonCerrar = document.querySelector('.buttonCloseChat');
let menuOpen = false;

menuBtn.addEventListener('click', () => {
    if (!menuOpen) {
        inteBot.classList.add('open');
        headerInteBot.classList.add('open');
        menuBtn.classList.add('open');
        botonCerrar.classList.add('open');
        menuOpen = true;
    } else {
        inteBot.classList.remove('open');
        headerInteBot.classList.remove('open');
        menuBtn.classList.remove('open');
        botonCerrar.classList.remove('open');
        menuOpen = false;
    }
})

botonCerrar.addEventListener('click', () => {
    inteBot.classList.remove('open');
    headerInteBot.classList.remove('open');
    menuBtn.classList.remove('open');
    botonCerrar.classList.remove('open');
    menuOpen = false;
})