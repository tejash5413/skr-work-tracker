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
    } catch (error) {
      console.error("❌ Failed to save attendance:", error);
      alert("❌ Submission failed!");
    }
  };
  export const postToGoogleSheetPayroll = async (data) => {
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxlm8E94QZ0o74WlK3elUARn9MVUvhiApWw2y-u_K_i5_LpI611u6rlWwt6xx_1Q-NZ/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
  
      const text = await response.text();
      console.log('✅ Google Sheets Response:', text);
      alert("✅ Employee Record has been changed") // 👈 Add this to confirm backend reply
    } catch (err) {
      console.error('❌ Failed to POST to Google Sheets', err);
    }
  };