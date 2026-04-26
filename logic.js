// ==========================================
// PHẦN 1: LOGIC TÍNH TOÁN
// ==========================================
const TarotLogic = {
    calculateLifePath: function (birthDate) {
        if (!birthDate) return 0;
        
        // CHUẨN THẦN SỐ HỌC: Cộng rã từng chữ số riêng lẻ trong ngày tháng năm sinh
        // Ví dụ: 1983-06-15 -> 1+9+8+3+0+6+1+5 = 33
        let sum = 0;
        for (let char of birthDate) {
            if (char !== '-') {
                sum += parseInt(char);
            }
        }
        
        // Rút gọn tổng cho đến khi về 1 chữ số, bỏ qua nếu là số Master (11, 22, 33)
        while (sum > 9) {
            if (sum === 11 || sum === 22 || sum === 33) {
                break;
            }
            
            let tempSum = 0;
            let sumStr = sum.toString();
            for (let char of sumStr) {
                tempSum += parseInt(char);
            }
            sum = tempSum;
        }
        return sum;
    },

    getLifePathDescription: function (number) {
        const descriptions = {
            1: "Bạn là người độc lập, kiên định và sinh ra để dẫn đầu. Bạn luôn muốn tự mình làm mọi thứ và không ngại thử thách mới.",
            2: "Bạn là người nhạy cảm, tinh tế và luôn trân trọng các mối quan hệ. Bạn thích sự hòa bình và thường là người hòa giải tuyệt vời.",
            3: "Bạn là người lạc quan, hóm hỉnh và có tâm hồn nghệ sĩ. Năng lượng của bạn luôn mang lại niềm vui cho mọi người xung quanh.",
            4: "Bạn là người có trách nhiệm, kỷ luật và cực kỳ thực tế. Bạn xây dựng cuộc sống dựa trên nền tảng vững chắc và sự an toàn.",
            5: "Bạn là người phóng khoáng, ghét sự ràng buộc và luôn khao khát trải nghiệm mới. Cuộc đời bạn là một chuyến phiêu lưu không hồi kết.",
            6: "Bạn là người giàu tình cảm, luôn đặt gia đình lên hàng đầu. Bạn thích chăm sóc, bao bọc và lan tỏa sự ấm áp đến người khác.",
            7: "Bạn là người bí ẩn, nội tâm và có tư duy sâu sắc. Bạn thích dành thời gian một mình để chiêm nghiệm về cuộc đời và tri thức.",
            8: "Bạn là người tham vọng, thực tế và có tố chất kinh doanh. Bạn luôn hướng tới thành công, tài chính và địa vị vững chắc.",
            9: "Bạn là người bao dung, vị tha và hướng thiện. Bạn luôn muốn cống hiến cho cộng đồng và giúp đỡ những hoàn cảnh khó khăn.",
            11: "Bạn sở hữu trực giác nhạy bén và khả năng thấu cảm đặc biệt. Sứ mệnh của bạn là truyền cảm hứng và khai sáng tinh thần cho người khác.",
            22: "Bạn có tầm nhìn xa trông rộng và khả năng hiện thực hóa những giấc mơ lớn lao. Bạn sinh ra để tạo nên những điều vĩ đại cho nhân loại.",
            33: "Bạn mang trong mình tình yêu thương vô điều kiện và năng lượng chữa lành mạnh mẽ. Sứ mệnh của bạn là giúp đỡ và nâng đỡ tâm hồn mọi người."
        };
        return descriptions[number] || "Số mệnh của bạn ẩn chứa nhiều điều bí ẩn chưa được khai phá.";
    },

    getZodiacSign: function (birthDate) {
        if (!birthDate) return "";
        const parts = birthDate.split('-');
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);

        if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "♒ Bảo Bình";
        if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "♓ Song Ngư";
        if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "♈ Bạch Dương";
        if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "♉ Kim Ngưu";
        if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "♊ Song Tử";
        if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "♋ Cự Giải";
        if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "♌ Sư Tử";
        if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "♍ Xử Nữ";
        if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "♎ Thiên Bình";
        if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "♏ Bọ Cạp";
        if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "♐ Nhân Mã";
        if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return "♑ Ma Kết";

        return "Không xác định";
    }
};

