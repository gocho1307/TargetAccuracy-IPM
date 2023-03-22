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
const GRID_ROWS = 3; // we divide our groups into a 3x7 grid (3 rows)
const GRID_COLUMNS = 6; // we divide our groups in a 3x7 grid (6 columns)
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
let hit_sound;
let miss_sound;

// Other variables
let created = false;
let missed = false;

// Targets and their Groups
let targets = [];
let groups = {};

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

  groups = {
    0: new Group([255, 255, 255, 100]),
    A: new Group([255, 102, 102, 100]),
    B: new Group([153, 0, 204, 100]),
    C: new Group([153, 51, 0, 100]),
    F: new Group([255, 153, 51, 100]),
    G: new Group([255, 166, 201, 100]),
    K: new Group([204, 0, 204, 100]),
    L: new Group([255, 255, 0, 100]),
    M: new Group([102, 204, 0, 100]),
    N: new Group([57, 150, 179, 100]),
    O: new Group([102, 51, 204, 100]),
    P: new Group([204, 0, 102, 100]),
    R: new Group([255, 0, 0, 100]),
    S: new Group([0, 191, 255, 100]),
    T: new Group([255, 99, 71, 100]),
    V: new Group([179, 106, 57, 100]),
    W: new Group([102, 102, 204, 100]),
    Y: new Group([255, 204, 51, 100]),
    Z: new Group([57, 179, 128, 100]),
  };

  randomizeTrials(); // randomize the trial order at the start of execution
  drawUserIDScreen(); // draws the user start-up screen (student ID and display size)
}

// Runs every frame and redraws the screen
function draw() {
  // The user is interacting with the 8x10 target grid
  if (draw_targets && attempt < 2) {
    if (missed) {
      background(15, 0, 0); // sets background to dark red on miss
    } else {
      background(0, 0, 0); // default background is black
    }

    // Print trial count at the top left-corner of the canvas
    textFont('Arial', 16);
    fill(color(255, 255, 255));
    textAlign(LEFT);
    text('Trial ' + (current_trial + 1) + ' of ' + trials.length, 50, 20);

    // Draw all targets
    for (let k in groups) {
      groups[k].draw(mouseX, mouseY);
    }

    // Draw the target label to be selected in the current trial
    textFont('Arial', 20);
    textAlign(CENTER);
    text(labels.getString(trials[current_trial], 0), width / 2, height - 20);
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
    let screen_width = display.width * 2.54; // screen width
    let screen_height = display.height * 2.54; // screen height

    // Creates the groups with targets
    if (!created) {
      createGroups(screen_width, screen_height);
    }

    // Starts drawing targets immediately after we go fullscreen
    draw_targets = true;
  }
}

// Creates and positions the UI groups with targets
function createGroups(screen_width, screen_height) {
  created = true;
  // Below we find out out white space we can have between the groups of 2cm targets
  // 80 represent some margins around the display (e.g., for text)
  let target_size = 1.875;
  let t_size = target_size * PPCM; // sets the target size

  // Actually creates the targets
  for (let i = 0; i < labels.getRowCount(); i++) {
    let target_label = labels.getString(i, 0);
    let target_id = labels.getNum(i, 1);
    let target_color = groups[target_label[0]].color;
    let target = new Target(t_size, target_label, target_id, target_color);
    targets.push(target);
    groups[target_label[0]].addTarget(target);
  }

  for (let k in groups) {
    groups[k].sortTargets();
    groups[k].calculateSize();
  }

  // Defines the margins between groups by dividing the white space for
  // the number of groups minus one
  let separator_size = 10;
  let vertical_gap =
    (screen_height - (3 * target_size + 4 / separator_size) * GRID_ROWS) * PPCM - 40; // empty space in cm across the y-axis (based on 3 groups per column)
  let v_margin = vertical_gap / (GRID_ROWS - 1);
  let group_fixed_height = (3 * target_size + 4 / separator_size) * PPCM;

  // Calculates the positions of the groups
  let groups_t = Object.values(groups);
  for (let r = 0; r < GRID_ROWS; r++) {
    let columns = GRID_COLUMNS;
    if (r === GRID_ROWS - 1) {
      columns += 1;
    }
    let groups_width = 0;
    for (let c = 0; c < columns; c++) {
      groups_width += groups_t[c + GRID_COLUMNS * r].width;
    }
    let horizontal_gap = (screen_width - groups_width) * PPCM - 40; // empty space in cm across the x-axis (based on 6 groups per row)
    let h_margin = horizontal_gap / (columns - 1);

    groups_width = 0;
    for (let c = 0; c < columns; c++) {
      let group_x = 20 + h_margin * c + groups_width;
      let group_y = 20 + (v_margin + group_fixed_height) * r;
      groups_width += groups_t[c + GRID_COLUMNS * r].width * PPCM;

      groups_t[c + GRID_COLUMNS * r].setPosition(group_x, group_y);
    }
  }
}

// Mouse button was pressed - lets test to see if hit was in the correct target
function mousePressed() {
  // Only look for mouse releases during the actual test
  // (i.e., during target selections)
  if (draw_targets) {
    for (let i = 0; i < labels.getRowCount(); i++) {
      // Check if the user selected one of the targets
      if (targets[i].isHovering(mouseX, mouseY)) {
        targets[i].select();
        // Checks if it was the correct target
        if (targets[i].id === trials[current_trial]) {
          hit_sound.setVolume(0.2);
          hit_sound.play();
          missed = false;
          hits++;
        } else {
          miss_sound.setVolume(0.2);
          miss_sound.play();
          missed = true;
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
    } else if (current_trial === 1) {
      // Check if this was the first selection in an attempt
      testStartTime = millis();
    }
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

// Evoked after the user starts its second (and last) attempt
function continueTest() {
  // Re-randomize the trial order
  randomizeTrials();

  // Resets performance variables
  hits = 0;
  misses = 0;

  // Resets the targets information exclusive to the first attempt
  for (let i = 0; i < labels.getRowCount(); i++) {
    targets[i].reset();
  }

  current_trial = 0;
  continue_button.remove();

  // Shows the targets again
  missed = false;
  draw_targets = true;
}
