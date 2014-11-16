stats = {}; // Holds current stats for tasks
timers = {}; // Holds running timers for tasks
aggTime = {}; // Holds aggregated time for tasks (Not up-to-date)
starts = {}; // Holds most recent start time for tasks


// document.getElementById('newtaskinput').onclick = newTask;
document.getElementById('newtaskinput').addEventListener('keydown', newTask);

function swapStartPause(task) {
    // startpauseButton = document.getElementById("startpause");
    startpauseButton = document.getElementById(task);
    currentRole = startpauseButton.getAttribute('role');
    switch (currentRole) {
        case "start":
            startpauseButton.setAttribute('role','pause');
            startpauseButton.onclick = function() {stopTimer(task) };
            break;
        case "pause":
            startpauseButton.setAttribute('role','start');
            startpauseButton.onclick = function() {startTimer(task) };
            break;
    }
}

// Graph starts out hidden
function displayGraph() {
    document.getElementById('donut').removeAttribute('hidden');
}

// Adds a new task if enter is pressed
function newTask(e) {
    if (!e) { var e = window.event; }

    // Enter is pressed
    if (e.keyCode == 13) {
        e.preventDefault();
        task = document.getElementById('newtaskinput').value;
        document.getElementById('newtaskinput').value = "";
        addTask(task);
    }
}

// Adds task to DOM
function addTask(task) {
    if (task == "") { return; }

    // Create dom element for task
    var newTaskDiv = document.createElement('div');
    newTaskDiv.setAttribute('class','task button list-item flat');
    newTaskDiv.setAttribute('role','start');
    newTaskDiv.setAttribute('id',task);
    newTaskDiv.onclick=function() {startTimer(task) };

    var newTaskSpan = document.createElement('div');
    newTaskSpan.innerHTML = task;
    var newTaskTimeSpan = document.createElement('div');
    newTaskTimeSpan.setAttribute('class','tasktime');

    newTaskDiv.appendChild(newTaskSpan);
    newTaskDiv.appendChild(newTaskTimeSpan);

    // Append to tasks container
    finishedTasks = document.getElementById("tasks");
    finishedTasks.appendChild(newTaskDiv);
}

function startTimer(task) {
    displayGraph();
    swapStartPause(task);
    if(!aggTime[task]) {
        aggTime[task] = 0;
    }
    starts[task] = Date.now();
    timers[task] = setInterval(function() {update(task)}, 100);
}

function stopTimer(task) {
    now = Date.now();
    swapStartPause(task);
    if (timers[task]) {
        aggTime[task] = (now - starts[task])/1000
        clearInterval(timers[task]);
    }
}

function update(task) {
    now = Date.now();
    // runningTime = (now - starts[task])/1000
    runningTime = aggTime[task] + (now - starts[task])/1000
    render(task);
}

function render(task) {
    tasktime = document.getElementById(task).getElementsByClassName('tasktime')[0];
    tasktime.innerHTML = runningTime.toFixed(3) + " seconds";
    stats[task] = runningTime;
    statsArray = arrayFromSet(stats);
    updatec3(statsArray);
}
function arrayFromSet(set) {
    var a = new Array();
    for (var key in set) {
        a.push([key, set[key]]);
    }
    return a;
}

var chart = c3.generate({
    bindto: '#donut',
    data: {
        columns: [],
        type : 'donut',
    },
    donut: {
        title: "Task Stats"
    }
});

function updatec3(data) {
    chart.load({
        columns: data
    });
}


