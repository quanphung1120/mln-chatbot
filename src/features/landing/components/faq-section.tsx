"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    id: "faq-1",
    q: "Nội dung có bám sát đúng slide của FPT không?",
    a: "Toàn bộ dữ liệu được biên soạn trực tiếp từ kho slide MLN chính thức (MLN111, MLN122, MLN131) của các cơ sở FPT, đối chiếu với giáo trình của Bộ Giáo dục và Đào tạo.",
  },
  {
    id: "faq-2",
    q: "Sinh viên các cơ sở khác nhau dùng chung được không?",
    a: "Hoàn toàn được! Dù lịch học và cách phân bổ giáo trình có thể khác nhau đôi chút giữa các cơ sở, nội dung cốt lõi của các môn Mác – Lênin đều thống nhất theo chương trình khung của Bộ.",
  },
  {
    id: "faq-3",
    q: "Có thể dùng để làm tiểu luận, bài thu hoạch không?",
    a: "Có. Mỗi câu trả lời đều kèm trích dẫn slide để bạn đối chiếu nhanh, phù hợp làm nguồn tham khảo đáng tin cậy cho tiểu luận và bài thu hoạch.",
  },
  {
    id: "faq-4",
    q: "XP, streak và bảng xếp hạng hoạt động thế nào?",
    a: "Mỗi lần luyện tập hoặc thi thử đúng, bạn nhận XP và duy trì streak ngày học liên tục. Điểm XP được xếp công khai trên bảng xếp hạng, giúp bạn so tài với bạn học cùng trường.",
  },
];

export default function FaqSection() {
  return (
    <section
      id="faq-section"
      className="border-t border-border bg-background px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Câu hỏi thường gặp
          </span>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Giải đáp thắc mắc
          </h2>
        </div>

        <Accordion className="w-full">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-base font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
