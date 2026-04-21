export type StockRiskLevel = "정상" | "부족 우려" | "부족";
export type LotStatus = "정상" | "임박" | "만료" | "재멸균 필요" | "폐기 후보";
export type PurchaseRequestStatus = "승인대기" | "승인" | "보류" | "반려" | "전송완료";

export interface ItemMaster {
  item_id: string;
  item_name: string;
  category: string;
  specification: string;
  unit: string;
  sterilization_required: boolean;
  expiry_managed: boolean;
  criticality: "고위험" | "중요" | "일반";
  preferred_vendor_id: string;
  substitute_item_ids: string[];
}

export interface InventoryLot {
  lot_id: string;
  item_id: string;
  quantity: number;
  received_at: string;
  expiry_date: string;
  sterilized_at?: string;
  sterilization_expiry_date?: string;
  location: string;
  status: LotStatus;
}

export interface SurgeryUsageHistory {
  usage_id: string;
  surgery_type: string;
  department: string;
  surgeon_id: string;
  item_id: string;
  used_qty: number;
  used_at: string;
}

export interface InventoryRecommendation {
  recommendation_id: string;
  item_id: string;
  current_stock: number;
  recommended_stock: number;
  safety_stock: number;
  minimum_stock: number;
  recommended_order_qty: number;
  rationale_text: string;
  calculated_at: string;
  summary_score: number;
  reason_lines: string[];
  risk_factors: string[];
  order_required: boolean;
  urgent_order_required: boolean;
}

export interface VendorMaster {
  vendor_id: string;
  vendor_name: string;
  contract_status: "계약중" | "검토중";
  lead_time_days: number;
  reliability_score: number;
  group_purchase_supported: boolean;
}

export interface VendorItemPrice {
  vendor_item_price_id: string;
  vendor_id: string;
  item_id: string;
  price: number;
  moq: number;
  contract_type: "단가계약" | "단건구매";
  updated_at: string;
}

export interface PurchaseRequest {
  purchase_request_id: string;
  item_id: string;
  request_qty: number;
  selected_vendor_id: string;
  request_status: PurchaseRequestStatus;
  approved_by?: string;
  requested_at: string;
  approved_at?: string;
  mock_order_result?: string;
}

export interface SterilizationEvent {
  sterilization_event_id: string;
  lot_id: string;
  processed_at: string;
  expires_at: string;
  status: "완료" | "재처리 필요" | "만료";
  note: string;
}

export interface CaseRequiredItem {
  case_id: string;
  item_id: string;
  required_qty: number;
  preferred_brands?: string[];
}
