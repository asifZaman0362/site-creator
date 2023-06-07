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
let srcInspector = null;
let textInspector = null;
let sizeInspector = null;
let shadowInspector = null;
let bgColorInspector = null;
let fgColorInspector = null;
let borderRadiusInspector = null;
let removeButton = null;
let childrenInspector = null;
let listInspector = null;
let alignInspector = null;
let bgImageInspector = null;
let borderInspector = null;

let urls = [];

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
  srcInspector?.classList.add('hidden');
  alignInspector?.classList.add('hidden');
  bgImageInspector?.classList.add('hidden');
  border?.classList.add('hidden');
  shadowInspector.classList.add('hidden');
  sel('#container-size').classList.add('hidden');
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

function updateAlignInspector() {
  alignInspector?.classList.remove('hidden');
  let align = getComputedStyle(context.element).textAlign;
  let left = sel('#left-align-block');
  let centre = sel('#centre-align-block');
  let right = sel('#right-align-block');
  left.checked = false;
  centre.checked = false;
  right.checked = false;
  switch (align) {
    case 'left':
      left.checked = true;
      break;
    case 'center':
    case 'justify':
      centre.checked = true;
      break;
    case 'right':
      right.checked = true;
      break;
  }
}

function updateBorderRadiusInput() {
  borderRadiusInspector?.classList.remove('hidden');
  sel('#border-radius-input').value = context.element.style.borderRadius.match(/[0-9]+/);
  sel('#top-left-radius').value = getComputedStyle(context.element).borderTopLeftRadius ? parseInt(getComputedStyle(context.element).borderTopLeftRadius) : 0;
  sel('#top-right-radius').value = getComputedStyle(context.element).borderTopRightRadius ? parseInt(getComputedStyle(context.element).borderTopRightRadius) : 0;
  sel('#bottom-right-radius').value = getComputedStyle(context.element).borderBottomRightRadius ? parseInt(getComputedStyle(context.element).borderBottomRightRadius) : 0;
  sel('#bottom-left-radius').value = getComputedStyle(context.element).borderBottomLeftRadius ? parseInt(getComputedStyle(context.element).borderBottomLeftRadius) : 0;
}

function updateBorderInspector() {
  borderInspector.classList.remove('checked');
  sel('#border-checkbox').checked = !context.element.classList.contains('border-off');
  let styles = getComputedStyle(context.element);
  let width = parseInt(styles.borderWidth);
  let style = styles.borderStyle == 'none' ? 'solid' : styles.borderStyle;
  let color = getComputedStyle(context.element).borderColor;
  sel('#border-thickness').value = parseInt(width);
  sel('#border-style').value = style;
  sel('#border-color').value = rgbStringToHex(color);
  sel('#border-color-hex').value = rgbStringToHex(color);
}

function updateBackgroundColorInput() {
  bgColorInspector?.classList.remove('hidden');
  sel('#bg-color').value = rgbStringToHex(getComputedStyle(context.element).backgroundColor);
  sel('#bg-color-hex').value = rgbStringToHex(getComputedStyle(context.element).backgroundColor);
}

function updateColorInput() {
  sel('#fg-color').value = rgbStringToHex(getComputedStyle(context.element).backgroundColor);
  sel('#fg-color-hex').value = rgbStringToHex(getComputedStyle(context.element).backgroundColor);
}

function updateBackgroundImageInput() {
  bgImageInspector.classList.remove('hidden');
  sel('#background-image-checkbox').checked = !context.element.classList.contains('background-image-off');
  let matches = context.element.style.backgroundImage.match(/url\("(.*)"\)/);
  try {
    sel('#background-image-url').value = matches.length == 2 ? matches[1] : '';
  } catch (e) {
    sel('#background-image-url').value = '';
  }
  if (context.element.style.objectFit) {
    sel('#object-fit').value = context.element.style.objectFit;
  } else if (context.element.style.backgroundRepeat == 'repeat') {
    sel('#object-fit').value = 'tile';
  }
  sel('#bg-position').value = context.element.style.backgroundPosition;
}

