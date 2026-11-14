// All retention, cost and acquisition inputs are hypotheses, not measured Fixdeed data.
import assert from "node:assert/strict";
const inputs = {
  annualPrice: 59, monthlyPrice: 7.99, paymentPercent: 0.036,
  paymentFixed: 0.30, monthlyDelivery: 1, monthlySupport: 0.50,
  monthlyFreeServiceAllocation: 0.25, refundReserve: 0.02,
  annualRenewal: 0.55, monthlyChurn: 0.08, fullyLoadedCacTarget: 20,
};
const service = inputs.monthlyDelivery + inputs.monthlySupport + inputs.monthlyFreeServiceAllocation;
const contribution=(price,months)=>price-price*inputs.paymentPercent-inputs.paymentFixed-months*service-price*inputs.refundReserve;
const annual=contribution(inputs.annualPrice,12),monthly=contribution(inputs.monthlyPrice,1);
const monthlyPaidPeriods=(months)=>(1-(1-inputs.monthlyChurn)**months)/inputs.monthlyChurn;
const annual24=annual*(1+inputs.annualRenewal),monthly24=monthly*monthlyPaidPeriods(24);
const round=n=>Math.round(n*100)/100;
assert.equal(round(annual),34.40);assert.equal(round(monthly),5.49);assert.equal(round(annual24),53.31);assert.equal(round(monthly24),59.38);
const model={label:"Modeled assumptions. No traction, payments, CAC or retention observed.",inputs,
  annual:{contribution:round(annual),contributionMarginPct:round(annual/59*100),contribution24Months:round(annual24),contributionToCac24Months:round(annual24/20)},
  monthly:{contribution:round(monthly),expectedPaidMonths12:round(monthlyPaidPeriods(12)),expectedRevenue12:round(7.99*monthlyPaidPeriods(12)),contribution24Months:round(monthly24)},
  sensitivity:[20,30,40].map(cac=>({cac,annualFirstYearAfterAcquisition:round(annual-cac),annual24MonthContributionToCac:round(annual24/cac)})),
  scale:{annualPayersFor100MARR:Math.ceil(100_000_000/59),broaderAge25to44ProxyHouseholds:19_450_000,requiredProxyPenetrationPct:round(100_000_000/59/19_450_000*100),warning:"All-tenure EIA 2024 age25–44 proxy, not the first-two-years segment, not willingness to pay. Ambition, not forecast."},
};
console.log(JSON.stringify(model,null,2));
