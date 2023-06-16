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
