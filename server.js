const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ==========================================
// 1. CÔNG CỤ ĐẶC VỤ (TOOLS)
// ==========================================
const tarotAgentTools = [{
    type: "function",
    function: {
        name: "tra_cuu_nang_luong_chiem_tinh",
        description: "BẮT BUỘC SỬ DỤNG công cụ này để lấy năng lượng vũ trụ trước khi giải bài.",
        parameters: {
            type: "object",
            properties: { zodiac_sign: { type: "string" } },
            required: ["zodiac_sign"]
        }
    }
}];

function tra_cuu_nang_luong_chiem_tinh(args) {
    const zodiac = args.zodiac_sign || "";
    console.log(`🛠️ [TOOL] Đang phân tích năng lượng chiêm tinh cho: ${zodiac}`);

    // Hệ thống dữ liệu Chiêm Tinh cơ bản
    const zodiacInfo = {
        "Bạch Dương": { planet: "Sao Hỏa", element: "Lửa", energy: "mạnh mẽ, bốc đồng nhưng đầy nhiệt huyết" },
        "Kim Ngưu": { planet: "Sao Kim", element: "Đất", energy: "thực tế, kiên định và hướng về vật chất/tình cảm" },
        "Song Tử": { planet: "Sao Thủy", element: "Khí", energy: "nhạy bén, linh hoạt nhưng dễ bị phân tâm" },
        "Cự Giải": { planet: "Mặt Trăng", element: "Nước", energy: "nhiều cảm xúc, nhạy cảm và cần sự an toàn" },
        "Sư Tử": { planet: "Mặt Trời", element: "Lửa", energy: "tự tin, tỏa sáng nhưng dễ tự ái" },
        "Xử Nữ": { planet: "Sao Thủy", element: "Đất", energy: "chi tiết, cẩn trọng và đôi khi quá khắt khe" },
        "Thiên Bình": { planet: "Sao Kim", element: "Khí", energy: "cân bằng, hài hòa nhưng hay do dự" },
        "Bọ Cạp": { planet: "Sao Diêm Vương", element: "Nước", energy: "sâu sắc, bí ẩn và có tính sở hữu cao" },
        "Nhân Mã": { planet: "Sao Mộc", element: "Lửa", energy: "tự do, lạc quan nhưng thiếu kiên nhẫn" },
        "Ma Kết": { planet: "Sao Thổ", element: "Đất", energy: "kỷ luật, tham vọng và đầy áp lực trách nhiệm" },
        "Bảo Bình": { planet: "Sao Thiên Vương", element: "Khí", energy: "độc lập, phá cách và khó lường" },
        "Song Ngư": { planet: "Sao Hải Vương", element: "Nước", energy: "mộng mơ, trực giác cao nhưng dễ tổn thương" }
    };

    // Lọc tìm Cung Hoàng Đạo chính xác từ input (loại bỏ emoji nếu có)
    let matchedSign = "Bạch Dương"; // Fallback mặc định
    for (const sign in zodiacInfo) {
        if (zodiac.includes(sign)) {
            matchedSign = sign;
            break;
        }
    }

    const info = zodiacInfo[matchedSign];

    // Dùng ngày hiện tại để tạo ra một "chu kỳ" năng lượng thay đổi theo ngày
    // Điều này giúp khách hàng xem nhiều lần trong ngày vẫn nhận được cùng 1 năng lượng (nhất quán hơn random)
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

    // Các trạng thái di chuyển của hành tinh
    const transitStates = [
        "đang tạo góc vuông căng thẳng, dễ sinh xung đột nội tâm và ngoại cảnh",
        "đang di chuyển thuận hành, mang lại sự thông suốt và may mắn",
        "đang nghịch hành, báo hiệu cần chậm lại, nhìn nhận quá khứ và cẩn trọng lời nói",
        "đang hội tụ với các vì sao khác, khuếch đại cảm xúc mạnh mẽ",
        "đang ở vị trí cân bằng, thời điểm tuyệt vời để tĩnh tâm và đưa ra quyết định"
    ];

    // Lấy trạng thái theo chu kỳ ngày
    const transit = transitStates[dayOfYear % transitStates.length];

    // Trả về thông điệp chi tiết cho LLM
    const thong_diep = `Hiện tại, hành tinh cai quản của ${matchedSign} là ${info.planet} ${transit}. Năng lượng nguyên tố ${info.element} đang ${info.energy}. Vận dụng thông tin này để làm rõ nguyên nhân sâu xa trong vấn đề của khách hàng.`;

    return {
        cung_hoang_dao: matchedSign,
        hanh_tinh_cai_quan: info.planet,
        nguyen_to: info.element,
        thong_diep_vu_tru: thong_diep
    };
}

