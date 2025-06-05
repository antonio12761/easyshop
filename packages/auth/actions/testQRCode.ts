"use server";

import { authenticator } from "otplib";
import QRCode from "qrcode";

export async function testQRCodeGeneration() {
  try {
    console.log("=== TEST GENERAZIONE QR CODE ===");

    // Test se le librerie sono disponibili
    console.log("Test librerie:");
    console.log("- authenticator disponibile:", typeof authenticator);
    console.log("- QRCode disponibile:", typeof QRCode);

    // Genera un secret di test
    const secret = authenticator.generateSecret();
    console.log("Secret di test generato:", secret);

    // Crea un URL di test
    const testEmail = "test@example.com";
    const serviceName = "RevUp Test";
    const otpauth = authenticator.keyuri(testEmail, serviceName, secret);
    console.log("OTP Auth URL di test:", otpauth);

    // Genera il QR code
    const qrCode = await QRCode.toDataURL(otpauth, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 256,
      margin: 2,
    });

    console.log("QR Code di test generato!");
    console.log("- Lunghezza:", qrCode.length);
    console.log("- È un data URL valido:", qrCode.startsWith("data:image/"));

    return {
      success: true,
      secret,
      otpauth,
      qrCode,
      qrCodeLength: qrCode.length,
      isValidDataUrl: qrCode.startsWith("data:image/"),
    };
  } catch (error) {
    console.error("Errore nel test QR code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
  }
}
