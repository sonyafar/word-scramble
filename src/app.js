const hint = document.getElementById('hint');
const add_def_btn = document.getElementById('add_def_btn');
const play_btn = document.getElementById('play_btn');

const popup_btn = document.getElementById('popup-btn');
const popup = document.getElementById('popup');
const close_btn = document.getElementById('close-btn');

const dropdown = document.querySelector('.dropdown');
const select = document.querySelector('.select');
const caret = document.querySelector('.caret');
const menu = document.querySelector('.menu');
const options = document.querySelectorAll('.menu li');
const selected = document.querySelector('.selected');

const definition_list = document.getElementById('definition-list');
const draggable_list = document.getElementById('draggable-list');
let letters_list = [];

const content = document.getElementById('content');
const spinner = document.getElementById('spinner');

let category = 'Four letters';
let letterCount = 4;
let word = "";
let wordInfo = "";
let definitions = new Array();

// Store list items (letters)
let listItems = []; 

let dragStartIndex;

let isLettersChanged = false;

addAllEventListeners();

getWord();

createDraggableLettersList();

function getWord() {
    if(!content.classList.contains('show')) content.classList.remove('show');
    spinner.classList.add('show');
    document.querySelectorAll('.draggable-list li').forEach(item => {
        item.classList.remove('wrong');
        item.classList.remove('right');
    });


    getRandomWord();
}

async function getRandomWord() {
    const res = await fetch(`https://random-word-api.herokuapp.com/word?length=${letterCount}`, 
    {
        headers: {
            accept: 'application/json'
        }
    });

    word = await res.json();

    letters_list = [];

    fetchWordInfo();

    extractLetters();  
}

async function fetchWordInfo() {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, 
    {
        headers: {
            accept: 'application/json'
        }
    });

    wordInfo = await res.json();

    definitions = [];
    definition_list.innerHTML = '';

    try {
        document.getElementById('partOfSpeech').innerHTML = `/ ${wordInfo[0].meanings[0].partOfSpeech} /`

        definitions = wordInfo[0].meanings[0].definitions;
    
        if(definitions.length <= 1 ) {
            add_def_btn.style.display = 'none';
        }
        
        var obj = definitions[0].definition;
    
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(obj));
        definition_list.appendChild(li); 
    }
    catch(error) {
        add_def_btn.style.display = 'none';
        var li = document.createElement("li");
        li.appendChild(document.createTextNode("Sorry pal, we couldn't find definitions for the word you were looking for"));
        definition_list.appendChild(li); 
    }
}

// Function create draggable list 
function createDraggableLettersList() {
    listItems = [];

    for(let i = 0; i < letterCount; i++) {
        const listItem = document.createElement('li');
        listItem.setAttribute('data-index', i);

        listItem.innerHTML = `
            <div class=draggable draggable=true>
                <p class="letter"></p>
            </div>
        `;

        listItems.push(listItem);
        draggable_list.appendChild(listItem);
    }
}

