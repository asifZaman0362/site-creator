function recursiveInline(item) {

}

function exportHtml(workspace, urls) {
  const copiedContent = document.createElement('div');
  copiedContent.innerHTML = workspace.outerHTML;
  copiedContent.querySelector('#placeholder').remove();
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
          console.debug(selector, element);
          for (const key of availableStyles) {
            const styleName = rule.style[key];
            //console.debug(styleName);
            let value = rule.style.getPropertyValue(styleName);
            //console.log(styleName, ':', value);
            element.style.setProperty(styleName, value);
          }
          //console.log(`Style used for selector '${selector}': '${rule.style}'`);
        }
      }
    }
  }
  //recursiveInline(copiedContent);
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <link rel="stylesheet" href="style.css">
    </head>
    <body>
      ${copiedContent.innerHTML}
    </body>
    </html>
  `;
  const exportedHtml = html;
  console.log(copiedContent);
  const fileName = 'exported.html';
  downloadHTML(exportedHtml, fileName);
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