function updateSizeInspector() {
  sizeInspector?.classList.remove('hidden');
  sel('#width-input').value = context.element.style.width;
  sel('#height-input').value = context.element.style.height;
}

function updateTextInspector() {
  textInspector?.classList.remove('hidden');
  let style = getComputedStyle(context.element);
  let left = sel('#left-align');
  let centre = sel('#centre-align');
  let justify = sel('#justify-text');
  let right = sel('#right-align');
  left.checked = false;
  centre.checked = false;
  justify.checked = false;
  right.checked = false;
  let align = style.textAlign;
  const computedDirection = window.getComputedStyle(context.element.parentElement || document.body).direction;
  if (computedDirection == 'ltr') {
    if (align == 'start') {
      align = 'left';
    } else if (align == 'end') {
      align = 'right';
    }
  } else {
    if (align == 'start') {
      align = 'right';
    } else if (align == 'end') {
      align = 'left';
    }
  }
  switch (align) {
    case 'left':
      left.checked = true;
      break;
    case 'center':
      centre.checked = true;
      break;
    case 'justify':
      justify.checked = true;
      break;
    case 'right':
      right.checked = true;
      break;
  }
  let strike = sel('#strikethrough-checkbox');
  let uline = sel('#underline-checkbox');
  let capitalize = sel('#capitalize-checkbox');
  strike.classList.remove('checked');
  uline.classList.remove('checked');
  capitalize.classList.remove('checked');
  if (style.textDecoration == 'underline') {
    uline.classList.add('checked');
  } else if (style.textDecoration == 'line-through') {
    strike.classList.add('checked');
  }
  if (style.textTransform == 'capitalize') {
    capitalize.classList.add('checked');
  }
  updateFontInspector(style.fontFamily.split(',')[0], style.fontSize, style.fontWeight, style.fontStyle);
  sel('#text-height-input').value = parseInt(style.lineHeight);
  sel('#text-width-input').value = parseInt(style.letterSpacing);
}

function updateSrcInspector() {
  srcInspector.classList.remove('hidden');
  srcInspector.querySelector('input').value = context.element.src;
}

function updateUrlInspector() {
  urlInspector?.classList.remove('hidden');
  if (context.type == 'A') {
    sel('#url-checkbox').checked = url.enabled;
    urlInspector.querySelector('input[type=text]').value = context.element.href;
    return;
  }
  let url = urls.find(u => u.element == context.element);
  if (url) {
    urlInspector.querySelector('input[type=text]').value = url.value;
    sel('#url-checkbox').checked = url.enabled;
  } else {
    urlInspector.querySelector('input[type=text]').value = '';
    sel('#url-checkbox').checked = false;
  }
}