// ==========================================
// 2. BỘ PROMPT MASTER TAROT (FULL OPTION)
// ==========================================
function buildPrompt(data) {
    const { questionType, zodiac, lifePathNumber, questionText, drawnCards } = data;

    const cardsInfo = drawnCards.map(c =>
        `${c.position}: ${c.vietnamese} / ${c.name} (${c.isReversed ? 'Đảo' : 'Thẳng'}) - Ý nghĩa: ${c.meaning}`
    ).join('\n\n');

    const promptProfiles = {
        'love': {
            role: "Chuyên gia Tarot Reader lâu năm về Tình cảm",
            approach: "Phân tích tâm lý và trải nghiệm thực tế, tuyệt đối không nói mơ hồ hay tâm linh sáo rỗng.",
            objectives: [
                "Mô tả QUÁ KHỨ và HIỆN TẠI với độ khớp thực tế cao nhất.",
                "Không sử dụng hiệu ứng Barnum (những câu chung chung ai nghe cũng thấy đúng).",
                "Chỉ đề cập những sự kiện có khả năng cao đã xảy ra dựa trên năng lượng lá bài.",
                "Nếu có nhiều luồng giải nghĩa, chọn khả năng mạnh nhất và khẳng định trực tiếp."
            ],
            guidelines: [
                "Bước 1 (Câu chuyện): Kết nối 3 lá bài thành một câu chuyện thực tế đang diễn ra trong đời khách hàng.",
                "Bước 2 (Tâm lý): Phân tích hành vi, suy nghĩ, cảm xúc cụ thể (VD: né tránh, chờ đợi, nhắn tin ít dần, mất động lực, tự phòng vệ...).",
                "Bước 3 (Góc khuất): Chỉ ra điểm mù tâm lý: điều khách hàng đang giấu kín hoặc đang tự lừa dối bản thân.",
                "Bước 4 (Tương lai): Đưa ra xu hướng tương lai có xác suất xảy ra cao nhất nếu khách hàng giữ nguyên cách hành xử hiện tại."
            ],
            tone: "Tự nhiên, thẳng thắn nhưng không phán xét.",
            forbidden: "có thể, có lẽ, tùy thuộc, biết đâu",
            ending: "1 câu message súc tích, chốt lại cốt lõi vấn đề.",
            readyMessage: "Gửi mình 3 lá bài"
        },
        'career': {
            role: "Tarot Reader chuyên định hướng Sự nghiệp",
            approach: "Đọc vị bài dựa trên thực lực, áp lực cạnh tranh và dòng chảy công việc; tuyệt đối không dùng từ ngữ tâm linh sáo rỗng.",
            objectives: [
                "Dùng năng lượng lá bài để chỉ ra vị thế thật của khách: đang bế tắc, đang ảo tưởng năng lực hay đang bị môi trường chèn ép.",
                "Bóc tách sự thật về thái độ làm việc và cách xử lý vấn đề thực tế của khách thông qua các biểu tượng.",
                "Chống Barnum: Phải chỉ ra những sự kiện công việc cụ thể (VD: dự án dậm chân tại chỗ, mâu thuẫn ngầm với đồng nghiệp, áp lực chỉ tiêu).",
                "Nếu bài có nhiều hướng giải, chọn kịch bản về hành động/kết quả mạnh nhất để khẳng định trực tiếp."
            ],
            guidelines: [
                "Bước 1 (Câu chuyện): Kết nối 3 lá bài thành một chuỗi sự kiện công việc thực tế, từ nguyên nhân quá khứ đến biến động hiện tại.",
                "Bước 2 (Tâm lý): Phân tích tư duy làm việc: sự trì trệ, đứng núi này trông núi nọ hay sự thiếu quyết đoán trong các lựa chọn nghề nghiệp.",
                "Bước 3 (Góc khuất): Chỉ ra 'điểm mù' trong công việc: sự lười biếng núp bóng mệt mỏi hoặc cái tôi quá lớn ngăn cản sự thăng tiến.",
                "Bước 4 (Tương lai): Dự báo kết quả sự nghiệp/tài chính xác suất cao nhất nếu khách hàng giữ nguyên thái độ và cách làm hiện tại."
            ],
            tone: "Quyết đoán, sòng phẳng, đậm chất 'đọc vị' chuyên môn.",
            forbidden: "có thể, có lẽ, tùy thuộc, biết đâu, vận may",
            ending: "1 câu chốt hạ về hành động cần thực hiện ngay lập tức để thay đổi vận trình công việc.",
            readyMessage: "Gửi mình 3 lá bài"
        },
        'health': {
            role: "Tarot Reader chuyên phân tích Thân - Tâm - Trí",
            approach: "Đọc vị sự liên kết giữa áp lực tinh thần và biểu hiện thể chất; loại bỏ hoàn toàn các khái niệm 'chữa lành' mơ hồ.",
            objectives: [
                "Mô tả trạng thái năng lượng thực tế: kiệt sức do ôm đồm, stress dồn nén hay sự bỏ bê bản thân.",
                "Chống Barnum: Chỉ ra nguồn gốc thói quen xấu hoặc sự suy kiệt cụ thể dựa trên tính chất khắc nghiệt của lá bài.",
                "Khẳng định trạng thái tâm lý đang trực tiếp 'bào mòn' thể chất của khách hàng như thế nào thông qua hình ảnh bộ bài.",
                "Chọn ra luồng năng lượng tiêu cực mạnh nhất để cảnh cáo trực diện (VD: sự trì trệ, sự lo âu thái quá)."
            ],
            guidelines: [
                "Bước 1 (Câu chuyện): Xây dựng câu chuyện về cách khách hàng đã bào mòn năng lượng bản thân từ quá khứ đến hiện tại.",
                "Bước 2 (Năng lượng): Phân tích các biểu hiện cụ thể (VD: mất ngủ vì nghĩ nhiều, đau mỏi do căng thẳng kéo dài, mất động lực sống).",
                "Bước 3 (Góc khuất): Vạch trần sự thật về việc khách hàng đang dùng sự 'bận rộn' hay 'vui vẻ giả tạo' để che lấp sự kiệt quệ bên trong.",
                "Bước 4 (Tương lai): Dự báo mức độ sụt giảm sức sống thể chất nếu khách hàng không chịu thay đổi tư duy và thói quen."
            ],
            tone: "Điềm tĩnh, quan sát sâu, nghiêm khắc và trực diện.",
            forbidden: "có thể, có lẽ, tùy thuộc, biết đâu, phép màu",
            ending: "1 câu nhắc nhở đắt giá nhất để khách hàng buộc phải tỉnh thức và nhìn lại bản thân.",
            readyMessage: "Gửi mình 3 lá bài"
        },
        'general': {
            role: "Tarot Reader chuyên thiết kế Vận trình (Life Architect)",
            approach: "Đọc vị bức tranh tổng thể cuộc đời dựa trên quy luật nhân quả thực tế; tuyệt đối không nói 'vạn sự tùy duyên'.",
            objectives: [
                "Xác định giai đoạn vận trình: đang ở chu kỳ khởi đầu, chuyển mình hay kết thúc một giai đoạn cũ.",
                "Chỉ ra những rào cản ngoại cảnh và nội tại đang thực sự diễn ra (VD: nợ nần, sự cô lập, hay cơ hội bị bỏ lỡ).",
                "Bóc tách mô thức hành vi lặp đi lặp lại khiến khách hàng luôn rơi vào một kiểu rắc rối tương tự.",
                "Khẳng định xu hướng vận trình mạnh mẽ nhất sắp tới dựa trên năng lượng áp đảo của bộ bài."
            ],
            guidelines: [
                "Bước 1 (Câu chuyện): Kết nối 3 lá bài thành một dòng thời gian thống nhất: từ sai lầm/nỗ lực quá khứ đến hiện trạng thực tế.",
                "Bước 2 (Mô thức): Phân tích cách khách hàng đang phản ứng với cuộc đời: là người chủ động hay kẻ đang để hoàn cảnh xô đẩy.",
                "Bước 3 (Góc khuất): Chỉ ra sự thật về cái tôi (Ego) hoặc sự sợ hãi đang ngăn cản họ bước sang trang mới của cuộc đời.",
                "Bước 4 (Tương lai): Đưa ra dự báo về kết quả chung cuộc của giai đoạn này nếu khách hàng không thay đổi tư duy cốt lõi."
            ],
            tone: "Thấu thính, thực tế, mang tính định hướng và 'đọc vị' tương lai.",
            forbidden: "có thể, có lẽ, tùy thuộc, biết đâu, may rủi",
            ending: "1 câu message thức tỉnh, chốt hạ bản chất cái giá phải trả hoặc phần thưởng sắp nhận được.",
        }
    };

    const profile = promptProfiles[questionType] || promptProfiles['general'];

    return `
Bạn là ${profile.role}.
Phương pháp: ${profile.approach}
Giọng văn: ${profile.tone}

**QUY TẮC CỦA ĐẶC VỤ AI (AGENTIC RULES - BẮT BUỘC):**
1. Gọi công cụ 'tra_cuu_nang_luong_chiem_tinh' TRƯỚC TIÊN.
2. Lồng ghép thông tin vũ trụ thu được vào bài luận giải một cách tự nhiên.

CẤM DÙNG TỪ: ${profile.forbidden}, chữa lành, năng lượng tiêu cực.

**MỤC TIÊU LÕI (BẮT BUỘC TUÂN THỦ):**
${profile.objectives.map(obj => `- ${obj}`).join('\n')}

**HƯỚNG DẪN ĐỌC BÀI:**
${profile.guidelines.map(g => `- ${g}`).join('\n')}

**🔥 KỸ THUẬT CỦA MASTER TAROT READER (ÉP BUỘC SỬ DỤNG):**
1. **Phân tích Nguyên Tố (Elemental Dignities):** Bạn PHẢI quét 3 lá bài để xem nguyên tố nào áp đảo (Gậy = Lửa/Nhiệt huyết/Nóng nảy; Cốc = Nước/Cảm xúc/Bi lụy; Kiếm = Khí/Lý trí/Tổn thương; Xu = Đất/Thực tế/Tiền bạc). Nếu có sự đối lập (VD: Nước dập Lửa), phải chỉ ra sự mâu thuẫn nội tâm của khách hàng.
2. **Tỷ lệ Major/Minor Arcana:** Nếu có nhiều lá Ẩn Chính (Major Arcana), hãy khẳng định đây là biến cố mang tính định mệnh, vượt ngoài tầm kiểm soát. Nếu toàn Ẩn Phụ (Minor), đây chỉ là vấn đề tâm lý/hành vi thường ngày.
3. **Dám đoán tình huống CỤ THỂ:** Dựa vào Cung Hoàng Đạo (${zodiac}) và Số Đường Đời (${lifePathNumber}) kết hợp với bài, BẮT BUỘC phải đưa ra MỘT kịch bản giả định cực kỳ chi tiết về thứ họ đang trải qua. (VD: "Bạn đang làm một công việc ổn định nhưng chán ngấy", hoặc "Bạn đang đơn phương một người không rõ ràng"). Thà đoán sai một tình huống cụ thể, CÒN HƠN nói chung chung kiểu "bạn đang có vấn đề".
4. **Không nói đạo lý:** Đâm thẳng vào sự thật mất lòng. Phân tích sự việc như một người quan sát sắc lạnh.
5. Không lặp từ ,câu nhiều lần , hãy sử dụng linh hoạt vốn từ ngữ TIẾNG VIỆT phong phú.
6. Chỉ sử dụng Tiếng Việt , không sử dụng hán tự hoặc bất kì ngôn ngữ nào khác.
7. Không được nhắc đến cung hoàng đạo và số đường đời trong phần luận giải (VD: Không nói "Bạn là một người thuộc cung Bảo Bình, số đường đời 5 luôn khao khát tự do và độc lập" ,hãy nói "Bạn là một người luôn khao khát tự do và độc lập").

**Dữ liệu người dùng:**
- Cung Hoàng Đạo: ${zodiac}
- Số Đường Đời: ${lifePathNumber}
${questionText ? `- Câu Hỏi Cụ Thể: ${questionText}` : '- Trạng thái: Người dùng không nói chi tiết, hãy dùng kỹ năng "Cold Read" để bắt bệnh dựa trên năng lượng bài.'}

**3 Lá Bài (Quá khứ - Hiện tại - Tương lai):**
${cardsInfo}

**LƯU Ý QUAN TRỌNG:**
1. TUYỆT ĐỐI KHÔNG sử dụng dấu ngoặc kép (") bên trong phần nội dung. Dùng dấu ngoặc đơn (').
2. KHÔNG sử dụng ký tự xuống dòng (Enter) tự do. Dùng thẻ HTML <br> hoặc <p>.
3. Trả về JSON thuần.

Định dạng JSON yêu cầu:
{
  "interpretation": "<p><strong>🪐 Vũ trụ đang nói gì với bạn:</strong> [Kết nối kết quả từ Tool với trạng thái của bạn lúc này. Tại sao năng lượng hành tinh lại khiến bạn rút ra 3 lá bài này? Viết 5 câu sâu sắc]</p><p><strong>🔥 Bắt bệnh chính xác:</strong> [Vẽ ra kịch bản đời thực mà BẠN đang trải qua. Dùng tính cách cung ${zodiac} để giải thích tại sao BẠN lại rơi vào tình cảnh này. Phải gọi tên sự thật đau lòng mà BẠN đang giấu kín. Viết ít nhất 8 câu]</p><p><strong>🃏 Dòng chảy cuộc đời bạn:</strong> [Liên kết 3 lá bài thành một chuỗi logic: Bạn đã sai lầm thế nào trong quá khứ? Hiện tại bạn đang bế tắc ra sao? Tương lai bạn sẽ nhận hậu quả gì nếu không thay đổi ngay? Viết ít nhất 10 câu cực kỳ chi tiết]</p><p><strong>⚠️ Góc khuất tâm hồn:</strong> [Vạch trần cái tôi, sự ích kỷ hoặc hèn nhát đang núp bóng bên trong BẠN. Đừng nể nang. Viết ít nhất 6 câu sắc lẹm]</p>",
  "advice": "<p><strong>💬 Lời khuyên dành cho bạn:</strong> ${profile.ending}</p>"
}
}
    `.trim();
}

