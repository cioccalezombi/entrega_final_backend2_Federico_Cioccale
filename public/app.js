const API = "/api";
const tokenKey = "jwt_token";

const el = (id) => document.getElementById(id);

function setOutput(node, data) {
  if (!node) return;
  node.textContent =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

function getToken() {
  return localStorage.getItem(tokenKey) || "";
}

function setToken(token) {
  if (token) localStorage.setItem(tokenKey, token);
  else localStorage.removeItem(tokenKey);
  syncAuthUI();
}

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function syncAuthUI() {
  const has = !!getToken();
  el("btnLogout")?.classList.toggle("d-none", !has);
}

const terminalLogEl = el("userTerminalLog");

function ensureCursor() {
  if (!terminalLogEl) return;
  let cursor = terminalLogEl.querySelector(".cursor");
  if (!cursor) {
    cursor = document.createElement("span");
    cursor.className = "cursor";
    terminalLogEl.appendChild(cursor);
  }
}

function logLine(text = "") {
  if (!terminalLogEl) return;
  const cursor = terminalLogEl.querySelector(".cursor");
  if (cursor) cursor.remove();
  terminalLogEl.textContent += `${text}\n`;
  terminalLogEl.scrollTop = terminalLogEl.scrollHeight;
  ensureCursor();
}

function clearLog() {
  if (!terminalLogEl) return;
  terminalLogEl.textContent = "";
  ensureCursor();
}

function setBusy(isBusy) {
  document.querySelectorAll("button").forEach((btn) => {
    // skip the ones that are naturally disabled
    if (!btn.hasAttribute('data-keep-disabled')) {
       btn.disabled = isBusy;
    }
  });
}

async function apiFetch(path, options = {}) {
  try {
    setBusy(true);

    const method = (options.method || "GET").toUpperCase();
    const url = `${API}${path}`;

    logLine(`> ${method} ${url}`);

    const res = await fetch(url, {
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...authHeaders(),
        ...(options.headers || {}),
      },
      ...options,
    });

    logLine(`> status ${res.status}`);

    const contentType = res.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const msg =
        typeof data === "string"
          ? data
          : data.message || data.error || "Request falló";
      throw new Error(`${res.status} ${msg}`);
    }

    return data;
  } catch (err) {
    logLine(`> ERROR: ${err.message}`);
    throw err;
  } finally {
    setBusy(false);
  }
}

// ----------------------------------------
// AUTH & SESSIONS
// ----------------------------------------

el("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  try {
    const data = await apiFetch("/sessions/login", { method: "POST", body: JSON.stringify(payload) });
    setToken(data.token);
    setOutput(el("authOutput"), data);
  } catch (err) {
    setOutput(el("authOutput"), String(err.message || err));
  }
});

el("btnCurrent")?.addEventListener("click", async () => {
  try {
    const data = await apiFetch("/sessions/current", { method: "GET" });
    setOutput(el("authOutput"), data);
  } catch (err) {
    setOutput(el("authOutput"), String(err.message || err));
  }
});

el("btnLogout")?.addEventListener("click", () => {
  setToken("");
  setOutput(el("authOutput"), "Logout local (se borró el token del navegador).");
});

el("forgotForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  try {
    const data = await apiFetch("/sessions/forgot-password", { method: "POST", body: JSON.stringify(payload) });
    setOutput(el("authOutput"), data);
  } catch(err) {
    setOutput(el("authOutput"), String(err.message || err));
  }
});

el("resetForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  try {
    const data = await apiFetch("/sessions/reset-password", { method: "POST", body: JSON.stringify(payload) });
    setOutput(el("authOutput"), data);
  } catch(err) {
    setOutput(el("authOutput"), String(err.message || err));
  }
});


// ----------------------------------------
// USERS CRUD
// ----------------------------------------

