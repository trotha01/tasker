// Global vars //
stats = {}; // Holds current stats for tasks
timers = {}; // Holds running timers for tasks
aggTime = {}; // Holds aggregated time for tasks (Not up-to-date)
starts = {}; // Holds most recent start time for tasks

localstorage = window.localStorage;

// Display chart //
var chart = c3.generate({
    bindto: '#donut',
    data: {
        columns: [],
        type : 'donut',
    },
    donut: {
        label: { show: true }
    }
});

function updatec3(data) {
    chart.load({
        columns: data
    });
}

// Graph starts out hidden
function displayGraph() {
    document.getElementById('donut').removeAttribute('hidden');
}

// Local Storage Methods //
function loadFromStorage(object, item) {
    if (localstorage[item]) {
        if(typeof localstorage[item] == "string") {
            return JSON.parse(localstorage[item]);
        }
        return localstorage[item];
    }
    return object;
}
function saveInStorage(object, item) {
        localstorage[item] = JSON.stringify(object);
}

// ACTION - load from storage, reload, add listeners //
aggTime = loadFromStorage(aggTime, 'aggTime');
starts = loadFromStorage(starts, 'starts');
reloadTasks();

document.getElementById('newtaskinput').addEventListener('keyup', validateInput);
document.getElementById('newtaskinput').addEventListener('keydown', newTask);
document.getElementById('clear').addEventListener('click', clear);

function reloadTasks() {
    stats = loadFromStorage(stats, 'stats');
    for(var key in stats) {
        if(stats.hasOwnProperty(key)) {
            addTask(key);
            if(stats[key] != 0) {
                displayGraph();
            }
            render(key);
        }
    }
}

function clear() {
    tasksDiv = document.getElementById('tasks');
    while(tasksDiv.firstChild) {
        tasksDiv.removeChild(tasksDiv.firstChild);
    }

    for (i in timers) {
        clearInterval(timers[i]);
    }

    localStorage.removeItem('stats');
    localStorage.removeItem('aggTime');
    localStorage.removeItem('starts');
    stats = {};
    timers = {};
    aggTime = {};
    starts = {};

    chart.unload();
}

function swapStartPause(task) {
    startpauseButton = document.getElementById(task);
    if(!startpauseButton) { return; }
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



// Adds a new task if enter is pressed
function newTask(e) {
    if (!e) { var e = window.event; }

    // Enter is pressed
    if (e.keyCode == 13) {
        hideError();
        task = document.getElementById('newtaskinput').value;
        e.preventDefault();
        task = safeTaskString(task);
        document.getElementById('newtaskinput').value = "";
        addNewTask(task);
    }
}

function hideError() {
    document.getElementById('error').innerHTML = "";
}

function existsError(task) {
    document.getElementById('error').innerHTML = task + " already exists";
    window.setTimeout(hideError, 5000);
}

function displayError() {
    document.getElementById('error').innerHTML = "Characters not allowed: ? = { } / \\ | ` - [ ]";
    window.setTimeout(hideError, 5000);
}

function validateInput(e) {
    // Check for invalid chars
    task = document.getElementById('newtaskinput').value;
    if (task.match(/[?={}\\/|`-]/)) {
        task = task.substring(0, task.length-1);
        document.getElementById('newtaskinput').value = task;
        displayError();

    } else if (e.keyCode != 13 && e.keyCode != 16 && e.keyCode != 17 && e.keyCode != 18){
        // hideError();
    }
}

// Removes chars from a string
function listRemove(charlist, string) {
    for (c in charlist) {
        string = string.replace(charlist[c],"");
    }
    return string;
}

function safeTaskString(task) {
    // return encodeURIComponent(task);
    task = listRemove('?={}\\/|`-', task);
    return task;
}

function decodeSafeTaskString(safetask) {
    // return decodeURIComponent(safetask)
    return safetask;
}

function addNewTask(task) {
    if (task == "") { return; }
    task = task.toUpperCase();
    if (stats[task] != undefined) { existsError(task); return; }
    stats[task]=0;
    saveInStorage(stats,'stats');

    addTask(task);
}

function deleteTask(task) {
    console.log("Delete task", task);
    taskElement = document.getElementById(task);
    if(taskElement) {
         taskElement.parentNode.removeChild(taskElement);
    }
    delete stats[task];
    delete starts[task];
    delete aggTime[task];
    saveInStorage(stats, 'stats');
    saveInStorage(starts, 'starts');
    saveInStorage(aggTime, 'aggTime');
    updateGraphFromStats(stats);
}

// Adds task to DOM
function addTask(task) {

    // Create dom element for task
    var newTaskDiv = document.createElement('div');
    newTaskDiv.setAttribute('class','task button list-item flat');
    newTaskDiv.setAttribute('role','start');
    newTaskDiv.setAttribute('id',task);
    newTaskDiv.onclick=function() {startTimer(task) };

    var delTask = document.createElement('div');
    delTask.innerHTML = 'DELETE';
    delTask.setAttribute('class','delete button pull-right');
    delTask.onclick=function() {newTaskDiv.onclick=null; deleteTask(task) };

    var newTaskName= document.createElement('div');
    newTaskName.innerHTML = decodeSafeTaskString(task);
    var newTaskTimeSpan = document.createElement('div');
    newTaskTimeSpan.setAttribute('class','tasktime');
    newTaskTimeSpan.innerHTML = timeDisplay(stats[task]);

    newTaskDiv.appendChild(delTask);
    newTaskDiv.appendChild(newTaskName);
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
    saveInStorage(starts,'starts');
}

function stopTimer(task) {
    now = Date.now();
    swapStartPause(task);
    if (timers[task]) {
        aggTime[task] += (now - starts[task])/1000
        clearInterval(timers[task]);
        saveInStorage(aggTime,'aggTime');
    }
}

function update(task) {
    now = Date.now();
    runningTime = aggTime[task] + (now - starts[task])/1000
    stats[task] = runningTime;
    saveInStorage(stats,'stats');
    render(task);
}

// Given seconds, returns a formatted string
function timeDisplay(s) {
    var sec_num = Math.floor(s);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

function render(task) {
    tasktime = document.getElementById(task).getElementsByClassName('tasktime')[0];
    if(!stats[task]) { return; }
    tasktime.innerHTML = timeDisplay(stats[task]);
    updateGraphFromStats(stats);
}
function updateGraphFromStats(stats){
    statsArray = arrayFromSet(stats);
    updatec3(statsArray);
}
function arrayFromSet(set) {
    var a = new Array();
    for (var key in set) {
        a.push([key, decodeSafeTaskString(set[key])]);
    }
    return a;
}
