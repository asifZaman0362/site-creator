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

let lastHighlight = null;

let highlight = null;


let fgColorInput = null;
let bgColorInput = null;
let [paddingLeftInput, paddingRightInput, paddingTopInput, paddingBottomInput] = [null, null, null, null];
let [marginLeftInput, marginRightInput, marginTopInput, marginBottomInput] = [null, null, null, null];
let contextHint = null;

let fontInspector = null;
let imageInspector = null;
let urlInspector = null;

let state = new VersionHistory();


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
      urlInspector.style.display = "block";
      urlInspector.querySelector('input').value = context.element.src;
      break;
    }
    case "H1":
    case "H2":
    case "H3":
    case "H4":
    case "H5":
    case "H6":
    case "P":
    case "SPAN":
    case "LI": {
      if (context.element.children.length == 0) {
        context.element.contentEditable = true;
        context.element.focus();
      }
      break;
    }
    case "A": {
      context.element.contentEditable = true;
      urlInspector.style.display = "block";
      break;
    }
    default: {
      break;
    }
  }
}

// set the context for the editor to show appropriate options based on the element being edited
function setEditorContext(item) {
  if (context.element) {
    context.element.contentEditable = false;
  }
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
  updateInspector();
}

function generateRandomId() {
  return crypto.randomUUID();
}

function highlightElement(element) {
  if (lastHighlight) {
    lastHighlight.classList.remove('hovered');
  }
  lastHighlight = element;
  element.classList.add('hovered');
  showHighlightElement(element);
}

function makeContentEditableRecursive(element) {
  //element.contentEditable = true;
  element.addEventListener('mouseenter', (event) => {
    highlightElement(element);
    event.stopPropagation();
  });
  element.addEventListener('mouseleave', (event) => {
    element.classList.remove('hovered');
    event.stopPropagation();
  });
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
    console.debug(element);
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
  highlight = document.querySelector("#highlight");
  urlInspector = document.querySelector("#url-selector");
  let sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(item => {
    const min = item.min
    const max = item.max
    const val = item.value
    item.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
    item.addEventListener('input', e => {
      let target = e.target
      if (e.target.type !== 'range') {
        target = document.getElementById('range')
      }
      const min = target.min
      const max = target.max
      const val = target.value
      target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
    })
  }
  );
}

window.addEventListener("load", setup);