async function loadUsers() {
  const tbody = el("usersTbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;

  try {
    const data = await apiFetch("/users", { method: "GET" });
    const users = data.users || [];

    if (!users.length) {
      tbody.innerHTML = `<tr><td colspan="5">No hay usuarios</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map((u) => {
      const cartId = u.cart?._id || u.cart || "-";
      return `<tr>
        <td class="text-break">${u.email}</td>
        <td>${u.first_name} ${u.last_name}</td>
        <td><span class="badge text-bg-secondary">${u.role}</span></td>
        <td class="text-end font-monospace small"><a href="#" onclick="copyCartId('${cartId}'); return false;">${cartId}</a></td>
        <td class="text-end">
          <button class="btn btn-outline-primary btn-sm" data-pick-user="${u._id}">Elegir</button>
        </td>
      </tr>`;
    }).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">${String(err.message || err)}</td></tr>`;
  }
}

window.copyCartId = (id) => {
   const ac = el("activeCartId");
   if(ac) ac.value = id;
   
   // jump to carts tab
   const tab = new bootstrap.Tab(el("carts-tab"));
   tab.show();
}

function setSelectedUser(user) {
  const form = el("userForm");
  if (!form) return;

  form.uid.value = user?._id || "";
  form.first_name.value = user?.first_name || "";
  form.last_name.value = user?.last_name || "";
  form.email.value = user?.email || "";
  form.age.value = user?.age ?? "";
  form.role.value = user?.role || "user";
  form.password.value = "";

  const hasSel = !!user?._id;
  el("btnUpdateUser").disabled = !hasSel;
  el("btnDeleteUser").disabled = !hasSel;
  el("btnCreateUser").disabled = hasSel;
  
  if(!hasSel) {
    el("btnUpdateUser").setAttribute('data-keep-disabled', 'true');
    el("btnDeleteUser").setAttribute('data-keep-disabled', 'true');
  } else {
    el("btnUpdateUser").removeAttribute('data-keep-disabled');
    el("btnDeleteUser").removeAttribute('data-keep-disabled');
  }
}

el("btnClearSel")?.addEventListener("click", () => {
  setSelectedUser(null);
  clearLog();
});

el("btnRefresh")?.addEventListener("click", loadUsers);

el("usersTbody")?.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-pick-user]");
  if (!btn) return;
  const uid = btn.getAttribute("data-pick-user");
  try {
    const data = await apiFetch(`/users/${uid}`, { method: "GET" });
    setSelectedUser(data.user);
    logLine("Usuario cargado en form");
  } catch (err) {}
});

el("userForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  delete payload.uid;

  if (payload.age) payload.age = Number(payload.age);
  if (!payload.password) delete payload.password;

  try {
    await apiFetch("/sessions/register", { method: "POST", body: JSON.stringify(payload) });
    form.reset();
    await loadUsers();
  } catch (err) {}
});

el("btnUpdateUser")?.addEventListener("click", async () => {
  const form = el("userForm");
  const uid = form?.uid?.value;
  if (!uid) return;

  const payload = Object.fromEntries(new FormData(form).entries());
  delete payload.uid;
  if (payload.age) payload.age = Number(payload.age);
  if (!payload.password) delete payload.password;

  try {
    await apiFetch(`/users/${uid}`, { method: "PUT", body: JSON.stringify(payload) });
    await loadUsers();
  } catch (err) {}
});

el("btnDeleteUser")?.addEventListener("click", async () => {
  const uid = el("userForm")?.uid?.value;
  if (!uid) return;

  if (!confirm("¿Seguro que querés eliminar?")) return;
  try {
    await apiFetch(`/users/${uid}`, { method: "DELETE" });
    setSelectedUser(null);
    await loadUsers();
  } catch (err) {}
});


// ----------------------------------------
// PRODUCTS CRUD
// ----------------------------------------

async function loadProducts() {
  const tbody = el("productsTbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;

  try {
    const data = await apiFetch("/products", { method: "GET" });
    const prods = data.products || [];

    if (!prods.length) {
       tbody.innerHTML = `<tr><td colspan="5">No hay productos</td></tr>`;
       return;
    }

    tbody.innerHTML = prods.map(p => `<tr>
       <td><span class="badge text-bg-warning">${p.code}</span></td>
       <td>${p.title}</td>
       <td>$${p.price}</td>
       <td>${p.stock}</td>
       <td class="text-end">
          <button class="btn btn-outline-primary btn-sm" data-pick-product="${p._id}">Elegir</button>
       </td>
    </tr>`).join('');
  } catch(err) {
    tbody.innerHTML = `<tr><td colspan="5">${String(err.message || err)}</td></tr>`;
  }
}

function setSelectedProduct(p) {
  const form = el("productForm");
  if (!form) return;

  form.pid.value = p?._id || "";
  form.title.value = p?.title || "";
  form.description.value = p?.description || "";
  form.price.value = p?.price || "";
  form.stock.value = p?.stock || "";
  form.category.value = p?.category || "";
  form.code.value = p?.code || "";

  const hasSel = !!p?._id;
  el("btnUpdateProduct").disabled = !hasSel;
  el("btnDeleteProduct").disabled = !hasSel;
  el("btnCreateProduct").disabled = hasSel;
  
  if(!hasSel) {
    el("btnUpdateProduct").setAttribute('data-keep-disabled', 'true');
    el("btnDeleteProduct").setAttribute('data-keep-disabled', 'true');
  } else {
    el("btnUpdateProduct").removeAttribute('data-keep-disabled');
    el("btnDeleteProduct").removeAttribute('data-keep-disabled');
  }
}

el("btnClearSelProduct")?.addEventListener("click", () => setSelectedProduct(null));
el("btnRefreshProducts")?.addEventListener("click", loadProducts);

el("productsTbody")?.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-pick-product]");
  if (!btn) return;
  const pid = btn.getAttribute("data-pick-product");
  
  el("productIdToAdd").value = pid; // auto-fill for cart testing

  try {
    const data = await apiFetch(`/products/${pid}`, { method: "GET" });
    setSelectedProduct(data.product);
  } catch (err) {}
});

