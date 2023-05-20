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
  console.log(qualifiedFontName);
  WebFont.load({
    google: {
      families: [qualifiedFontName]
    }
  });
}

function setup() {
  list = document.querySelector("#font-selector");
  weightList = document.querySelector("#weight-selector");
  italicButton = document.querySelector("#italic");
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
  console.log("yo!");
  if (list && context.element) {
    let picked = list.options[list.selectedIndex].value;
    addFont(picked);
    console.log("selecting ", picked);
    context.element.style.fontFamily = picked;
    while (weightList.options.length > 0)
      weightList.options.remove(0);
    getVariantInfo(picked).weights.forEach(item => {
      let weightOption = document.createElement('option');
      weightOption.value = item;
      weightOption.innerHTML = item;
      weightList.add(weightOption);
    });
    console.debug(getVariantInfo(picked));
  }
}

function onSelectWeight(_event) {
  if (weightList && context.element) {
    let picked = weightList.options[weightList.selectedIndex].value;
    context.element.style.fontWeight = picked;
  }
}

function updateItalicButtonState(value) {
  if (value)
    italicButton.classList.replace('unchecked', 'checked');
  else
    italicButton.classList.replace('checked', 'unchecked');
}

function toggleItalic() {
  if (!context.element) return;
  if (context.element.style.fontStyle == "italic") {
    context.element.style.fontStyle = "normal";
    updateItalicButtonState(false);
  } else {
    context.element.style.fontStyle = "italic";
    updateItalicButtonState(true);
  }
}

function setFontSize(input) {
  if (context.element) {
    context.element.style.fontSize = `${input.value}px`;
  }
}

window.addEventListener('load', setup);
