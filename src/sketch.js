// Bake-off #2 -- Selection in Dense Interfaces
// IPM 2022-23, 3rd Period
// Deadline: until March 31st at 23h59m through Fénix
// Bake-off: during the laboratories of the week of April 10th

// Database (CHANGE THESE!)
const GROUP_NUMBER = 84; // add your group number here as an integer (e.g., 2, 3)
const RECORD_TO_FIREBASE = false; // set to 'true' to record user results to Firebase

// Pixel density and setup variables (DO NOT CHANGE!)
let PPI, PPCM;
const NUM_OF_TRIALS = 12; // the numbers of trials (i.e., target selections) to be completed
const GRID_ROWS = 8; // we divide our 80 targets in a 8x10 grid (8 rows)
const GRID_COLUMNS = 10; // we divide our 80 targets in a 8x10 grid (10 columns)
let continue_button;
let labels; // the item list from the "labels" CSV

// Metrics
let testStartTime, testEndTime; // time between the start and end of one attempt (8 trials)
let hits = 0; // number of successful selections
let misses = 0; // number of missed selections (used to calculate accuracy)
let database; // Firebase DB

// Study control parameters
let draw_targets = false; // used to control what to show in draw()
let trials; // contains the order of targets that activate in the test
let current_trial = 0; // the current trial number (indexes into trials array above)
let attempt = 0; // users complete each test twice to account for practice (attemps 0 and 1)

// Sound
let hit_sound; // sound when users hit a target
let miss_sound; // sound when users miss a target

// Other variables
let new_background_color; // used to set the background color when misses or hits occur

// Target list
let targets = [];

// Ensures important data is loaded before the program starts
function preload() {
  labels = loadTable('./assets/labels.csv', 'csv', 'header');
  hit_sound = loadSound('./assets/hit.wav');
  miss_sound = loadSound('./assets/miss.wav');
}

// Runs once at the start
function setup() {
  createCanvas(700, 500); // window size in px before we go into fullScreen()
  frameRate(60); // frame rate (DO NOT CHANGE!)

  randomizeTrials(); // randomize the trial order at the start of execution
  drawUserIDScreen(); // draws the user start-up screen (student ID and display size)
}

// Runs every frame and redraws the screen
function draw() {
  if (draw_targets && attempt < 2) {
    // The user is interacting with the 8x10 target grid
    background(new_background_color || color(0, 0, 0)); // sets background color

    // Print trial count at the top left-corner of the canvas
    textFont('Arial', 16);
    fill(color(255, 255, 255));
    textAlign(LEFT);
    text('Trial ' + (current_trial + 1) + ' of ' + trials.length, 50, 20);

    // Draw all targets
    for (var i = 0; i < labels.getRowCount(); i++) {
      targets[i].draw();
    }

    // Draw the target label to be selected in the current trial
    textFont('Arial', 20);
    textAlign(CENTER);
    text(labels.getString(trials[current_trial], 0), width / 2, height - 20);
  }
}

// Print and save results at the end of 12 trials
function printAndSavePerformance() {
  // DO NOT CHANGE THESE!
  let accuracy = parseFloat(hits * 100) / parseFloat(hits + misses);
  let test_time = (testEndTime - testStartTime) / 1000;
  let time_per_target = nf(test_time / parseFloat(hits + misses), 0, 3);
  let penalty = constrain(
    (parseFloat(95) - parseFloat(hits * 100) / parseFloat(hits + misses)) * 0.2,
    0,
    100
  );
  let target_w_penalty = nf(test_time / parseFloat(hits + misses) + penalty, 0, 3);
  let timestamp =
    day() + '/' + month() + '/' + year() + '  ' + hour() + ':' + minute() + ':' + second();

  textFont('Arial', 18);
  background(color(0, 0, 0)); // clears screen
  fill(color(255, 255, 255)); // set text fill color to white
  textAlign(LEFT);
  text(timestamp, 10, 20); // display time on screen (top-left corner)

  textAlign(CENTER);
  text('Attempt ' + (attempt + 1) + ' out of 2 completed!', width / 2, 60);
  text('Hits: ' + hits, width / 2, 100);
  text('Misses: ' + misses, width / 2, 120);
  text('Accuracy: ' + accuracy + '%', width / 2, 140);
  text('Total time taken: ' + test_time + 's', width / 2, 160);
  text('Average time per target: ' + time_per_target + 's', width / 2, 180);
  text('Average time for each target (+ penalty): ' + target_w_penalty + 's', width / 2, 220);

  // Saves results (DO NOT CHANGE!)
  let attempt_data = {
    project_from: GROUP_NUMBER,
    assessed_by: student_ID,
    test_completed_by: timestamp,
    attempt: attempt,
    hits: hits,
    misses: misses,
    accuracy: accuracy,
    attempt_duration: test_time,
    time_per_target: time_per_target,
    target_w_penalty: target_w_penalty,
  };

  // Send data to DB (DO NOT CHANGE!)
  if (RECORD_TO_FIREBASE) {
    // Access the Firebase DB
    if (attempt === 0) {
      firebase.initializeApp(firebaseConfig);
      database = firebase.database();
    }

    // Add user performance results
    let db_ref = database.ref('G' + GROUP_NUMBER);
    db_ref.push(attempt_data);
  }
}

