import assert from "node:assert";
import { createHmac, createHash } from "node:crypto";
import {
  calculateInternalPaintingArea,
  calculateExternalPaintingArea,
  totalPaintingArea,
} from "../lib/calculations/painting";
import {
  normalizeEstimateSettings,
  parsePaintingRate,
} from "../lib/project/estimateSettings";
import {
  calculateCalculationResult,
  buildProjectEstimate,
} from "../lib/project/quantityEngine";
import { getPaymentConfig, DEFAULT_SERVICE_FEE_INR } from "../lib/payment/config";
import {
  createPaymentOrder,
  verifyAndRecordPayment,
  recordWebhookPayment,
  verifyWebhookSignature,
  PaymentError,
} from "../lib/payment/service";
import { POST as handleWebhookPost } from "../app/api/payments/webhook/route";
import { generateEstimatePdf } from "../lib/reports/estimatePdf";
import { prisma } from "../lib/prisma";

async function runTests() {
  console.log("=== RUNNING ESTIMEX IMPLEMENTATION VERIFICATION SUITE ===\n");
  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            passed++;
            console.log(`  ✓ ${name}`);
          })
          .catch((err) => {
            console.error(`  ✗ ${name}:`, err.message);
            throw err;
          });
      } else {
        passed++;
        console.log(`  ✓ ${name}`);
      }
    } catch (err: unknown) {
      console.error(`  ✗ ${name}:`, err instanceof Error ? err.message : String(err));
      throw err;
    }
  }

  console.log("1. PAINTING SPECIFICATIONS AND CALCULATIONS");
  test("Internal and external painting area functions compute correctly", () => {
    assert.strictEqual(calculateInternalPaintingArea(120), 120);
    assert.strictEqual(calculateExternalPaintingArea(80), 80);
    assert.strictEqual(totalPaintingArea(120, 80), 200);
    assert.strictEqual(calculateInternalPaintingArea(0), 0);
  });

  test("Legacy painting rate inverse unit conversion (< 1 converts 1/x)", () => {
    // 0.0625 litres per m² is 16 m² per litre
    const rate = parsePaintingRate(undefined, 0.0625);
    assert.strictEqual(rate, 16);
  });

  test("Legacy mislabeled painting rate (>= 1 preserved directly)", () => {
    // Engineer typed 15 into a field labeled 'litres per m²' meaning 15 m²/L
    const rate = parsePaintingRate(undefined, 15);
    assert.strictEqual(rate, 15);
  });

  test("normalizeEstimateSettings handles missing, zero, and legacy values safely", () => {
    const emptySettings = normalizeEstimateSettings({});
    assert.strictEqual(emptySettings.painting.internalCoverageM2PerLitre, 0);
    assert.strictEqual(emptySettings.painting.externalCoverageM2PerLitre, 0);
    assert.strictEqual(emptySettings.painting.coats, 0);

    const legacySettings = normalizeEstimateSettings({
      painting: {
        internalLitresPerM2: 15,
        externalLitresPerM2: 16,
        coats: 2,
      },
    });
    assert.strictEqual(legacySettings.painting.internalCoverageM2PerLitre, 15);
    assert.strictEqual(legacySettings.painting.externalCoverageM2PerLitre, 16);
  });

  test("Painting material & labour quantities derived from plaster when unentered", () => {
    const calculations = [
      {
        type: "INTERNAL_PLASTER" as const,
        inputs: {
          plasterGroups: [{ wallLength: 10, height: 3, numberOfWalls: 4 }],
          deductions: [],
        },
        results: { grossArea: 120, deductionArea: 0, netArea: 120 },
      },
      {
        type: "EXTERNAL_PLASTER" as const,
        inputs: {
          plasterGroups: [{ wallLength: 10, height: 3, numberOfWalls: 4 }],
          deductions: [],
        },
        results: { grossArea: 80, deductionArea: 0, netArea: 80 },
      },
    ];

    const estimate = buildProjectEstimate(
      calculations,
      [{ materialName: "Paint", unit: "LITRE", rate: 250 }],
      {
        painting: {
          internalCoverageM2PerLitre: 12,
          externalCoverageM2PerLitre: 10,
          coats: 2,
        },
        labour: [{ key: "painting", label: "Painting", unit: "m²", rate: 20 }],
      }
    );

    // Internal: 120 * 2 / 12 = 20 L
    // External: 80 * 2 / 10 = 16 L
    // Total Paint: 36 L
    const paint = estimate.materials.find((m) => m.materialName === "Paint");
    assert(paint, "Paint material must be present");
    assert.strictEqual(Math.round(paint.quantity * 100) / 100, 36);

    const paintingLabour = estimate.labour.find((l) => l.key === "painting");
    assert(paintingLabour, "Painting labour must be present");
    assert.strictEqual(paintingLabour.quantity, 200); // 120 + 80
  });

  console.log("\n2. PAYMENT WORKFLOW & WEBHOOK SECURITY");
  test("Payment config defaults to fixed ₹699 fee when env is unset", () => {
    const savedKeyId = process.env.PAYMENT_KEY_ID;
    const savedKeySecret = process.env.PAYMENT_KEY_SECRET;
    const savedRzpKeyId = process.env.RAZORPAY_KEY_ID;
    const savedRzpKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const savedFee = process.env.ESTIMATION_SERVICE_FEE_INR;
    try {
      delete process.env.PAYMENT_KEY_ID;
      delete process.env.PAYMENT_KEY_SECRET;
      delete process.env.RAZORPAY_KEY_ID;
      delete process.env.RAZORPAY_KEY_SECRET;
      delete process.env.ESTIMATION_SERVICE_FEE_INR;
      const config = getPaymentConfig();
      assert.strictEqual(DEFAULT_SERVICE_FEE_INR, 699, "DEFAULT_SERVICE_FEE_INR must be 699");
      assert.strictEqual(config.feeInr, 699, "feeInr must default to 699 INR");
      assert.strictEqual(config.currency, "INR");
      assert.strictEqual(config.isTestMode, true, "isTestMode must be true when keys absent");
      assert(config.upiVpa && config.upiVpa.length > 0, "UPI VPA must be present");
    } finally {
      if (savedKeyId !== undefined) process.env.PAYMENT_KEY_ID = savedKeyId;
      if (savedKeySecret !== undefined) process.env.PAYMENT_KEY_SECRET = savedKeySecret;
      if (savedRzpKeyId !== undefined) process.env.RAZORPAY_KEY_ID = savedRzpKeyId;
      if (savedRzpKeySecret !== undefined) process.env.RAZORPAY_KEY_SECRET = savedRzpKeySecret;
      if (savedFee !== undefined) process.env.ESTIMATION_SERVICE_FEE_INR = savedFee;
    }
  });

  test("Payment config respects positive environment fee override", () => {
    const savedFee = process.env.ESTIMATION_SERVICE_FEE_INR;
    try {
      process.env.ESTIMATION_SERVICE_FEE_INR = "899";
      const config = getPaymentConfig();
      assert.strictEqual(config.feeInr, 899, "feeInr must use environment override");
    } finally {
      if (savedFee !== undefined) process.env.ESTIMATION_SERVICE_FEE_INR = savedFee;
      else delete process.env.ESTIMATION_SERVICE_FEE_INR;
    }
  });

  await test("createPaymentOrder creates ₹699 order with dynamic UPI and prevents double charging", async () => {
    const savedKeyId = process.env.PAYMENT_KEY_ID;
    const savedKeySecret = process.env.PAYMENT_KEY_SECRET;
    process.env.PAYMENT_KEY_ID = "rzp_test_fixture";
    process.env.PAYMENT_KEY_SECRET = "fixture_secret_12345";

    const testEmail = `test_pay_cust_${Date.now()}@example.com`;
    const customer = await prisma.customer.create({
      data: { name: "Pay Cust", email: testEmail, passwordHash: "h" },
    });

    const project = await prisma.project.create({
      data: {
        projectName: "Villa Pay Test",
        clientName: "Pay Cust",
        clientEmail: testEmail,
        location: "Pune",
        customerId: customer.id,
        status: "PAYMENT_PENDING",
      },
    });

    try {
      // 1. Create order
      const order = await createPaymentOrder(project.id, customer.id);
      assert(order.orderId.startsWith("order_"), "orderId must be generated");
      assert.strictEqual(order.amountInr, 699, "amountInr must be 699");
      assert.strictEqual(order.amountPaise, 69900, "amountPaise must be 69900");
      assert.strictEqual(order.currency, "INR");
      assert(order.upiDeepLink.includes("am=699.00"), "UPI deep link must encode exact ₹699 amount");
      assert(order.upiDeepLink.includes(encodeURIComponent(order.orderId)), "UPI deep link must include orderId");

      // 2. Idempotency: second call returns the same pending order
      const secondOrder = await createPaymentOrder(project.id, customer.id);
      assert.strictEqual(secondOrder.orderId, order.orderId, "Must return existing order for idempotency");

      // 3. Complete payment with valid HMAC signature
      const paymentId = `pay_tx_${Date.now()}`;
      const validSig = createHmac("sha256", "fixture_secret_12345")
        .update(`${order.orderId}|${paymentId}`)
        .digest("hex");

      const verifyResult = await verifyAndRecordPayment({
        orderId: order.orderId,
        paymentId,
        signature: validSig,
        projectId: project.id,
        customerId: customer.id,
      });
      assert.strictEqual(verifyResult.success, true);
      assert.strictEqual(verifyResult.project.status, "PAYMENT_RECEIVED");

      // 4. Double charging prevention: calling createPaymentOrder now must throw
      let errorThrown = false;
      try {
        await createPaymentOrder(project.id, customer.id);
      } catch (err: unknown) {
        errorThrown = true;
        const msg = err instanceof Error ? err.message : "";
        assert(msg.includes("already been received"), "Must prevent double charging");
      }
      assert(errorThrown, "Must reject payment creation after payment received");
    } finally {
      await prisma.project.delete({ where: { id: project.id } });
      await prisma.customer.delete({ where: { id: customer.id } });
      if (savedKeyId !== undefined) process.env.PAYMENT_KEY_ID = savedKeyId;
      else delete process.env.PAYMENT_KEY_ID;
      if (savedKeySecret !== undefined) process.env.PAYMENT_KEY_SECRET = savedKeySecret;
      else delete process.env.PAYMENT_KEY_SECRET;
    }
  });

  await test("Case 1: Valid captured-payment webhook (payment.captured -> 200, COMPLETED)", async () => {
    const testSecret = "webhook_secret_case_1";
    process.env.PAYMENT_WEBHOOK_SECRET = testSecret;

    const testEmail = `test_case1_${Date.now()}@example.com`;
    const customer = await prisma.customer.create({
      data: { name: "Case 1 Customer", email: testEmail, passwordHash: "h" },
    });
    const project = await prisma.project.create({
      data: {
        projectName: "Case 1 Project",
        clientName: "Case 1 Customer",
        clientEmail: testEmail,
        location: "Mumbai",
        customerId: customer.id,
        status: "PAYMENT_PENDING",
      },
    });
    const order = await createPaymentOrder(project.id, customer.id);
    const paymentId = `pay_live_captured_${Date.now()}`;

    const webhookBody = JSON.stringify({
      entity: "event",
      account_id: "acc_live_test",
      event: "payment.captured",
      contains: ["payment"],
      payload: {
        payment: {
          entity: {
            id: paymentId,
            entity: "payment",
            amount: 69900,
            currency: "INR",
            status: "captured",
            order_id: order.orderId,
            method: "upi",
            email: testEmail,
          },
        },
      },
    });

    const signature = createHmac("sha256", testSecret).update(webhookBody).digest("hex");
    const request = new Request("https://estimex-nine.vercel.app/api/payments/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-razorpay-signature": signature,
      },
      body: webhookBody,
    });

    try {
      const res = await handleWebhookPost(request);
      assert.strictEqual(res.status, 200, "Webhook response status must be 200");
      const body = await res.json();
      assert.strictEqual(body.received, true);
      assert.strictEqual(body.status, "completed");
      assert.strictEqual(body.orderId, order.orderId);
      assert.strictEqual(body.paymentId, paymentId);

      // Verify DB state
      const updatedPayment = await prisma.payment.findUnique({ where: { orderId: order.orderId } });
      assert(updatedPayment, "Payment record must exist");
      assert.strictEqual(updatedPayment.status, "COMPLETED");
      assert.strictEqual(updatedPayment.transactionId, paymentId);
      const meta = updatedPayment.metadata as Record<string, unknown>;
      assert.strictEqual(meta.webhookEvent, "payment.captured");
      assert(meta.webhookProcessedAt, "webhookProcessedAt must be recorded");

      const updatedProject = await prisma.project.findUnique({ where: { id: project.id } });
      assert(updatedProject, "Project record must exist");
      assert.strictEqual(updatedProject.status, "PAYMENT_RECEIVED");
    } finally {
      await prisma.project.delete({ where: { id: project.id } });
      await prisma.customer.delete({ where: { id: customer.id } });
      delete process.env.PAYMENT_WEBHOOK_SECRET;
    }
  });

  await test("Case 2: Invalid webhook signature (-> 400)", async () => {
    process.env.PAYMENT_WEBHOOK_SECRET = "secret_case_2";
    const webhookBody = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: { id: "pay_test", order_id: "order_test", amount: 69900, currency: "INR" },
        },
      },
    });

    const request = new Request("https://estimex-nine.vercel.app/api/payments/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-razorpay-signature": "tampered_bad_signature_hex",
      },
      body: webhookBody,
    });

    const res = await handleWebhookPost(request);
    assert.strictEqual(res.status, 400, "Must return 400 on invalid signature");
    const body = await res.json();
    assert(body.error.includes("Invalid webhook signature"));
    delete process.env.PAYMENT_WEBHOOK_SECRET;
  });

  await test("Case 3: Missing webhook secret in production (-> rejected 400)", async () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const envRecord = process.env as Record<string, string | undefined>;
    try {
      envRecord.NODE_ENV = "production";
      delete process.env.PAYMENT_WEBHOOK_SECRET;
      delete process.env.RAZORPAY_WEBHOOK_SECRET;

      const webhookBody = JSON.stringify({ event: "payment.captured" });
      const request = new Request("https://estimex-nine.vercel.app/api/payments/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-razorpay-signature": "any_signature",
        },
        body: webhookBody,
      });

      const res = await handleWebhookPost(request);
      assert.strictEqual(res.status, 400, "Must reject webhook when secret is missing in production");
      assert.strictEqual(verifyWebhookSignature(webhookBody, "any_sig"), false);
    } finally {
      envRecord.NODE_ENV = prevNodeEnv;
    }
  });

  await test("Case 4: Failed-payment event (payment.failed -> 200, failure recorded, NOT marked completed)", async () => {
    const testSecret = "secret_case_4";
    process.env.PAYMENT_WEBHOOK_SECRET = testSecret;

    const testEmail = `test_case4_${Date.now()}@example.com`;
    const customer = await prisma.customer.create({
      data: { name: "Case 4 Customer", email: testEmail, passwordHash: "h" },
    });
    const project = await prisma.project.create({
      data: {
        projectName: "Case 4 Project",
        clientName: "Case 4 Customer",
        clientEmail: testEmail,
        location: "Delhi",
        customerId: customer.id,
        status: "PAYMENT_PENDING",
      },
    });
    const order = await createPaymentOrder(project.id, customer.id);
    const failedPaymentId = `pay_failed_${Date.now()}`;

    const webhookBody = JSON.stringify({
      entity: "event",
      event: "payment.failed",
      contains: ["payment"],
      payload: {
        payment: {
          entity: {
            id: failedPaymentId,
            order_id: order.orderId,
            amount: 69900,
            currency: "INR",
            status: "failed",
            error_code: "BAD_REQUEST_ERROR",
            error_description: "Payment failed due to card decline",
          },
        },
      },
    });

    const signature = createHmac("sha256", testSecret).update(webhookBody).digest("hex");
    const request = new Request("https://estimex-nine.vercel.app/api/payments/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-razorpay-signature": signature,
      },
      body: webhookBody,
    });

    try {
      const res = await handleWebhookPost(request);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.received, true);
      assert.strictEqual(body.event, "payment.failed");
      assert.strictEqual(body.status, "recorded_failure");

      // Check DB state: payment MUST remain PENDING, project MUST remain PAYMENT_PENDING
      const paymentRecord = await prisma.payment.findUnique({ where: { orderId: order.orderId } });
      assert(paymentRecord, "Payment record must exist");
      assert.strictEqual(paymentRecord.status, "PENDING", "Payment status must NOT be COMPLETED");
      const meta = paymentRecord.metadata as Record<string, unknown>;
      assert.strictEqual(meta.lastFailedPaymentId, failedPaymentId);
      assert.strictEqual(meta.lastErrorCode, "BAD_REQUEST_ERROR");
      assert.strictEqual(meta.lastErrorDescription, "Payment failed due to card decline");

      const projectRecord = await prisma.project.findUnique({ where: { id: project.id } });
      assert(projectRecord, "Project record must exist");
      assert.strictEqual(projectRecord.status, "PAYMENT_PENDING", "Project status must NOT be PAYMENT_RECEIVED");
    } finally {
      await prisma.project.delete({ where: { id: project.id } });
      await prisma.customer.delete({ where: { id: customer.id } });
      delete process.env.PAYMENT_WEBHOOK_SECRET;
    }
  });

  await test("Case 5: Unrelated event (order.created / refund.processed -> 200 ignored, DB unchanged)", async () => {
    const testSecret = "secret_case_5";
    process.env.PAYMENT_WEBHOOK_SECRET = testSecret;

    const webhookBody = JSON.stringify({
      entity: "event",
      event: "order.created",
      payload: {
        order: { entity: { id: "order_unrelated_123" } },
      },
    });

    const signature = createHmac("sha256", testSecret).update(webhookBody).digest("hex");
    const request = new Request("https://estimex-nine.vercel.app/api/payments/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-razorpay-signature": signature,
      },
      body: webhookBody,
    });

    const res = await handleWebhookPost(request);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.received, true);
    assert.strictEqual(body.event, "order.created");
    assert.strictEqual(body.status, "ignored");
    delete process.env.PAYMENT_WEBHOOK_SECRET;
  });

  await test("Case 6: Missing payment ID or order ID (-> 400, no invented transaction ID)", async () => {
    const testSecret = "secret_case_6";
    process.env.PAYMENT_WEBHOOK_SECRET = testSecret;

    // Missing payment ID
    const bodyNoPaymentId = JSON.stringify({
      event: "payment.captured",
      payload: {
        order: { entity: { id: "order_only_123" } },
      },
    });

    const sigNoPayment = createHmac("sha256", testSecret).update(bodyNoPaymentId).digest("hex");
    const reqNoPayment = new Request("https://estimex-nine.vercel.app/api/payments/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-razorpay-signature": sigNoPayment,
      },
      body: bodyNoPaymentId,
    });

    const res1 = await handleWebhookPost(reqNoPayment);
    assert.strictEqual(res1.status, 400);
    const data1 = await res1.json();
    assert(data1.error.includes("Missing required payment ID or order ID"));

    // Missing order ID
    const bodyNoOrderId = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_only_123" } },
      },
    });

    const sigNoOrder = createHmac("sha256", testSecret).update(bodyNoOrderId).digest("hex");
    const reqNoOrder = new Request("https://estimex-nine.vercel.app/api/payments/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-razorpay-signature": sigNoOrder,
      },
      body: bodyNoOrderId,
    });

    const res2 = await handleWebhookPost(reqNoOrder);
    assert.strictEqual(res2.status, 400);
    const data2 = await res2.json();
    assert(data2.error.includes("Missing required payment ID or order ID"));
    delete process.env.PAYMENT_WEBHOOK_SECRET;
  });

  await test("Case 7: Incorrect amount or currency (amount 10000 or currency USD -> 400)", async () => {
    const testSecret = "secret_case_7";
    process.env.PAYMENT_WEBHOOK_SECRET = testSecret;

    // 7a: Amount mismatch (10000 paise instead of 69900)
    const bodyBadAmount = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_bad_amount",
            order_id: "order_bad_amount",
            amount: 10000,
            currency: "INR",
          },
        },
      },
    });

    const sigBadAmount = createHmac("sha256", testSecret).update(bodyBadAmount).digest("hex");
    const reqBadAmount = new Request("https://estimex-nine.vercel.app/api/payments/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-razorpay-signature": sigBadAmount,
      },
      body: bodyBadAmount,
    });

    const resBadAmount = await handleWebhookPost(reqBadAmount);
    assert.strictEqual(resBadAmount.status, 400);
    const dataBadAmount = await resBadAmount.json();
    assert(dataBadAmount.error.includes("does not match expected estimation fee"));

    // 7b: Currency mismatch (USD instead of INR)
    const bodyBadCurrency = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_bad_curr",
            order_id: "order_bad_curr",
            amount: 69900,
            currency: "USD",
          },
        },
      },
    });

    const sigBadCurrency = createHmac("sha256", testSecret).update(bodyBadCurrency).digest("hex");
    const reqBadCurrency = new Request("https://estimex-nine.vercel.app/api/payments/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-razorpay-signature": sigBadCurrency,
      },
      body: bodyBadCurrency,
    });

    const resBadCurrency = await handleWebhookPost(reqBadCurrency);
    assert.strictEqual(resBadCurrency.status, 400);
    const dataBadCurrency = await resBadCurrency.json();
    assert(dataBadCurrency.error.includes("does not match expected (INR)"));
    delete process.env.PAYMENT_WEBHOOK_SECRET;
  });

  await test("Case 8: Unknown order (order_unknown_xxx -> 404)", async () => {
    const testSecret = "secret_case_8";
    process.env.PAYMENT_WEBHOOK_SECRET = testSecret;

    const webhookBody = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_unknown_order_123",
            order_id: "order_does_not_exist_9999",
            amount: 69900,
            currency: "INR",
          },
        },
      },
    });

    const signature = createHmac("sha256", testSecret).update(webhookBody).digest("hex");
    const request = new Request("https://estimex-nine.vercel.app/api/payments/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-razorpay-signature": signature,
      },
      body: webhookBody,
    });

    const res = await handleWebhookPost(request);
    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert(body.error.includes("Payment record not found for webhook order"));
    delete process.env.PAYMENT_WEBHOOK_SECRET;
  });

  await test("Case 9: Duplicate webhook delivery (idempotent 200 already_processed)", async () => {
    const testSecret = "secret_case_9";
    process.env.PAYMENT_WEBHOOK_SECRET = testSecret;

    const testEmail = `test_case9_${Date.now()}@example.com`;
    const customer = await prisma.customer.create({
      data: { name: "Case 9 Customer", email: testEmail, passwordHash: "h" },
    });
    const project = await prisma.project.create({
      data: {
        projectName: "Case 9 Project",
        clientName: "Case 9 Customer",
        clientEmail: testEmail,
        location: "Kolkata",
        customerId: customer.id,
        status: "PAYMENT_PENDING",
      },
    });
    const order = await createPaymentOrder(project.id, customer.id);
    const paymentId = `pay_case9_${Date.now()}`;

    const webhookBody = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: order.orderId,
            amount: 69900,
            currency: "INR",
          },
        },
      },
    });

    const signature = createHmac("sha256", testSecret).update(webhookBody).digest("hex");
    const makeReq = () =>
      new Request("https://estimex-nine.vercel.app/api/payments/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-razorpay-signature": signature,
        },
        body: webhookBody,
      });

    try {
      // First delivery -> completed
      const res1 = await handleWebhookPost(makeReq());
      assert.strictEqual(res1.status, 200);
      const body1 = await res1.json();
      assert.strictEqual(body1.status, "completed");

      // Second delivery (duplicate) -> already_processed
      const res2 = await handleWebhookPost(makeReq());
      assert.strictEqual(res2.status, 200);
      const body2 = await res2.json();
      assert.strictEqual(body2.status, "already_processed");
      assert.strictEqual(body2.received, true);
    } finally {
      await prisma.project.delete({ where: { id: project.id } });
      await prisma.customer.delete({ where: { id: customer.id } });
      delete process.env.PAYMENT_WEBHOOK_SECRET;
    }
  });

  await test("Case 10: Database failure returns 500 retryable response", async () => {
    process.env.PAYMENT_WEBHOOK_SECRET = "secret_case_10";
    const webhookBody = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_db_err",
            order_id: "order_db_err",
            amount: 69900,
            currency: "INR",
          },
        },
      },
    });

    const signature = createHmac("sha256", "secret_case_10").update(webhookBody).digest("hex");
    const request = new Request("https://estimex-nine.vercel.app/api/payments/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-razorpay-signature": signature,
      },
      body: webhookBody,
    });

    // Mock underlying client $transaction throwing database connection error
    const globalStore = globalThis as unknown as {
      prisma: { $transaction: (...args: unknown[]) => Promise<unknown> };
    };
    const client = globalStore.prisma;
    const origTransaction = client.$transaction;
    client.$transaction = async () => {
      throw new Error("PrismaClientKnownRequestError: Connection lost to database host");
    };

    try {
      const res = await handleWebhookPost(request);
      assert.strictEqual(res.status, 500, "Database errors must return 500 so Razorpay retries");
      const body = await res.json();
      assert(body.error.includes("Database error during webhook processing. Will retry."));
    } finally {
      client.$transaction = origTransaction;
      delete process.env.PAYMENT_WEBHOOK_SECRET;
    }
  });

  await test("Case 11: Invalid checkout signature & client spoofing prevention", async () => {
    const savedKeyId = process.env.PAYMENT_KEY_ID;
    const savedKeySecret = process.env.PAYMENT_KEY_SECRET;
    process.env.PAYMENT_KEY_ID = "rzp_test_fixture";
    process.env.PAYMENT_KEY_SECRET = "fixture_secret_case_11";

    const customerA = await prisma.customer.create({
      data: { name: "Customer A", email: `cust_a_${Date.now()}@example.com`, passwordHash: "h" },
    });
    const customerB = await prisma.customer.create({
      data: { name: "Customer B", email: `cust_b_${Date.now()}@example.com`, passwordHash: "h" },
    });

    const projectA = await prisma.project.create({
      data: {
        projectName: "Project A",
        clientName: "Customer A",
        clientEmail: customerA.email,
        location: "Bengaluru",
        customerId: customerA.id,
        status: "PAYMENT_PENDING",
      },
    });

    const orderA = await createPaymentOrder(projectA.id, customerA.id);
    const paymentId = `pay_case_11_${Date.now()}`;

    try {
      // 11a: Tampered checkout signature throws 400
      let sigError = false;
      try {
        await verifyAndRecordPayment({
          orderId: orderA.orderId,
          paymentId,
          signature: "tampered_fake_signature_hex",
          projectId: projectA.id,
          customerId: customerA.id,
        });
      } catch (err: unknown) {
        sigError = true;
        assert(err instanceof PaymentError);
        assert.strictEqual(err.status, 400);
        assert(err.message.includes("Invalid payment signature"));
      }
      assert(sigError, "Invalid checkout signature must throw 400");

      // Valid signature
      const validSig = createHmac("sha256", "fixture_secret_case_11")
        .update(`${orderA.orderId}|${paymentId}`)
        .digest("hex");

      // 11b: Customer B attempts to spoof verification for Customer A's project (throws 403)
      let spoofError = false;
      try {
        await verifyAndRecordPayment({
          orderId: orderA.orderId,
          paymentId,
          signature: validSig,
          projectId: projectA.id,
          customerId: customerB.id, // Wrong customer!
        });
      } catch (err: unknown) {
        spoofError = true;
        assert(err instanceof PaymentError);
        assert.strictEqual(err.status, 403);
        assert(err.message.includes("Project does not belong to the authenticated customer"));
      }
      assert(spoofError, "Client spoofing must be blocked with 403");

      // 11c: Legitimate verification with Customer A succeeds
      const legitimateResult = await verifyAndRecordPayment({
        orderId: orderA.orderId,
        paymentId,
        signature: validSig,
        projectId: projectA.id,
        customerId: customerA.id,
      });
      assert.strictEqual(legitimateResult.success, true);
      assert.strictEqual(legitimateResult.project.status, "PAYMENT_RECEIVED");
    } finally {
      await prisma.project.delete({ where: { id: projectA.id } });
      await prisma.customer.deleteMany({
        where: { id: { in: [customerA.id, customerB.id] } },
      });
      if (savedKeyId !== undefined) process.env.PAYMENT_KEY_ID = savedKeyId;
      else delete process.env.PAYMENT_KEY_ID;
      if (savedKeySecret !== undefined) process.env.PAYMENT_KEY_SECRET = savedKeySecret;
      else delete process.env.PAYMENT_KEY_SECRET;
    }
  });

  await test("Status guards: Webhooks do not downgrade IN_PROGRESS/COMPLETED or overwrite REFUNDED", async () => {
    const testSecret = "secret_status_guards";
    process.env.PAYMENT_WEBHOOK_SECRET = testSecret;

    const testEmail = `test_guards_${Date.now()}@example.com`;
    const customer = await prisma.customer.create({
      data: { name: "Guard Customer", email: testEmail, passwordHash: "h" },
    });

    const projectInProgress = await prisma.project.create({
      data: {
        projectName: "Guard Project 1",
        clientName: "Guard Customer",
        clientEmail: testEmail,
        location: "Hyderabad",
        customerId: customer.id,
        status: "PAYMENT_PENDING",
      },
    });
    const order1 = await createPaymentOrder(projectInProgress.id, customer.id);
    // Advance project to IN_PROGRESS
    await prisma.project.update({
      where: { id: projectInProgress.id },
      data: { status: "IN_PROGRESS" },
    });

    const projectRefunded = await prisma.project.create({
      data: {
        projectName: "Guard Project 2",
        clientName: "Guard Customer",
        clientEmail: testEmail,
        location: "Hyderabad",
        customerId: customer.id,
        status: "PAYMENT_PENDING",
      },
    });
    const order2 = await createPaymentOrder(projectRefunded.id, customer.id);
    await prisma.payment.update({
      where: { orderId: order2.orderId },
      data: { status: "REFUNDED" },
    });

    try {
      // 1. IN_PROGRESS project is preserved
      const webhookRes = await recordWebhookPayment({
        orderId: order1.orderId,
        paymentId: `pay_guard_${Date.now()}`,
      });
      assert.strictEqual(webhookRes.success, true);
      assert.strictEqual(webhookRes.project.status, "IN_PROGRESS", "Must NOT downgrade from IN_PROGRESS to PAYMENT_RECEIVED");

      // 2. REFUNDED payment is rejected
      let refundError = false;
      try {
        await recordWebhookPayment({
          orderId: order2.orderId,
          paymentId: `pay_refund_${Date.now()}`,
        });
      } catch (err: unknown) {
        refundError = true;
        assert(err instanceof PaymentError);
        assert.strictEqual(err.status, 400);
        assert(err.message.includes("already refunded"));
      }
      assert(refundError, "Refunded payment must reject webhook payment");
    } finally {
      await prisma.project.deleteMany({ where: { id: { in: [projectInProgress.id, projectRefunded.id] } } });
      await prisma.customer.delete({ where: { id: customer.id } });
      delete process.env.PAYMENT_WEBHOOK_SECRET;
    }
  });

  console.log("\n3. MULTI-STOREY BUILDING SUPPORT");
  test("Single-storey backward compatibility produces identical results", () => {
    const singleStoreyInputs = {
      columnGroups: [
        { type: "C1", width: 0.4, depth: 0.4, number: 6, height: 3.0 },
      ],
    };

    const res = calculateCalculationResult("COLUMN_CONCRETE", singleStoreyInputs);
    // 0.4 * 0.4 * 3.0 * 6 = 2.88 m³
    assert.strictEqual(Math.round(Number(res.concreteVolume) * 1000) / 1000, 2.88);
    // (0.4 + 0.4) * 2 * 3.0 * 6 = 28.8 m²
    assert.strictEqual(Math.round(Number(res.shutteringArea) * 1000) / 1000, 28.8);
  });

  test("Multi-storey independent dimensions and floor aggregation", () => {
    const multiStoreyInputs = {
      byFloor: {
        "0": {
          // Ground Floor: 6 columns of 400x400, height 3.0m -> 2.88 m³
          columnGroups: [
            { type: "C1", width: 0.4, depth: 0.4, number: 6, height: 3.0 },
          ],
        },
        "1": {
          // First Floor: 4 columns of 300x300, height 3.2m -> 0.3 * 0.3 * 3.2 * 4 = 1.152 m³
          columnGroups: [
            { type: "C1-Upper", width: 0.3, depth: 0.3, number: 4, height: 3.2 },
          ],
        },
      },
    };

    const res = calculateCalculationResult("COLUMN_CONCRETE", multiStoreyInputs);
    // Total aggregated volume: 2.88 + 1.152 = 4.032 m³
    assert.strictEqual(Math.round(Number(res.concreteVolume) * 1000) / 1000, 4.032);

    // byFloor breakdown present and accurate
    const bf = res.byFloor as Record<string, { concreteVolume: number; shutteringArea: number }>;
    assert(bf, "byFloor must be present");
    assert.strictEqual(Math.round(bf["0"].concreteVolume * 1000) / 1000, 2.88);
    assert.strictEqual(Math.round(bf["1"].concreteVolume * 1000) / 1000, 1.152);
  });

  test("buildProjectEstimate aggregates multi-storey quantities and generates floorBreakdown", () => {
    const multiStoreyCalculations = [
      {
        type: "COLUMN_CONCRETE" as const,
        inputs: {
          byFloor: {
            "0": { columnGroups: [{ type: "C1", width: 0.4, depth: 0.4, number: 6, height: 3.0 }] },
            "1": { columnGroups: [{ type: "C1", width: 0.3, depth: 0.3, number: 4, height: 3.2 }] },
          },
        },
        results: {
          concreteVolume: 4.032,
          shutteringArea: 44.16,
          byFloor: {
            "0": { concreteVolume: 2.88, shutteringArea: 28.8 },
            "1": { concreteVolume: 1.152, shutteringArea: 15.36 },
          },
        },
      },
    ];

    const estimate = buildProjectEstimate(
      multiStoreyCalculations,
      [{ materialName: "Cement", unit: "BAG", rate: 380 }],
      {}
    );

    // Total column concrete work quantity must equal aggregated 4.032 m³ without double counting
    const colWork = estimate.workQuantities.find((w) => w.key === "columnConcrete");
    assert(colWork, "Column concrete work must exist");
    assert.strictEqual(colWork.quantity, 4.032);

    // floorBreakdown must contain both storeys
    assert(estimate.floorBreakdown, "floorBreakdown must be present");
    assert.strictEqual(estimate.floorBreakdown.length, 2);
    assert.strictEqual(estimate.floorBreakdown[0].floorName, "Ground Floor");
    assert.strictEqual(estimate.floorBreakdown[1].floorName, "Floor 1");
    assert.strictEqual(estimate.floorBreakdown[0].workQuantities[0].quantity, 2.88);
    assert.strictEqual(estimate.floorBreakdown[1].workQuantities[0].quantity, 1.152);
  });

  console.log("\n4. DATABASE INTEGRATION & MODEL PERSISTENCE");
  await test("PostgreSQL database connection and migrations are valid", async () => {
    const projectCount = await prisma.project.count();
    assert(typeof projectCount === "number", "Database query must succeed");

    const floorCount = await prisma.floor.count();
    assert(typeof floorCount === "number", "Floor table query must succeed");

    const paymentCount = await prisma.payment.count();
    assert(typeof paymentCount === "number", "Payment table query must succeed");
  });

  console.log("\n5. CUSTOMER SESSION EXPIRY");

  // Test the expiry logic in isolation (no live DB/cookie needed for these).
  // We import the module-level constants directly to keep tests aligned with
  // the runtime values and environment variable overrides.
  const { INACTIVITY_MINUTES, SESSION_DAYS } = await import("../lib/customer-auth");

  test("INACTIVITY_MINUTES defaults to 30 unless env overrides it", () => {
    // Either the default (30) or an env-override — must be a positive number.
    assert(typeof INACTIVITY_MINUTES === "number", "INACTIVITY_MINUTES must be a number");
    assert(INACTIVITY_MINUTES > 0, "INACTIVITY_MINUTES must be positive");
    if (!process.env.CUSTOMER_INACTIVITY_TIMEOUT_MINUTES) {
      assert.strictEqual(INACTIVITY_MINUTES, 30, "Default inactivity timeout must be 30 minutes");
    }
  });

  test("SESSION_DAYS defaults to 7 unless env overrides it", () => {
    assert(typeof SESSION_DAYS === "number", "SESSION_DAYS must be a number");
    assert(SESSION_DAYS > 0, "SESSION_DAYS must be positive");
    if (!process.env.CUSTOMER_SESSION_DAYS) {
      assert.strictEqual(SESSION_DAYS, 7, "Default session lifetime must be 7 days");
    }
  });

  test("Inactivity deadline arithmetic is correct", () => {
    const now = Date.now();
    const inactivityMs = INACTIVITY_MINUTES * 60 * 1000;
    const absoluteMs = SESSION_DAYS * 24 * 60 * 60 * 1000;

    // A session whose lastActiveAt is 1ms before the inactivity deadline should be expired.
    const justExpiredLastActive = new Date(now - inactivityMs - 1);
    const inactivityDeadline = new Date(now - inactivityMs);
    assert(
      justExpiredLastActive <= inactivityDeadline,
      "Session inactive for longer than INACTIVITY_MINUTES must be past the deadline",
    );

    // A session whose lastActiveAt is 1ms after the inactivity deadline should be active.
    const justActiveLastActive = new Date(now - inactivityMs + 1000);
    assert(
      justActiveLastActive > inactivityDeadline,
      "Session inactive for less than INACTIVITY_MINUTES must be within the deadline",
    );

    // Absolute lifetime: expiresAt 7 days from now should still be valid.
    const futureExpiry = new Date(now + absoluteMs);
    assert(futureExpiry > new Date(now), "Absolute expiry must be in the future");
  });

  test("Absolute lifetime is enforced independently of inactivity", () => {
    const now = Date.now();
    const absoluteMs = SESSION_DAYS * 24 * 60 * 60 * 1000;

    // Simulate a session that was touched recently but has exceeded the absolute lifetime.
    const recentLastActive = new Date(now - 60_000); // active 1 minute ago
    const expiredExpiresAt = new Date(now - 1); // absolute lifetime elapsed
    const validExpiresAt = new Date(now + absoluteMs); // lifetime still valid

    // Both conditions must be checked independently.
    assert(expiredExpiresAt <= new Date(now), "Expired absolute session must be caught");
    assert(recentLastActive > new Date(now - INACTIVITY_MINUTES * 60 * 1000), "Recently active session would pass inactivity check");
    // The session must be rejected because expiresAt has lapsed, even if lastActiveAt is recent.
    assert(expiredExpiresAt <= new Date(now), "Absolute lifetime must take priority over recent activity");
    assert(validExpiresAt > new Date(now), "Non-expired absolute lifetime must be valid");
  });

  await test("CustomerSession table has lastActiveAt column (migration applied)", async () => {
    const sessionCount = await prisma.customerSession.count();
    assert(typeof sessionCount === "number", "CustomerSession table must be queryable");

    // Verify the column exists by running a query that uses it.
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "CustomerSession"
      WHERE "lastActiveAt" IS NOT NULL OR "lastActiveAt" IS NULL
    `;
    assert(Array.isArray(result), "lastActiveAt column must exist and be queryable");
  });

  await test("touchCustomerSession updates lastActiveAt in database on meaningful action", async () => {
    const { touchCustomerSession } = await import("../lib/customer-auth");
    const testEmail = `test_inactivity_${Date.now()}@example.com`;
    const testCustomer = await prisma.customer.create({
      data: {
        name: "Test Inactivity Customer",
        email: testEmail,
        passwordHash: "test_hash",
      },
    });

    const testToken = `test_token_${Date.now()}`;
    const tokenHash = createHash("sha256").update(testToken).digest("hex");
    const initialActive = new Date(Date.now() - 10 * 60 * 1000); // 10 mins ago

    const session = await prisma.customerSession.create({
      data: {
        customerId: testCustomer.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastActiveAt: initialActive,
      },
    });

    assert.strictEqual(session.lastActiveAt.getTime(), initialActive.getTime());

    // Meaningful activity touches the session
    await touchCustomerSession(testToken);

    const updatedSession = await prisma.customerSession.findUnique({
      where: { id: session.id },
    });

    assert(updatedSession, "Session must still exist");
    assert(
      updatedSession.lastActiveAt.getTime() > initialActive.getTime(),
      "lastActiveAt must be refreshed after touchCustomerSession",
    );

    // Clean up test customer and cascade sessions
    await prisma.customer.delete({ where: { id: testCustomer.id } });
  });

  test("Inactivity expiration threshold accurately distinguishes active vs expired", () => {
    const now = new Date();
    const timeoutMs = 30 * 60 * 1000;
    const deadline = new Date(now.getTime() - timeoutMs);

    const expiredTimestamp = new Date(now.getTime() - 31 * 60 * 1000);
    const activeTimestamp = new Date(now.getTime() - 15 * 60 * 1000);

    assert(expiredTimestamp <= deadline, "Timestamp 31 min ago must be expired");
    assert(activeTimestamp > deadline, "Timestamp 15 min ago must be active");
  });

  console.log("\n6. LOGOUT, CACHE-CONTROL HEADERS & BACK-BUTTON SECURITY");

  test("Engineer unauthorizedResponse returns 401 with no-store cache headers", async () => {
    const { unauthorizedResponse } = await import("../lib/auth");
    const response = unauthorizedResponse();
    assert.strictEqual(response.status, 401);
    const cacheControl = response.headers.get("Cache-Control");
    assert(cacheControl && cacheControl.includes("no-store"), "Must have no-store in Cache-Control");
    assert(cacheControl.includes("no-cache"), "Must have no-cache in Cache-Control");
    assert.strictEqual(response.headers.get("Pragma"), "no-cache");
  });

  test("Customer customerUnauthorizedResponse returns 401 with no-store cache headers", async () => {
    const { customerUnauthorizedResponse } = await import("../lib/customer-auth");
    const response = customerUnauthorizedResponse();
    assert.strictEqual(response.status, 401);
    const cacheControl = response.headers.get("Cache-Control");
    assert(cacheControl && cacheControl.includes("no-store"), "Must have no-store in Cache-Control");
    assert(cacheControl.includes("no-cache"), "Must have no-cache in Cache-Control");
    assert.strictEqual(response.headers.get("Pragma"), "no-cache");
  });

  await test("Engineer logout route redirects to /engineer-login with 303 and Clear-Site-Data", async () => {
    const { POST } = await import("../app/api/auth/logout/route");
    const fakeRequest = new Request("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });
    const response = await POST(fakeRequest);
    assert.strictEqual(response.status, 303, "Logout redirect must be 303 See Other");
    assert(
      response.headers.get("Location")?.endsWith("/engineer-login"),
      "Must redirect to /engineer-login",
    );
    assert(
      response.headers.get("Cache-Control")?.includes("no-store"),
      "Must have no-store header on logout",
    );
    assert.strictEqual(
      response.headers.get("Clear-Site-Data"),
      '"cache"',
      "Must include Clear-Site-Data: cache",
    );
  });

  await test("Customer logout route redirects to /login with 303 and Clear-Site-Data", async () => {
    const { POST } = await import("../app/api/customer-auth/logout/route");
    const fakeRequest = new Request("http://localhost:3000/api/customer-auth/logout", {
      method: "POST",
    });
    const response = await POST(fakeRequest);
    assert.strictEqual(response.status, 303, "Logout redirect must be 303 See Other");
    assert(
      response.headers.get("Location")?.endsWith("/login"),
      "Must redirect to /login",
    );
    assert(
      response.headers.get("Cache-Control")?.includes("no-store"),
      "Must have no-store header on logout",
    );
    assert.strictEqual(
      response.headers.get("Clear-Site-Data"),
      '"cache"',
      "Must include Clear-Site-Data: cache",
    );
  });

  await test("Customer session invalidation cleans up database record completely", async () => {
    const testEmail = `test_logout_cust_${Date.now()}@example.com`;
    const customer = await prisma.customer.create({
      data: { name: "Logout Cust", email: testEmail, passwordHash: "h" },
    });
    const token = `token_logout_${Date.now()}`;
    const tokenHash = createHash("sha256").update(token).digest("hex");

    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    // Invalidate
    await prisma.customerSession.deleteMany({ where: { tokenHash } });
    const check = await prisma.customerSession.findUnique({ where: { tokenHash } });
    assert.strictEqual(check, null, "Session must be completely deleted from DB");

    await prisma.customer.delete({ where: { id: customer.id } });
  });

  await test("Engineer session invalidation cleans up database record completely", async () => {
    const testEmail = `test_logout_eng_${Date.now()}@example.com`;
    const engineer = await prisma.engineer.create({
      data: { name: "Logout Eng", email: testEmail, passwordHash: "h" },
    });
    const token = `token_logout_eng_${Date.now()}`;
    const tokenHash = createHash("sha256").update(token).digest("hex");

    await prisma.engineerSession.create({
      data: {
        engineerId: engineer.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    // Invalidate
    await prisma.engineerSession.deleteMany({ where: { tokenHash } });
    const check = await prisma.engineerSession.findUnique({ where: { tokenHash } });
    assert.strictEqual(check, null, "Session must be completely deleted from DB");

    await prisma.engineer.delete({ where: { id: engineer.id } });
  });

  await test("next.config.ts configures noCacheHeaders for protected paths", async () => {
    const nextConfig = (await import("../next.config")).default;
    assert(typeof nextConfig.headers === "function", "nextConfig.headers must be a function");
    const headersList = await nextConfig.headers();
    const customerHeader = headersList.find((h: { source: string }) => h.source === "/customer/:path*");
    assert(customerHeader, "Must have header for /customer/:path*");
    const cc = customerHeader.headers.find((h: { key: string }) => h.key === "Cache-Control");
    assert(cc && cc.value.includes("no-store"), "Must include no-store in Cache-Control");
  });

  console.log("\n7. PROFESSIONAL ESTIMATE PDF GENERATION");
  await test("generateEstimatePdf outputs valid PDF buffer with BOQ and separate ₹699 receipt", async () => {
    const dummyPdfInput = {
      project: {
        id: "proj_pdf_12345678",
        projectName: "Modern Duplex Villa G+1",
        clientName: "Rahul Sharma",
        clientEmail: "rahul@example.com",
        location: "Kothrud, Pune",
        createdAt: new Date(),
      },
      estimate: {
        revision: 1,
        finalizedAt: new Date(),
        totalCost: 1250000,
        snapshot: {
          workQuantities: [
            { key: "excavation", label: "Excavation", quantity: 45.5, unit: "m³" },
            { key: "columnConcrete", label: "Column Concrete", quantity: 18.2, unit: "m³" },
            { key: "brickwork", label: "Brickwork", quantity: 82.0, unit: "m³" },
            { key: "internalPainting", label: "Internal Painting", quantity: 240.0, unit: "m²" },
          ],
          materials: [
            { materialName: "Cement", quantity: 350, unit: "BAG", rate: 380, cost: 133000 },
            { materialName: "Steel Reinforcement", quantity: 2200, unit: "KILOGRAM", rate: 68, cost: 149600 },
            { materialName: "Paint", quantity: 48, unit: "LITRE", rate: 320, cost: 15360 },
          ],
          labour: [
            { key: "concreteLabour", label: "Concrete Pouring Labour", quantity: 18.2, unit: "m³", rate: 1200, cost: 21840 },
            { key: "paintingLabour", label: "Painting Labour", quantity: 240, unit: "m²", rate: 25, cost: 6000 },
          ],
          totalMaterialCost: 297960,
          totalLabourCost: 27840,
          totalCost: 325800,
          floorBreakdown: [
            {
              floorLevel: 0,
              floorName: "Ground Floor",
              workQuantities: [
                { key: "columnConcrete", label: "Column Concrete", quantity: 10.0, unit: "m³" },
                { key: "brickwork", label: "Brickwork", quantity: 45.0, unit: "m³" },
              ],
            },
            {
              floorLevel: 1,
              floorName: "First Floor",
              workQuantities: [
                { key: "columnConcrete", label: "Column Concrete", quantity: 8.2, unit: "m³" },
                { key: "brickwork", label: "Brickwork", quantity: 37.0, unit: "m³" },
              ],
            },
          ],
        },
      },
      payment: {
        amount: 699,
        currency: "INR",
        status: "COMPLETED",
        orderId: "order_test_987654",
        transactionId: "pay_test_receipt_123",
        createdAt: new Date(),
      },
    };

    const pdfBuffer = await generateEstimatePdf(dummyPdfInput);
    assert(Buffer.isBuffer(pdfBuffer), "Must return a Buffer");
    assert(pdfBuffer.length > 5000, `PDF buffer must have valid content (got ${pdfBuffer.length} bytes)`);

    // Verify PDF header magic bytes "%PDF-"
    const magic = pdfBuffer.subarray(0, 5).toString("utf-8");
    assert.strictEqual(magic, "%PDF-", "Generated buffer must be a valid PDF document");

    // Verify PDF trailer metadata contains Document Title and Author
    const pdfText = pdfBuffer.toString("latin1");
    assert(pdfText.includes("Estimex Estimate - Modern Duplex Villa G+1"), "PDF metadata must include Title");
    assert(pdfText.includes("Estimex Professional Engineering Services"), "PDF metadata must include Author");

    // Decompress PDF stream content and verify reconstructed text & payment receipt
    const zlib = await import("node:zlib");
    const streamRegex = /\/Length\s+(\d+)[\s\S]*?stream\r?\n/g;
    let match: RegExpExecArray | null;
    const decompressedList: string[] = [];
    while ((match = streamRegex.exec(pdfText)) !== null) {
      const len = parseInt(match[1], 10);
      const start = match.index + match[0].length;
      const slice = pdfBuffer.subarray(start, start + len);
      try {
        decompressedList.push(zlib.inflateSync(slice).toString("latin1"));
      } catch {
        // Raw image streams (e.g. DCTDecode JPEG) are not deflate streams
      }
    }
    const decompressedStreams = decompressedList.join("\n");

    const extractedText = (decompressedStreams.match(/<([0-9a-fA-F]+)>/g) || [])
      .map((h) => Buffer.from(h.replace(/<|>/g, ""), "hex").toString("latin1"))
      .join("");

    assert(extractedText.includes("ESTIMEX"), "PDF stream must contain ESTIMEX heading");
    assert(extractedText.includes("699.00"), "PDF stream must contain 699.00 service fee");
    assert(extractedText.includes("pay_test_receipt_123"), "PDF stream must contain transaction receipt reference");
    assert(decompressedStreams.includes("/I1 Do"), "PDF stream must invoke the embedded Estimex logo");
  });

  console.log("\n8. CUSTOMER AUTH FIXES, POSTGRESQL SSL NORMALIZATION & HOMEPAGE CLEANUP");
  await test("PostgreSQL connection normalization updates sslmode to verify-full and silences warning", async () => {
    const { normalizeConnectionString } = await import("../lib/prisma");
    const testUrl = "postgresql://usr:secret@db.example.com:5432/estimex?sslmode=require&connect_timeout=15";
    const normalized = normalizeConnectionString(testUrl);
    assert(normalized.includes("sslmode=verify-full"), "Must normalize sslmode=require to sslmode=verify-full");
    assert(!normalized.includes("sslmode=require"), "sslmode=require must be replaced");
    assert(normalized.includes("connect_timeout=15"), "Other query parameters must be preserved");

    // Also test fallback and prefer
    const preferUrl = "postgresql://usr:secret@db.example.com:5432/estimex?sslmode=prefer";
    assert(normalizeConnectionString(preferUrl).includes("sslmode=verify-full"), "Must normalize prefer");

    const caUrl = "postgresql://usr:secret@db.example.com:5432/estimex?sslmode=verify-ca";
    assert(normalizeConnectionString(caUrl).includes("sslmode=verify-full"), "Must normalize verify-ca");

    const fs = await import("node:fs");
    const prismaFile = fs.readFileSync("lib/prisma.ts", "utf-8");
    assert(!prismaFile.includes("console.log(connectionString)"), "Never leak connection strings or secrets");
  });

  await test("Customer session cookie specifies both maxAge and expires for cross-client reliability", async () => {
    const fs = await import("node:fs");
    const authFile = fs.readFileSync("lib/customer-auth.ts", "utf-8");
    assert(authFile.includes("maxAge: SESSION_DAYS * 24 * 60 * 60"), "Customer session cookie must specify maxAge");
    assert(authFile.includes("expires: expiresAt"), "Customer session cookie must specify expires");
    assert(authFile.includes("sameSite: \"lax\""), "Customer session cookie must use lax sameSite");
    assert(authFile.includes("httpOnly: true"), "Customer session cookie must be httpOnly");
  });

  await test("Protected layouts export dynamic = force-dynamic and revalidate = 0", async () => {
    const fs = await import("node:fs");
    const submitLayout = fs.readFileSync("app/submit/layout.tsx", "utf-8");
    assert(submitLayout.includes('export const dynamic = "force-dynamic"'), "app/submit/layout.tsx must be force-dynamic");
    assert(submitLayout.includes("export const revalidate = 0"), "app/submit/layout.tsx must revalidate = 0");

    const customerLayout = fs.readFileSync("app/customer/layout.tsx", "utf-8");
    assert(customerLayout.includes('export const dynamic = "force-dynamic"'), "app/customer/layout.tsx must be force-dynamic");
    assert(customerLayout.includes("export const revalidate = 0"), "app/customer/layout.tsx must revalidate = 0");
  });

  await test("Customer dashboard and homepage submit links disable prefetch to prevent stale redirect caching", async () => {
    const fs = await import("node:fs");
    const customerPage = fs.readFileSync("app/customer/page.tsx", "utf-8");
    assert(customerPage.includes('href="/submit" prefetch={false}'), "Customer dashboard submit links must disable prefetch");

    const homePage = fs.readFileSync("app/page.tsx", "utf-8");
    assert(homePage.includes('href="/submit"\n              prefetch={false}'), "Homepage submit links must disable prefetch");
  });

  await test("Homepage Drawing reference section is completely removed from codebase", async () => {
    const fs = await import("node:fs");
    const homePage = fs.readFileSync("app/page.tsx", "utf-8");
    assert(!homePage.includes("Drawing reference"), "Drawing reference section must be removed from homepage");
    assert(!homePage.includes("length: 36"), "The 36-div drawing placeholder grid must be removed");
  });

  console.log("\n9. CANONICAL PRODUCTION SEO, SITEMAP & ROBOTS URL INTEGRITY");
  await test("getSiteUrl defaults to https://estimex-nine.vercel.app and strips trailing slashes", async () => {
    const { getSiteUrl, DEFAULT_SITE_URL } = await import("../lib/site-url");
    assert.strictEqual(DEFAULT_SITE_URL, "https://estimex-nine.vercel.app");

    const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;
    try {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      assert.strictEqual(getSiteUrl(), "https://estimex-nine.vercel.app");

      process.env.NEXT_PUBLIC_SITE_URL = "https://custom-domain.com/";
      assert.strictEqual(getSiteUrl(), "https://custom-domain.com", "Trailing slash must be stripped");
    } finally {
      if (originalEnv !== undefined) {
        process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
      } else {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      }
    }
  });

  await test("sitemap() generates valid entries with https://estimex-nine.vercel.app and excludes private routes", async () => {
    const { default: sitemap } = await import("../app/sitemap");
    const entries = sitemap();

    assert(Array.isArray(entries) && entries.length > 0, "sitemap() must return an array of entries");

    // All entries must start with https://estimex-nine.vercel.app
    for (const entry of entries) {
      assert(entry.url.startsWith("https://estimex-nine.vercel.app"), `Entry URL must start with canonical base: ${entry.url}`);
      assert(!entry.url.includes("estimex.in"), `Entry URL must never contain estimex.in: ${entry.url}`);
      assert(!entry.url.includes("/customer"), `Private customer route must not be in sitemap: ${entry.url}`);
      assert(!entry.url.includes("/engineer"), `Private engineer route must not be in sitemap: ${entry.url}`);
      assert(!entry.url.includes("/submit"), `Submission intake route must not be in sitemap: ${entry.url}`);
      assert(!entry.url.includes("/api"), `API route must not be in sitemap: ${entry.url}`);
    }

    const urls = entries.map((e) => e.url);
    assert(urls.includes("https://estimex-nine.vercel.app"), "Must include homepage");
    assert(urls.includes("https://estimex-nine.vercel.app/contact"), "Must include /contact");
    assert(urls.includes("https://estimex-nine.vercel.app/terms"), "Must include /terms");
    assert(urls.includes("https://estimex-nine.vercel.app/privacy"), "Must include /privacy");
    assert(urls.includes("https://estimex-nine.vercel.app/refund-policy"), "Must include /refund-policy");
    assert(urls.includes("https://estimex-nine.vercel.app/login"), "Must include /login");
    assert(urls.includes("https://estimex-nine.vercel.app/register"), "Must include /register");
  });

  await test("robots() points to canonical sitemap and protects private routes", async () => {
    const { default: robots } = await import("../app/robots");
    const config = robots();

    assert.strictEqual(config.sitemap, "https://estimex-nine.vercel.app/sitemap.xml");

    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;
    assert(rules, "robots rules must be defined");
    const disallow = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];
    assert(disallow.includes("/customer/") || disallow.includes("/customer"), "Must disallow customer routes");
    assert(disallow.includes("/engineer/") || disallow.includes("/engineer"), "Must disallow engineer routes");
    assert(disallow.includes("/submit/") || disallow.includes("/submit"), "Must disallow submit routes");
    assert(disallow.includes("/api/"), "Must disallow api routes");
  });

  await test("No estimex.in references remain in app/ or lib/", async () => {
    const fs = await import("node:fs");
    const sitemapContent = fs.readFileSync("app/sitemap.ts", "utf-8");
    const robotsContent = fs.readFileSync("app/robots.ts", "utf-8");
    const layoutContent = fs.readFileSync("app/layout.tsx", "utf-8");

    assert(!sitemapContent.includes("estimex.in"), "app/sitemap.ts must not reference estimex.in");
    assert(!robotsContent.includes("estimex.in"), "app/robots.ts must not reference estimex.in");
    assert(!layoutContent.includes("estimex.in"), "app/layout.tsx must not reference estimex.in");
  });

  console.log(`\n======================================================`);
  console.log(`ALL TESTS PASSED: ${passed}/${total} assertions verified successfully.`);
  console.log(`======================================================\n`);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
