'use client';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Upload Your Report',
      description: 'Simply drag and drop your financial reports in PDF, Excel, or CSV format.',
      icon: '📄',
      details: ['Supports multiple formats', 'Secure file handling', 'Instant validation']
    },
    {
      step: '02',
      title: 'AI Analysis',
      description: 'Our Gemini AI processes your document and extracts key financial data.',
      icon: '🤖',
      details: ['Advanced text extraction', 'Pattern recognition', 'Data validation']
    },
    {
      step: '03',
      title: 'Generate Insights',
      description: 'Get comprehensive analysis with KPIs, risks, and strategic recommendations.',
      icon: '📊',
      details: ['KPI calculation', 'Risk assessment', 'Growth opportunities']
    },
    {
      step: '04',
      title: 'Export & Share',
      description: 'Download reports in multiple formats or integrate with your favorite tools.',
      icon: '📤',
      details: ['PDF & Word export', 'Notion integration', 'API access']
    }
  ];

  return (
    <section className="py-20 bg-white" id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It{' '}
            <span className="gradient-text">Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From upload to insights in just a few clicks. Our streamlined process 
            makes financial analysis effortless and efficient.
          </p>
        </div>

        {/* Process Flow */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 z-0"></div>
                )}
                
                <div className="relative z-10 text-center">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-2xl font-bold mb-6">
                    {step.icon}
                  </div>
                  
                  {/* Step Info */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 card-hover">
                    <div className="text-sm font-bold text-blue-600 mb-2">STEP {step.step}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    
                    {/* Details */}
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            See It In Action
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Watch how our AI transforms a complex financial report into clear, 
            actionable insights in under 2 minutes.
          </p>
          
          {/* Video Placeholder */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-64 rounded-lg flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-6xl mb-4">▶️</div>
                <h4 className="text-2xl font-bold mb-2">Interactive Demo</h4>
                <p className="text-blue-100">Click to see the magic happen</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              Try It Free Now
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h4>
            <p className="text-gray-600">Get analysis results in under 2 minutes, not hours or days.</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Highly Accurate</h4>
            <p className="text-gray-600">94.8% accuracy rate powered by advanced AI algorithms.</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Always Learning</h4>
            <p className="text-gray-600">Our AI continuously improves with each analysis.</p>
          </div>
        </div>
      </div>
    </section>
  );
}