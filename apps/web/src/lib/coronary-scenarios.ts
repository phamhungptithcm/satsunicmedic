import "server-only";
import { learningScenarioSchema } from "@hs/contracts";
import { myocardialInfarctionDraft } from "./pathophysiology-draft";

const source = (url: string) => [{ id: "nhlbi", title: "NHLBI · Cơ chế bệnh mạch vành", url }];
const stage = (id: string, start: number, label: string, appearance: "normal" | "plaque" | "occlusion", event: string, mechanism: string, consequence: string) => ({ id, start, label, appearance, event, mechanism, consequence, sourceIds: ["nhlbi"] });
export const coronaryScenarios = {
  infarction: myocardialInfarctionDraft,
  stenosis: learningScenarioSchema.parse({
    ...myocardialInfarctionDraft, id: "coronary-atherosclerosis", revision: 1, title: "Bệnh mạch vành do xơ vữa", englishTitle: "Coronary atherosclerosis", aliases: ["CAD", "xơ vữa"], duration: 24,
    objective: "Phân biệt hẹp mạch vành với tắc cấp do huyết khối.",
    limitation: "Vòng vàng đánh dấu vị trí hẹp giả định trên LAD. Số hạt đi qua giảm là ký hiệu hạn chế cung cấp máu, không phải lưu lượng đo được. Mesh không biến dạng, không tính vận tốc tại chỗ hẹp, dự trữ vành hoặc mức thiếu máu cơ tim.",
    sources: source("https://www.nhlbi.nih.gov/health/coronary-heart-disease/causes"),
    stages: [
      stage("baseline", 0, "Mạch thông", "normal", "Dòng minh họa đi qua LAD và nhánh mũ.", "Mạch vành đưa máu tới cơ tim.", "Quan sát hai đường dòng trên cùng atlas."),
      stage("plaque", 8, "Mảng xơ vữa", "plaque", "Vòng vàng đánh dấu vị trí mảng xơ vữa giả định.", "Mảng xơ vữa tích tụ trong thành mạch có thể thu hẹp lòng mạch.", "Mô hình đánh dấu vị trí, chưa dựng hình thành mạch bị biến đổi."),
      stage("limited-flow", 16, "Cung cấp máu bị hạn chế", "plaque", "Ít hạt minh họa vượt qua đoạn hẹp, nhưng đường mạch chưa bị chặn hoàn toàn.", "Hẹp mạch có thể hạn chế khả năng tăng cung cấp máu khi nhu cầu tăng.", "Không suy ra mức hẹp hoặc thiếu máu từ số hạt. Hẹp mạch không đồng nghĩa với nhồi máu."),
    ],
    quiz: { question: "Điều nào đúng với kịch bản hẹp mạch này?", options: [{ id: "partial", label: "Vẫn có dòng đi qua; hẹp không đồng nghĩa đã nhồi máu." }, { id: "clot", label: "Mọi mảng xơ vữa đều là huyết khối tắc hoàn toàn." }], correctId: "partial", explanation: "Kịch bản minh họa hạn chế cung cấp máu qua mạch hẹp. Huyết khối tắc cấp là một cơ chế khác.", sourceIds: ["nhlbi"] },
  }),
  spasm: learningScenarioSchema.parse({
    ...myocardialInfarctionDraft, id: "coronary-spasm", revision: 1, title: "Co thắt động mạch vành", englishTitle: "Coronary artery spasm", aliases: ["co thắt", "vasospasm"], duration: 24,
    objective: "Theo dõi sự cản dòng tạm thời do co thắt, khác với huyết khối.",
    limitation: "Vòng tím là ký hiệu vị trí co thắt giả định trên LAD; mesh thành mạch chưa biến dạng. Kịch bản chọn một cơn cản dòng hoàn toàn rồi hồi phục, không đại diện mọi cơn và không mô phỏng điều trị. Thời gian và hạt là minh họa định tính.",
    sources: source("https://www.nhlbi.nih.gov/health/angina/types"),
    stages: [
      stage("baseline", 0, "Mạch thông", "normal", "LAD và nhánh mũ có dòng minh họa.", "Thành mạch chưa co thắt trong giai đoạn này.", "Ghi nhớ dòng trước cơn để đối chiếu."),
      stage("spasm", 8, "Co thắt cản dòng", "occlusion", "Vòng tím đánh dấu đoạn co thắt; hạt dừng đi qua vị trí này.", "Co thắt thành động mạch có thể tạm thời giảm hoặc chặn máu tới cơ tim.", "Không vẽ huyết khối: nguyên nhân cản dòng ở đây là co thắt."),
      stage("recovery", 16, "Hết co thắt trong kịch bản", "normal", "Dòng minh họa trở lại khi đoạn co thắt giãn ra.", "Cơn co thắt có thể thoáng qua, cả ở mạch không có mảng xơ vữa.", "Hồi phục trong minh họa không có nghĩa mọi cơn đều tự hết hoặc không gây tổn thương."),
    ],
    quiz: { question: "Tại sao kịch bản này không có hình huyết khối?", options: [{ id: "spasm", label: "Cản dòng do co thắt thành mạch, không giả định có cục máu đông." }, { id: "same", label: "Co thắt và huyết khối là cùng một cơ chế." }], correctId: "spasm", explanation: "Co thắt là sự co của thành động mạch. Kịch bản tách cơ chế này khỏi tắc do huyết khối.", sourceIds: ["nhlbi"] },
  }),
};
