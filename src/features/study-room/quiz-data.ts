// ---------------------------------------------------------------------------
// Ngân hàng câu hỏi Triết học Mác – Lênin (MLN111).
// Mỗi câu trả lời đúng giúp bạn kiếm coins để xây dựng căn phòng / ngôi nhà.
// `answer` là chỉ số (index) của đáp án đúng trong mảng `options`.
// ---------------------------------------------------------------------------

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explain: string;
}

export const COINS_PER_CORRECT = 15;

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Ai là người đưa ra định nghĩa kinh điển về phạm trù “vật chất” trong triết học Mác – Lênin?",
    options: ["C. Mác", "Ph. Ăngghen", "V.I. Lênin", "L. Phoiơbắc"],
    answer: 2,
    explain: "Lênin định nghĩa: vật chất là phạm trù triết học dùng để chỉ thực tại khách quan tồn tại độc lập với ý thức và được ý thức phản ánh.",
  },
  {
    id: 2,
    question: "Thuộc tính cơ bản nhất của vật chất để phân biệt vật chất với ý thức là gì?",
    options: ["Có khối lượng", "Tồn tại khách quan", "Có thể tri giác được", "Luôn vận động"],
    answer: 1,
    explain: "Thuộc tính “tồn tại khách quan” – tồn tại độc lập với ý thức con người – là dấu hiệu cơ bản nhất của vật chất.",
  },
  {
    id: 3,
    question: "Theo triết học Mác – Lênin, nguồn gốc xã hội trực tiếp quyết định sự ra đời của ý thức là:",
    options: ["Bộ óc con người", "Lao động và ngôn ngữ", "Thế giới khách quan", "Giáo dục"],
    answer: 1,
    explain: "Lao động và ngôn ngữ là hai sức kích thích chủ yếu, là nguồn gốc xã hội của ý thức.",
  },
  {
    id: 4,
    question: "Phép biện chứng duy vật có mấy quy luật cơ bản?",
    options: ["Hai", "Ba", "Bốn", "Sáu"],
    answer: 1,
    explain: "Ba quy luật cơ bản: lượng – chất; thống nhất và đấu tranh của các mặt đối lập; phủ định của phủ định.",
  },
  {
    id: 5,
    question: "Quy luật nào chỉ ra CÁCH THỨC của sự vận động, phát triển?",
    options: [
      "Quy luật lượng – chất",
      "Quy luật mâu thuẫn",
      "Quy luật phủ định của phủ định",
      "Quy luật giá trị",
    ],
    answer: 0,
    explain: "Quy luật chuyển hóa từ những thay đổi về lượng thành thay đổi về chất và ngược lại chỉ ra cách thức của sự phát triển.",
  },
  {
    id: 6,
    question: "Quy luật nào vạch ra NGUỒN GỐC, ĐỘNG LỰC của sự phát triển?",
    options: [
      "Quy luật lượng – chất",
      "Quy luật thống nhất và đấu tranh của các mặt đối lập",
      "Quy luật phủ định của phủ định",
      "Quy luật cung – cầu",
    ],
    answer: 1,
    explain: "Quy luật mâu thuẫn (thống nhất và đấu tranh của các mặt đối lập) là hạt nhân, chỉ ra nguồn gốc, động lực của sự phát triển.",
  },
  {
    id: 7,
    question: "Quy luật nào chỉ ra KHUYNH HƯỚNG của sự phát triển?",
    options: [
      "Quy luật mâu thuẫn",
      "Quy luật lượng – chất",
      "Quy luật phủ định của phủ định",
      "Quy luật quan hệ sản xuất",
    ],
    answer: 2,
    explain: "Phủ định của phủ định cho thấy phát triển diễn ra theo khuynh hướng đi lên, theo đường “xoáy ốc”.",
  },
  {
    id: 8,
    question: "Hai nguyên lý cơ bản của phép biện chứng duy vật là:",
    options: [
      "Nguyên lý nhân quả và nguyên lý tất nhiên",
      "Nguyên lý về mối liên hệ phổ biến và nguyên lý về sự phát triển",
      "Nguyên lý vận động và nguyên lý đứng im",
      "Nguyên lý vật chất và nguyên lý ý thức",
    ],
    answer: 1,
    explain: "Hai nguyên lý: mối liên hệ phổ biến và sự phát triển.",
  },
  {
    id: 9,
    question: "Vấn đề cơ bản của triết học là gì?",
    options: [
      "Quan hệ giữa con người và tự nhiên",
      "Quan hệ giữa vật chất và ý thức (tư duy và tồn tại)",
      "Quan hệ giữa cá nhân và xã hội",
      "Quan hệ giữa lý luận và thực tiễn",
    ],
    answer: 1,
    explain: "Vấn đề cơ bản của triết học là mối quan hệ giữa tư duy và tồn tại (ý thức và vật chất).",
  },
  {
    id: 10,
    question: "Theo chủ nghĩa duy vật lịch sử, yếu tố nào giữ vai trò quyết định sự tồn tại và phát triển của xã hội?",
    options: ["Sản xuất vật chất", "Nhà nước", "Tôn giáo", "Ý thức xã hội"],
    answer: 0,
    explain: "Sản xuất vật chất (phương thức sản xuất) là cơ sở, là yếu tố quyết định sự tồn tại và phát triển của xã hội.",
  },
  {
    id: 11,
    question: "Trong quan hệ giữa tồn tại xã hội và ý thức xã hội, cái nào quyết định?",
    options: [
      "Ý thức xã hội quyết định tồn tại xã hội",
      "Tồn tại xã hội quyết định ý thức xã hội",
      "Cả hai ngang nhau, không cái nào quyết định",
      "Tùy từng thời kỳ lịch sử",
    ],
    answer: 1,
    explain: "Tồn tại xã hội quyết định ý thức xã hội; ý thức xã hội có tính độc lập tương đối và tác động trở lại.",
  },
  {
    id: 12,
    question: "Theo triết học Mác – Lênin, thực tiễn có vai trò gì đối với nhận thức?",
    options: [
      "Chỉ là nơi áp dụng tri thức",
      "Là cơ sở, động lực, mục đích của nhận thức và là tiêu chuẩn của chân lý",
      "Không liên quan đến nhận thức",
      "Chỉ là kết quả của nhận thức",
    ],
    answer: 1,
    explain: "Thực tiễn là cơ sở, động lực, mục đích của nhận thức và là tiêu chuẩn kiểm tra chân lý.",
  },
  {
    id: 13,
    question: "Ý thức, theo triết học Mác – Lênin, là:",
    options: [
      "Sản phẩm thuần túy của thần linh",
      "Sự phản ánh hiện thực khách quan vào bộ óc con người một cách năng động, sáng tạo",
      "Một dạng vật chất đặc biệt",
      "Cái có trước, sinh ra vật chất",
    ],
    answer: 1,
    explain: "Ý thức là sự phản ánh năng động, sáng tạo hiện thực khách quan vào bộ óc người; là hình ảnh chủ quan của thế giới khách quan.",
  },
  {
    id: 14,
    question: "Hình thức lịch sử đầu tiên của phép biện chứng là:",
    options: [
      "Phép biện chứng duy vật",
      "Phép biện chứng duy tâm của Hêghen",
      "Phép biện chứng chất phác thời cổ đại",
      "Phép siêu hình",
    ],
    answer: 2,
    explain: "Phép biện chứng chất phác (cổ đại) → phép biện chứng duy tâm (Hêghen) → phép biện chứng duy vật (Mác – Ăngghen).",
  },
  {
    id: 15,
    question: "Cặp phạm trù nào phản ánh mối liên hệ sản sinh: cái này làm nảy sinh cái kia?",
    options: [
      "Nội dung – hình thức",
      "Nguyên nhân – kết quả",
      "Bản chất – hiện tượng",
      "Tất nhiên – ngẫu nhiên",
    ],
    answer: 1,
    explain: "Nguyên nhân là cái sinh ra kết quả; đây là mối liên hệ sản sinh trong cặp phạm trù nhân – quả.",
  },
];
