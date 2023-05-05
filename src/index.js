let templateList = null;
let target = null;
let projectRoot = null;

function addElement(element, root) {
  root.appendChild(element);
}

function hoverItem(item) {
  if (templateList) {
    templateList.classList.add("shown");
    if (target) target.classList.remove("active");
    target = document.querySelector(`#${item}`);
    if (target) target.classList.add("active");
  }
}

function stopHover() {
  if (templateList)
    templateList.classList.remove("shown");
}

function createInterface() {

}

function dragOver(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "copy";
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text/html");
  let wrapperNode = document.createElement("div");
  wrapperNode.innerHTML = data;
  let createdElement = wrapperNode.firstChild;
  if (projectRoot) {
    projectRoot.appendChild(createdElement);
  }
}

function startDrag(ev) {
  ev.dataTransfer.effectAllowed = "copy";
  let element = ev.target.querySelector(".module");
  ev.dataTransfer.setData("text/html", element.outerHTML);
}

function setup() {
  templateList = document.querySelector("#template-list");
  let elements = document.getElementsByClassName("template-item-wrapper");
  for (let element of elements) {
    element.draggable = true;
    element.ondragstart = startDrag;
  }
  projectRoot = document.querySelector("#project-root");
  if (projectRoot) {
    projectRoot.ondragover = dragOver;
    projectRoot.ondrop = drop;
  }
}

window.addEventListener("load", setup);
