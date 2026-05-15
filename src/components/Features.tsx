import { Zap, Target, Puzzle, TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';

export default function Features() {
  const features = [
    {
      icon: Zap,
      title: 'Real-time Detection',
      description: 'Process images and detect potholes instantly with millisecond response times',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'High Accuracy AI Model',
      description: '99.2% accuracy powered by state-of-the-art deep learning algorithms',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Puzzle,
      title: 'Easy Integration',
      description: 'Simple REST API that integrates seamlessly with existing infrastructure',
      gradient: 'from-blue-500 to-purple-500',
    },
    {
      icon: TrendingUp,
      title: 'Scalable System',
      description: 'Cloud-native architecture handles thousands of requests per second',
      gradient: 'from-cyan-500 to-blue-500',
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white leading-tight">
            Powerful Features
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Built with cutting-edge technology to deliver exceptional performance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <GlassCard key={index} hover className="p-5 sm:p-6 group">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 mb-4 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-base sm:text-xl font-semibold mb-2 sm:mb-3 text-white">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
