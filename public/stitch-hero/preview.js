const toggle = document.querySelector('header nav button');
const menu = document.querySelector('#concept-menu');
function closeMenu() {menu.hidden=true;toggle.setAttribute('aria-expanded','false');}
toggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();toggle.focus();}});
document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!toggle.contains(e.target))closeMenu();});
