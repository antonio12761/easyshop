"use server";

export async function simpleTest() {
  try {
    console.log("=== TEST SEMPLICE DIPENDENZE ===");

    // Test 1: Verifica se possiamo importare le librerie
    let otplibAvailable = false;
    let qrcodeAvailable = false;
    let cryptoAvailable = false;

    try {
      const { authenticator } = await import("otplib");
      otplibAvailable = true;
      console.log("✅ otplib importato con successo");
    } catch (error) {
      console.error("❌ Errore importazione otplib:", error);
    }

    try {
      const QRCode = await import("qrcode");
      qrcodeAvailable = true;
      console.log("✅ qrcode importato con successo");
    } catch (error) {
      console.error("❌ Errore importazione qrcode:", error);
    }

    try {
      const crypto = await import("crypto");
      cryptoAvailable = true;
      console.log("✅ crypto importato con successo");
    } catch (error) {
      console.error("❌ Errore importazione crypto:", error);
    }

    // Test 2: Verifica funzionalità base
    let secretGenerated = false;
    let randomGenerated = false;

    if (otplibAvailable) {
      try {
        const { authenticator } = await import("otplib");
        const secret = authenticator.generateSecret();
        secretGenerated = !!secret;
        console.log("✅ Secret generato:", secret.substring(0, 10) + "...");
      } catch (error) {
        console.error("❌ Errore generazione secret:", error);
      }
    }

    if (cryptoAvailable) {
      try {
        const crypto = await import("crypto");
        const random = crypto.randomBytes(4).toString("hex");
        randomGenerated = !!random;
        console.log("✅ Random generato:", random);
      } catch (error) {
        console.error("❌ Errore generazione random:", error);
      }
    }

    const result = {
      success: true,
      dependencies: {
        otplib: otplibAvailable,
        qrcode: qrcodeAvailable,
        crypto: cryptoAvailable,
      },
      functionality: {
        secretGeneration: secretGenerated,
        randomGeneration: randomGenerated,
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
      },
    };

    console.log("=== RISULTATO TEST SEMPLICE ===");
    console.log(JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error("=== ERRORE TEST SEMPLICE ===");
    console.error("Errore:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
  }
}
