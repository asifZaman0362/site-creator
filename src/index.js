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

let siblingPrevious = null;
let previousBefore = null;


let fgColorInput = null;
let bgColorInput = null;
let [paddingLeftInput, paddingRightInput, paddingTopInput, paddingBottomInput] = [null, null, null, null];
let [marginLeftInput, marginRightInput, marginTopInput, marginBottomInput] = [null, null, null, null];
let contextHint = null;

let fontInspector = null;
let imageInspector = null;
let urlInspector = null;
let textInspector = null;
let sizeInspector = null;
let shadowInspector = null;
let bgColorInspector = null;
let fgColorInspector = null;
let borderRadiusInspector = null;
let removeButton = null;
let childrenInspector = null;
let listInspector = null;

let [desktopButton, mobileButton] = [null, null];

let state = new VersionHistory();
let timeout = null;

function removeListItem(item, sibling, before, parentNode) {
  state.change({
    type: "Remove",
    element: item,
    sibling: sibling,
    before: before,
    parentNode: parentNode
  });
  item.remove();
}

function hoverItem(item) {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => hovered(item), 250);
}

// function called when a category is hovered
function hovered(item) {
  if (templateList) {
    templateList.classList.add("shown");
    if (selectedCategory) selectedCategory.classList.remove("active");
    selectedCategory = document.querySelector(`#${item}`);
    if (selectedCategory) selectedCategory.classList.add("active");
  }
}

function stopHover() {
  clearTimeout(timeout);
  timeout = setTimeout(hoverStopped, 500);
}

