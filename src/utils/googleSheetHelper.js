export const postToGoogleSheetAttendance = async (record) => {
    try {
        console.log("📤 Sending to Google Sheets:", record); // ✅ Debug

      await fetch("https://script.google.com/macros/s/AKfycby06KKg93F7RTIpsy0L-LcRLNaOLgeRLLVtXJ4xPIX2C5qlZksvockNHJhiowx1_X1z/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(record)
      });
      alert("✅ Attendance submitted successfully!");
    } catch (error) {
      console.error("❌ Failed to save attendance:", error);
      alert("❌ Submission failed!");
    }
  };