// ==========================================
// 3. VÒNG LẶP ĐẶC VỤ (ENDPOINT)
// ==========================================
app.post('/api/tarot', async (req, res) => {
    const prompt = buildPrompt(req.body);
    const url = "https://api.groq.com/openai/v1/chat/completions";

    let chatHistory = [
        { role: "system", content: "Bạn là Master Tarot Reader. CHỈ ĐƯỢC trả về JSON thuần. Không chào hỏi, không dùng markdown ```json." },
        { role: "user", content: prompt }
    ];

    try {
        for (let step = 1; step <= 3; step++) {
            console.log(`🤖 [AGENT] Bước ${step}...`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: chatHistory,
                    tools: tarotAgentTools,
                    tool_choice: "auto",
                    temperature: 0.8, // Tăng độ "phiêu" cho AI
                    max_tokens: 3000    // Cho phép nó viết dài thoải mái
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(JSON.stringify(data));

            const responseMessage = data.choices[0].message;

            if (responseMessage.tool_calls) {
                console.log(`🤖 [AGENT] Đang gọi Tool...`);
                chatHistory.push(responseMessage);
                for (const toolCall of responseMessage.tool_calls) {
                    if (toolCall.function.name === "tra_cuu_nang_luong_chiem_tinh") {
                        const args = JSON.parse(toolCall.function.arguments);
                        const result = tra_cuu_nang_luong_chiem_tinh(args);
                        chatHistory.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(result) });
                    }
                }
                continue;
            }

            console.log("🎯 [AGENT] Xong!");
            let cleanJson = responseMessage.content.replace(/```json/g, '').replace(/```/g, '').trim();
            return res.json(JSON.parse(cleanJson));
        }
    } catch (error) {
        console.error("🚨 LỖI:", error);
        res.status(500).json({ error: "Vũ trụ đang bận." });
    }
});

app.listen(3000, () => console.log(`🚀 Server up:  https://tarot-agentic-app.onrender.com`));
























