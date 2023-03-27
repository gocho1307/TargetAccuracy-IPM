// Target class: represents a target with label, position, dimensions, etc.
class Target {
  constructor(w, l, id, c) {
    this.width = w;
    this.label = l;
    this.id = id;
    this.color = c;
    this.was_selected = false;
  }

  // Checks if a mouse is hovering over the target
  isHovering() {
    let distance_x = abs(this.x - mouseX);
    let distance_y = abs(this.y - mouseY);
    return distance_x <= this.width / 2 && distance_y <= this.width / 2;
  }

  // Marks the target as selected by the user
  select() {
    this.was_selected = true;
  }

  // Resets the target information exclusive to the first attempt
  reset() {
    this.was_selected = false;
  }

  // Sets the position of the target
  setPosition(target_x, target_y) {
    this.x = target_x;
    this.y = target_y;
  }

  // Draws the target (i.e., a circle) and all of its information
  draw() {
    // Changes the alpha of the target when a mouse is hovering it
    if (this.isHovering()) {
      this.color[3] = 75;
    }
    // Draws a selection if the target was selected
    if (this.was_selected) {
      stroke(color(150, 75));
      strokeWeight(7);
    }

    // Draws the target
    fill(color(this.color));
    rectMode(CENTER);
    rect(this.x, this.y, this.width, this.width);
    rectMode(CORNER);
    noStroke();

    // Draws the top letter and the label
    fill(color(255, 255, 255));
    textAlign(CENTER);
    textFont('Arial', 20);
    text(this.label[0], this.x, this.y - 20);
    textFont('Arial', 14);
    text(this.label, this.x, this.y);
    this.color[3] = 100;
  }
}
