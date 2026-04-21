import { surgeryCases } from "@/data/mock-surgeries";
import type {
  CaseRequiredItem,
  InventoryLot,
  InventoryRecommendation,
  ItemMaster,
  LotStatus,
  PurchaseRequest,
  SterilizationEvent,
  SurgeryUsageHistory,
  VendorItemPrice,
  VendorMaster,
} from "@/types/inventory";

const today = "2026-04-22";

export const itemMasters: ItemMaster[] = [
  {
    item_id: "ITEM-001",
    item_name: "멸균 봉합사 2-0",
    category: "봉합재",
    specification: "흡수성 45cm",
    unit: "EA",
    sterilization_required: true,
    expiry_managed: true,
    criticality: "고위험",
    preferred_vendor_id: "V-01",
    substitute_item_ids: ["ITEM-002"],
  },
  {
    item_id: "ITEM-002",
    item_name: "멸균 봉합사 3-0",
    category: "봉합재",
    specification: "흡수성 45cm",
    unit: "EA",
    sterilization_required: true,
    expiry_managed: true,
    criticality: "중요",
    preferred_vendor_id: "V-02",
    substitute_item_ids: ["ITEM-001"],
  },
  {
    item_id: "ITEM-003",
    item_name: "복강경 트로카",
    category: "복강경 소모품",
    specification: "10mm",
    unit: "EA",
    sterilization_required: true,
    expiry_managed: true,
    criticality: "고위험",
    preferred_vendor_id: "V-03",
    substitute_item_ids: [],
  },
  {
    item_id: "ITEM-004",
    item_name: "멸균 드레이프 세트",
    category: "소모품",
    specification: "정형외과용",
    unit: "SET",
    sterilization_required: true,
    expiry_managed: true,
    criticality: "중요",
    preferred_vendor_id: "V-01",
    substitute_item_ids: [],
  },
  {
    item_id: "ITEM-005",
    item_name: "지혈 스폰지",
    category: "소모품",
    specification: "중형",
    unit: "EA",
    sterilization_required: false,
    expiry_managed: true,
    criticality: "일반",
    preferred_vendor_id: "V-02",
    substitute_item_ids: [],
  },
  {
    item_id: "ITEM-006",
    item_name: "레이저 파이버",
    category: "비뇨 소모품",
    specification: "365um",
    unit: "EA",
    sterilization_required: true,
    expiry_managed: true,
    criticality: "고위험",
    preferred_vendor_id: "V-04",
    substitute_item_ids: [],
  },
];

export const inventoryLots: InventoryLot[] = [
  lot("LOT-001", "ITEM-001", 12, "정상", "2026-10-01", "2026-05-30"),
  lot("LOT-002", "ITEM-001", 8, "임박", "2026-05-02", "2026-04-25"),
  lot("LOT-003", "ITEM-002", 40, "정상", "2026-11-10", "2026-06-01"),
  lot("LOT-004", "ITEM-003", 6, "부족", "2026-08-20", "2026-05-01"),
  lot("LOT-005", "ITEM-004", 18, "재멸균 필요", "2026-09-01", "2026-04-20"),
  lot("LOT-006", "ITEM-005", 55, "정상", "2027-01-01"),
  lot("LOT-007", "ITEM-006", 4, "임박", "2026-05-15", "2026-04-24"),
];

function lot(
  lot_id: string,
  item_id: string,
  quantity: number,
  state: LotStatus | "부족",
  expiry_date: string,
  sterilization_expiry_date?: string,
): InventoryLot {
  const status = state === "부족" ? "정상" : state;
  return {
    lot_id,
    item_id,
    quantity,
    received_at: "2026-04-01",
    expiry_date,
    sterilized_at: sterilization_expiry_date ? "2026-04-10" : undefined,
    sterilization_expiry_date,
    location: "중앙 자재창고",
    status,
  };
}

