const addBtn = document.getElementById("addEventBtn");
const eventList = document.getElementById("eventList");
const clearBtn = document.getElementById("clearbtn");
const sampleBtn = document.getElementById("samplebtn");

addBtn.addEventListener("click", function () {
  const title = document.getElementById("eventTitle").value;
  const date = document.getElementById("eventDate").value;
  const category = document.getElementById("eventCategory").value;
  const desc = document.getElementById("eventDesc").value;

  if (title === "" || date === "") {
    alert("Please fill required fields");
    return;
  }

  
  const emptyText = document.querySelector(".empty-text");
  if (emptyText) emptyText.remove();

  
  const card = document.createElement("div");
  card.className = "event-card";

  card.innerHTML = `
    <h3>${title}</h3>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Category:</strong> ${category}</p>
    <p>${desc}</p>
    <button class="delete-btn">X</button>
  `;

  eventList.appendChild(card);

  
  document.getElementById("eventTitle").value = "";
  document.getElementById("eventDate").value = "";
  document.getElementById("eventCategory").value = "";
  document.getElementById("eventDesc").value = "";
});


eventList.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    e.target.parentElement.remove();

    
    if (document.querySelectorAll(".event-card").length === 0) {
      showEmptyText();
    }
  }
});


clearBtn.addEventListener("click", function () {
  document.querySelectorAll(".event-card").forEach(event => event.remove());
  showEmptyText();
});


sampleBtn.addEventListener("click", function () {
  const emptyText = document.querySelector(".empty-text");
  if (emptyText) emptyText.remove();

  const card = document.createElement("div");
  card.className = "event-card";

  card.innerHTML = `
    <h3>Sample Workshop</h3>
    <p><strong>Date:</strong> 2026-03-01</p>
    <p><strong>Category:</strong> Workshop</p>
    <p>This is a sample event to demonstrate the dashboard.</p>
    <button class="delete-btn">X</button>
  `;

  eventList.appendChild(card);
});


function showEmptyText() {
  if (!document.querySelector(".empty-text")) {
    const p = document.createElement("p");
    p.className = "empty-text";
    p.textContent = "No events yet. Add your first event!";
    eventList.appendChild(p);
  }
}
