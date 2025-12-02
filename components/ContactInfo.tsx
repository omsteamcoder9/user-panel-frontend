export default function ContactInfo() {
  const contactMethods = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email',
      details: 'contact@yourcompany.com',
      description: 'Send us an email anytime'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Phone',
      details: '+91 8765435656',
      description: 'Mon-Fri from 9am to 6pm'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Office',
      details: '123 Business Ave',
      description: 'Suite 100, New York, NY 10001'
    }
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h3>
      <p className="text-gray-600 mb-8">
        We're here to help and answer any questions you might have. We look forward to hearing from you.
      </p>
      
      <div className="space-y-6">
        {contactMethods.map((method, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              {method.icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{method.title}</h4>
              <p className="text-gray-700 font-medium">{method.details}</p>
              <p className="text-gray-500 text-sm">{method.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Business Hours</h4>
        <div className="space-y-2 text-gray-600">
          <div className="flex justify-between">
            <span>Monday - Friday</span>
            <span>9:00 AM - 6:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span>Saturday</span>
            <span>10:00 AM - 4:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span>Sunday</span>
            <span>Closed</span>
          </div>
        </div>
      </div>
    </div>
  );
}