export const caseRequiredItems: CaseRequiredItem[] = surgeryCases.flatMap((c) => {
  const base =
    c.department === "정형외과"
      ? ["ITEM-001", "ITEM-004"]
      : c.department === "외과"
        ? ["ITEM-003", "ITEM-005"]
        : c.department === "비뇨의학과"
          ? ["ITEM-006", "ITEM-001"]
          : ["ITEM-001", "ITEM-005"];
  return base.map((item_id, idx) => ({
    case_id: c.id,
    item_id,
    required_qty: idx === 0 ? 3 : 2,
    preferred_brands: c.surgeon.includes("김도윤") ? ["OrthoPrime"] : undefined,
  }));
});

export const surgeryUsageHistory: SurgeryUsageHistory[] = Array.from({ length: 48 }).map((_, i) => {
  const item = itemMasters[i % itemMasters.length];
  return {
    usage_id: `U-${i + 1}`,
    surgery_type: i % 2 === 0 ? "복강경" : "정형외과",
    department: i % 3 === 0 ? "외과" : "정형외과",
    surgeon_id: i % 2 === 0 ? "이승민 교수" : "김도윤 교수",
    item_id: item.item_id,
    used_qty: 1 + (i % 4),
    used_at: `2026-03-${String((i % 28) + 1).padStart(2, "0")}`,
  };
});

export const vendorMasters: VendorMaster[] = [
  { vendor_id: "V-01", vendor_name: "메디서플라이", contract_status: "계약중", lead_time_days: 3, reliability_score: 92, group_purchase_supported: true },
  { vendor_id: "V-02", vendor_name: "코리아메드", contract_status: "계약중", lead_time_days: 5, reliability_score: 84, group_purchase_supported: false },
  { vendor_id: "V-03", vendor_name: "서지테크", contract_status: "계약중", lead_time_days: 4, reliability_score: 89, group_purchase_supported: true },
  { vendor_id: "V-04", vendor_name: "유로메디칼", contract_status: "검토중", lead_time_days: 6, reliability_score: 80, group_purchase_supported: true },
];

export const vendorItemPrices: VendorItemPrice[] = itemMasters.flatMap((item, idx) =>
  vendorMasters.map((v, vi) => ({
    vendor_item_price_id: `P-${item.item_id}-${v.vendor_id}`,
    vendor_id: v.vendor_id,
    item_id: item.item_id,
    price: 9000 + idx * 1300 + vi * 500,
    moq: vi % 2 === 0 ? 10 : 20,
    contract_type: vi % 2 === 0 ? "단가계약" : "단건구매",
    updated_at: today,
  })),
);

export const sterilizationEvents: SterilizationEvent[] = inventoryLots
  .filter((lotItem) => lotItem.sterilization_expiry_date)
  .map((lotItem, index) => ({
    sterilization_event_id: `SE-${index + 1}`,
    lot_id: lotItem.lot_id,
    processed_at: lotItem.sterilized_at ?? today,
    expires_at: lotItem.sterilization_expiry_date!,
    status: lotItem.status === "재멸균 필요" ? "재처리 필요" : lotItem.status === "만료" ? "만료" : "완료",
    note: lotItem.status === "재멸균 필요" ? "멸균 유효기간 만료로 재처리 필요" : "정상",
  }));

export const purchaseRequestsMock: PurchaseRequest[] = [
  {
    purchase_request_id: "PR-001",
    item_id: "ITEM-003",
    request_qty: 24,
    selected_vendor_id: "V-03",
    request_status: "승인대기",
    requested_at: "2026-04-22 08:20",
  },
  {
    purchase_request_id: "PR-002",
    item_id: "ITEM-001",
    request_qty: 30,
    selected_vendor_id: "V-01",
    request_status: "전송완료",
    approved_by: "수간호사",
    requested_at: "2026-04-21 16:10",
    approved_at: "2026-04-21 16:22",
    mock_order_result: "Mock 발주 요청 생성 완료",
  },
];

export const inventoryRecommendationsMock: InventoryRecommendation[] = [];
