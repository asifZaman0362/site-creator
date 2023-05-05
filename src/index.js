let templateList = null;

function addElement(element, root) {
  root.appendChild(element);
}

function hoverItem(item) {
  console.debug(item);
  if (templateList)
    templateList.classList.add("shown");
}

function stopHover() {
  if (templateList)
    templateList.classList.remove("shown");
}

function createInterface() {

}

function setup() {
  templateList = document.querySelector("#template-list");
}

window.addEventListener("load", setup);
