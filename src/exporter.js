function exportHtml(workspace, urls) {
  const copiedContent = document.createElement('div');
  copiedContent.innerHTML = workspace.innerHTML;
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
