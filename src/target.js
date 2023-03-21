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
  isHovering(mouse_x, mouse_y) {
    return dist(this.x, this.y, mouse_x, mouse_y) < this.width / 2;
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

  // Draws the target (i.e., a circle)
  // and its label
  draw(mouse_x, mouse_y) {
    // Change the alpha of the target when a mouse is hovering it
    if (this.isHovering(mouse_x, mouse_y)) {
      this.color[3] = 75;
    }
    // Draw a selection if the target was selected
    if (this.was_selected) {
      stroke(color(150, 75));
      strokeWeight(10);
    }

    // Draw target
    fill(color(this.color));
    circle(this.x, this.y, this.width);
    noStroke();

    // Draw label
    textFont('Arial', 12);
    fill(color(255, 255, 255));
    textAlign(CENTER);
    text(this.label, this.x, this.y);
    this.color[3] = 100;
  }
}
