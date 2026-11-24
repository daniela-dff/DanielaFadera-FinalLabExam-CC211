const starterStudents = [
  {id:"2026-001",name:"Ava Santos",course:"BS Information Technology",year:"1st Year",status:"Active"},
  {id:"2026-002",name:"Liam Reyes",course:"BS Computer Science",year:"2nd Year",status:"Active"},
  {id:"2026-003",name:"Mia Garcia",course:"BS Information Technology",year:"3rd Year",status:"Active"},
  {id:"2026-004",name:"Noah Cruz",course:"BS Business Administration",year:"2nd Year",status:"Inactive"},
  {id:"2026-005",name:"Ella Flores",course:"BS Psychology",year:"4th Year",status:"Active"},
  {id:"2026-006",name:"Ethan Dela Rosa",course:"BS Information Systems",year:"1st Year",status:"Active"}
];

const STORAGE_KEY = "studenthub-records-v1";
let students = loadStudents();
const tableBody = document.getElementById("studentTableBody");
const searchInput = document.getElementById("searchInput");
const yearFilter = document.getElementById("yearFilter");
const modal = document.getElementById("studentModal");
const studentForm = document.getElementById("studentForm");
const toast = document.getElementById("toast");
let toastTimer;

function loadStudents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterStudents.map(student => ({...student}));
  } catch {
    return starterStudents.map(student => ({...student}));
  }
}
function saveStudents() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(students)); }
  catch { showToast("Browser storage is unavailable. Changes may not persist."); }
}
function initials(name) {
  return name.trim().split(/\s+/).slice(0,2).map(part => part[0]).join("").toUpperCase();
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function renderStudents() {
  const term = searchInput.value.trim().toLowerCase();
  const year = yearFilter.value;
  const filtered = students.filter(student => {
    const matchesTerm = [student.name, student.id, student.course].some(value => value.toLowerCase().includes(term));
    return matchesTerm && (year === "all" || student.year === year);
  });
  tableBody.innerHTML = filtered.map(student => `
    <tr>
      <td><div class="student-cell"><span class="avatar">${escapeHTML(initials(student.name))}</span><div><span class="student-name">${escapeHTML(student.name)}</span><span class="student-email">Student profile</span></div></div></td>
      <td>${escapeHTML(student.id)}</td><td>${escapeHTML(student.course)}</td><td>${escapeHTML(student.year)}</td>
      <td><span class="status ${student.status === "Inactive" ? "inactive" : ""}">${escapeHTML(student.status)}</span></td>
      <td><div class="row-actions"><button class="icon-button" data-action="edit" data-id="${escapeHTML(student.id)}" aria-label="Edit ${escapeHTML(student.name)}">Edit</button><button class="icon-button delete" data-action="delete" data-id="${escapeHTML(student.id)}" aria-label="Delete ${escapeHTML(student.name)}">Delete</button></div></td>
    </tr>`).join("");
  document.getElementById("emptyState").hidden = filtered.length !== 0;
  document.getElementById("recordCount").textContent = `Showing ${filtered.length} of ${students.length} student${students.length === 1 ? "" : "s"}`;
  document.getElementById("statStudents").textContent = students.length;
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function openModal(student = null) {
  studentForm.reset();
  document.getElementById("modalError").textContent = "";
  document.getElementById("editStudentId").value = student ? student.id : "";
  document.getElementById("modalTitle").textContent = student ? "Edit student" : "Add student";
  document.getElementById("saveStudentBtn").textContent = student ? "Save changes" : "Save student";
  if (student) {
    document.getElementById("studentName").value = student.name;
    document.getElementById("studentId").value = student.id;
    document.getElementById("studentCourse").value = student.course;
    document.getElementById("studentYear").value = student.year;
    document.getElementById("studentStatus").value = student.status;
    document.getElementById("studentId").readOnly = true;
  } else {
    document.getElementById("studentId").readOnly = false;
  }
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("studentName").focus();
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}
document.getElementById("addStudentBtn").addEventListener("click", () => openModal());
document.getElementById("closeModalBtn").addEventListener("click", closeModal);
document.getElementById("cancelModalBtn").addEventListener("click", closeModal);
modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) closeModal(); });

studentForm.addEventListener("submit", event => {
  event.preventDefault();
  const editingId = document.getElementById("editStudentId").value;
  const student = {
    id: document.getElementById("studentId").value.trim(),
    name: document.getElementById("studentName").value.trim(),
    course: document.getElementById("studentCourse").value.trim(),
    year: document.getElementById("studentYear").value,
    status: document.getElementById("studentStatus").value
  };
  const duplicate = students.some(existing => existing.id.toLowerCase() === student.id.toLowerCase() && existing.id !== editingId);
  if (duplicate) {
    document.getElementById("modalError").textContent = "That student ID is already in use. Please enter a different ID.";
    return;
  }
  if (editingId) {
    const index = students.findIndex(existing => existing.id === editingId);
    if (index !== -1) students[index] = student;
    showToast("Student record updated.");
  } else {
    students.unshift(student);
    showToast("Student added successfully.");
  }
  saveStudents();
  renderStudents();
  closeModal();
});
tableBody.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const student = students.find(item => item.id === button.dataset.id);
  if (!student) return;
  if (button.dataset.action === "edit") openModal(student);
  if (button.dataset.action === "delete") {
    if (window.confirm(`Delete the record for ${student.name}?`)) {
      students = students.filter(item => item.id !== student.id);
      saveStudents();
      renderStudents();
      showToast("Student record deleted.");
    }
  }
});
searchInput.addEventListener("input", renderStudents);
yearFilter.addEventListener("change", renderStudents);

document.getElementById("contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const message = document.getElementById("contactMessage").value.trim();
  if (!name || !email || !message) return;
  document.getElementById("formFeedback").textContent = `Thanks, ${name}! Your message has been received in this demo.`;
  event.target.reset();
});
document.getElementById("currentYear").textContent = new Date().getFullYear();

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});
document.querySelectorAll(".nav-link, .nav-cta, .brand, .hero-actions a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});
const sections = document.querySelectorAll("main section[id]");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    }
  });
}, {rootMargin:"-35% 0px -55% 0px"});
sections.forEach(section => observer.observe(section));

renderStudents();
