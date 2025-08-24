'use client';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-green-200 rounded-full blur-xl opacity-30 animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            AI-Powered Financial Intelligence
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your{' '}
            <span className="gradient-text">Financial Reports</span>
            {' '}Into Actionable Insights
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload PDFs, Excel files, and CSV reports to get instant AI-powered analysis, 
            KPI extraction, risk assessment, and strategic recommendations in minutes, not hours.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Start Free Analysis
            </button>
            <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-gray-50">
              Watch Demo
            </button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Free tier available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span>Enterprise-grade security</span>
            </div>
          </div>
        </div>
        
        {/* Dashboard Preview */}
        <div className="mt-16 max-w-6xl mx-auto">
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 h-64 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold mb-2">Interactive Dashboard Preview</h3>
                  <p className="text-blue-100">Real-time KPIs • Risk Analysis • AI Insights</p>
                </div>
              </div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-8 -left-8 bg-white rounded-lg shadow-lg p-4 border border-gray-200 hidden lg:block">
              <div className="text-green-600 text-2xl mb-2">↗️</div>
              <div className="text-sm font-medium text-gray-900">Revenue Growth</div>
              <div className="text-2xl font-bold text-green-600">+24.5%</div>
            </div>
            
            <div className="absolute -top-8 -right-8 bg-white rounded-lg shadow-lg p-4 border border-gray-200 hidden lg:block">
              <div className="text-blue-600 text-2xl mb-2">⚡</div>
              <div className="text-sm font-medium text-gray-900">Analysis Speed</div>
              <div className="text-2xl font-bold text-blue-600">&lt; 2 min</div>
            </div>
            
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 border border-gray-200 hidden md:block">
              <div className="text-purple-600 text-2xl mb-2">🎯</div>
              <div className="text-sm font-medium text-gray-900">AI Accuracy</div>
              <div className="text-2xl font-bold text-purple-600">94.8%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}