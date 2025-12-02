import ContactForm from '@/components/ContactForm';
import ContactInfo from '@/components/ContactInfo';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white-50 to-indigo-100 py-12 cursor-pointer">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <ContactInfo />
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const faqItems = [
  {
    question: "How soon can I expect a response?",
    answer: "We typically respond to all inquiries within 24 hours during business days."
  },
  {
    question: "Do you offer phone support?",
    answer: "Yes, we offer phone support during our business hours for urgent matters."
  },
  {
    question: "Can I schedule a meeting?",
    answer: "Absolutely! Please mention your preferred time in your message and we'll coordinate."
  },
  {
    question: "What information should I include?",
    answer: "Please include your name, contact details, and a detailed description of your inquiry."
  }
];