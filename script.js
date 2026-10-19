// Beginner-friendly JavaScript to render and filter homework items

// Sample data — in a real app this might come from a server
let items = [
  { id:1, title:"Algebra: Linear Equations", subject:"Math", due:"2026-10-22", desc:"Solve problems 1–12 on page 48.", link:"" },
  { id:2, title:"Photosynthesis Notes", subject:"Science", due:"2026-10-25", desc:"Read and summarize the lab sheet.", link:"" },
  { id:3, title:"Essay Draft", subject:"English", due:"2026-10-28", desc:"First draft of the short essay.", link:"" },
  { id:4, title:"World War II Timeline", subject:"History", due:"2026-10-20", desc:"Create a timeline of major events.", link:"" },
];

// Grab DOM elements
const results = document.getElementById('results');
const searchInput = document.getElementById('search');
const categoriesEl = document.getElementById('categories');
const addForm = document.getElementById('addForm');

// Track current filters
let currentSubject = 'all';
let currentQuery = '';

// Helper: format date for display (YYYY-MM-DD -> readable)
function formatDate(d){
  if(!d) return 'No due date';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString();
}

// Render items into the results area
function render(list){
  // Sort by due date (soonest first). Items without dates go last.
  list.sort((a,b)=>{
    if(!a.due) return 1;
    if(!b.due) return -1;
    return new Date(a.due) - new Date(b.due);
  });

  // Build HTML
  results.innerHTML = '';
  if(list.length === 0){
    results.innerHTML = '<p>No items found. Try changing search or category.</p>';
    return;
  }

  list.forEach(item=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="meta">
        <span>${item.subject}</span>
        <span>${formatDate(item.due)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.desc)}</p>
      ${item.link ? `<a href="${escapeAttr(item.link)}" target="_blank" rel="noopener">Open resource</a>` : ''}
    `;
    results.appendChild(card);
  });
}

// Simple HTML escapers to avoid accidental injection (good habit)
function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[s]);
}
function escapeAttr(str){
  return escapeHtml(str).replace(/"/g, '&quot;');
}

// Apply filters (search + category)
function applyFilters(){
  const q = currentQuery.trim().toLowerCase();
  const filtered = items.filter(it=>{
    // Category filter
    if(currentSubject !== 'all' && it.subject !== currentSubject) return false;
    // Search filter: check title, subject, description
    if(q === '') return true;
    return (
      it.title.toLowerCase().includes(q) ||
      (it.subject && it.subject.toLowerCase().includes(q)) ||
      (it.desc && it.desc.toLowerCase().includes(q))
    );
  });
  render(filtered);
}

// Event: search input
searchInput.addEventListener('input', (e)=>{
  currentQuery = e.target.value;
  applyFilters();
});

// Event: category buttons (delegation)
categoriesEl.addEventListener('click', (e)=>{
  if(e.target.tagName !== 'BUTTON') return;
  // Update active button styles
  [...categoriesEl.children].forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');

  currentSubject = e.target.dataset.subject;
  applyFilters();
});

// Event: add form submit — adds a new item to the local list
addForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const subject = document.getElementById('subject').value.trim() || 'General';
  const due = document.getElementById('due').value || '';
  const link = document.getElementById('link').value.trim();

  // Basic validation
  if(!title) return alert('Please enter a title.');

  const newItem = {
    id: Date.now(),
    title, subject, due, desc: 'Added by student', link
  };
  items.push(newItem);

  // Clear inputs
  addForm.reset();

  // Show the new item (switch category to show it if needed)
  // If user filtered to a different subject, change to "All"
  if(currentSubject !== 'all' && currentSubject !== subject){
    // make 'All' active
    [...categoriesEl.children].forEach(b => {
      if(b.dataset.subject === 'all') b.classList.add('active'); else b.classList.remove('active');
    });
    currentSubject = 'all';
  }
  applyFilters();
});

// Initial render on page load
applyFilters();
