import axios from "axios";

export const sendWhatsAppMessage = async (to, message) => {
  try {
    const url = `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: `91${to}`, // भारत के नंबर के लिए
        type: "text",
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ WhatsApp Message Sent");
    return response.data;
  } catch (error) {
    console.error(
      "WhatsApp Error:",
      error.response?.data || error.message
    );
  }
};