// ==========================================
// PHẦN 2: BIẾN TOÀN CỤC & SỰ KIỆN
// ==========================================
let drawnCards = [];
let currentCardIndices = [];
let isReversedCards = [];

document.addEventListener('DOMContentLoaded', function () {
    const birthDateInput = document.getElementById('birthDate');
    if (birthDateInput) {
        birthDateInput.addEventListener('change', handleBirthDateChange);
        birthDateInput.addEventListener('input', handleBirthDateChange);
    }

    const drawButton = document.getElementById('drawButton');
    if (drawButton) drawButton.addEventListener('click', showDrawingInterface);

    const finalDrawButton = document.getElementById('finalDrawButton');
    if (finalDrawButton) finalDrawButton.addEventListener('click', revealCards);

    const redrawButton = document.getElementById('redrawButton');
    if (redrawButton) redrawButton.addEventListener('click', resetToForm);
});

function handleBirthDateChange() {
    const birthDate = document.getElementById('birthDate').value;
    if (!birthDate) return;

    document.getElementById('zodiac').value = TarotLogic.getZodiacSign(birthDate);
    document.getElementById('lifePathNumber').value = `${TarotLogic.calculateLifePath(birthDate)}`;

    const drawButton = document.getElementById('drawButton');
    if (drawButton) {
        drawButton.disabled = false;
        drawButton.style.opacity = '1';
    }
}

// ==========================================
// PHẦN 3: GIAO DIỆN TRẢI BÀI (ARC SPREAD)
// ==========================================
function showDrawingInterface() {
    const birthDate = document.getElementById('birthDate').value;
    if (!birthDate) {
        alert('Vui lòng nhập ngày sinh của bạn!');
        return;
    }

    document.querySelector('.input-panel').style.display = 'none';
    document.getElementById('deckSection').style.display = 'block';
    document.getElementById('initialState').classList.add('hidden');

    currentCardIndices = [];
    isReversedCards = [];
    document.getElementById('finalDrawButton').style.display = 'none';

    for (let i = 1; i <= 3; i++) {
        const cardEl = document.getElementById(`drawCard${i}`);
        cardEl.innerHTML = `<div class="card-back" style="opacity: 0.3;">🔶</div>`;
        cardEl.classList.add('face-down', 'empty-slot');
    }

    renderArcSpread();
}

function renderArcSpread() {
    const container = document.getElementById('arcSpreadContainer');
    if (!container) return;
    container.innerHTML = '';

    const totalCards = 78;
    let deck = Array.from({ length: totalCards }, (_, i) => i);
    deck.sort(() => Math.random() - 0.5);

    deck.forEach((cardId, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'arc-card';
        cardEl.innerHTML = `<img src="images/card-back.jpg" alt="Mặt sau" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'card-back-mini\\'>🔶</div>';">`;

        const normalizedIdx = (index / (totalCards - 1)) - 0.5;
        const angle = normalizedIdx * 60;
        const yOffset = - (Math.pow(normalizedIdx * 2, 2)) * 50;
        const leftPos = 50 + (normalizedIdx * 90);

        cardEl.style.left = `${leftPos}%`;
        cardEl.style.transform = `translateX(-50%) translateY(${yOffset}px) rotate(${angle}deg)`;
        cardEl.style.zIndex = index;

        cardEl.dataset.origTransform = cardEl.style.transform;
        cardEl.dataset.origZ = index;

        cardEl.addEventListener('mouseenter', () => {
            if (!cardEl.classList.contains('picked')) {
                cardEl.style.transform = `translateX(-50%) translateY(${yOffset - 30}px) rotate(${angle}deg) scale(1.15)`;
                cardEl.style.zIndex = 100;
            }
        });
        cardEl.addEventListener('mouseleave', () => {
            if (!cardEl.classList.contains('picked')) {
                cardEl.style.transform = cardEl.dataset.origTransform;
                cardEl.style.zIndex = cardEl.dataset.origZ;
            }
        });

        cardEl.addEventListener('click', () => pickCardFromArc(cardEl, cardId));
        container.appendChild(cardEl);
    });
}