// Create an array of letters
function extractLetters() {
    letters_list = word.toString().split('')
        .map(obj => ({value: obj, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(obj => obj.value);
        
    if(isLettersChanged)  createDraggableLettersList();
    changeLettersList();
}

// Insert shuffled letters into DOM
function changeLettersList() {
    letters_list.forEach((letter, index) => 
    {
        document.querySelectorAll('.draggable')[index].innerText = letter;
    });

    content.classList.add('show');

    setTimeout(() => spinner.classList.remove('show'), 0.3)
    addDragDropListeners();
}

function addDragDropListeners() {
    const draggables = document.querySelectorAll('.draggable');
    const dragListItems = document.querySelectorAll('.draggable-list li');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', dragStart);
    })

    dragListItems.forEach(item => {
        item.addEventListener('dragover', dragOver);
        item.addEventListener('drop', dragDrop);
        item.addEventListener('dragenter', dragEnter);
        item.addEventListener('dragleave', dragLeave);
    })
}

function dragStart() {
    dragStartIndex = this.closest('li').getAttribute('data-index');
    this.closest('.draggable-list li .draggable').classList.add('start');
}

function dragEnter() {
    this.classList.add('over');
}

function dragOver(e) {
    e.preventDefault();
}

// Prevent default behavior
function dragLeave() {
    document.querySelectorAll('.draggable').forEach(item => {
        item.classList.remove('start');
    })
    this.classList.remove('over');
}

function dragDrop() {
    const dragEndIndex = this.getAttribute('data-index');

    swapItems(dragStartIndex, dragEndIndex);

    this.classList.remove('over');

}

// Swap list items that are doing drag and drop 
function swapItems(fromIndex, toIndex) {
    listItems = document.querySelectorAll('.draggable-list li')
    const firstItem = listItems[fromIndex].querySelector('.draggable');
    const secondItem = listItems[toIndex].querySelector('.draggable');

    listItems[fromIndex].appendChild(secondItem);
    listItems[toIndex].appendChild(firstItem);

    checkOrder();
}

// Check the order of the letters in the word
function checkOrder() {
    listItems.forEach((item, index) => {
        const letter = item.querySelector('.draggable').innerText.trim();
        
        if(letter !== word.toString().split('')[index]) {
            item.classList.add('wrong');
        }
        else {
            item.classList.remove('wrong');
            item.classList.add('right');
        }
    })
}

// Add definition 
function showMoreDefinitions() {
    if(definitions.length > 0) {
        let currentIndex = definition_list.getElementsByTagName("li").length;

        if(definitions.length > 3 && currentIndex <= 4) {
            var obj = definitions[currentIndex + 1].definition;
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(obj));
    
            if(currentIndex == 3 || currentIndex == definitions.length - 1) {
                add_def_btn.style.display = 'none';
            }
    
            definition_list.appendChild(li); 
        }
    }
}

// Play the word pronunciation
function playAudio() {
    let phonetics = wordInfo[0].phonetics;

    if(phonetics.length != 0) {
        for(let i = 0; i < phonetics.length; i++) {
            if(phonetics[i].audio != "") {
                var audio = new Audio(phonetics[i].audio);
                audio.play();
                break;
            }
            else {
                alert('Audio is not available 😔.');
                break;
            }
        }
    }
    else {
        alert('Audio is not available 😔.');
    }
}

async function changeLettersCount() {
    isLettersChanged = true;
    draggable_list.innerHTML = '';
    switch(category) {
        case "Four letters": {
            letterCount = 4;
            break;
        }
        case "Five letters": {
            letterCount = 5;
            break;
        }
        case "Six letters": {
            letterCount = 6;
            break;
        }
        case "Seven letters": {
            letterCount = 7;
            break;
        }
    }

    // createDraggableLettersList();
}


// Add Event Listener to the buttons and links
function addAllEventListeners() {
    add_def_btn.addEventListener('click', showMoreDefinitions);

    play_btn.addEventListener('click', playAudio)

    popup_btn.addEventListener('click', () => {
        popup.classList.toggle('active');
    })

    close_btn.addEventListener('click', () => {
        popup.classList.remove('active');
    })


    select.addEventListener('click', () => {
        select.classList.toggle('clicked');
        menu.classList.toggle('opened');
    })


    options.forEach(option => {
        option.addEventListener('click', () => {
            content.classList.remove('show');
            selected.innerText = option.innerText;
            category = selected.innerText;
            changeLettersCount();
            getWord();
            select.classList.remove('clicked');
            menu.classList.remove('opened');
        })

        options.forEach(option => {
            option.classList.remove('active');
        })
    })



    window.addEventListener('click', ({target}) => {
        if(target == popup) {
            popup.classList.remove('active');
        }

        if(target != selected && menu.classList.contains('opened')) {
            menu.classList.remove('opened');
        }
    })
}