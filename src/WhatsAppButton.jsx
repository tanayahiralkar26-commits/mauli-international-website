
import "./WhatsAppButton.css";

export default function WhatsAppButton() {
  const message =
    "Hello Mauli International, I would like to enquire about your products and export services.";

  const whatsappURL = `https://wa.me/919873963341?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      className="whatsapp-float"
      href={whatsappURL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact Mauli International on WhatsApp"
    >
      <span className="whatsapp-icon">☏</span>
      <span>Chat with us</span>
    </a>
  );
}