el("productForm")?.addEventListener("submit", async(e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  delete payload.pid;
  payload.price = Number(payload.price);
  payload.stock = Number(payload.stock);

  try {
    const data = await apiFetch("/products", { method: "POST", body: JSON.stringify(payload) });
    setOutput(el("productOutput"), data);
    e.target.reset();
    await loadProducts();
  } catch(err) {
    setOutput(el("productOutput"), String(err.message || err));
  }
});

el("btnUpdateProduct")?.addEventListener("click", async() => {
  const form = el("productForm");
  const pid = form.pid.value;
  if(!pid) return;

  const payload = Object.fromEntries(new FormData(form).entries());
  delete payload.pid;
  payload.price = Number(payload.price);
  payload.stock = Number(payload.stock);

  try {
    const data = await apiFetch(`/products/${pid}`, { method: "PUT", body: JSON.stringify(payload) });
    setOutput(el("productOutput"), data);
    await loadProducts();
  } catch(err) {
    setOutput(el("productOutput"), String(err.message || err));
  }
});

el("btnDeleteProduct")?.addEventListener("click", async() => {
  const form = el("productForm");
  const pid = form.pid.value;
  if(!pid) return;

  if(!confirm("¿Borrar este producto?")) return;

  try {
    const data = await apiFetch(`/products/${pid}`, { method: "DELETE" });
    setOutput(el("productOutput"), data);
    setSelectedProduct(null);
    await loadProducts();
  } catch(err) {
    setOutput(el("productOutput"), String(err.message || err));
  }
});

// ----------------------------------------
// CARTS (Purchase / Add)
// ----------------------------------------

async function loadCartContent(cid) {
   if(!cid) return;
   const tbody = el("cartTbody");
   if(!tbody) return;

   tbody.innerHTML = `<tr><td colspan="4">Cargando...</td></tr>`;

   try {
     const data = await apiFetch(`/carts/${cid}`);
     const products = data.cart?.products || [];

     if(!products.length) {
        tbody.innerHTML = `<tr><td colspan="4">Carrito vacío</td></tr>`;
        return;
     }

     tbody.innerHTML = products.map(item => {
        const p = item.product || {};
        const st = (p.price || 0) * item.quantity;
        return `<tr>
           <td>${p.title || 'Error/Borrado'}</td>
           <td>$${p.price || 0}</td>
           <td>${item.quantity}</td>
           <td>$${st.toFixed(2)}</td>
        </tr>`;
     }).join('');

   } catch(err) {
     tbody.innerHTML = `<tr><td colspan="4">${String(err.message || err)}</td></tr>`;
   }
}

el("btnLoadCart")?.addEventListener("click", () => {
   const cid = el("activeCartId")?.value;
   if(cid) loadCartContent(cid);
});

el("btnAddProductToCart")?.addEventListener("click", async() => {
   const cid = el("activeCartId")?.value;
   const pid = el("productIdToAdd")?.value;
   if(!cid || !pid) return alert("Falta Cart ID o Product ID");

   try {
     const data = await apiFetch(`/carts/${cid}/products/${pid}`, { method: "POST" });
     setOutput(el("cartOutput"), data);
     loadCartContent(cid);
   } catch(err) {
     setOutput(el("cartOutput"), String(err.message || err));
   }
});

el("btnPurchaseCart")?.addEventListener("click", async() => {
   const cid = el("activeCartId")?.value;
   if(!cid) return alert("Falta Cart ID");

   if(!confirm("¿Realizar compra final (checkout)?")) return;

   try {
     const data = await apiFetch(`/carts/${cid}/purchase`, { method: "POST" });
     setOutput(el("cartOutput"), data);
     loadCartContent(cid); // refresh cart to see what remained
     loadProducts(); // refresh products to see new stock
   } catch(err) {
     setOutput(el("cartOutput"), String(err.message || err));
   }
});


document.addEventListener("DOMContentLoaded", () => {
  clearLog();
  logLine("> App lista");
  setSelectedUser(null);
  setSelectedProduct(null);
  syncAuthUI();
  
  loadUsers();
  loadProducts();
});
