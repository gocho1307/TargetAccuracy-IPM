// Support variables & functions (DO NOT CHANGE!)

let student_ID_form, display_size_form, start_button; // Initial input variables
let student_ID, display_size; // User input parameters

// Prints the PRO TIP section at the top of the screen
function drawProTip() {
  background(color(0)); // sets the background to black

  // 1. Places pro tip to memorize the positions and look around
  fill(color(255));
  textSize(17);
  circle(15, 24, 10);
  textStyle(BOLD);
  text('PRO TIP', 25, 30);
  textStyle(NORMAL);
  text('You can look around freely before clicking anything.', 10, 65);
  text('Here are the colors chosen for each group exactly as they appear on the screen:', 10, 89);

  // 2. Places indicators of the colors for each letter
  textAlign(CENTER);
  textSize(20);
  textStyle(BOLD);
  let x = 150;
  let y = 139;
  for (let k in groups) {
    if (k == 'K' || k == 'R') {
      x = 150;
      y += 40;
    }

    // Simulates the target
    fill(color(groups[k].color));
    rectMode(CENTER);
    rect(x, y, 34, 34);
    rectMode(CORNER);

    // Draws the letter
    fill(color(255));
    text(k, x, y + 7);

    x += 40;
  }

  // 3. Explains the alphabetical order
  fill(color(255));
  textAlign(LEFT);
  textSize(17);
  textStyle(NORMAL);
  text('Please note that the targets are sorted by alphabetical order.', 10, 290);
  text('Each group only has labels that start with the same letter.', 10, 314);

  // 4. Separates the PRO TIP section from the forms
  stroke(color(255));
  strokeWeight(1);
  line(10, 339, 690, 340);
}

// Prints the initial UI that prompts that ask for student ID and screen size
function drawUserIDScreen() {
  // Text prompt
  main_text = createDiv('Insert your student number and display size');
  main_text.id('main_text');
  main_text.position(10, 365);

  // Input forms:
  // 1. Student ID
  let student_ID_pos_y_offset = main_text.size().height + 400; // y offset from previous item

  student_ID_form = createInput('103124'); // create input field
  student_ID_form.position(200, student_ID_pos_y_offset);

  student_ID_label = createDiv('Student number (int)'); // create label
  student_ID_label.id('input');
  student_ID_label.position(10, student_ID_pos_y_offset);

  // 2. Display size
  let display_size_pos_y_offset = student_ID_pos_y_offset + student_ID_form.size().height + 20;

  display_size_form = createInput('15'); // create input field
  display_size_form.position(200, display_size_pos_y_offset);

  display_size_label = createDiv('Display size in inches'); // create label
  display_size_label.id('input');
  display_size_label.position(10, display_size_pos_y_offset);

  // 3. Start button
  start_button = createButton('START');
  start_button.mouseReleased(startTest);
  start_button.position(
    width / 2 - start_button.size().width / 2,
    height / 2 - start_button.size().height / 2 + 230
  );
}

// Verifies if the student ID is a number, and within an acceptable range
function validID() {
  if (parseInt(student_ID_form.value()) < 200000 && parseInt(student_ID_form.value()) > 1000)
    return true;
  else {
    alert('Please insert a valid student number (integer between 1000 and 200000)');
    return false;
  }
}

// Verifies if the display size is a number, and within an acceptable range (>13")
function validSize() {
  if (parseInt(display_size_form.value()) <= 50 && parseInt(display_size_form.value()) > 12)
    return true;
  else {
    alert('Please insert a valid display size (between 13 and 50)');
    return false;
  }
}

// Starts the test (i.e., target selection task)
function startTest() {
  if (validID() && validSize()) {
    // Saves student and display information
    student_ID = parseInt(student_ID_form.value());
    display_size = parseInt(display_size_form.value());

    // Deletes UI elements
    main_text.remove();
    student_ID_form.remove();
    student_ID_label.remove();
    display_size_form.remove();
    display_size_label.remove();
    start_button.remove();

    // Goes fullscreen and starts test
    fullscreen(!fullscreen());
  }
}

// Randomize the order in the targets to be selected
function randomizeTrials() {
  trials = []; // Empties the array

  // Creates an array with random items from the "legendas" CSV
  for (var i = 0; i < NUM_OF_TRIALS; i++) trials.push(floor(random(legendas.getRowCount())));

  // print("trial order: " + trials);   // prints trial order - for debug purposes
}
