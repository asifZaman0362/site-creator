class VersionHistory {
  changePointer
  constructor() {
    this.changePointer = {
      change: null,
      next: null,
      prev: null
    }
  }
  change(action) {
    if (this.changePointer) {
      this.changePointer.next = {
        change: action,
        next: null,
        prev: this.changePointer
      }
      this.changePointer = this.changePointer.next;
    }
    else {
      this.changePointer = {
        change: action,
        next: null,
        prev: null
      };
    }
  }
  undo() {
    if (this.changePointer == null || this.changePointer.prev == null) {
      return null;
    }
    let change = this.changePointer.change;
    this.changePointer = this.changePointer.prev;
    return change;
  }
  redo() {
    if (this.changePointer == null || this.changePointer.next == null) {
      return null;
    }
    this.changePointer = this.changePointer.next;
    return this.changePointer.change;
  }
}

let his = new VersionHistory();
let thing = document.querySelector("#text");

function undoLast() {
  let change = his.undo();
  if (change)
    thing.innerHTML = change.from;
}

function redoLast() {
  let change = his.redo();
  if (change)
    thing.innerHTML = change.to;
}

function onSetText(text) {
  let change = {
    from: thing.innerHTML,
    to: text
  }
  his.change(change);
  thing.innerHTML = text;
}

document.querySelector("#button").addEventListener('click', (_event) => {
  let input = document.querySelector("#input").value;
  onSetText(input);
});
