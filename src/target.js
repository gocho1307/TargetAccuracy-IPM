// Target class: represents a target with label, position, dimensions, etc
class Target {
  constructor(x, y, w, l, id, c) {
    this.x = x;
    this.y = y;
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

  // Resets the target selection between attempts
  reset() {
    this.was_selected = false;
  }

  // Draws the target (i.e., a circle)
  // and its label
  draw(mouse_x, mouse_y) {
    // Draw a selection on selection or if the mouse is hovering the target
    if (this.isHovering(mouse_x, mouse_y)) {
      stroke(color(255, 255, 255));
      strokeWeight(4);
    } else if (this.was_selected) {
      stroke(color(17, 170, 170));
      strokeWeight(4);
    }

    // Draw target
    fill(color(155, 155, 155));
    circle(this.x, this.y, this.width);
    noStroke();

    // Draw label
    textFont('Arial', 12);
    fill(color(255, 255, 255));
    textAlign(CENTER);
    text(this.label, this.x, this.y);
  }
}
