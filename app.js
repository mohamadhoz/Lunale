async function loadProducts(){
  const q = document.getElementById('search').value;
  const cat = document.getElementById('category').value;
  const url = new URL('/api/products', location.origin);
  if (q) url.searchParams.set('q', q);
  if (cat) url.searchParams.set('category', cat);
  const res = await fetch(url);
  const list = await res.json();
  const grid = document.getElementById('products');
  grid.innerHTML = '';
  const cats = new Set();
  list.forEach(p=>{
    cats.add(p.category);
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      ${p.image ? `<img src="${p.image}" alt="${p.name}">` : ''}
      <h3>${p.name}</h3>
      <p>${p.description || ''}</p>
      <p><strong>${p.price} USD</strong></p>
      <a href="/product.html?id=${p.id}">View</a>
    `;
    grid.appendChild(div);
  });

  const select = document.getElementById('category');
  // clear existing except first
  while(select.options.length>1) select.remove(1);
  cats.forEach(c=>{
    if (c){
      const opt = document.createElement('option');
      opt.value = c; opt.text = c;
      select.appendChild(opt);
    }
  });
}

document.getElementById('search').addEventListener('input', () => loadProducts());
document.getElementById('category').addEventListener('change', () => loadProducts());
document.getElementById('refresh').addEventListener('click', () => loadProducts());
window.addEventListener('load', loadProducts);
