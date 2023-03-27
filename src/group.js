// Group class: represents a group of targets and how they are placed on the canvas
class Group {
  constructor(c) {
    this.targets = [];
    this.color = c;
  }

  // Adds a new target to the group
  addTarget(new_target) {
    this.targets.push(new_target);
  }

  // Sorts all the targets in the group by alphabetical order
  sortTargets() {
    this.targets.sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  // Calculates the width and height of the group dynamically
  // according to the amount of targets
  calculateSize() {
    this.n_width = ceil(this.targets.length / 3);
    this.width = this.n_width * target_size + (this.n_width + 1) / separator_size;

    if (this.targets.length >= 3) {
      this.n_height = 3;
    } else {
      this.n_height = this.targets.length;
    }
    this.height = 3 * target_size + 4 / separator_size;
  }

  // Sets the position of the group and all of its targets on the canvas
  setPosition(group_x, group_y) {
    this.x = group_x;
    this.y = group_y;
    let group_separator = PPCM / separator_size;
    let t_size = target_size * PPCM;

    for (let r = 0; r < this.n_height; r++) {
      for (let c = 0; c < this.n_width; c++) {
        if (c + this.n_width * r >= this.targets.length) {
          break;
        }

        let target_x = this.x + group_separator + (group_separator + t_size) * c + t_size / 2;
        let target_y = this.y + group_separator + (group_separator + t_size) * r + t_size / 2;

        this.targets[c + this.n_width * r].setPosition(target_x, target_y);
      }
    }
  }

  // Draws the group of targets
  draw() {
    for (let i = 0; i < this.targets.length; i++) {
      this.targets[i].draw();
    }
  }
}
