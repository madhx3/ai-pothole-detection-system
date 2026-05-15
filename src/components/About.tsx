import { Camera, Brain, CheckCircle2 } from 'lucide-react';
import GlassCard from './GlassCard';

export default function About() {
  const steps = [
    {
      icon: Camera,
      title: 'Capture Road Image',
      description: 'High-resolution camera captures road surface images in real-time',
    },
    {
      icon: Brain,
      title: 'AI Processes Image',
      description: 'Deep learning model analyzes image using computer vision algorithms',
    },
    {
      icon: CheckCircle2,
      title: 'Detect Potholes',
      description: 'System identifies potholes and generates detailed damage reports',
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white leading-tight">
            How It Works
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Advanced AI technology simplifies pothole detection in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <GlassCard key={index} hover className="p-6 sm:p-8 text-center group">
              <div className="mb-6 relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <step.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 sm:top-10 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent" />
                )}
              </div>
              <div className="relative">
                <span className="absolute -top-8 sm:-top-12 right-2 sm:right-4 text-4xl sm:text-6xl font-bold text-white/5">
                  {index + 1}
                </span>
                <h3 className="text-lg sm:text-2xl font-semibold mb-2 sm:mb-3 text-white">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
