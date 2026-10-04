import "server-only";
import type { Disease } from "./disease-catalog";

// Source-backed educational drafts, researched 2026-10-01. No clinical review claimed.
export const diseases = [
  {
    "id": "myocardial-infarction",
    "title": "Nhồi máu cơ tim",
    "english": "Myocardial infarction · MI · NMCT",
    "system": "Tim mạch",
    "organ": "Tim",
    "summary": "Thiếu máu kéo dài có thể làm một vùng cơ tim bị hoại tử.",
    "mechanism": [
      "Mảng xơ vữa có thể bị tổn thương",
      "Huyết khối cản dòng mạch vành",
      "Cơ tim phía sau chỗ tắc thiếu oxy"
    ],
    "distinction": "Nhồi máu cơ tim khác ngừng tim; không phải mọi trường hợp đều do cùng một cơ chế.",
    "simulation": "infarction",
    "source": {
      "title": "NHLBI · Myocardial infarction",
      "url": "https://www.nhlbi.nih.gov/health/heart-attack/causes"
    }
  },
  {
    "id": "coronary-atherosclerosis",
    "title": "Bệnh mạch vành do xơ vữa",
    "english": "Coronary heart disease · CAD",
    "system": "Tim mạch",
    "organ": "Tim",
    "summary": "Mảng xơ vữa trong thành mạch vành có thể hạn chế máu nuôi cơ tim.",
    "mechanism": [
      "Mảng xơ vữa tích tụ",
      "Lòng mạch hẹp lại",
      "Khả năng cung cấp máu có thể không đáp ứng nhu cầu"
    ],
    "distinction": "Hẹp mạch không đồng nghĩa đã có nhồi máu; mức ảnh hưởng phụ thuộc nhiều yếu tố.",
    "simulation": "stenosis",
    "source": {
      "title": "NHLBI · Coronary heart disease",
      "url": "https://www.nhlbi.nih.gov/health/coronary-heart-disease/causes"
    }
  },
  {
    "id": "coronary-spasm",
    "title": "Co thắt động mạch vành",
    "english": "Coronary artery spasm · Vasospastic angina",
    "system": "Tim mạch",
    "organ": "Tim",
    "summary": "Co thắt thành động mạch vành có thể làm giảm hoặc chặn dòng máu tạm thời.",
    "mechanism": [
      "Thành mạch co thắt",
      "Dòng máu nuôi cơ tim bị cản",
      "Dòng có thể trở lại khi co thắt hết"
    ],
    "distinction": "Co thắt có thể xảy ra cả khi không có mảng xơ vữa; hồi phục trong kịch bản không bảo đảm mọi cơn đều vô hại.",
    "simulation": "spasm",
    "source": {
      "title": "NHLBI · Coronary artery spasm",
      "url": "https://www.nhlbi.nih.gov/health/angina/types"
    }
  },
  {
    "id": "heart-failure",
    "title": "Suy tim",
    "english": "Heart failure",
    "system": "Tim mạch",
    "organ": "Tim",
    "summary": "Tim không bơm đủ máu đáp ứng nhu cầu cơ thể hoặc cần áp lực đổ đầy cao.",
    "mechanism": [
      "Chức năng bơm hoặc đổ đầy suy giảm",
      "Cung cấp máu và áp lực tuần hoàn thay đổi",
      "Ứ dịch có thể gây khó thở và phù"
    ],
    "distinction": "Suy tim không có nghĩa tim đã ngừng đập.",
    "simulation": null,
    "source": {
      "title": "NHLBI · Heart failure",
      "url": "https://www.nhlbi.nih.gov/health/heart-failure"
    }
  },
  {
    "id": "arrhythmia",
    "title": "Rối loạn nhịp tim",
    "english": "Arrhythmia",
    "system": "Tim mạch",
    "organ": "Tim",
    "summary": "Bất thường tín hiệu điện làm nhịp tim quá nhanh, quá chậm hoặc không đều.",
    "mechanism": [
      "Tạo nhịp hoặc dẫn truyền thay đổi",
      "Thứ tự và tần số co bóp thay đổi",
      "Hiệu quả bơm máu có thể bị ảnh hưởng"
    ],
    "distinction": "Không phải mọi rối loạn nhịp đều gây triệu chứng hoặc có cùng mức nguy hiểm.",
    "simulation": null,
    "source": {
      "title": "NHLBI · Arrhythmia",
      "url": "https://www.nhlbi.nih.gov/health/arrhythmias"
    }
  },
  {
    "id": "hypertension",
    "title": "Tăng huyết áp",
    "english": "Hypertension · High blood pressure",
    "system": "Tim mạch",
    "organ": "Động mạch",
    "summary": "Áp lực máu trong động mạch tăng kéo dài có thể gây tổn thương cơ quan.",
    "mechanism": [
      "Áp lực động mạch tăng",
      "Tim và mạch chịu tải kéo dài",
      "Tim, não hoặc thận có thể bị tổn thương"
    ],
    "distinction": "Bệnh thường không có triệu chứng; không thể nhận biết chỉ từ cảm giác cơ thể.",
    "simulation": null,
    "source": {
      "title": "NHLBI · Hypertension",
      "url": "https://www.nhlbi.nih.gov/health/high-blood-pressure"
    }
  },
  {
    "id": "valve-disease",
    "title": "Bệnh van tim",
    "english": "Heart valve disease",
    "system": "Tim mạch",
    "organ": "Van tim",
    "summary": "Van bị hẹp hoặc đóng không kín làm thay đổi dòng máu qua tim.",
    "mechanism": [
      "Van mở hạn chế hoặc đóng không kín",
      "Dòng bị cản hoặc chảy ngược",
      "Buồng tim phải thích nghi với tải bất thường"
    ],
    "distinction": "Hẹp van và hở van là hai cơ chế khác nhau; cần biết van nào bị ảnh hưởng.",
    "simulation": null,
    "source": {
      "title": "NHLBI · Heart valve disease",
      "url": "https://www.nhlbi.nih.gov/health/heart-valve-diseases"
    }
  },
  {
    "id": "deep-vein-thrombosis",
    "title": "Huyết khối tĩnh mạch sâu",
    "english": "Deep vein thrombosis · DVT",
    "system": "Tim mạch",
    "organ": "Tĩnh mạch",
    "summary": "Cục máu đông hình thành trong tĩnh mạch sâu, thường ở chi dưới.",
    "mechanism": [
      "Huyết khối hình thành trong tĩnh mạch",
      "Dòng máu tĩnh mạch bị cản",
      "Một phần huyết khối có thể di chuyển tới phổi"
    ],
    "distinction": "Huyết khối tại chỗ và vật tắc di chuyển là hai khái niệm cần phân biệt.",
    "simulation": null,
    "source": {
      "title": "NHLBI · Deep vein thrombosis",
      "url": "https://www.nhlbi.nih.gov/health/venous-thromboembolism"
    }
  },
  {
    "id": "pulmonary-embolism",
    "title": "Thuyên tắc động mạch phổi",
    "english": "Pulmonary embolism · PE",
    "system": "Hô hấp",
    "organ": "Mạch phổi",
    "summary": "Vật tắc, thường là huyết khối từ tĩnh mạch sâu, chặn động mạch phổi.",
    "mechanism": [
      "Vật tắc theo tuần hoàn tới phổi",
      "Một nhánh động mạch phổi bị chặn",
      "Tưới máu vùng phổi phía sau giảm"
    ],
    "distinction": "Động mạch phổi đưa máu từ tim phải tới phổi; đây không phải tắc đường dẫn khí.",
    "simulation": null,
    "source": {
      "title": "NHLBI · Pulmonary embolism",
      "url": "https://www.nhlbi.nih.gov/health/pulmonary-embolism"
    }
  },
  {
    "id": "asthma",
    "title": "Hen phế quản",
    "english": "Asthma",
    "system": "Hô hấp",
    "organ": "Phế quản",
    "summary": "Viêm và hẹp đường thở gây các đợt khó thở, khò khè hoặc ho.",
    "mechanism": [
      "Đường thở viêm và nhạy cảm",
      "Tác nhân kích thích làm đường thở hẹp",
      "Luồng khí, nhất là khi thở ra, bị hạn chế"
    ],
    "distinction": "Triệu chứng có thể thay đổi theo thời gian; giữa các đợt người bệnh có thể ít triệu chứng.",
    "simulation": null,
    "source": {
      "title": "NHLBI · Asthma",
      "url": "https://www.nhlbi.nih.gov/health/asthma"
    }
  },
  {
    "id": "copd",
    "title": "Bệnh phổi tắc nghẽn mạn tính",
    "english": "Chronic obstructive pulmonary disease · COPD",
    "system": "Hô hấp",
    "organ": "Phổi",
    "summary": "Tổn thương đường thở và phế nang gây hạn chế luồng khí kéo dài.",
    "mechanism": [
      "Đường thở hoặc thành phế nang bị tổn thương",
      "Độ đàn hồi giảm và luồng khí bị cản",
      "Thở ra khó hơn, khí có thể bị giữ lại"
    ],
    "distinction": "Khí phế thũng và viêm phế quản mạn có thể cùng hiện diện, không giống hoàn toàn hen.",
    "simulation": null,
    "source": {
      "title": "NHLBI · Chronic obstructive pulmonary disease",
      "url": "https://www.nhlbi.nih.gov/health/copd"
    }
  },
  {
    "id": "pneumonia",
    "title": "Viêm phổi",
    "english": "Pneumonia",
    "system": "Hô hấp",
    "organ": "Phế nang",
    "summary": "Nhiễm trùng làm các túi khí ở phổi bị viêm và có thể chứa dịch hoặc mủ.",
    "mechanism": [
      "Tác nhân gây nhiễm trùng phổi",
      "Phế nang viêm, có dịch",
      "Trao đổi khí trở nên khó khăn"
    ],
    "distinction": "Viêm phổi có nhiều tác nhân; không suy ra tác nhân chỉ từ hình ảnh minh họa.",
    "simulation": null,
    "source": {
      "title": "NHLBI · Pneumonia",
      "url": "https://www.nhlbi.nih.gov/health/pneumonia"
    }
  },
  {
    "id": "ischemic-stroke",
    "title": "Đột quỵ thiếu máu não",
    "english": "Ischemic stroke",
    "system": "Thần kinh",
    "organ": "Não",
    "summary": "Tắc mạch làm gián đoạn cung cấp máu cho một vùng não.",
    "mechanism": [
      "Mạch cấp máu não bị tắc",
      "Oxy và chất dinh dưỡng tới mô giảm",
      "Tế bào não có thể bị tổn thương"
    ],
    "distinction": "Vùng não bị ảnh hưởng quyết định biểu hiện; chưa có bản đồ tưới máu trong thư viện này.",
    "simulation": null,
    "source": {
      "title": "NINDS · Ischemic stroke",
      "url": "https://www.ninds.nih.gov/health-information/stroke/stroke-overview"
    }
  },
  {
    "id": "hemorrhagic-stroke",
    "title": "Đột quỵ xuất huyết",
    "english": "Hemorrhagic stroke",
    "system": "Thần kinh",
    "organ": "Não",
    "summary": "Mạch vỡ gây chảy máu trong hoặc quanh não.",
    "mechanism": [
      "Thành mạch bị vỡ",
      "Máu thoát khỏi lòng mạch",
      "Mô não bị tổn thương và có thể bị chèn ép"
    ],
    "distinction": "Khác với đột quỵ thiếu máu do tắc mạch; không dùng chung một hiệu ứng tắc để biểu diễn.",
    "simulation": null,
    "source": {
      "title": "NINDS · Hemorrhagic stroke",
      "url": "https://www.ninds.nih.gov/health-information/stroke/stroke-overview"
    }
  },
  {
    "id": "type-1-diabetes",
    "title": "Đái tháo đường típ 1",
    "english": "Type 1 diabetes · T1D",
    "system": "Nội tiết",
    "organ": "Tụy",
    "summary": "Hệ miễn dịch phá hủy tế bào sản xuất insulin, gây thiếu insulin.",
    "mechanism": [
      "Tế bào beta bị tổn thương do tự miễn",
      "Insulin thiếu hụt",
      "Glucose trong máu tăng"
    ],
    "distinction": "Không đồng nhất với cơ chế đề kháng insulin của típ 2.",
    "simulation": null,
    "source": {
      "title": "NIDDK · Type 1 diabetes",
      "url": "https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/type-1-diabetes"
    }
  },
  {
    "id": "type-2-diabetes",
    "title": "Đái tháo đường típ 2",
    "english": "Type 2 diabetes · T2D",
    "system": "Nội tiết",
    "organ": "Tụy và mô ngoại vi",
    "summary": "Cơ thể sử dụng insulin kém hiệu quả và không tạo đủ insulin để bù.",
    "mechanism": [
      "Các mô đáp ứng kém với insulin",
      "Khả năng tiết insulin không bù đủ",
      "Đường huyết tăng kéo dài"
    ],
    "distinction": "Bệnh có thể tiến triển âm thầm; triệu chứng không phản ánh đầy đủ mức đường huyết.",
    "simulation": null,
    "source": {
      "title": "NIDDK · Type 2 diabetes",
      "url": "https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/type-2-diabetes"
    }
  },
  {
    "id": "hyperthyroidism",
    "title": "Cường giáp",
    "english": "Hyperthyroidism",
    "system": "Nội tiết",
    "organ": "Tuyến giáp",
    "summary": "Tuyến giáp sản xuất quá nhiều hormone giáp.",
    "mechanism": [
      "Hormone giáp được tạo quá mức",
      "Nhiều hoạt động cơ thể tăng nhanh",
      "Có thể xuất hiện tim nhanh, nóng và sụt cân"
    ],
    "distinction": "Có nhiều nguyên nhân; không đồng nhất mọi cường giáp với bệnh Graves.",
    "simulation": null,
    "source": {
      "title": "NIDDK · Hyperthyroidism",
      "url": "https://www.niddk.nih.gov/health-information/endocrine-diseases/hyperthyroidism"
    }
  },
  {
    "id": "hypothyroidism",
    "title": "Suy giáp",
    "english": "Hypothyroidism",
    "system": "Nội tiết",
    "organ": "Tuyến giáp",
    "summary": "Tuyến giáp không tạo đủ hormone cho nhu cầu cơ thể.",
    "mechanism": [
      "Hormone giáp thiếu hụt",
      "Nhiều hoạt động cơ thể chậm lại",
      "Có thể mệt mỏi, sợ lạnh và tăng cân"
    ],
    "distinction": "Các triệu chứng không đặc hiệu; học cơ chế không thay thế xét nghiệm chức năng giáp.",
    "simulation": null,
    "source": {
      "title": "NIDDK · Hypothyroidism",
      "url": "https://www.niddk.nih.gov/health-information/endocrine-diseases/hypothyroidism"
    }
  },
  {
    "id": "chronic-kidney-disease",
    "title": "Bệnh thận mạn",
    "english": "Chronic kidney disease · CKD",
    "system": "Thận – tiết niệu",
    "organ": "Thận",
    "summary": "Tổn thương thận kéo dài làm suy giảm khả năng lọc và điều hòa của thận.",
    "mechanism": [
      "Thận bị tổn thương kéo dài",
      "Khả năng lọc máu suy giảm",
      "Dịch và chất thải có thể tích tụ"
    ],
    "distinction": "Giai đoạn sớm có thể không có triệu chứng; chức năng thận cần được đánh giá bằng xét nghiệm.",
    "simulation": null,
    "source": {
      "title": "NIDDK · Chronic kidney disease",
      "url": "https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd"
    }
  },
  {
    "id": "kidney-stones",
    "title": "Sỏi thận",
    "english": "Kidney stones",
    "system": "Thận – tiết niệu",
    "organ": "Thận và niệu quản",
    "summary": "Các tinh thể trong nước tiểu kết tụ thành khối rắn.",
    "mechanism": [
      "Khoáng chất kết tinh",
      "Tinh thể lớn dần thành sỏi",
      "Sỏi di chuyển có thể cản đường thoát nước tiểu"
    ],
    "distinction": "Sỏi nhỏ có thể ít triệu chứng; vị trí và tắc nghẽn ảnh hưởng biểu hiện.",
    "simulation": null,
    "source": {
      "title": "NIDDK · Kidney stones",
      "url": "https://www.niddk.nih.gov/health-information/urologic-diseases/kidney-stones"
    }
  },
  {
    "id": "gerd",
    "title": "Trào ngược dạ dày – thực quản",
    "english": "Gastroesophageal reflux disease · GERD",
    "system": "Tiêu hóa",
    "organ": "Thực quản",
    "summary": "Dịch dạ dày trào ngược gây triệu chứng lặp lại hoặc biến chứng.",
    "mechanism": [
      "Hàng rào chống trào ngược hoạt động kém",
      "Dịch dạ dày đi lên thực quản",
      "Niêm mạc bị kích thích hoặc tổn thương"
    ],
    "distinction": "Một lần trào ngược không đồng nghĩa đã mắc bệnh trào ngược mạn tính.",
    "simulation": null,
    "source": {
      "title": "NIDDK · Gastroesophageal reflux disease",
      "url": "https://www.niddk.nih.gov/health-information/digestive-diseases/acid-reflux-ger-gerd-adults"
    }
  },
  {
    "id": "peptic-ulcer",
    "title": "Loét dạ dày – tá tràng",
    "english": "Peptic ulcer disease",
    "system": "Tiêu hóa",
    "organ": "Dạ dày và tá tràng",
    "summary": "Ổ loét hình thành trên niêm mạc dạ dày hoặc tá tràng.",
    "mechanism": [
      "Hàng rào bảo vệ niêm mạc bị ảnh hưởng",
      "Acid góp phần gây tổn thương",
      "Ổ loét có thể gây đau hoặc chảy máu"
    ],
    "distinction": "H. pylori và thuốc chống viêm không steroid là các nguyên nhân thường gặp; không quy mọi ổ loét cho stress.",
    "simulation": null,
    "source": {
      "title": "NIDDK · Peptic ulcer disease",
      "url": "https://www.niddk.nih.gov/health-information/digestive-diseases/peptic-ulcers-stomach-ulcers"
    }
  },
  {
    "id": "cirrhosis",
    "title": "Xơ gan",
    "english": "Cirrhosis",
    "system": "Tiêu hóa",
    "organ": "Gan",
    "summary": "Mô sẹo thay thế mô gan khỏe sau tổn thương kéo dài.",
    "mechanism": [
      "Gan bị tổn thương mạn tính",
      "Mô sẹo làm biến đổi cấu trúc gan",
      "Dòng máu qua gan và chức năng gan bị ảnh hưởng"
    ],
    "distinction": "Xơ gan có nhiều nguyên nhân, không chỉ do rượu.",
    "simulation": null,
    "source": {
      "title": "NIDDK · Cirrhosis",
      "url": "https://www.niddk.nih.gov/health-information/liver-disease/cirrhosis"
    }
  },
  {
    "id": "gallstones",
    "title": "Sỏi mật",
    "english": "Gallstones",
    "system": "Tiêu hóa",
    "organ": "Túi mật và đường mật",
    "summary": "Thành phần dịch mật kết tụ thành các khối rắn.",
    "mechanism": [
      "Thành phần mật mất cân bằng",
      "Sỏi hình thành trong túi mật",
      "Sỏi có thể làm tắc đường mật"
    ],
    "distinction": "Nhiều sỏi không gây triệu chứng; tắc đường mật là một tình huống khác với sỏi nằm yên.",
    "simulation": null,
    "source": {
      "title": "NIDDK · Gallstones",
      "url": "https://www.niddk.nih.gov/health-information/digestive-diseases/gallstones"
    }
  },
  {
    "id": "osteoarthritis",
    "title": "Thoái hóa khớp",
    "english": "Osteoarthritis · OA",
    "system": "Cơ xương khớp",
    "organ": "Khớp",
    "summary": "Biến đổi nhiều thành phần của khớp gây đau, cứng và giảm vận động.",
    "mechanism": [
      "Sụn và các mô khớp thay đổi",
      "Cấu trúc và cơ học khớp bị ảnh hưởng",
      "Đau và hạn chế vận động có thể tăng"
    ],
    "distinction": "Không chỉ là sụn bị mòn; cả xương và mô quanh khớp có thể tham gia.",
    "simulation": null,
    "source": {
      "title": "NIAMS · Osteoarthritis",
      "url": "https://www.niams.nih.gov/health-topics/osteoarthritis"
    }
  },
  {
    "id": "rheumatoid-arthritis",
    "title": "Viêm khớp dạng thấp",
    "english": "Rheumatoid arthritis · RA",
    "system": "Cơ xương khớp",
    "organ": "Màng hoạt dịch",
    "summary": "Bệnh tự miễn gây viêm khớp, thường ảnh hưởng các khớp đối xứng.",
    "mechanism": [
      "Miễn dịch tấn công mô khớp",
      "Màng hoạt dịch viêm và dày lên",
      "Sụn và xương có thể bị tổn thương"
    ],
    "distinction": "Khác thoái hóa khớp; có thể ảnh hưởng cả các cơ quan ngoài khớp.",
    "simulation": null,
    "source": {
      "title": "NIAMS · Rheumatoid arthritis",
      "url": "https://www.niams.nih.gov/health-topics/rheumatoid-arthritis"
    }
  },
  {
    "id": "osteoporosis",
    "title": "Loãng xương",
    "english": "Osteoporosis",
    "system": "Cơ xương khớp",
    "organ": "Xương",
    "summary": "Khối lượng và chất lượng xương suy giảm, làm tăng nguy cơ gãy.",
    "mechanism": [
      "Cân bằng tạo và mất xương thay đổi",
      "Cấu trúc xương suy yếu",
      "Xương dễ gãy hơn"
    ],
    "distinction": "Có thể âm thầm cho tới khi gãy xương; không phải bệnh gây hẹp khe khớp.",
    "simulation": null,
    "source": {
      "title": "NIAMS · Osteoporosis",
      "url": "https://www.niams.nih.gov/health-topics/osteoporosis"
    }
  }
] satisfies Disease[];
