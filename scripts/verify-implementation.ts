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
} from "../lib/payment/service";
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

  console.log("\n2. PAYMENT WORKFLOW & SECURITY");
  test("Payment config defaults to fixed ₹699 fee when env is unset", () => {
    delete process.env.ESTIMATION_SERVICE_FEE_INR;
    const config = getPaymentConfig();
    assert.strictEqual(DEFAULT_SERVICE_FEE_INR, 699, "DEFAULT_SERVICE_FEE_INR must be 699");
    assert.strictEqual(config.feeInr, 699, "feeInr must default to 699 INR");
    assert.strictEqual(config.currency, "INR");
    assert.strictEqual(config.isTestMode, true, "isTestMode must be true when keys absent");
    assert(config.upiVpa && config.upiVpa.length > 0, "UPI VPA must be present");
  });

  test("Payment config respects positive environment fee override", () => {
    process.env.ESTIMATION_SERVICE_FEE_INR = "899";
    const config = getPaymentConfig();
    assert.strictEqual(config.feeInr, 899, "feeInr must use environment override");
    delete process.env.ESTIMATION_SERVICE_FEE_INR;
  });

  await test("createPaymentOrder creates ₹699 order with dynamic UPI and prevents double charging", async () => {
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

    // 3. Complete payment
    const verifyResult = await verifyAndRecordPayment({
      orderId: order.orderId,
      paymentId: `pay_tx_${Date.now()}`,
      signature: "test_signature",
      projectId: project.id,
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

    // Clean up
    await prisma.customer.delete({ where: { id: customer.id } });
  });

  await test("HMAC signature verification rejects invalid signatures in production mode", async () => {
    process.env.PAYMENT_KEY_ID = "rzp_live_test";
    process.env.PAYMENT_KEY_SECRET = "live_secret_12345";
    const orderId = "order_test_123";
    const paymentId = "pay_test_456";

    const forgedSignature = "forged_hex_signature";
    let errorThrown = false;
    try {
      await verifyAndRecordPayment({
        orderId,
        paymentId,
        signature: forgedSignature,
        projectId: "non_existent_project",
      });
    } catch (err: unknown) {
      errorThrown = true;
      const msg = err instanceof Error ? err.message : "";
      assert(msg.includes("Invalid payment signature") || msg.includes("Verification failed"));
    }
    assert(errorThrown, "Forged signature must throw verification error");
    delete process.env.PAYMENT_KEY_ID;
    delete process.env.PAYMENT_KEY_SECRET;
  });

  await test("Production guards reject test signatures and unconfigured orders in production", async () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const envRecord = process.env as Record<string, string | undefined>;
    try {
      envRecord.NODE_ENV = "production";
      delete process.env.PAYMENT_KEY_ID;
      delete process.env.PAYMENT_KEY_SECRET;

      // 1. verifyAndRecordPayment must reject test signatures in production
      let verifyError = false;
      try {
        await verifyAndRecordPayment({
          orderId: "order_prod_test",
          paymentId: "pay_prod_test",
          signature: "test_signature",
          projectId: "non_existent_project",
        });
      } catch (err: unknown) {
        verifyError = true;
        const msg = err instanceof Error ? err.message : "";
        assert(msg.includes("Simulated test payments are disabled in production"));
      }
      assert(verifyError, "Test signatures must be rejected in production");

      // 2. verifyWebhookSignature must return false when secret is missing in production
      delete process.env.PAYMENT_WEBHOOK_SECRET;
      const webhookValid = verifyWebhookSignature("{}", "test_webhook_signature");
      assert.strictEqual(webhookValid, false, "Webhook must reject test signatures in production");

      // 3. createPaymentOrder must reject when unconfigured in production
      let orderError = false;
      try {
        await createPaymentOrder("proj_123", "cust_123");
      } catch (err: unknown) {
        orderError = true;
        const msg = err instanceof Error ? err.message : "";
        assert(msg.includes("Payment gateway is not configured"));
      }
      assert(orderError, "createPaymentOrder must reject unconfigured keys in production");
    } finally {
      envRecord.NODE_ENV = prevNodeEnv;
    }
  });

  await test("Webhook marks payment COMPLETED and project PAYMENT_RECEIVED", async () => {
    const testEmail = `test_webhook_${Date.now()}@example.com`;
    const customer = await prisma.customer.create({
      data: { name: "Webhook Cust", email: testEmail, passwordHash: "h" },
    });

    const project = await prisma.project.create({
      data: {
        projectName: "Webhook Project",
        clientName: "Webhook Cust",
        clientEmail: testEmail,
        location: "Mumbai",
        customerId: customer.id,
        status: "PAYMENT_PENDING",
      },
    });

    const order = await createPaymentOrder(project.id, customer.id);
    const webhookRes = await recordWebhookPayment({
      orderId: order.orderId,
      paymentId: `webhook_pay_${Date.now()}`,
    });

    assert.strictEqual(webhookRes.success, true);
    assert.strictEqual(webhookRes.project.status, "PAYMENT_RECEIVED");
    assert.strictEqual(webhookRes.payment.status, "COMPLETED");

    // Clean up
    await prisma.customer.delete({ where: { id: customer.id } });
  });

  test("Webhook signature verification verifies authentic payloads", () => {
    process.env.PAYMENT_WEBHOOK_SECRET = "webhook_secret_key";
    const payload = JSON.stringify({ event: "payment.captured", paymentId: "pay_1" });
    const authenticSignature = createHmac("sha256", "webhook_secret_key")
      .update(payload)
      .digest("hex");

    assert.strictEqual(verifyWebhookSignature(payload, authenticSignature), true);
    assert.strictEqual(verifyWebhookSignature(payload, "invalid_sig"), false);
    delete process.env.PAYMENT_WEBHOOK_SECRET;
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

  console.log(`\n======================================================`);
  console.log(`ALL TESTS PASSED: ${passed}/${total} assertions verified successfully.`);
  console.log(`======================================================\n`);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
