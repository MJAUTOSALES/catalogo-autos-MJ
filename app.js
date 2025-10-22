(async function(){
  const $ = (sel, el=document)=>el.querySelector(sel);
  const $$ = (sel, el=document)=>Array.from(el.querySelectorAll(sel));

  // Theme toggle
  const root = document.documentElement;
  const themeBtn = $("#toggleTheme");
  const storedTheme = localStorage.getItem("theme");
  if(storedTheme === "light"){ root.classList.add("light"); }
  themeBtn.addEventListener("click", ()=>{
    root.classList.toggle("light");
    localStorage.setItem("theme", root.classList.contains("light") ? "light" : "dark");
  });

  // Load manifest
  const data = await fetch("manifest.json").then(r=>r.json()).catch(()=>[]);

  // Populate brand list
  const brandList = $("#brandList");
  const allBtn = document.createElement("button");
  allBtn.textContent = "Todas";
  allBtn.className = "active";
  brandList.appendChild(allBtn);

  data.forEach(({brand})=>{
    const btn = document.createElement("button");
    btn.textContent = brand;
    btn.dataset.brand = brand;
    brandList.appendChild(btn);
  });

  const grid = $("#grid");
  const title = $("#currentBrand");
  const count = $("#count");

  function render(brand=null){
    grid.innerHTML = "";
    let images = [];
    if(!brand || brand==="Todas"){
      data.forEach(b=> images.push(...b.images.map(x=>({...x, brand:b.brand}))));
    }else{
      const b = data.find(x=>x.brand===brand);
      if(b) images = b.images.map(x=>({...x, brand:b.brand}));
    }
    title.textContent = brand || "Todas";
    count.textContent = images.length ? images.length + " fotos" : "Sin fotos";

    const frag = document.createDocumentFragment();
    images.forEach(({src, brand})=>{
      const fig = document.createElement("figure");
      const img = document.createElement("img");
      img.loading = "lazy";
      img.alt = brand;
      img.src = src;
      const cap = document.createElement("figcaption");
      cap.textContent = brand;
      fig.appendChild(img);
      fig.appendChild(cap);
      fig.addEventListener("click", ()=>openLightbox(src));
      frag.appendChild(fig);
    });
    grid.appendChild(frag);
  }

  // Lightbox
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxClose = $("#lightboxClose");
  function openLightbox(src){
    lightboxImg.src = src;
    lightbox.setAttribute("aria-hidden","false");
  }
  function closeLightbox(){
    lightbox.setAttribute("aria-hidden","true");
    lightboxImg.src = "";
  }
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e)=>{ if(e.target===lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeLightbox(); });

  // Interactions
  brandList.addEventListener("click", (e)=>{
    if(e.target.tagName==="BUTTON"){
      $$(".brand-list button").forEach(b=>b.classList.remove("active"));
      e.target.classList.add("active");
      render(e.target.dataset.brand || "Todas");
    }
  });

  // Search brands
  const search = $("#search");
  search.addEventListener("input", ()=>{
    const q = search.value.trim().toLowerCase();
    $$(".brand-list button").forEach(btn=>{
      if(btn.textContent==="Todas") return;
      btn.style.display = btn.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });

  // Initial render
  render("Todas");
})();