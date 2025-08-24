'use client';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CFO',
      company: 'TechStart Inc.',
      image: '👩‍💼',
      content: 'This platform transformed how we analyze our quarterly reports. What used to take our team days now takes minutes, and the insights are incredibly accurate.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Financial Analyst',
      company: 'Growth Capital Partners',
      image: '👨‍💼',
      content: 'The AI-powered risk assessment has helped us identify potential issues before they became problems. The ROI has been exceptional.',
      rating: 5
    },
    {
      name: 'Emily Watson',
      role: 'CEO',
      company: 'Sustainable Solutions',
      image: '👩‍💼',
      content: 'Finally, a tool that speaks business language. The strategic recommendations have directly influenced our growth strategy.',
      rating: 5
    },
    {
      name: 'David Kim',
      role: 'Finance Director',
      company: 'Manufacturing Pro',
      image: '👨‍💼',
      content: 'The export features and integrations saved us countless hours. Our board presentations have never looked better.',
      rating: 5
    },
    {
      name: 'Lisa Thompson',
      role: 'Business Consultant',
      company: 'Strategic Advisors',
      image: '👩‍💼',
      content: 'I use this for all my client engagements. The accuracy and speed of analysis gives me a competitive edge.',
      rating: 5
    },
    {
      name: 'Alex Johnson',
      role: 'VP Finance',
      company: 'Retail Chain Corp',
      image: '👨‍💼',
      content: 'The enterprise features and security compliance made this an easy choice for our organization.',
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gray-50" id="testimonials">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trusted by{' '}
            <span className="gradient-text">Finance Leaders</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of finance professionals who trust our platform 
            to deliver accurate, actionable insights.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">10,000+</div>
              <div className="text-gray-600">Reports Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 border border-gray-200 card-hover"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">⭐</span>
                ))}
              </div>
              
              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              {/* Author */}
              <div className="flex items-center">
                <div className="text-3xl mr-4">{testimonial.image}</div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-blue-600">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Company Logos */}
        <div className="mt-20">
          <p className="text-center text-gray-500 mb-8">Trusted by leading companies worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {/* Placeholder for company logos */}
            <div className="bg-gray-200 rounded-lg px-8 py-4 text-gray-600 font-semibold">TechStart</div>
            <div className="bg-gray-200 rounded-lg px-8 py-4 text-gray-600 font-semibold">Growth Capital</div>
            <div className="bg-gray-200 rounded-lg px-8 py-4 text-gray-600 font-semibold">Sustainable Solutions</div>
            <div className="bg-gray-200 rounded-lg px-8 py-4 text-gray-600 font-semibold">Manufacturing Pro</div>
            <div className="bg-gray-200 rounded-lg px-8 py-4 text-gray-600 font-semibold">Retail Chain</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Transform Your Financial Analysis?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of finance professionals who trust our AI-powered platform 
            to deliver accurate insights in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}