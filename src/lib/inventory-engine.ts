import { surgeryCases } from "@/data/mock-surgeries";
import {
  caseRequiredItems,
  inventoryLots,
  itemMasters,
  surgeryUsageHistory,
  vendorItemPrices,
  vendorMasters,
} from "@/data/inventory-mock";
import type { InventoryRecommendation, ItemMaster, LotStatus } from "@/types/inventory";

export function getCurrentStock(itemId: string) {
  return inventoryLots.filter((lot) => lot.item_id === itemId).reduce((acc, lot) => acc + lot.quantity, 0);
}

export function getItemRisk(itemId: string) {
  const current = getCurrentStock(itemId);
  const rec = getRecommendationForItem(itemId);
  if (current <= rec.minimum_stock) return "부족";
  if (current <= rec.safety_stock) return "부족 우려";
  return "정상";
}

export function getLotPriorityBadge(status: LotStatus) {
  if (status === "임박") return "우선 사용";
  if (status === "재멸균 필요") return "재멸균";
  if (status === "만료") return "폐기";
  if (status === "폐기 후보") return "폐기 검토";
  return "정상";
}

export function getFefoLot(itemId: string) {
  return inventoryLots
    .filter((lot) => lot.item_id === itemId && lot.status !== "만료" && lot.status !== "폐기 후보")
    .sort((a, b) => a.expiry_date.localeCompare(b.expiry_date))[0];
}

export function getRecommendationForItem(itemId: string): InventoryRecommendation {
  const item = itemMasters.find((i) => i.item_id === itemId);
  const history = surgeryUsageHistory.filter((h) => h.item_id === itemId);
  const recent4w = history.slice(-16).reduce((acc, h) => acc + h.used_qty, 0);
  const trend12wAvg = history.reduce((acc, h) => acc + h.used_qty, 0) / Math.max(history.length, 1);
  const upcoming = caseRequiredItems
    .filter((r) => r.item_id === itemId && surgeryCases.some((c) => c.id === r.case_id))
    .reduce((acc, r) => acc + r.required_qty, 0);

  const leadTime = vendorMasters.find((v) => v.vendor_id === item?.preferred_vendor_id)?.lead_time_days ?? 5;
  const dailyForecast = Math.max(1, Math.round(recent4w / 28 + trend12wAvg * 0.3 + upcoming / 14));
  const volatilityFactor = item?.criticality === "고위험" ? 1.4 : item?.criticality === "중요" ? 1.2 : 1.0;
  const safetyStock = Math.round(dailyForecast * 4 * volatilityFactor);
  const minimumStock = Math.round(dailyForecast * 2);
  const recommendedStock = Math.round(dailyForecast * leadTime + safetyStock);
  const current = getCurrentStock(itemId);
  const orderQty = Math.max(0, recommendedStock - current);
  const urgent = current <= minimumStock && (item?.criticality === "고위험" || leadTime >= 5);

  return {
    recommendation_id: `REC-${itemId}`,
    item_id: itemId,
    current_stock: current,
    recommended_stock: recommendedStock,
    safety_stock: safetyStock,
    minimum_stock: minimumStock,
    recommended_order_qty: orderQty,
    rationale_text: `최근 4주 사용량, 12주 추세, 예정 수술 ${upcoming}개 소요, 평균 납기 ${leadTime}일, 품목 중요도를 반영해 권장재고를 계산했습니다.`,
    calculated_at: "2026-04-22 09:00",
    summary_score: Math.max(50, Math.min(99, 100 - (orderQty > 0 ? 30 : 0) - (urgent ? 20 : 0) + (leadTime <= 3 ? 10 : 0))),
    reason_lines: [
      `최근 4주 사용량 ${recent4w}개와 12주 추세를 반영했습니다.`,
      `향후 예정 수술 기반 예상 소요 ${upcoming}개를 포함했습니다.`,
      `공급사 평균 납기 ${leadTime}일과 중요도 계수를 적용했습니다.`,
    ],
    risk_factors: [
      urgent ? "긴급 수술 발생 시 재고 고갈 가능성" : "수요 급증 시 안전재고 변동 가능성",
      leadTime >= 5 ? "납기 지연 리스크가 높음" : "납기 안정성은 양호",
    ],
    order_required: orderQty > 0,
    urgent_order_required: urgent,
  };
}

export function getAllRecommendations() {
  return itemMasters.map((item) => getRecommendationForItem(item.item_id));
}

export function getInventoryDashboardStats() {
  const recs = getAllRecommendations();
  const soonExpiry = inventoryLots.filter((lot) => lot.status === "임박").length;
  const sterilizationDue = inventoryLots.filter((lot) => lot.status === "재멸균 필요").length;
  const shortage = recs.filter((r) => r.current_stock <= r.minimum_stock).length;
  const orderNeeded = recs.filter((r) => r.order_required).length;
  return { soonExpiry, sterilizationDue, shortage, orderNeeded };
}

export function getItemPriceComparisons(itemId: string) {
  const rows = vendorItemPrices
    .filter((p) => p.item_id === itemId)
    .map((price) => {
      const vendor = vendorMasters.find((v) => v.vendor_id === price.vendor_id)!;
      const score = Math.round(
        (100000 / price.price) * 35 +
          (100 / Math.max(vendor.lead_time_days, 1)) * 25 +
          vendor.reliability_score * 0.4,
      );
      const groupSaving = vendor.group_purchase_supported ? Math.round(price.price * 0.08) : 0;
      return { ...price, vendor_name: vendor.vendor_name, lead_time_days: vendor.lead_time_days, reliability_score: vendor.reliability_score, group_purchase_supported: vendor.group_purchase_supported, score, groupSaving };
    })
    .sort((a, b) => b.score - a.score);
  return rows;
}

export function getCaseItemStatus(caseId: string) {
  return caseRequiredItems.filter((r) => r.case_id === caseId).map((req) => {
    const item = itemMasters.find((i) => i.item_id === req.item_id) as ItemMaster;
    const rec = getRecommendationForItem(req.item_id);
    const fefo = getFefoLot(req.item_id);
    const enough = rec.current_stock >= req.required_qty;
    return {
      ...req,
      item_name: item.item_name,
      risk: enough ? getItemRisk(req.item_id) : "부족",
      fefo_lot_id: fefo?.lot_id ?? "할당 불가",
      lot_status: fefo?.status ?? "만료",
      substitute_items: item.substitute_item_ids
        .map((id) => itemMasters.find((i) => i.item_id === id)?.item_name)
        .filter(Boolean),
      urgent_action: enough ? "우선 로트 사용" : "대체품 또는 긴급발주 필요",
    };
  });
}
