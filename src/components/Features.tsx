'use client';

export default function Features() {
  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Analysis',
      description: 'Advanced Gemini AI processes your financial documents to extract meaningful insights automatically.',
      details: ['Natural language summaries', 'Intelligent data extraction', 'Pattern recognition']
    },
    {
      icon: '📊',
      title: 'KPI Extraction',
      description: 'Automatically identify and calculate key performance indicators from your financial reports.',
      details: ['Revenue & profit margins', 'Growth rate analysis', 'Financial ratios']
    },
    {
      icon: '⚠️',
      title: 'Risk Assessment',
      description: 'Identify potential risks and red flags in your financial data with AI-driven analysis.',
      details: ['Cash flow risks', 'Market volatility', 'Compliance issues']
    },
    {
      icon: '💡',
      title: 'Strategic Insights',
      description: 'Get actionable recommendations and opportunities based on your financial performance.',
      details: ['Growth opportunities', 'Cost optimization', 'Investment advice']
    },
    {
      icon: '📋',
      title: 'Multiple Formats',
      description: 'Support for PDF, Excel, and CSV files with intelligent content extraction.',
      details: ['PDF text extraction', 'Excel formula analysis', 'CSV data processing']
    },
    {
      icon: '🔐',
      title: 'Enterprise Security',
      description: 'Bank-grade security with encrypted storage and secure data processing.',
      details: ['End-to-end encryption', 'SOC 2 compliant', 'GDPR ready']
    }
  ];

  return (
    <section className="py-20 bg-white" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for{' '}
            <span className="gradient-text">Smart Analysis</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform transforms complex financial data into clear, 
            actionable insights that drive better business decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-200 rounded-2xl p-8 card-hover hover:border-blue-300 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
              <ul className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-center text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Reports Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98.5%</div>
              <div className="text-blue-100">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">&lt; 2 min</div>
              <div className="text-blue-100">Average Analysis Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Happy Businesses</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}