function colorChanged(color, fg) {
  if (context.element) {
    if (fg)
      //context.element.style.color = color;
      onStyleChangeUpdate(color, 'color', '');
    else
      //context.element.style.backgroundColor = color;
      onStyleChangeUpdate(color, 'backgroundColor', '');
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

function onSelectAlignment(input) {
  if (!context.element) return;
  onStyleChange(input, 'text-align', '');
}

function onStrikethroughCheck(input) {
  if (!context.element) return;
  if (context.element.style.textDecoration == 'line-through') {
    onStyleChangeUpdate('none', 'textDecoration', '');
    input.classList.remove('checked');
  } else {
    onStyleChangeUpdate('line-through', 'textDecoration', '');
    input.classList.add('checked');
    document.querySelector('#underline-checkbox').classList.remove('checked');
  }
}

function onUnderlineCheck(input) {
  if (!context.element) return;
  if (context.element.style.textDecoration == 'underline') {
    onStyleChangeUpdate('none', 'textDecoration', '');
    input.classList.remove('checked');
  } else {
    onStyleChangeUpdate('underline', 'textDecoration', '');
    input.classList.add('checked');
    document.querySelector('#strikethrough-checkbox').classList.remove('checked');
  }
}

function onCapitalizeCheck(input) {
  if (!context.element) return;
  if (context.element.style.textTransform == 'uppercase') {
    onStyleChangeUpdate('none', 'textTransform', '');
    input.classList.remove('checked');
  } else {
    onStyleChangeUpdate('uppercase', 'textTransform', '');
    input.classList.add('checked');
  }
}

function onPaddingChange(element, direction) {
  /*let val = element.value;
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
  }*/
  //let val = element.value;
  if (context.element) {
    switch (direction) {
      case "top":
        //context.element.style.paddingTop = `${val}px`;
        onStyleChange(element, 'paddingTop', 'px');
        break;
      case "right":
        //context.element.style.paddingRight = `${val}px`;
        onStyleChange(element, 'paddingRight', 'px');
        break;
      case "bottom":
        //context.element.style.paddingBottom = `${val}px`;
        onStyleChange(element, 'paddingBottom', 'px');
        break;
      case "left":
        //context.element.style.paddingLeft = `${val}px`;
        onStyleChange(element, 'paddingLeft', 'px');
        break;
    }
  }
}

function onStyleChange(input, attribute, unit) {
  let value = input.value;
  let newValue = value + unit;
  if (context.element) {
    let original = context.element.style[attribute];
    state.change({
      type: "Style",
      element: context.element,
      attribute: attribute,
      from: original,
      to: newValue
    });
    context.element.style[attribute] = newValue;
  }
}

function onStyleChangeUpdate(value, attribute, unit) {
  let newValue = value + unit;
  if (context.element) {
    let original = context.element.style[attribute];
    state.change({
      type: "Style",
      element: context.element,
      attribute: attribute,
      from: original,
      to: newValue
    });
    context.element.style[attribute] = newValue;
  }
}

function onAttributeChange(attributeName, value) {
  if (context.element) {
    let original = context.element.getAttribute(attributeName);
    state.change({
      type: "Attribute",
      element: context.element,
      attributeName: attributeName,
      form: original,
      to: newValue
    });
    context.element.setAttribute(attributeName, value);
  }
}

function onElementAdd(element, adjacent) {
  state.change({
    type: "Add",
    element: element,
    adjacent: adjacent
  });
}

function onElementRemove(element, before) {
  state.change({
    type: "Remove",
    element: element,
    before: before
  });
}

function onElementReorder(element, adjacent, below) {
  state.change({
    type: "Move",
    element: element,
    adjacent: adjacent,
    below: below
  });
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
  //let val = element.value;
  if (context.element) {
    switch (direction) {
      case "top":
        //context.element.style.marginTop = `${val}px`;
        onStyleChange(element, 'marginTop', 'px');
        break;
      case "right":
        //context.element.style.marginRight = `${val}px`;
        onStyleChange(element, 'marginRight', 'px');
        break;
      case "bottom":
        //context.element.style.marginBottom = `${val}px`;
        onStyleChange(element, 'marginBottom', 'px');
        break;
      case "left":
        //context.element.style.marginLeft = `${val}px`;
        onStyleChange(element, 'marginLeft', 'px');
        break;
    }
  }
}

function onUrlChanged(element) {
  let value = element.value;
  if (context.element) {
    if (context.type == "DIV" || context.type == "IMG")
      //context.element.src = value;
      onAttributeChange('src', value);
    else if (context.type == "A")
      //context.element.href = value;
      onAttributeChange('href', value);
  }
}

function showHighlightElement(element) {
  let rect = element.getBoundingClientRect();
  let styles = getComputedStyle(element);
  let left = rect.left - parseInt(styles.marginLeft) - window.pageXOffset;
  let width = rect.width + parseInt(styles.marginLeft) + parseInt(styles.marginRight);
  let height = rect.height + parseInt(styles.marginTop) + parseInt(styles.marginBottom);
  let top = rect.top - window.pageYOffset - parseInt(styles.marginTop);
  highlight.style.left = `${left}px`;
  highlight.style.top = `${top}px`;
  highlight.style.width = `${width}px`;
  highlight.style.height = `${height}px`;
  console.debug(left, width, height, top);
}

function updateThingFromHistory(change, undo) {
  switch (change.type) {
    case "Add": {
      console.log("Thing was added now removing it...");
      break;
    }
    case "Remove": {
      console.log("Thing was removed now adding it back...");
      break;
    }
    case "Style": {
      change.element.style[change.attribute] = undo ? change.from : change.to;
      break;
    }
    case "Attribute": {
      change.element.setAttribute(change.attributeName, undo ? change.from : change.to);
      break;
    }
    default: {
      console.debug(change);
      break;
    }
  }
}

function undoLast() {
  let change = state.undo();
  if (!change) return;
  updateThingFromHistory(change, true);
}

function redoLast() {
  let change = state.redo();
  if (!change) return;
  updateThingFromHistory(change, false);
}
