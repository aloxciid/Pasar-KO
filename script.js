/****************************************************
 DATU SASAK MARKET - script.js
****************************************************/

/*=========================================
 PENGHUBUNG KE APPS SCRIPT
 Tempel URL Web App (berakhiran /exec) di bawah ini.
 Bagian ini menggantikan google.script.run, jadi
 semua kode di bawahnya tidak perlu diubah.
=========================================*/

const API_URL = "PASTE_URL_WEB_APP_DISINI/exec";

function createRunner(onOk, onFail){

    return new Proxy({}, {

        get: function(_, name){

            if(name === "withSuccessHandler"){
                return function(fn){ return createRunner(fn, onFail); };
            }

            if(name === "withFailureHandler"){
                return function(fn){ return createRunner(onOk, fn); };
            }

            return function(){

                const args = Array.prototype.slice.call(arguments);

                const url = API_URL +
                    "?aksi=" + encodeURIComponent(String(name)) +
                    "&args=" + encodeURIComponent(JSON.stringify(args));

                fetch(url)
                .then(function(r){ return r.json(); })
                .then(function(res){ if(onOk) onOk(res); })
                .catch(function(err){

                    console.error(err);

                    if(onFail){
                        onFail(err);
                    }else{
                        alert("Gagal memuat data. Coba refresh halaman.");
                    }

                });

            };

        }

    });

}

const google = { script: { run: createRunner(null, null) } };


/*=========================================
 VARIABLE
=========================================*/

let currentPage = "home";
let currentData = [];
let filteredData = [];
let currentMenu = "";
let websiteConfig = {};

// Pagination
let currentPaginationPage = 1;
const ITEMS_PER_PAGE = 16;

window.onload = function(){

    initialize();

};


/*=========================================
INITIALIZE
=========================================*/

function initialize(){

    bindNavigation();
    bindSearch();
    loadWebMenu();
    loadHome();
    hideLoading();

}


/*=========================================
LOADING
=========================================*/

function hideLoading(){

    setTimeout(function(){

        document.getElementById("loading").style.display="none";

    },500);

}

function showLoading(){

    document.getElementById("app").innerHTML=`

        <div class="loading-page">

            <div class="loader"></div>

            <h2>Sabar Bentar KING!! 🗿🗿🗿🗿🗿</h2>

            <p>☆*: .｡. o(≧▽≦)o .｡.:*☆</p>

        </div>

    `;

}


/*=========================================
NAVIGATION
=========================================*/

function bindNavigation(){

    document.querySelectorAll(".nav-btn").forEach(function(btn){

        btn.onclick=function(){

            document.querySelectorAll(".nav-btn").forEach(function(b){

                b.classList.remove("active");

            });

            btn.classList.add("active");

            navigate(btn.dataset.page);

        };

    });

}

function navigate(page){

    currentPage=page;

    switch(page){

        case "info": loadInfo(); break;
        case "home": loadHome(); break;
        case "akun": loadAkun(); break;
        case "equipment": loadEquipment(); break;
        case "matmed": loadMatmed(); break;
        case "mutiara": loadMutiara(); break;
        case "batu": loadBatu(); break;
        case "jasa": loadJasa(); break;
        case "blacklist": loadBlacklist(); break;

    }

}


/*=========================================
SEARCH
=========================================*/

function bindSearch(){

    document
    .getElementById("globalSearch")
    .addEventListener("keyup",function(){

        searchLocal(this.value);

    });

}

function searchLocal(keyword){

    keyword = keyword.toLowerCase();

    filteredData = currentData.filter(function(item){

        return JSON.stringify(item)
        .toLowerCase()
        .includes(keyword);

    });

    currentPaginationPage = 1;

    renderCurrent();

}


/*=========================================
HOME
=========================================*/

function loadHome(){

    showLoading();

    google.script.run

    .withSuccessHandler(function(res){

        renderHome(res.data);

    })

    .getDashboard();

}

