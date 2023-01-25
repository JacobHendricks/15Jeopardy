

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
const $startBtn = $('#start');
const $table = $('#jeopardy');
// const $td = $('td');
const $th = $('th');


/** Get NUM_CATEGORIES random category from API.
 * 
 * Returns array of category ids
 * 
 * Selects group of 100 categories from 28,163 total.  Filter categories with at least 5 clues.  Shuffle and return the first 6.
 */ 

async function getCategoryIds() {
  const response = await axios.get("https://jservice.io/api/categories", {
    params: {
      count: 100,
      offset: Math.floor(Math.random() * 28063)
    }
  });
  const categories = response.data.filter(result => {
    return result.clues_count > 4
  });
  return shuffleArray(categories).slice(0,6).map(value => value.id); 
}


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}


/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const response = await axios.get("https://jservice.io/api/category", {
    params: {
      id: catId
    }
  });
  return {
    title: response.data.title,
    clues: response.data.clues.map(clue => {
      return {
        question: clue.question,
        answer: clue.answer,
        value: clue.value,
        showing: null, 
      };
    })
  }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  // for (let title of categories) {
  //   console.log(categories.title);
    // $("tr").append(
    //   `<th>${categories.title}<th>`
    // )
  // }
  for (let i = 0; i < categories.length; i++) {
    // console.log(categories[i].title);
    $('#thead-row').append(
      `<th>${categories[i].title}</th>`
    )
    for(let j = 0; j <= 4; j++) {
      // console.log(categories[i].title, categories[i].clues[j].question);
      $(`#tbody-row${j}`).append(
          `<td id="${j}-${i}" class="value">
          ${categories[i].clues[j].value}
          </td>`
        // `<td id="${j}-${i}">
        //   <div class="cover">?</div>
        //   <div class="hide question">${categories[i].clues[j].question}</div>
        //   <div class="hide answer">${categories[i].clues[j].answer}</div>
        // </td>` 
      );
    };
  };
}




/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  let target = evt.target;
  let id = evt.target.id;
  let [clueId, catId] = id.split("-");
  let clue = categories[catId].clues[clueId];

  let msg;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
  } else {
    // already showing answer; ignore
    return
  }

  // Update text of cell
  $(`#${clueId}-${catId}`).html(msg);

}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $("td").remove();
  $("th").remove();
  document.getElementById("spin-container").style.visibility = "visible";

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  document.getElementById("spin-container").style.visibility = "hidden";
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  showLoadingView();
  categories = [];
  const catIds = await getCategoryIds();
  for (let id of catIds) {
    const res = await getCategory(id);
    categories.push(res);
  }
  fillTable()
  $startBtn.text("Restart");
  hideLoadingView();
}

/** On click of start / restart button, set up game. */

$startBtn.on("click", setupAndStart);

/** On page load, add event handler for clicking clues */

$table.on("click", "td", handleClick);
// TODO