// Mouse button was pressed - lets test to see if hit was in the correct target
function mousePressed() {
  // Only look for mouse releases during the actual test
  // (i.e., during target selections)
  if (draw_targets) {
    for (var i = 0; i < labels.getRowCount(); i++) {
      // Check if the user clicked over one of the targets
      if (targets[i].clicked(mouseX, mouseY)) {
        // Checks if it was the correct target
        if (targets[i].id === trials[current_trial]) {
          hit_sound.setVolume(0.2);
          hit_sound.play();
          new_background_color = color(0, 25, 0);
          hits++;
        } else {
          miss_sound.setVolume(0.2);
          miss_sound.play();
          new_background_color = color(25, 0, 0);
          misses++;
        }

        current_trial++; // move on to the next trial/target
        break;
      }
    }

    // Check if the user has completed all trials
    if (current_trial === NUM_OF_TRIALS) {
      testEndTime = millis();
      draw_targets = false; // stop showing targets and the user performance results
      printAndSavePerformance(); // print the user's results on-screen and send these to the DB
      attempt++;

      // If there's an attempt to go create a button to start this
      if (attempt < 2) {
        continue_button = createButton('START 2ND ATTEMPT');
        continue_button.mouseReleased(continueTest);
        continue_button.position(
          width / 2 - continue_button.size().width / 2,
          height / 2 - continue_button.size().height / 2
        );
      }
    }
    // Check if this was the first selection in an attempt
    else if (current_trial === 1) {
      testStartTime = millis();
    }
  }
}

// Evoked after the user starts its second (and last) attempt
function continueTest() {
  // Re-randomize the trial order
  randomizeTrials();

  // Resets performance variables
  hits = 0;
  misses = 0;

  current_trial = 0;
  continue_button.remove();

  // Shows the targets again
  new_background_color = color(0, 0, 0);
  draw_targets = true;
}

// Creates and positions the UI targets
function createTargets(target_size, horizontal_gap, vertical_gap) {
  // Define the margins between targets by dividing the white space
  // for the number of targets minus one
  h_margin = horizontal_gap / (GRID_COLUMNS - 1);
  v_margin = vertical_gap / (GRID_ROWS - 1);

  // Set targets in a 8 x 10 grid
  for (var r = 0; r < GRID_ROWS; r++) {
    for (var c = 0; c < GRID_COLUMNS; c++) {
      let target_x = 40 + (h_margin + target_size) * c + target_size / 2; // give it some margin from the left border
      let target_y = (v_margin + target_size) * r + target_size / 2;

      // Find the appropriate label and ID for this target
      let labels_index = c + GRID_COLUMNS * r;
      let target_label = labels.getString(labels_index, 0);
      let target_id = labels.getNum(labels_index, 1);

      let target = new Target(target_x, target_y + 40, target_size, target_label, target_id);
      targets.push(target);
    }
  }
}

// Is invoked when the canvas is resized (e.g., when we go fullscreen)
function windowResized() {
  if (fullscreen()) {
    // DO NOT CHANGE THESE!
    resizeCanvas(windowWidth, windowHeight);
    let display = new Display({ diagonal: display_size }, window.screen);
    PPI = display.ppi; // calculates pixels per inch
    PPCM = PPI / 2.54; // calculates pixels per cm

    // Make your decisions in 'cm', so that targets have the same size for all participants
    // Below we find out out white space we can have between 2 cm targets
    let screen_width = display.width * 2.54; // screen width
    let screen_height = display.height * 2.54; // screen height
    let target_size = 2; // sets the target size (will be converted to cm when passed to createTargets)
    let horizontal_gap = screen_width - target_size * GRID_COLUMNS; // empty space in cm across the x-axis (based on 10 targets per row)
    let vertical_gap = screen_height - target_size * GRID_ROWS; // empty space in cm across the y-axis (based on 8 targets per column)

    // Creates and positions the UI targets according to the white space defined above (in cm!)
    // 80 represent some margins around the display (e.g., for text)
    createTargets(target_size * PPCM, horizontal_gap * PPCM - 80, vertical_gap * PPCM - 80);

    // Starts drawing targets immediately after we go fullscreen
    draw_targets = true;
  }
}
