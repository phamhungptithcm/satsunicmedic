import "server-only";
import { learningScenarioSchema, heartBindingSchema } from "@hs/contracts";
import binding from "../../preview-assets/heart/binding.json";

export const heartBinding = heartBindingSchema.parse(binding);

// Kept server-side. The route checks development mode before importing this file.
export const myocardialInfarctionDraft = learningScenarioSchema.parse({
  id: "myocardial-infarction",
  revision: 2,
  locale: "vi",
  status: "draft",
  title: "Nhồi máu cơ tim",
  englishTitle: "Myocardial infarction",
  aliases: ["tim", "mạch vành", "heart attack", "MI", "NMCT"],
  objective: "Giải thích vì sao máu vẫn đi qua buồng tim nhưng một vùng cơ tim có thể bị thiếu máu nuôi.",
  limitation: "Minh họa định tính trên atlas tim 3D của một cơ chế nhồi máu do huyết khối trên mảng xơ vữa. Vị trí tổn thương, kích thước hạt và tốc độ là giả định học tập, không phải số đo người bệnh. Chưa có bản đồ vùng tưới máu trên cơ tim. Không đại diện cho mọi nguyên nhân nhồi máu cơ tim.",
  duration: 32,
  stages: [
    { id: "baseline", start: 0, label: "Tưới máu bình thường", appearance: "normal", event: "Máu đi qua động mạch vành tới cơ tim.", mechanism: "Động mạch vành cung cấp máu giàu oxy cho cơ tim.", consequence: "Cơ tim nhận máu nuôi qua hệ mạch vành; máu trong buồng tim là một đường khác.", sourceIds: ["nhlbi-causes"] },
    { id: "plaque", start: 8, label: "Mảng xơ vữa", appearance: "plaque", event: "Mảng xơ vữa hình thành trong thành động mạch vành.", mechanism: "Mảng xơ vữa có thể làm hẹp lòng mạch và cản trở dòng máu.", consequence: "Có mảng xơ vữa không có nghĩa là đã xảy ra nhồi máu. Đây là một bước nền trong kịch bản đang xem.", sourceIds: ["nhlbi-causes"] },
    { id: "occlusion", start: 16, label: "Huyết khối gây tắc", appearance: "occlusion", event: "Ở kịch bản này, tổn thương mảng xơ vữa dẫn đến hình thành huyết khối.", mechanism: "Huyết khối làm tắc nhánh LAD trong kịch bản, cản máu tới vùng cơ tim phía sau chỗ tắc.", consequence: "Vùng được nhánh đó nuôi bị giảm cung cấp oxy. Mô hình vẫn giữ dòng minh họa ở nhánh mũ không bị tắc.", sourceIds: ["nhlbi-causes"] },
    { id: "injury", start: 24, label: "Tổn thương cơ tim", appearance: "injury", event: "Thiếu máu kéo dài có thể làm cơ tim bị tổn thương và chết.", mechanism: "Mức tổn thương phụ thuộc vùng được cấp máu và thời gian tới khi được điều trị; mô hình không tính mức độ này.", consequence: "Nhồi máu cơ tim không đồng nghĩa với ngừng tim. Cảnh dừng ở bước này, không tự diễn tiến trở về bình thường.", sourceIds: ["nhlbi-causes", "aha-heart-attack"] },
  ],
  sources: [
    { id: "nhlbi-causes", title: "NHLBI · Heart Attack — Causes and Risk Factors", url: "https://www.nhlbi.nih.gov/health/heart-attack/causes" },
    { id: "aha-heart-attack", title: "AHA · What Is a Heart Attack?", url: "https://www.heart.org/-/media/Files/Health-Topics/Answers-by-Heart/What-is-a-Heart-Attack.pdf" },
  ],
  structures: [
    { id: "vessel", label: "Động mạch vành", description: "Theo dõi mũi tên từ đầu mạch tới hai nhánh. Nhánh trên là nhánh có tổn thương trong kịch bản; không gán tên động mạch cụ thể cho sơ đồ này." },
    { id: "tissue", label: "Vùng cơ tim phía sau chỗ tắc", description: "Vùng gạch chéo biểu thị cơ tim chịu ảnh hưởng khi nhánh trên bị tắc. Đây là ký hiệu học tập, không phải bản đồ diện tích nhồi máu." },
    { id: "chamber", label: "Máu trong buồng tim", description: "Đường qua buồng tim được vẽ tách riêng để phân biệt với máu nuôi cơ tim qua mạch vành. Sơ đồ không mô tả đầy đủ các buồng và van tim." },
  ],
  quiz: {
    question: "Khi nhánh LAD trong kịch bản bị tắc, vùng nào bị giảm cấp máu qua nhánh đó?",
    options: [
      { id: "all", label: "Toàn bộ cơ thể ngừng nhận máu ngay lập tức." },
      { id: "downstream", label: "Vùng cơ tim phía sau chỗ tắc của nhánh đó." },
      { id: "chamber", label: "Chỉ máu nằm trong buồng tim." },
    ],
    correctId: "downstream",
    explanation: "Nhánh bị tắc cản máu nuôi tới vùng cơ tim phía sau. Điều này khác với đường máu đi qua buồng tim và không có nghĩa là toàn bộ tim ngừng bơm ngay lập tức.",
    sourceIds: ["nhlbi-causes"],
  },
});