function renderHome(data){

    document.getElementById("app").innerHTML=`

    <div class="dashboard">

        <div class="dashboard-card">
            <h2>Ready, Jual Akun</h2>
            <h1>${data.akun}</h1>
        </div>

        <div class="dashboard-card">
            <h2>Equipment</h2>
            <h1>${data.equipment}</h1>
        </div>

        <div class="dashboard-card">
            <h2>MatMed</h2>
            <h1>${data.matmed}</h1>
        </div>

        <div class="dashboard-card">
            <h2>Mutiara</h2>
            <h1>${data.mutiara}</h1>
        </div>

        <div class="dashboard-card">
            <h2>MatStarry</h2>
            <h1>${data.batu}</h1>
        </div>

        <div class="dashboard-card">
            <h2>Jasa Perantara JB</h2>
            <h1>${data.jasa}</h1>
        </div>

        <div class="dashboard-card">
            <h2>Blacklist Penipu</h2>
            <h1>${data.blacklist}</h1>
        </div>

    </div>

    `;

}


/*=========================================
RENDER CURRENT
=========================================*/

function renderCurrent(){

    switch(currentMenu){

        case "info": renderInfo(filteredData); break;
        case "akun": renderAkun(filteredData); break;
        case "equipment": renderEquipment(filteredData); break;
        case "matmed": renderMatmed(filteredData); break;
        case "mutiara": renderMutiara(filteredData); break;
        case "batu": renderBatu(filteredData); break;
        case "jasa": renderJasa(filteredData); break;
        case "blacklist": renderBlacklist(filteredData); break;

    }

}


/*=========================================
PAGINATION
=========================================*/

function getPageData(data){

    const start = (currentPaginationPage - 1) * ITEMS_PER_PAGE;

    return data.slice(start, start + ITEMS_PER_PAGE);

}

function getPaginationHTML(data){

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    if(totalPages<=1) return "";

    let html = '<div class="pagination">';

    if(currentPaginationPage>1){

        html += `
        <button onclick="changePage(${currentPaginationPage-1})">
            ⬅ Prev
        </button>
        `;

    }

    html += `
        <span class="page-info">
            Pages ${currentPaginationPage} / ${totalPages}
        </span>
    `;

    if(currentPaginationPage<totalPages){

        html += `
        <button onclick="changePage(${currentPaginationPage+1})">
            Next ➡
        </button>
        `;

    }

    html += '</div>';

    return html;

}

