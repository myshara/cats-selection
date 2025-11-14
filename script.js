const numCats = 10;
let cats = [];
let currentIndex = 0;
let liked = [];

// --- Button Event Listeners ---

document.getElementById("start-btn").addEventListener("click", () => {
    document.getElementById("welcome-screen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    document.getElementById("controls").style.display = "flex"; 
    document.getElementById("summary").classList.add("hidden");
    document.getElementById("stack").classList.remove("hidden");
    loadCats();
});

document.getElementById("back-btn").addEventListener("click", () => {
    document.getElementById("app").classList.add("hidden");
    document.getElementById("welcome-screen").classList.remove("hidden");

    cats = [];
    liked = [];
    currentIndex = 0;

    // reset UI
    document.getElementById("controls").style.display = "flex";
    document.getElementById("stack").classList.remove("hidden");
});

document.getElementById("restart-btn").addEventListener("click", () => {
    liked = [];
    cats = [];
    currentIndex = 0;

    document.getElementById("summary").classList.add("hidden");
    document.getElementById("stack").classList.remove("hidden");
    document.getElementById("controls").style.display = "flex"; 

    loadCats();
});

document.getElementById("back-home-btn").addEventListener("click", () => {
    document.getElementById("summary").classList.add("hidden");
    document.getElementById("app").classList.add("hidden");
    document.getElementById("welcome-screen").classList.remove("hidden");

    liked = [];
    cats = [];
    currentIndex = 0;

    // restore UI for next visit
    document.getElementById("controls").style.display = "flex";
    document.getElementById("stack").classList.remove("hidden");
});

document.getElementById("reload-btn").addEventListener("click", () => {
    cats = [];
    liked = [];
    currentIndex = 0;

    document.getElementById("summary").classList.add("hidden");
    document.getElementById("stack").classList.remove("hidden");
    document.getElementById("controls").style.display = "flex";

    loadCats();
});

// --- Main Functions ---

function loadCats() {
    cats = []; 
    for (let i = 0; i < numCats; i++) {
        cats.push(`https://cataas.com/cat?t=${Date.now()}${i}`);
    }
    renderStack();
}

function renderStack() {
    const stack = document.getElementById("stack");
    stack.innerHTML = "";
    const maxVisible = 3;

    for (let i = currentIndex; i < Math.min(currentIndex + maxVisible, cats.length); i++) {
        const card = document.createElement("div");
        card.className = "card";
        card.style.zIndex = cats.length - i;

        const offset = i - currentIndex;
        const baseTransform = `translateY(${offset * 12}px)`;
        card.dataset.baseTransform = baseTransform;
        card.style.transform = baseTransform;

        const img = document.createElement("img");
        img.src = cats[i];
        card.appendChild(img);

        const likeText = document.createElement("div");
        likeText.textContent = "LIKE ❤️";
        likeText.className = "feedback like";
        card.appendChild(likeText);

        const nopeText = document.createElement("div");
        nopeText.textContent = "NOPE 💔";
        nopeText.className = "feedback dislike";
        card.appendChild(nopeText);

        stack.appendChild(card);
    }

    if (currentIndex < cats.length) {
        addSwipeListener(stack.firstChild);
    } else {
        showSummary();
    }
}

function addSwipeListener(card) {
    let startX = 0, currentX = 0;
    let isDragging = false;
    const likeText = card.querySelector(".like");
    const nopeText = card.querySelector(".dislike");

    const updateTransform = (deltaX) => {
        const rotate = deltaX * 0.05;
        card.style.transform = `${card.dataset.baseTransform} translateX(${deltaX}px) rotate(${rotate}deg)`;
        const opacity = Math.min(Math.abs(deltaX) / 80, 1);
        likeText.style.opacity = deltaX > 0 ? opacity : 0;
        nopeText.style.opacity = deltaX < 0 ? opacity : 0;
    };

    const animateOut = (direction) => {
        const translateX = direction === "right" ? "120vw" : "-120vw";
        const rotate = direction === "right" ? 25 : -25;
        card.style.transition = "transform 1s ease-in-out";
        card.style.transform = `translateX(${translateX}) rotate(${rotate}deg)`;

        setTimeout(() => {
            currentIndex++;
            if (currentIndex >= cats.length) {
                showSummary();
            } else {
                renderStack();
            }
        }, 1000);
    };

    const handleSwipe = (deltaX) => {
        const threshold = 100;
        if (deltaX > threshold) {
            liked.push(cats[currentIndex]);
            animateOut("right");
            return true;
        } else if (deltaX < -threshold) {
            animateOut("left");
            return true;
        }
        return false;
    };

    const start = (x) => { startX = x; isDragging = true; card.style.transition = "none"; };
    const move = (x) => { 
        if (isDragging) { 
            const deltaX = x - startX; 
            updateTransform(deltaX); 
            if (handleSwipe(deltaX)) isDragging = false; 
        } 
    };
    const end = () => { 
        if (isDragging) { 
            card.style.transition = "transform 0.4s ease"; 
            card.style.transform = card.dataset.baseTransform; 
        } 
        isDragging = false; 
    };

    card.addEventListener("touchstart", e => start(e.touches[0].clientX));
    card.addEventListener("touchmove", e => move(e.touches[0].clientX));
    card.addEventListener("touchend", end);
    card.addEventListener("mousedown", e => start(e.clientX));
    window.addEventListener("mousemove", e => move(e.clientX));
    window.addEventListener("mouseup", end);
}

function showSummary() {
    document.getElementById("stack").classList.add("hidden");
    document.getElementById("controls").style.display = "none"; 
    const summary = document.getElementById("summary");
    summary.classList.remove("hidden");

    document.getElementById("count").textContent = liked.length;
    const likedCats = document.getElementById("liked-cats");
    likedCats.innerHTML = "";

    liked.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.className = "liked-img";
        likedCats.appendChild(img);
    });
}
