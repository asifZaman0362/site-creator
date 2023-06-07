const API_KEY = "AIzaSyD2PrUXPIDSGHmtpTe1cB8UwKUwXMcISAQ"
const GFONTS_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`

const loadedFonts = [];
let allFonts = [];

let list = null;
let weightList = null;
let italicButton = null;

function lsFonts(cb) {
  fetch(GFONTS_URL)
    .then(res => res.json())
    .then(res => {
      let fonts = [];
      res
        .items
        .map(
          item => {
            fonts.push({
              family: item.family,
              variants: item.variants
            });
          }
        );
      cb(fonts);
    })
    .catch(err => console.error(err));
}

function addFont(font) {
  if (loadedFonts.find(item => item == font)) return;
  loadedFonts.push(font);
  let styles = getVariantInfo(font);
  let italic = styles.italic ? 'i,' : '';
  let weights = "";
  styles.weights.forEach(
    item => weights += item + ","
  );
  let qualifiedFontName = `${font}:${italic}${weights}`;
  WebFont.load({
    google: {
      families: [qualifiedFontName]
    }
  });
}

function setup() {
  list = document.querySelector("#font-selector");
  weightList = document.querySelector("#weight-selector");
  italicButton = document.querySelector("#italic-button");
  lsFonts((fonts) =>
    fonts.forEach(font => {
      allFonts.push(font);
      let option = document.createElement('option');
      option.value = font.family;
      option.innerHTML = font.family;
      list.add(option, null);
    })
  );
}

function updateFontInspector(family, size, weight, style) {
  family = family.match(/[a-zA-Z0-9 ]+/)[0];
  let pos = allFonts.findIndex(f => f.family == family);
  if (pos >= 0) {
    list.selectedIndex = pos + 1;
    let x = 0, index = 0;
    while (weightList.options.length > 0)
      weightList.options.remove(0);
    getVariantInfo(family).weights.forEach(item => {
      if (item == weight) index = x;
      let weightOption = document.createElement('option');
      weightOption.value = item;
      weightOption.innerHTML = item;
      weightList.add(weightOption);
      x++;
    });
    weightList.selectedIndex = index;
  } else {
    list.selectedIndex = 0;
  }
  if (style == 'italic')
    italicButton.classList.add('checked');
  else
    italicButton.classList.remove('checked');
  sel('#font-size').value = parseInt(size);
}

function getVariantInfo(fontFamily) {
  let font = allFonts.find(font => font.family == fontFamily);
  if (!font) return null;
  let italic = false;
  let weights = [];
  font.variants.forEach(variant => {
    let weight = parseInt(variant);
    if (weight.toString() != "NaN") {
      weights.push(weight.toString());
    }
    let variantStr = variant.match(/[a-zA-Z]+/);
    if (variantStr) {
      switch (variantStr[0].toLowerCase()) {
        case "regular":
          weights.push("400");
          break;
        case "italic":
          italic = true;
        default:
          break;
      }
    }
  });
  return {
    weights: new Set(weights),
    italic: italic
  };
}

function onSelectFont(_event) {
  if (list && context.element) {
    let picked = list.options[list.selectedIndex].value;
    addFont(picked);
    //context.element.style.fontFamily = picked;
    onStyleChangeUpdate(picked, 'fontFamily', '');
    while (weightList.options.length > 0)
      weightList.options.remove(0);
    getVariantInfo(picked).weights.forEach(item => {
      let weightOption = document.createElement('option');
      weightOption.value = item;
      weightOption.innerHTML = item;
      weightList.add(weightOption);
    });
  }
}

function onSelectWeight(_event) {
  if (weightList && context.element) {
    let picked = weightList.options[weightList.selectedIndex].value;
    //context.element.style.fontWeight = picked;
    onStyleChangeUpdate(picked, 'fontWeight', '');
  }
}

function updateItalicButtonState(value) {
  if (value)
    italicButton.classList.add('checked');
  else
    italicButton.classList.remove('checked');
}

function toggleItalic() {
  if (!context.element) return;
  if (context.element.style.fontStyle == "italic") {
    //context.element.style.fontStyle = "normal";
    onStyleChangeUpdate('normal', 'fontStyle', '');
    updateItalicButtonState(false);
  } else {
    //context.element.style.fontStyle = "italic";
    onStyleChangeUpdate('italic', 'fontStyle', '');
    updateItalicButtonState(true);
  }
}

function setFontSize(input) {
  if (context.element) {
    context.element.style.fontSize = `${input.value}px`;
    onStyleChange(input, 'fontStyle', 'px');
  }
}

window.addEventListener('load', setup);