function updateShadowInspector(text) {
  sel('#text-shadow').classList.remove('hidden');
  if (text)
    sel('#shadow-label').innerHTML = 'Text Shadow';
  else
    sel('#shadow-label').innerHTML = 'Box Shadow';
  sel('#shadow-checkbox').checked = !context.element.classList.contains('shadow-off');
  let shadow = text ? getComputedStyle(context.element).textShadow : getComputedStyle(context.element).boxShadow;
  if (shadow.startsWith('#')) {
    try {
      let color = shadow.match(/#[a-zA-Z0-9]+/)[0];
      sel('#shadow-color').value = rgbStringToHex(color);
      sel('#shadow-color-hex').value = rgbStringToHex(color);
    } catch (e) {
      sel('#shadow-color').value = '#00';
      sel('#shadow-color-hex').value = '#000000';
    }
  } else if (shadow.startsWith('rgb')) {
    try {
      let cols = shadow.match(/rgba?\(.+\)/)[0].match(/[0-9\.]+/g);
      let alpha = cols.length == 4 ? cols[3] : 1;
      let color = rgbStringToHex(shadow.match(/rgba?\(.+\)/)[0]);
      sel('#shadow-color-opacity').value = alpha * 100;
      sel('#shadow-color').value = color;
      sel('#shadow-color-hex').value = color;
    } catch (e) {
      sel('#shadow-color-opacity').value = 0;
      sel('#shadow-color').value = '#000000';
      sel('#shadow-color-hex').value = '#000000';
    }
  } else {
    sel('#shadow-color-opacity').value = 0;
    sel('#shadow-color').value = '#000000';
    sel('#shadow-color-hex').value = '#000000';
  }
  try {
    let matches = shadow.match(/\b\d+px\b/g);
    let target = sel('#x-offset');
    target.value = parseInt(matches[0]);
    let min = target.min
    let max = target.max
    let val = target.value
    target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
    sel('#x-offset-value').innerHTML = `${target.value}px`;
    target = sel('#y-offset');
    target.value = parseInt(matches[1]);
    min = target.min
    max = target.max
    val = target.value
    target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
    sel('#y-offset-value').innerHTML = `${target.value}px`;
    target = sel('#blur');
    target.value = parseInt(matches[2]);
    min = target.min
    max = target.max
    val = target.value
    target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
    sel('#blur-value').innerHTML = `${target.value}px`;
  } catch (err) {
    let target = sel('#x-offset');
    target.value = 0;
    let min = target.min
    let max = target.max
    let val = target.value
    target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
    sel('#x-offset-value').innerHTML = `${target.value}px`;
    target = sel('#y-offset');
    target.value = 0;
    min = target.min
    max = target.max
    val = target.value
    target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
    sel('#y-offset-value').innerHTML = `${target.value}px`;
    target = sel('#blur');
    target.value = 0;
    min = target.min
    max = target.max
    val = target.value
    target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
    sel('#blur-value').innerHTML = `${target.value}px`;
  }
}

function updateContainerSizeInspector() {
  sel('#container-size').classList.remove('hidden');
  sel('#container-size-input').value = parseInt(getComputedStyle(projectRoot).width);
}

function updateInspector() {
  hideInspectorFields();
  if (context.type == "CONTAINER") {
    updateContainerSizeInspector();
    updateBackgroundImageInput();
    return;
  }
  if (context.element.classList.contains('module')) {
    updateBorderRadiusInput();
    updateBorderInspector();
    updateBackgroundColorInput();
    updateBackgroundImageInput();
    updateShadowInspector();
    removeButton?.classList.remove('hidden');
    showChildren();
    return;
  }
  switch (context.type) {
    case "DIV":
    case "SECTION":
    case "ARTICLE":
    case "MENU": {
      updateBackgroundImageInput();
      updateBorderRadiusInput();
      updateBorderInspector();
      updateSizeInspector();
      updateShadowInspector();
      updateAlignInspector();
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
      updateAlignInspector();
      updateBackgroundColorInput();
      updateBorderInspector();
      updateBackgroundImageInput();
      updateSizeInspector();
      updateShadowInspector();
      break;
    }
    case "IMG": {
      updateUrlInspector();
      updateSizeInspector();
      updateBorderInspector();
      updateSrcInspector();
      updateShadowInspector();
      updateAlignInspector();
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
      updateBorderInspector();
      updateSizeInspector();
      updateShadowInspector(true);
      updateTextInspector();
      updateUrlInspector();
      if (context.element.children.length == 0) {
        context.element.contentEditable = true;
        context.element.focus();

      } else {
        childrenInspector?.classList.remove('hidden');
        showChildren();
      }
      break;
    }
    case "A": {
      updateBorderInspector();
      updateShadowInspector(true);
      updateTextInspector();
      context.element.contentEditable = true;
      updateUrlInspector();
      break;
    }
    default: {
      updateBorderInspector();
      updateBackgroundColorInput();
      updateBackgroundImageInput();
      updateSizeInspector();
      updateShadowInspector();
      if (context.element.children.length > 0) {
        childrenInspector?.classList.remove('hidden');
        showChildren();
      }
      break;
    }
  }
}

// set the context for the editor to show appropriate options based on the element being edited
function setEditorContext(item, parent) {
  if (context.element) {
    context.element.contentEditable = false;
  }
  context.type = parent ? 'CONTAINER' : item.tagName;
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

function onToggleUrl(input) {
  if (context.type == 'A') {
    input.checked = url.enabled;
    return;
  }
  let url = urls.find(url => url.element == context.element);
  if (url) {
    state.change({
      type: "URL",
      subtype: "toggle",
      element: context.element,
      from: url.enabled,
      to: !url.enabled
    });
    url.enabled = !url.enabled;
  } else {
    url = { enabled: true, url: '', element: context.element };
    context.element.dataset.urlId = generateRandomId();
    urls.push(url);
    state.change({
      type: "URL",
      subtype: "toggle",
      element: context.element,
      from: false,
      to: true
    });
  }
  input.checked = url.enabled;
}

function onUpdateUrl(input) {
  if (context.type == 'A') {
    state.change({
      type: "Attribute",
      element: context.element,
      attribute: "href",
      from: context.element.href,
      to: input.value
    });
    context.element.href = input.value;
    return;
  }
  let url = urls.find(url => url.element == context.element);
  if (url) {
    state.change({
      type: "URL",
      subtype: "updateValue",
      element: context.element,
      from: url.value,
      to: input.value
    });
    url.value = input.value;
  } else {
    url = { enabled: false, url: '', element: context.element };
    context.element.dataset.urlId = generateRandomId();
    urls.push(url);
    state.change({
      type: "URL",
      subtype: "updateValue",
      element: context.element,
      from: '',
      to: input.value
    });
    url.value = input.value;
  }
}

function updateRoot() {
  if (projectRoot.children.length == 0) {
    sel('#placeholder').style.visibility = 'visible';
  } else {
    sel('#placeholder').style.visibility = 'hidden';
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
  updateRoot();
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
  updateRoot();
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
  highlight = document.querySelector("#highlight");
  urlInspector = document.querySelector("#url-inspector");
  srcInspector = document.querySelector("#src-inspector");
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
  alignInspector = document.querySelector('#alignment-inspector');
  bgImageInspector = document.querySelector('#background-image-inspector');
  borderInspector = document.querySelector('#border');
  shadowInspector = document.querySelector('#text-shadow');
  let sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(item => {
    const min = item.min
    const max = item.max
    const val = item.value
    item.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%';
    let valueLabel = sel(`#${item.id}-value`);
    if (valueLabel) {
      valueLabel.innerHTML = val + 'px';
    }
    item.addEventListener('input', e => {
      let target = e.target
      if (e.target.type !== 'range') {
        target = document.getElementById('range')
      }
      const min = target.min
      const max = target.max
      const val = target.value
      target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
      let valueLabel = sel(`#${target.id}-value`);
      if (valueLabel) {
        valueLabel.innerHTML = val + 'px';
      }
    })
  }
  );
  setEditorContext(sel('#playground'), true);
}

window.addEventListener("load", setup);

function onUpdateShadow(color, x, y, blur) {
  if (textInspector.classList.contains('hidden') && context.element) {
    onStyleChangeUpdate(`${color} ${x} ${y} ${blur}`, 'box-shadow', 'px');
  } else if (context.element) {
    onStyleChangeUpdate(`${color} ${x} ${y} ${blur}`, 'text-shadow', 'px');
  }
}

function sel(query) {
  return document.querySelector(query);
}

function onShadowUpdate() {
  let color = hexToRgb(sel('#shadow-color-hex').value, sel('#shadow-color-opacity').value);
  let x = sel('#x-offset').value;
  sel('#x-offset-value').innerHTML = `${x}px`;
  let y = sel('#y-offset').value;
  sel('#y-offset-value').innerHTML = `${y}px`;
  let blur = sel('#blur').value;
  sel('#blur-value').innerHTML = `${y}px`;
  if (textInspector.classList.contains('hidden') && context.element) {
    onStyleChangeUpdate(`${color} ${x}px ${y}px ${blur}px`, 'boxShadow', '');
  } else if (context.element) {
    onStyleChangeUpdate(`${color} ${x}px ${y}px ${blur}px`, 'textShadow', '');
  }
}

function colorChanged(color, forWhat) {
  if (context.element) {
    switch (forWhat) {
      case 'fg':
        //context.element.style.color = color;
        onStyleChangeUpdate(color, 'color', '');
        break;
      case 'bg':
        //context.element.style.backgroundColor = color;
        onStyleChangeUpdate(color, 'backgroundColor', '');
        break;
      case 'border':
        onStyleChangeUpdate(color, 'borderColor', '');
        break;
      case 'shadowColor':
        onShadowUpdate();
        break;
    }
  }
}

function colorHexUpdate(element) {
  let colorInput = element.previousElementSibling;
  colorInput.value = element.value;
  let forWhat = element.attributes["colorfor"].value;
  colorChanged(colorInput.value, forWhat);
}

function colorUpdate(element) {
  let colorHexInput = element.nextElementSibling;
  colorHexInput.value = element.value;
  let forWhat = element.attributes["colorfor"].value;
  colorChanged(colorHexInput.value, forWhat);
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
    updateInspector();
  } else {
    projectRoot.classList.replace('desktop', 'mobile');
    updateInspector();
  }
}

function onContainerSizeUpdate(input) {
  let size = input.value;
  projectRoot.style.width = size + "px";
  updateInspector();
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

function onStyleToggled(propName) {
  if (context.element) {
    if (context.element.classList.contains(`${propName}-off`)) {
      onStyleEnabled(propName);
    } else {
      onStyleDisabled(propName);
    }
  }
}

function onStyleEnabled(property) {
  if (context.element) {
    let className = `${property}-off`;
    state.change({
      type: "RemoveClass",
      element: context.element,
      className: className
    });
    context.element.classList.remove(className);
  }
}

function onStyleDisabled(property) {
  if (context.element) {
    let className = `${property}-off`;
    state.change({
      type: "AddClass",
      element: context.element,
      className: className
    });
    context.element.classList.add(className);
  }
}

function onBackgroundImageSrcChanged(input) {
  let url = `url('${input.value}')`;
  if (context.element) {
    state.change({
      type: "Style",
      element: context.element,
      attribute: "backgroundImage",
      from: getComputedStyle(context.element).backgroundImage,
      to: url
    });
    context.element.style.backgroundImage = url;
  }
}

function onBackgroundSizeChanged(input) {
  let value = input.value;
  if (context.element == null) return;
  if (value == 'tile') {
    state.change({
      type: 'Style',
      element: context.element,
      attribute: 'backgroundRepeat',
      from: context.element.style.backgroundRepeat,
      to: 'repeat'
    });
    context.element.style.backgroundRepeat = 'repeat';
    context.element.style.backgroundSize = 'auto';
  } else {
    state.change({
      type: 'Style',
      element: context.element,
      attribute: 'backgroundSize',
      from: context.element.style.backgroundSize,
      to: value
    });
    context.element.style.backgroundSize = value;
    context.element.style.backgroundRepeat = 'no-repeat';
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
  if (rgb.startsWith('#')) return rgb;
  const matches = rgb.match(/(\d+)/g);
  const hex = rgbToHex(matches[0], matches[1], matches[2]);
  return hex;
}

function hexToRgb(hex, a) {
  if (hex.startsWith('rgb')) return hex;
  let pattern = /[a-zA-Z0-9][a-zA-Z0-9]/g;
  let match = hex.matchAll(pattern);
  let r = parseInt(match.next().value, 16);
  let g = parseInt(match.next().value, 16);
  let b = parseInt(match.next().value, 16);
  a = a / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;

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
      updateRoot();
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
      updateRoot();
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
    case "RemoveClass": {
      if (undo) {
        change.element.classList.add(change.className);
      } else {
        change.element.classList.remove(change.className);
      }
      break;
    }
    case "AddClass": {
      if (!undo) {
        change.element.classList.add(change.className);
      } else {
        change.element.classList.remove(change.className);
      }
      break;
    }
    case "URL": {
      let url = urls.find(url => url.element == change.element);
      if (change.subtype == "toggle") {
        url.enabled = undo ? change.from : change.to;
      } else {
        url.value = undo ? change.from : change.to;
      }
      break;
    }
    default: {
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