// function called when menu is no longer hovered on
function hoverStopped() {
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

function hideInspectorFields() {
  fontInspector?.classList.add('hidden');
  imageInspector?.classList.add('hidden');
  urlInspector?.classList.add('hidden');
  textInspector?.classList.add('hidden');
  sizeInspector?.classList.add('hidden');
  shadowInspector?.classList.add('hidden');
  bgColorInspector?.classList.add('hidden');
  fgColorInspector?.classList.add('hidden');
  borderRadiusInspector?.classList.add('hidden');
  removeButton?.classList.add('hidden');
  childrenInspector?.classList.add('hidden');
  listInspector?.classList.add('hidden');
}

function getChildrenNodesRecursive(element) {
  let item = document.createElement('li');
  item.classList.add('list-item');
  let icon = document.createElement('i');
  let label = document.createElement('span');
  icon.classList.add('fa-solid');
  switch (element.tagName) {
    case "A":
      icon.classList.add('fa-link');
      label.innerHTML = "Link";
      break;
    case "UL":
    case "OL":
      icon.classList.add('fa-list');
      label.innerHTML = "List";
      break;
    case "IMG":
      icon.classList.add('fa-image');
      label.innerHTML = "Image";
      break;
    case "P":
    case "SPAN":
    case "H1":
    case "H2":
    case "H3":
    case "H4":
    case "H5":
    case "H6":
    case "PRE":
      icon.classList.add('fa-font');
      label.innerHTML = "Text";
      break;
    default:
      icon.classList.add('fa-square');
      label.innerHTML = "Div";
      break;
  }
  let button = document.createElement('i');
  button.classList.add('toggle', 'fa-solid');
  console.debug(element);
  if (element.style.display == 'none') {
    button.classList.remove('fa-eye');
    button.classList.add('fa-eye-slash');
  } else {
    button.classList.remove('fa-eye-slash');
    button.classList.add('fa-eye');
  }
  button.addEventListener('click', _ev => {
    if (element.style.display == 'none') {
      onStyleChangeUpdate('', 'display', '', element);
      button.classList.replace('fa-eye-slash', 'fa-eye');
    } else {
      onStyleChangeUpdate('none', 'display', '', element);
      button.classList.replace('fa-eye', 'fa-eye-slash');
    }
  });
  item.appendChild(icon);
  item.appendChild(label);
  item.appendChild(button);
  if (element.children.length == 0) return item;
  else {
    let itemWrapper = document.createElement('li');
    itemWrapper.classList.add('list-item-wrapper');
    itemWrapper.appendChild(item);
    let list = document.createElement('ul');
    list.classList.add('children-list');
    for (let i = 0; i < element.children.length; i++) {
      list.appendChild(getChildrenNodesRecursive(element.children[i]));
    }
    itemWrapper.appendChild(list);
    return itemWrapper;
  }
}

function showChildren() {
  if (context.element) {
    childrenInspector.classList.remove('hidden');
    let list = childrenInspector.querySelector('ul');
    list.innerHTML = '';
    for (let i = 0; i < context.element.children.length; i++) {
      list.appendChild(getChildrenNodesRecursive(context.element.children[i]));
    }
  }
}

function showListItems() {
  if (context.element) {
    listInspector.querySelector('ul').innerHTML = '';
    for (let i = 0; i < context.element.children.length; i++) {
      let item = document.createElement('li');
      let span = document.createElement('span');
      span.innerHTML = context.element.children[i].innerHTML;
      item.appendChild(span);
      let icon = document.createElement('i');
      icon.addEventListener('click', (_event) => {
        removeItem(context.element.children[i]);
        showListItems();
      });
      icon.classList.add('fa-solid', 'fa-minus');
      item.appendChild(icon);
      listInspector.querySelector('ul').appendChild(item);
    }
  }
}

function updateInspector() {
  console.debug('update ', context);
  hideInspectorFields();
  if (context.element.classList.contains('module')) {
    borderRadiusInspector?.classList.remove('hidden');
    bgColorInspector?.classList.remove('hidden');
    removeButton?.classList.remove('hidden');
    showChildren();
    return;
  }
  switch (context.type) {
    case "DIV":
    case "SECTION":
    case "ARTICLE":
    case "MENU": {
      borderRadiusInspector?.classList.remove('hidden');
      bgColorInspector?.classList.remove('hidden');
      sizeInspector?.classList.remove('hidden');
      if (context.element.children.length > 0)
        showChildren();
      break;
    }
    case "UL":
    case "OL": {
      if (context.element.classList.contains('text-list')) {
        listInspector?.classList.remove('hidden');
        showListItems();
      }
      bgColorInspector?.classList.remove('hidden');
      sizeInspector?.classList.remove('hidden');
      break;
    }
    case "IMG": {
      sizeInspector?.classList.remove('hidden');
      urlInspector?.classList.remove('hidden');
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
      sizeInspector?.classList.remove('hidden');
      textInspector?.classList.remove('hidden');
      if (context.element.children.length == 0) {
        context.element.contentEditable = true;
        context.element.focus();
      } else {
        childrenInspector?.classList.remove('hidden');
      }
      break;
    }
    case "A": {
      textInspector?.classList.remove('hidden');
      context.element.contentEditable = true;
      urlInspector?.classList.remove('hidden');
      urlInspector.querySelector('input').value = context.element.src;
      break;
    }
    default: {
      bgColorInspector?.classList.remove('hidden');
      sizeInspector?.classList.remove('hidden');
      if (context.element.children.length > 0)
        showChildren();
      break;
    }
  }
}

// set the context for the editor to show appropriate options based on the element being edited
function setEditorContext(item) {
  console.debug('context', item);
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
  if (lastHighlight == element) return;
  lastHighlight = element;
  element.classList.add('hovered');
  showHighlightElement(element);
}

function makeContentEditableRecursive(element) {
  //element.contentEditable = true;
  element.addEventListener('mousemove', (event) => {
    console.log('moved');
    highlightElement(element);
    event.stopPropagation();
  });
  element.addEventListener('mouseleave', (event) => {
    removeHighlight();
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
      state.change({
        type: "Add",
        element: createdElement,
        sibling: relativeTarget,
        before: dropAboveTarget,
        parentElement: projectRoot
      });
    } else {
      projectRoot.appendChild(createdElement);
      state.change({
        type: "Add",
        element: createdElement,
        sibling: null,
        before: false,
        parentElement: projectRoot
      });
    }
  } else if (ev.dataTransfer.dropEffect == "move") {
    const id = ev.dataTransfer.getData("text");
    if (!id) return;
    const element = document.getElementById(id);
    if (relativeTarget) {
      if (dropAboveTarget) {
        relativeTarget.insertAdjacentElement("beforebegin", element);
      } else relativeTarget.insertAdjacentElement("afterend", element);
      state.change({
        type: "Move",
        element: element,
        sibling: relativeTarget,
        before: dropAboveTarget,
        previous: siblingPrevious,
        previousBefore: previousBefore
      });
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
  if (ev.target.nextSibling) {
    siblingPrevious = ev.target.nextSibling;
    previousBefore = true;
  } if (ev.target.previousSibling) {
    siblingPrevious = ev.target.previousSibling;
    previousBefore = false;
  }
  ev.dataTransfer.effectAllowed = "move";
  ev.dataTransfer.setData("text", ev.target.id);
}

function removeItem(item) {
  if (!item) {
    item = context.element;
  }
  if (item) {
    let sibling = null;
    let before = false;
    let parentNode = item.parentNode;
    if (item.nextElementSibling) {
      sibling = item.nextElementSibling;
      before = true;
    } else if (item.previousElementSibling) {
      sibling = item.previousElementSibling;
    }
    state.change({
      type: "Remove",
      element: item,
      sibling: sibling,
      before: before,
      parentNode: parentNode
    });
    item.remove();
    item = null;
  }
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
  textInspector = document.querySelector("#text-inspector");
  sizeInspector = document.querySelector("#size-inspector");
  shadowInspector = document.querySelector("#shadow-inspector");
  bgColorInspector = document.querySelector("#background-color-inspector");
  fgColorInspector = document.querySelector("#foreground-color-inspector");
  borderRadiusInspector = document.querySelector("#border-radius-slider");
  removeButton = document.querySelector("#remove-button");
  childrenInspector = document.querySelector('#children-inspector');
  desktopButton = document.querySelector('#desktop');
  mobileButton = document.querySelector('#mobile');
  listInspector = document.querySelector('#list-inspector');
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

function onSelectScreenSize(size) {
  if (size == 'desktop') {
    projectRoot.classList.replace('mobile', 'desktop');
  } else {
    projectRoot.classList.replace('desktop', 'mobile');
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

function onItalicChanged(button) {
  if (context.element) {
    if (context.element.style.fontStyle == 'italic') {
      onStyleChangeUpdate('normal', 'fontStyle', '');
      button.classList.remove('checked');
    } else {
      onStyleChangeUpdate('italic', 'fontStyle', '');
      button.classList.add('checked');
    }
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

function onStyleChangeUpdate(value, attribute, unit, element) {
  let newValue = value + unit;
  if (context.element) {
    let original = context.element.style[attribute];
    state.change({
      type: "Style",
      element: element ? element : context.element,
      attribute: attribute,
      from: original,
      to: newValue
    });
    if (element) {
      element.style[attribute] = newValue;
    } else
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

function removeHighlight() {
  //highlight.style.left = "-100px";
  lastHighlight = null;
  highlight.style.width = "0";
  highlight.style.height = "0";
}

function updateThingFromHistory(change, undo) {
  switch (change.type) {
    case "Add": {
      let element = change.element;
      let sibling = change.sibling;
      let parentElement = change.parentElement;
      let before = change.before;
      if (undo) {
        element.remove();
      } else {
        if (sibling) {
          if (before) {
            sibling.insertAdjacentElement('beforebegin', element);
          } else sibling.insertAdjacentElement('afterend', element);
        } else {
          parentElement.appendChild(element);
        }
      }
      break;
    }
    case "Remove": {
      let element = change.element;
      let sibling = change.sibling;
      let before = change.before;
      let parentNode = change.parentNode;
      if (undo) {
        if (sibling) {
          if (before) {
            sibling.insertAdjacentElement('beforebegin', element);
          } else sibling.insertAdjacentElement('afterend', element);
        } else {
          parentNode.appendChild(element);
        }
      } else {
        element.remove();
      }
      break;
    }
    case "Move": {
      let element = change.element;
      let sibling = change.sibling;
      let before = change.before;
      let previous = change.previous;
      let previousBefore = change.previousBefore;
      if (undo) {
        element.remove();
        if (previousBefore) {
          previous.insertAdjacentElement('beforebegin', element);
        } else {
          previous.insertAdjacentElement('afterend', element);
        }
      } else {
        element.remove();
        if (before) {
          sibling.insertAdjacentElement('beforebegin', element);
        } else {
          sibling.insertAdjacentElement('afterend', element);
        }
      }
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
  if (context.element) {
    updateInspector();
  }
}

function redoLast() {
  let change = state.redo();
  if (!change) return;
  updateThingFromHistory(change, false);
  if (context.element) {
    updateInspector();
  }
}
