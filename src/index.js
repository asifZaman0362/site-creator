// the sliding list containing all the elements shown on hovering the menu items
let templateList = null;
let selectedCategory = null;
// the root element for the website builder, this is where dropped elements go
let projectRoot = null;
// this is the element adjacent to which the new element is to be dropped
let relativeTarget = null;
// this flag is checked to determine whether to insert the new element above or below the adjacent element
let dropAboveTarget = false;

let context = { type: null, element: null };


let fgColorInput = null;
let bgColorInput = null;
let [paddingLeftInput, paddingRightInput, paddingTopInput, paddingBottomInput] = [null, null, null, null];
let [marginLeftInput, marginRightInput, marginTopInput, marginBottomInput] = [null, null, null, null];
let contextHint = null;

// function called when a category is hovered
function hoverItem(item) {
  if (templateList) {
    templateList.classList.add("shown");
    if (selectedCategory) selectedCategory.classList.remove("active");
    selectedCategory = document.querySelector(`#${item}`);
    if (selectedCategory) selectedCategory.classList.add("active");
  }
}

// function called when menu is no longer hovered on
function stopHover() {
  if (templateList)
    templateList.classList.remove("shown");
}

// this creates the whole interface by taking provided templates, cleaning them up, tagging them and putting them
// in their appropriate categories in the menu
function createInterface() {

}

// event handler for when an item is being dragged over another existing element in the generated DOM
// useful for ordering nodes
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

// this is the event handler for the dragover event on the project root
function dragOver(ev) {
  ev.preventDefault();
  if (ev.dataTransfer.effectAllowed == "copy")
    ev.dataTransfer.dropEffect = "copy";
  else if (ev.dataTransfer.effectAllowed == "move")
    ev.dataTransfer.dropEffect = "move";
}

function updateInspector() {
  switch (context.type) {
    case "DIV": {
      break;
    }
    case "IMG": {
      break;
    }
    case "H1": {
      break;
    }
    case "P": {
      break;
    }
    case "A": {
      break;
    }
    default: {
      break;
    }
  }
}

// set the context for the editor to show appropriate options based on the element being edited
function setEditorContext(item) {
  context.type = item.tagName;
  context.element = item;
  contextHint.innerHTML = `${context.type}`;
  let styles = getComputedStyle(item);
  paddingBottomInput.value = parseInt(styles.paddingBottom);
  paddingTopInput.value = parseInt(styles.paddingTop);
  paddingLeftInput.value = parseInt(styles.paddingLeft);
  paddingRightInput.value = parseInt(styles.paddingBottom);
  marginBottomInput.value = parseInt(styles.marginBottom);
  marginTopInput.value = parseInt(styles.marginTop);
  marginLeftInput.value = parseInt(styles.marginLeft);
  marginRightInput.value = parseInt(styles.marginBottom);
  bgColorInput.value = rgbStringToHex(styles.backgroundColor);
  fgColorInput.value = rgbStringToHex(styles.color);
}

function generateRandomId() {
  return crypto.randomUUID();
}

function makeContentEditableRecursive(element) {
  element.contentEditable = true;
  element.addEventListener("click", (event) => {
    setEditorContext(element)
    event.stopPropagation();
  });
  for (let child of element.children) {
    /*child.contentEditable = true;
    console.debug(child);
    child.addEventListener("click", (event) => {
      console.debug(element); setEditorContext(element)
      event.stopPropagation();
    });*/
    makeContentEditableRecursive(child);
  }
}

function drop(ev) {
  if (!projectRoot) return;
  ev.preventDefault();
  if (ev.dataTransfer.dropEffect == "copy") {
    const data = ev.dataTransfer.getData("text/html");
    let wrapperNode = document.createElement("div");
    wrapperNode.innerHTML = data;
    let createdElement = wrapperNode.firstChild;
    createdElement.draggable = true;
    createdElement.ondragstart = startDragMove;
    createdElement.ondragover = dragOverModule;
    createdElement.id = generateRandomId();
    makeContentEditableRecursive(createdElement);
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

// this is the dragstart event handler for element previews in the menu since they are copied
// unlike drags on existing elements in the DOM which are moved instead
function startDrag(ev) {
  ev.dataTransfer.effectAllowed = "copy";
  let element = ev.target.querySelector(".module");
  ev.dataTransfer.setData("text/html", element.outerHTML);
}

// the other dragstart handler for existing elements which are to be moved instead being copied
// unlike menu preview items
function startDragMove(ev) {
  ev.dataTransfer.effectAllowed = "move";
  ev.dataTransfer.setData("text", ev.target.id);
}

// entry point, sort of, fires when document loads
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
  createSpacingBoxImage();
  paddingTopInput = document.querySelector("#top-padding");
  paddingBottomInput = document.querySelector("#bottom-padding");
  paddingLeftInput = document.querySelector("#left-padding");
  paddingRightInput = document.querySelector("#right-padding");
  marginTopInput = document.querySelector("#top-margin");
  marginBottomInput = document.querySelector("#bottom-margin");
  marginLeftInput = document.querySelector("#left-margin");
  marginRightInput = document.querySelector("#right-margin");
  fgColorInput = document.querySelector("#fg-color");
  bgColorInput = document.querySelector("#bg-color");
  contextHint = document.querySelector("#context");
}

window.addEventListener("load", setup);

function colorChanged(color, fg) {
  if (context.element) {
    if (fg)
      context.element.style.color = color;
    else
      context.element.style.backgroundColor = color;
  }
}

function colorHexUpdate(element) {
  let colorInput = element.previousElementSibling;
  colorInput.value = element.value;
  let fg = element.attributes["colorfor"].value == "fg";
  colorChanged(colorInput.value, fg);
}

function colorUpdate(element) {
  let colorHexInput = element.nextElementSibling;
  colorHexInput.value = element.value;
  let fg = element.attributes["colorfor"].value == "fg";
  colorChanged(colorHexInput.value, fg);
}

function createSpacingBoxImage() {
  let canvases = document.getElementsByTagName("canvas");
  for (let canvas of canvases) {
    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(canvas.width, canvas.height);
    context.moveTo(0, canvas.height);
    context.lineTo(canvas.width, 0);
    context.closePath();
    context.strokeStyle = "lightgray";
    context.stroke();
  }
}

function onPaddingChange(element, direction) {
  let val = element.value;
  if (context.element) {
    switch (direction) {
      case "top":
        context.element.style.paddingTop = `${val}px`;
        break;
      case "right":
        context.element.style.paddingRight = `${val}px`;
        break;
      case "bottom":
        context.element.style.paddingBottom = `${val}px`;
        break;
      case "left":
        context.element.style.paddingLeft = `${val}px`;
        break;
    }
  }
}

function rgbStringToHex(rgb) {
  const matches = rgb.match(/(\d+)/g);
  const hex = rgbToHex(matches[0], matches[1], matches[2]);
  return hex;
}

function rgbToHex(r, g, b) {
  const red = Number(r).toString(16).padStart(2, '0');
  const green = Number(g).toString(16).padStart(2, '0');
  const blue = Number(b).toString(16).padStart(2, '0');
  return `#${red}${green}${blue}`;
}

function onMarginChange(element, direction) {
  let val = element.value;
  if (context.element) {
    switch (direction) {
      case "top":
        context.element.style.marginTop = `${val}px`;
        break;
      case "right":
        context.element.style.marginRight = `${val}px`;
        break;
      case "bottom":
        context.element.style.marginBottom = `${val}px`;
        break;
      case "left":
        context.element.style.marginLeft = `${val}px`;
        break;
    }
  }
}
