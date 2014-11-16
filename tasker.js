stats = {};
timer = null;

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

function newTask(e) {
    if (!e) { var e = window.event; }

    // Enter is pressed
    if (e.keyCode == 13) {
        e.preventDefault();
        task = document.getElementById('newtaskinput').value;
        addTask(task);
    }
}

function addTask(task) {
    if (task == "") { return; }

    // Create dom element for it
    var newTaskDiv = document.createElement('div');
    newTaskDiv.setAttribute('class','task');
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
    console.log(task);
    swapStartPause(task);
    if (!timer) {
        start = Date.now();
        timer = setInterval(function() {update(task)}, 100);
    } else {
        timer = setInterval(function() {update(task)}, 100);
    }
}

function stopTimer(task) {
    swapStartPause(task);
    if (timer) {
        clearInterval(timer);
    }
}

function taskDone() {
    start = 0;
    timer = null;
    render();
}

function update(task) {
    now = Date.now();
    runningTime = (now - start)/1000
    render(task);
}

function render(task) {
    tasktime = document.getElementById(task).getElementsByClassName('tasktime')[0];
    tasktime.innerHTML = runningTime + " seconds";
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
    bindto: '#c3sample',
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