function changePage(page){

    currentPaginationPage = page;

    renderCurrent();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/*=========================================
LOAD MENU (HEADER + LINK WHATSAPP)
=========================================*/

function loadWebMenu(){

    google.script.run

    .withSuccessHandler(function(res){

        const d = res.data;

        websiteConfig = d;

        // HEADER WEBSITE
        document.querySelector(".logo h1").innerHTML = d.NAMA_LAPAK;

        document.querySelector(".logo small").innerHTML = d.SUB_LAPAK;

        let icon = document.querySelector(".logo-icon");

        if(d.IMAGE){

            icon.innerHTML = `
                <img src="${d.IMAGE_URL}"
                style="
                width:${d.LOGO_SIZE}px;
                height:${d.LOGO_SIZE}px;
                object-fit:contain;
                ">
            `;

        }else if(d.ICON){

            icon.innerHTML = d.ICON;

        }

        // WHATSAPP FOOTER
        const wa = "https://wa.me/" + d.NO_WA;

        document.getElementById("waTitip").href =
            wa +
            "?text=" +
            encodeURIComponent(
`TUKK, BISA BANTU TITIP JUAL AKUN?
NANTI LU ADA PERSENAN KOK XD....

GAME :
JOB :
NAMA AKUN :
LV.
OPEN HARGA :
DESKRIPSI PENJUAL :`
        );

        document.getElementById("waJasa").href =
            wa +
            "?text=" +
            encodeURIComponent(
`TUKK, BISA BANTU PERANTARA?.`
        );

        document.getElementById("waLapor").href =
            wa +
            "?text=" +
            encodeURIComponent(
`NAMA AKUN PENIPU :

SOSMED PENIPU :

KONTAK PENIPU :

AKUN PELAPOR :

SOSMED PELAPOR :

DESKRIPSI KASUS :

KERUGIAN YANG DI TIMBULKAN :`
        );

    })

    .getWebMenu();

}


/*=========================================
LOAD DATA PER MENU
=========================================*/

function loadAkun(){

    currentMenu="akun";
    currentPaginationPage = 1;
    showLoading();

    google.script.run
    .withSuccessHandler(function(res){

        currentData=res.data;
        filteredData=[...currentData];

        renderAkun(filteredData);

    })
    .getAkun();

}

function loadEquipment(){

    currentMenu="equipment";
    currentPaginationPage = 1;
    showLoading();

    google.script.run
    .withSuccessHandler(function(res){

        currentData=res.data;
        filteredData=[...currentData];

        renderEquipment(filteredData);

    })
    .getEquipment();

}

function loadMatmed(){

    currentMenu="matmed";
    currentPaginationPage = 1;
    showLoading();

    google.script.run
    .withSuccessHandler(function(res){

        currentData=res.data;
        filteredData=[...currentData];

        renderMatmed(filteredData);

    })
    .getMatmed();

}

function loadMutiara(){

    currentMenu="mutiara";
    currentPaginationPage = 1;
    showLoading();

    google.script.run
    .withSuccessHandler(function(res){

        currentData=res.data;
        filteredData=[...currentData];

        renderMutiara(filteredData);

    })
    .getMutiara();

}

function loadBatu(){

    currentMenu="batu";
    currentPaginationPage = 1;
    showLoading();

    google.script.run
    .withSuccessHandler(function(res){

        currentData=res.data;
        filteredData=[...currentData];

        renderBatu(filteredData);

    })
    .getBatu();

}

function loadJasa(){

    currentMenu="jasa";
    currentPaginationPage = 1;
    showLoading();

    google.script.run
    .withSuccessHandler(function(res){

        currentData=res.data;
        filteredData=[...currentData];

        renderJasa(filteredData);

    })
    .getJasa();

}

function loadBlacklist(){

    currentMenu="blacklist";
    currentPaginationPage = 1;
    showLoading();

    google.script.run
    .withSuccessHandler(function(res){

        currentData=res.data;
        filteredData=[...currentData];

        renderBlacklist(filteredData);

    })
    .getBlacklist();

}

function loadInfo(){

    currentMenu="info";
    currentPaginationPage=1;
    showLoading();

    google.script.run
    .withSuccessHandler(function(res){

        currentData=res.data;
        filteredData=[...currentData];

        renderInfo(filteredData);

    })
    .getWebInfo();

}


/*=========================================
CARD GENERATOR
=========================================*/

function createCard(item,title,subtitle,price,status,buyButton=""){

return `

<div class="card" data-id="${item.ID}">

    <div class="card-image">

        <img src="${item.IMAGE_URL || 'https://placehold.co/400x400?text=No+Image'}">

    </div>

    <div class="card-body">

        <div class="card-title">
            ${title}
        </div>

        <div class="card-info">
            ${subtitle}
        </div>

        <div class="card-price">
            ${price}
        </div>

        <div class="card-action">

            <span class="badge ${status.toLowerCase().replace(/\s+/g,'-')}">
                ${status}
            </span>

            ${buyButton}

        </div>

    </div>

</div>

`;

}


/*=========================================
BUY WHATSAPP
=========================================*/

function createBuyButton(menu,namaBarang){

    const nomor =
        websiteConfig.NO_WA || "6287731011961";

    let pesan="";

    if(menu==="Akun"){

        pesan =
        "Bos... Gua mau beli " +
        menu +
        " " +
        namaBarang +
        " bisa?";

    }else{

        pesan =
        "Bos... Gua mau beli " +
        menu +
        " " +
        namaBarang +
        " bisa?, kapan bisa ke BL?";

    }

    const url =
        "https://wa.me/" +
        nomor +
        "?text=" +
        encodeURIComponent(pesan);

    return `

        <a
            href="${url}"
            target="_blank"
            class="btn-buy"
            onclick="event.stopPropagation();">

            🛒 Buy

        </a>

    `;

}


/*=========================================
RENDER
=========================================*/

function renderInfo(data){

    if(data.length===0){

        document.getElementById("app").innerHTML=
        '<div class="empty">Belum Ada Informasi KING!!</div>';

        return;

    }

    const pageData=getPageData(data);

    let html='<div class="grid">';

    pageData.forEach(function(item){

        html+=createCard(

            item,

            item.JUDUL_INFO,

            item.NB,

            "Baca selengkapnya...",

            ""

        );

    });

    html+='</div>';

    html+=getPaginationHTML(data);

    document.getElementById("app").innerHTML=html;

    document.querySelectorAll(".card").forEach(function(card){

        card.onclick=function(){

            showInfo(this.dataset.id);

        };

    });

}

function renderAkun(data){

    if(data.length===0){

        document.getElementById("app").innerHTML=
        '<div class="empty">Wadduhh Kosong KING!! | Kalau Mau titip Bisa hubungin Datuk</div>';

        return;

    }

    const pageData=getPageData(data);

    let html='<div class="grid">';

    pageData.forEach(function(item){

        html+=createCard(

            item,

            item.NAMA_AKUN,

            "Job : "+item.JOB+" | Lv."+item.LEVEL,

            "Rp "+Number(item.OPEN_HARGA).toLocaleString("id-ID"),

            "READY",

            createBuyButton("Akun", item.NAMA_AKUN+" Lv."+item.LEVEL+" Yang Harga Rp. "+item.OPEN_HARGA+" itu")

        );

    });

    html+='</div>';

    html+=getPaginationHTML(data);

    document.getElementById("app").innerHTML=html;

    document.querySelectorAll(".card").forEach(function(card){

        card.onclick=function(){

            showAkun(this.dataset.id);

        };

    });

}

function renderEquipment(data){

    if(data.length===0){

        document.getElementById("app").innerHTML=
        '<div class="empty">Wadduhh Kosong KING!!🗿🗿🗿</div>';

        return;

    }

    const pageData = getPageData(data);

    let html='<div class="grid">';

    pageData.forEach(function(item){

        html += createCard(

            item,

            item.NAMA_ITEM+ ", Lv."+item.LEVEL,

            item.JOB+" | "+item.TIPE_ITEM,

            Number(item.PRICE).toLocaleString("id-ID")+" Gold",

            item.KESIAPAN,

            createBuyButton("Equip", item.NAMA_ITEM + " Lv."+item.LEVEL+" Harga "+item.PRICE)

        );

    });

    html += "</div>";

    html += getPaginationHTML(data);

    document.getElementById("app").innerHTML = html;

}

function renderMatmed(data){

    if(data.length===0){

        document.getElementById("app").innerHTML=
        '<div class="empty">Wadduhh Kosong KING!!🗿🗿🗿</div>';

        return;

    }

    const pageData = getPageData(data);

    let html='<div class="grid">';

    pageData.forEach(function(item){

        html+=createCard(

            item,

            item.NAMA,

            "STOK "+item.STOK+" PCS",

            Number(item.HARGA).toLocaleString("id-ID")+" Gold/PCS",

            item.KESIAPAN,

            createBuyButton("MatMed", item.NAMA+" Yang Harga "+item.HARGA+"/PCS ")

        );

    });

    html+='</div>';

    html+=getPaginationHTML(data);

    document.getElementById("app").innerHTML=html;

}

function renderMutiara(data){

    if(data.length===0){

        document.getElementById("app").innerHTML=
        '<div class="empty">Wadduhh Kosong KING!!🗿🗿🗿</div>';

        return;

    }

    const pageData=getPageData(data);

    let html='<div class="grid">';

    pageData.forEach(function(item){

        html+=createCard(

            item,

            item.NAMA,

            "STOK "+item.STOK+" PCS",

            Number(item.HARGA).toLocaleString("id-ID")+" Gold/PCS",

            item.KESIAPAN,

            createBuyButton("Mutiara", item.NAMA+" Yang Harga "+item.HARGA+"/PCS ")

        );

    });

    html+='</div>';

    html+=getPaginationHTML(data);

    document.getElementById("app").innerHTML=html;

}

function renderBatu(data){

    if(data.length===0){

        document.getElementById("app").innerHTML=
        '<div class="empty">Wadduhh Kosong KING!!🗿🗿🗿</div>';

        return;

    }

    const pageData=getPageData(data);

    let html='<div class="grid">';

    pageData.forEach(function(item){

        html+=createCard(

            item,

            item.NAMA,

            "STOK "+item.STOK+" PCS",

            Number(item.HARGA).toLocaleString("id-ID")+" Gold/PCS",

            item.KESIAPAN,

            createBuyButton("MatStarry", item.NAMA+" Yang Harga "+item.HARGA+"/PCS ")

        );

    });

    html+='</div>';

    html+=getPaginationHTML(data);

    document.getElementById("app").innerHTML=html;

}

function renderJasa(data){

    if(data.length===0){

        document.getElementById("app").innerHTML=
        '<div class="empty">Wadduhh Kosong KING!! | Hubungi Datuk Kalau Mau Sewa Jasa Perantara</div>';

        return;

    }

    const pageData=getPageData(data);

    let html=`

    <table class="table">

        <thead>

            <tr>

                <th>No</th>
                <th>Transaksi</th>
                <th>Seller</th>
                <th>Buyer</th>
                <th>Item</th>
                <th>Harga</th>
                <th>Fee</th>
                <th>Status</th>

            </tr>

        </thead>

        <tbody>

    `;

    pageData.forEach(function(item){

        html+=`

        <tr>

            <td>${item.NO}</td>

            <td>${item.NAMA_TRANSAKSI}</td>

            <td>${item.SELLER}</td>

            <td>${item.BUYER}</td>

            <td>${item.ITEM}</td>

            <td>Rp ${Number(item.HARGA).toLocaleString("id-ID")}</td>

            <td>Rp ${Number(item["FEE 10%"]).toLocaleString("id-ID")}</td>

            <td>${item.STATUS}</td>

        </tr>

        `;

    });

    html+=`

        </tbody>

    </table>

    `;

    html+=getPaginationHTML(data);

    document.getElementById("app").innerHTML=html;

}

function renderBlacklist(data){

    if(data.length===0){

        document.getElementById("app").innerHTML=
        '<div class="empty">Wadduhh Kosong KING!! | Silahkan Lapor Datuk dan Lengkapi data yang diminta kalau ada penipu</div>';

        return;

    }

    const pageData=getPageData(data);

    let html=`

    <table class="table">

        <thead>

            <tr>

                <th>No</th>
                <th>Akun Penipu</th>
                <th>Kontak Penipu</th>
                <th>Pelapor</th>
                <th>Kerugian</th>
                <th>Detail</th>

            </tr>

        </thead>

        <tbody>

    `;

    pageData.forEach(function(item){

        html+=`

        <tr>

            <td>${item.NO}</td>

            <td>${item.NAMA_AKUN_BLACKLIST}</td>

            <td>${item.KONTAK_BLACKLIST}</td>

            <td>${item.AKUN_PELAPOR}</td>

            <td>${item["KERUGIAN YANG DI TIMBULKAN"]}</td>

            <td>

                <button class="btn btn-primary btn-detail"
                    data-id="${item.ID}">

                    Detail

                </button>

            </td>

        </tr>

        `;

    });

    html+=`

        </tbody>

    </table>

    `;

    html+=getPaginationHTML(data);

    document.getElementById("app").innerHTML=html;

    document.querySelectorAll(".btn-detail").forEach(function(btn){

        btn.onclick=function(){

            showBlacklist(this.dataset.id);

        };

    });

}


/*=========================================
DETAIL BLACKLIST
=========================================*/

function showBlacklist(id){

    google.script.run

    .withSuccessHandler(function(res){

        const d=res.data;

        document.getElementById("modalBody").innerHTML=`

        <h2>${d.NAMA_AKUN_BLACKLIST}</h2>

        <br>

        <b>Sosmed Penipu :</b>

        ${d.SOSMED_BLACKLIST}

        <br><br>

        <b>Kontak Penipu :</b>

        ${d.KONTAK_BLACKLIST}

        <br><br>

        <b>Akun Pelapor :</b>

        ${d.AKUN_PELAPOR}

        <br><br>

        <b>Sosmed Pelapor :</b>

        <br>

        ${d.SOSMED_PELAPOR}

        <br><br>

        <b>Deskripsi :</b>

        <br>

        ${d.DESKRIPSI_KASUS}

        <br><br>

        <b>Kerugian :</b>

        ${d["KERUGIAN YANG DI TIMBULKAN"]}

        `;

        document.getElementById("modal").style.display="flex";

    })

    .getDetailBlacklist(id);

}


/*=========================================
DETAIL AKUN
=========================================*/

function showAkun(id){

    // Tampilkan modal
    document.getElementById("modal").style.display = "flex";

    // Loading di dalam modal
    document.getElementById("modalBody").innerHTML = `
    <div style="
    text-align:center;
    padding:60px 20px;
    ">

    <div class="loader" style="margin:0 auto 20px;"></div>

    <h2>Sabar Bentar KING!! 🗿</h2>

    <p>😍😍😍</p>

    </div>
    `;

    google.script.run

    .withSuccessHandler(function(res){

        if(!res.success){
            alert("Data tidak ditemukan!");
            return;
        }

        const d = res.data;

        document.getElementById("modalBody").innerHTML = `

            <img src="${d.IMAGE_URL}"
                 style="width:100%;border-radius:12px;margin-bottom:20px;">

            <h2>${d.NAMA_AKUN}</h2>

            <br>

            <b>🎮 Game</b><br>
            ${d.GAME}

            <br><br>

            <b>⚔ Job</b><br>
            ${d.JOB}

            <br><br>

            <b>⭐ Level</b><br>
            ${d.LEVEL}

            <br><br>

            <b>💰 Harga</b><br>
            Rp ${Number(d.OPEN_HARGA).toLocaleString("id-ID")}

            <br><br>

            <b>📝 Deskripsi</b><br>
            ${d.DESKRIPSI_SELLER}

        `;

        document.getElementById("modal").style.display = "flex";

    })

    .getDetailAkun(id);

}


/*=========================================
DETAIL INFO
=========================================*/

function showInfo(id){

    document.getElementById("modal").style.display="flex";

    document.getElementById("modalBody").innerHTML=`

    <div class="loading-page">

        <div class="loader"></div>

        <h2>Sabar KING</h2>

    </div>

    `;

    google.script.run

    .withSuccessHandler(function(res){

        const d=res.data;

        document.getElementById("modalBody").innerHTML=`

        <img src="${d.IMAGE_URL}"
        style="
        width:100%;
        max-height:500px;
        object-fit:contain;
        border-radius:12px;
        margin-bottom:20px;
        ">

        <h2>${d.JUDUL_INFO}</h2>

        <br>

        <p>
        ${d.ISI_INFO}
        </p>

        <br>

        <small>
        ${d.NB}
        </small>

        `;

    })

    .getDetailWebInfo(id);

}


/*=========================================
MODAL
=========================================*/

document.getElementById("closeModal").onclick=function(){

    document.getElementById("modal").style.display="none";

}

window.onclick=function(e){

    if(e.target==document.getElementById("modal")){

        document.getElementById("modal").style.display="none";

    }

}
