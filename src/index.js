let templateList = null;
let target = null;
let projectRoot = null;
let relativeTarget = null;
let dropAboveTarget = false;

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

function dragOverModule(ev) {
  relativeTarget = ev.target;
  let rect = ev.target.getBoundingClientRect();
  let mousey = ev.clientY - rect.top;
  if (mousey < rect.height / 2) {
    dropAboveTarget = true;
  } else {
    dropAboveTarget = false;
  }
}

function dragOver(ev) {
  ev.preventDefault();
  if (ev.dataTransfer.effectAllowed == "copy")
    ev.dataTransfer.dropEffect = "copy";
  else if (ev.dataTransfer.effectAllowed == "move")
    ev.dataTransfer.dropEffect = "move";
}

function generateRandomId() {
  return crypto.randomUUID();
}

function drop(ev) {
  if (!projectRoot) return;
  ev.preventDefault();
  console.log(ev.dataTransfer.dropEffect);
  if (ev.dataTransfer.dropEffect == "copy") {
    const data = ev.dataTransfer.getData("text/html");
    let wrapperNode = document.createElement("div");
    wrapperNode.innerHTML = data;
    let createdElement = wrapperNode.firstChild;
    createdElement.draggable = true;
    createdElement.ondragstart = startDragMove;
    createdElement.ondragover = dragOverModule;
    createdElement.id = generateRandomId();
    if (relativeTarget) {
      if (dropAboveTarget) {
        relativeTarget.insertAdjacentElement("beforebegin", createdElement);
      } else relativeTarget.insertAdjacentElement("afterend", createdElement);
    } else {
      projectRoot.appendChild(createdElement);
    }
  } else if (ev.dataTransfer.dropEffect == "move") {
    const id = ev.dataTransfer.getData("text");
    if (!id) return;
    const element = document.getElementById(id);
    if (relativeTarget) {
      if (dropAboveTarget) {
        relativeTarget.insertAdjacentElement("beforebegin", element);
      } else relativeTarget.insertAdjacentElement("afterend", element);
    } else {
      projectRoot.appendChild(element);
    }
  }
  relativeTarget = null;
}

function startDrag(ev) {
  ev.dataTransfer.effectAllowed = "copy";
  let element = ev.target.querySelector(".module");
  ev.dataTransfer.setData("text/html", element.outerHTML);
}

function startDragMove(ev) {
  ev.dataTransfer.effectAllowed = "move";
  ev.dataTransfer.setData("text", ev.target.id);
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