function pickCardFromArc(cardEl, cardId) {
    if (currentCardIndices.length >= 3 || cardEl.classList.contains('picked')) return;

    const position = currentCardIndices.length;
    currentCardIndices.push(cardId);
    isReversedCards.push(Math.random() > 0.5);

    cardEl.classList.add('picked');

    const slotEl = document.getElementById(`drawCard${position + 1}`);
    slotEl.classList.remove('empty-slot');
    slotEl.innerHTML = `<img src="images/card-back.jpg" alt="Mặt sau" class="card-img-back" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'card-back\\'>🔶</div>';">`;

    if (currentCardIndices.length === 3) {
        const btn = document.getElementById('finalDrawButton');
        btn.style.display = 'block';
        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ==========================================
// PHẦN 4: HIỂN THỊ KẾT QUẢ BÀI RÚT
// ==========================================
function getCardImage(card) {
    if (card.id !== undefined && card.id >= 0 && card.id <= 21) {
        const majors = [
            "Fool", "Magician", "High_Priestess", "Empress", "Emperor",
            "Hierophant", "Lovers", "Chariot", "Strength", "Hermit",
            "Wheel_of_Fortune", "Justice", "Hanged_Man", "Death",
            "Temperance", "Devil", "Tower", "Star", "Moon", "Sun",
            "Judgement", "World"
        ];
        let numStr = card.id < 10 ? '0' + card.id : String(card.id);
        let exactName = majors[card.id];
        return `images/RWS_Tarot_${numStr}_${exactName}.jpg`;
    }

    if (card.name) {
        let name = card.name.toLowerCase();
        let suit = "";
        if (name.includes("cup")) suit = "Cups";
        else if (name.includes("pentacle") || name.includes("coin")) suit = "Pents";
        else if (name.includes("sword")) suit = "Swords";
        else if (name.includes("wand")) suit = "Wands";

        if (suit !== "") {
            let rankStr = "01";
            if (name.includes("ace")) rankStr = "01";
            else if (name.includes("two") || name.match(/\b2\b/)) rankStr = "02";
            else if (name.includes("three") || name.match(/\b3\b/)) rankStr = "03";
            else if (name.includes("four") || name.match(/\b4\b/)) rankStr = "04";
            else if (name.includes("five") || name.match(/\b5\b/)) rankStr = "05";
            else if (name.includes("six") || name.match(/\b6\b/)) rankStr = "06";
            else if (name.includes("seven") || name.match(/\b7\b/)) rankStr = "07";
            else if (name.includes("eight") || name.match(/\b8\b/)) rankStr = "08";
            else if (name.includes("nine") || name.match(/\b9\b/)) rankStr = "09";
            else if (name.includes("ten") || name.match(/\b10\b/)) rankStr = "10";
            else if (name.includes("page")) rankStr = "11";
            else if (name.includes("knight")) rankStr = "12";
            else if (name.includes("queen")) rankStr = "13";
            else if (name.includes("king")) rankStr = "14";
            return `images/${suit}${rankStr}.jpg`;
        }
    }
    const fileName = (card.name || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `images/${fileName}.jpg`;
}

function revealCards() {
    const positions = ["Quá khứ", "Hiện tại", "Tương lai"];
    drawnCards = currentCardIndices.map((index, idx) => ({
        card: TAROT_DECK[index],
        position: positions[idx],
        isReversed: isReversedCards[idx]
    }));

    let delay = 0;
    currentCardIndices.forEach((idx, position) => {
        setTimeout(() => { revealCardAnimation(position); }, delay);
        delay += 500;
    });

    setTimeout(() => {
        displayCardResults(drawnCards);
        generateInterpretation(drawnCards);
    }, delay + 300);
}

function revealCardAnimation(position) {
    const cardEl = document.getElementById(`drawCard${position + 1}`);
    const card = TAROT_DECK[currentCardIndices[position]];
    const isReversed = isReversedCards[position];
    const imagePath = getCardImage(card);

    cardEl.classList.add('flip-animation');

    setTimeout(() => {
        cardEl.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'card-face-img-container';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'relative';

        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = card.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '6px';

        if (isReversed) img.style.transform = 'rotate(180deg)';

        img.onerror = function () {
            container.innerHTML = `
                <div class="card-face" style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; background: #2a0845; border-radius: 6px; padding: 5px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
                    <div class="card-symbol" style="font-size: 3rem; margin-bottom: 5px; ${isReversed ? 'transform: rotate(180deg);' : ''}">${card.symbol}</div>
                    <p class="card-name" style="color: #ffb700; font-size: 0.85rem; font-weight: bold; text-align: center; margin: 0;">${card.name}</p>
                    <p class="card-vietnamese" style="color: #ddd; font-size: 0.75rem; text-align: center; margin: 0;">${card.vietnamese} ${isReversed ? '<br><span style="color:#ff6b6b">(Ngược)</span>' : ''}</p>
                </div>
            `;
        };

        container.appendChild(img);
        cardEl.appendChild(container);
        cardEl.classList.remove('face-down', 'flip-animation');
    }, 200);
}

function displayCardResults(drawnCards) {
    document.getElementById('deckSection').style.display = 'none';
    document.getElementById('resultContent').classList.remove('hidden');
    document.getElementById('loadingState').classList.remove('hidden');

    const birthDate = document.getElementById('birthDate').value;
    if (birthDate) {
        const lpNum = TarotLogic.calculateLifePath(birthDate);
        const description = TarotLogic.getLifePathDescription(lpNum);
        const summaryDiv = document.getElementById('lifePathSummary');
        summaryDiv.classList.remove('hidden');
        summaryDiv.innerHTML = `
            <h4 style="color: #ffd700; margin-bottom: 5px;">🔮 Số Đường Đời: ${lpNum}</h4>
            <p style="font-style: italic; font-size: 0.95em;">"${description}"</p>
        `;
    }

    drawnCards.forEach((item, index) => {
        const cardEl = document.getElementById(`card${index + 1}`);
        if (cardEl) {
            const card = item.card;
            cardEl.querySelector('.card-placeholder').style.display = 'none';

            const oldImg = cardEl.querySelector('.card-img-result');
            if (oldImg) oldImg.remove();
            const oldSymbol = cardEl.querySelector('.card-symbol-large');
            if (oldSymbol) oldSymbol.remove();

            let imgDiv = document.createElement('img');
            imgDiv.className = 'card-img-result';
            imgDiv.src = getCardImage(card);

            imgDiv.onerror = function () {
                this.onerror = null;
                this.style.display = 'none';
                let symbolDiv = document.createElement('div');
                symbolDiv.className = 'card-symbol-large';
                symbolDiv.style.fontSize = '3rem';
                symbolDiv.style.marginBottom = '10px';
                symbolDiv.textContent = card.symbol;
                if (item.isReversed) symbolDiv.style.transform = 'rotate(180deg)';
                cardEl.insertBefore(symbolDiv, cardEl.firstChild);
            };

            if (item.isReversed) imgDiv.style.transform = 'rotate(180deg)';
            cardEl.insertBefore(imgDiv, cardEl.firstChild);

            cardEl.querySelector('.card-name').textContent = card.name;
            cardEl.querySelector('.card-vietnamese').textContent = card.vietnamese + (item.isReversed ? " (Ngược)" : "");
            cardEl.querySelector('.card-position').textContent = item.position;
        }
    });
}

// ==========================================
// PHẦN 5: GEMINI API & LUẬN GIẢI
// ==========================================

// Gửi dữ liệu thô lên Server của bạn
async function generateInterpretation(drawnCards) {
    document.getElementById('loadingState').classList.remove('hidden');

    // Gom tất cả thông tin người dùng nhập trên web
    const payload = {
        questionType: document.querySelector('input[name="questionType"]:checked').value,
        birthDate: document.getElementById('birthDate').value,
        zodiac: document.getElementById('zodiac').value,
        lifePathNumber: document.getElementById('lifePathNumber').value,
        questionText: document.getElementById('question').value,
        drawnCards: drawnCards.map(c => ({
            position: c.position,
            vietnamese: c.card.vietnamese,
            name: c.card.name,
            isReversed: c.isReversed,
            meaning: c.card.fullMeaning || c.card.meaning
        }))
    };

    try {
        // Gửi data xuống Backend (Server)
        const response = await fetch('https://tarot-agentic-app.onrender.com/api/tarot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Lỗi kết nối Server");

        const responseData = await response.json();
        // Nhận kết quả từ Server và in ra màn hình
        displayGeminiResult(responseData);
    } catch (error) {
        console.error("Lỗi:", error);
        document.getElementById('interpretationText').innerHTML = `<p class='error-msg'>⚠️ Trạm vũ trụ Backend đang bảo trì. Bạn nhớ bật Server (node server.js) nhé!</p>`;
        document.getElementById('loadingState').classList.add('hidden');
    }
}

// LƯU Ý: Giữ nguyên các hàm khác của bạn như displayGeminiResult, calculateLifePath, lật bài... nhé!


function displayGeminiResult(data) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('interpretationText').innerHTML = data.interpretation;
    document.getElementById('adviceText').innerHTML = data.advice;
    document.querySelector('.interpretation-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==========================================
// PHẦN 6: LÀM SẠCH VÀ CHƠI LẠI TỪ ĐẦU
// ==========================================
function resetToForm() {
    document.querySelector('.input-panel').style.display = 'block';
    document.getElementById('deckSection').style.display = 'none';
    document.getElementById('resultContent').classList.add('hidden');
    document.getElementById('initialState').classList.remove('hidden');

    document.getElementById('tarotForm').reset();
    document.getElementById('zodiac').value = '';
    document.getElementById('lifePathNumber').value = '';

    const drawBtn = document.getElementById('drawButton');
    if (drawBtn) {
        drawBtn.disabled = true;
        drawBtn.style.opacity = '0.5';
    }

    const arcContainer = document.getElementById('arcSpreadContainer');
    if (arcContainer) arcContainer.innerHTML = '';

    document.getElementById('interpretationText').innerHTML = '';
    document.getElementById('adviceText').innerHTML = '';
    document.getElementById('lifePathSummary').innerHTML = '';

    for (let i = 1; i <= 3; i++) {
        const cardEl = document.getElementById(`card${i}`);
        if (cardEl) {
            const oldImg = cardEl.querySelector('.card-img-result');
            if (oldImg) oldImg.remove();
            const oldSymbol = cardEl.querySelector('.card-symbol-large');
            if (oldSymbol) oldSymbol.remove();

            const placeholder = cardEl.querySelector('.card-placeholder');
            if (placeholder) placeholder.style.display = 'flex';

            cardEl.querySelector('.card-name').textContent = '';
            cardEl.querySelector('.card-vietnamese').textContent = '';
            cardEl.querySelector('.card-position').textContent = '';
        }
    }

    drawnCards = [];
    currentCardIndices = [];
    isReversedCards = [];
}