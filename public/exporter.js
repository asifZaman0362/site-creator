function addFonts() {
  let links = [];
  for (const styleSheet of document.styleSheets) {
    if (styleSheet.href != null && !styleSheet.href.match('style.css')) {
      let link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = styleSheet.href;
      links.push(link.outerHTML);
    }
  }
  if (links.length == 0) return '';
  let linkText = '';
  for (const link of links) {
    linkText += '\n' + link;
  }
  return linkText;
}

function removeEditableRecursive(element) {
  element.contentEditable = false;
  element.draggable = false;
  for (let i = 0; i < element.children.length; i++) {
    let child = element.children[i];
    removeEditableRecursive(child);
  }
}

function getStylesRecursive(element, styles) {
  let rules = [];
  let keys = Object.keys(element.style);
  let n = keys.findIndex(key => isNaN(parseInt(key)));
  let availableStyles = keys.slice(0, n);
  for (const style in availableStyles) {
    const styleName = element.style[style];
    let value = element.style.getPropertyValue(styleName);
    rules.push({ name: styleName, value: value });
  }
  styles.set(element, rules);
  for (let i = 0; i < element.children.length; i++) {
    getStylesRecursive(element.children[i], styles);
  }
}

function exportHtml(workspace, urls) {
  const copiedContent = document.createElement('div');
  copiedContent.innerHTML = workspace.outerHTML;
  copiedContent.querySelector('#placeholder').remove();
  removeEditableRecursive(copiedContent);
  let modifiedStyles = new Map();
  getStylesRecursive(workspace, modifiedStyles);
  urls.forEach(url => {
    if (url.enabled && url.value) {
      let element = copiedContent.querySelector(`[data-url-id="${url.element.dataset.urlId}"`);
      let before = false;
      let sibling = null;
      let parentElement = element.parentElement;
      if (element.nextElementSibling) {
        sibling = element.nextElementSibling;
        before = true;
      } else if (element.previousElementSibling) {
        sibling = element.previousElementSibling;
      }
      element.remove();
      let link = document.createElement('a');
      link.href = url.value;
      link.appendChild(element);
      if (sibling) {
        sibling.insertAdjacentElement(before ? 'beforebegin' : 'afterend', link);
      } else {
        parentElement.appendChild(link);
      }
    }
  });
  const styles = document.styleSheets;
  for (const css of styles) {
    try {
      const rules = css.cssRules || StyleSheet.rules;
      for (const rule of rules) {
        if (!rule.selectorText) continue;
        let keys = Object.keys(rule.style);
        let n = keys.findIndex(key => isNaN(parseInt(key)));
        let availableStyles = keys.slice(0, n);
        const selectors = rule.selectorText.split(',');
        for (const selector of selectors) {
          const elements = copiedContent.querySelectorAll(selector);
          for (const element of elements) {
            for (const key of availableStyles) {
              const styleName = rule.style[key];
              let value = rule.style.getPropertyValue(styleName);
              //element.style.setProperty(styleName, value);
            }
          }
        }
      }
    } catch (_err) {
      continue;
    }
  }
  modifiedStyles.forEach((rules, element) => {
    rules.forEach(rule => {
      element.style.setProperty(rule.name, rule.value);
    });
  });
  //recursiveInline(copiedContent);
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      ${addFonts()}
    </head>
    <body>
      ${copiedContent.innerHTML}
    </body>
    </html>
  `;
  const exportedHtml = html;
  console.log(exportedHtml);
  const fileName = 'exported.html';
  //downloadHTML(exportedHtml, fileName);
}

function downloadHTML(htmlContent, fileName) {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
