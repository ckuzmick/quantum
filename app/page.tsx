'use client'

import { useRef, useState, useEffect } from 'react';
import { StandingWaveSimulation } from './components/StandingWaveSimulation';
import { ProbabilityDensityVisualization } from './components/ProbabilityDensityVisualization';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Wavelength {
  id: number;
  frequency: number;
  amplitude: number;
  enabled: boolean;
}

export default function Home() {
  const [wavelengths, setWavelengths] = useState<Wavelength[]>([
    { id: 1, frequency: 1, amplitude: 3, enabled: true },
  ]);
  const [time, setTime] = useState(0);
  const timeRef = useRef(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Sync wavelengths with StandingWaveSimulation
  useEffect(() => {
    // Will be passed down to StandingWaveSimulation via context or props
  }, [wavelengths]);

  // Animation loop for time
  useEffect(() => {
    const animate = () => {
      timeRef.current += 1;
      setTime(timeRef.current);
    };
    animationRef.current = setInterval(animate, 30);
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-950 via-purple-950 to-blue-950 border-b border-blue-700 text-white p-12 shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.5),transparent)]"></div>
        <div className="relative max-w-6xl mx-auto">
          <h1 className="text-6xl font-bold mb-3 bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            The Quantum Infinite Square Well
          </h1>
          <p className="text-xl text-blue-100">
            Explore how particles behave in quantum confinement through interactive 3D visualizations and probability analysis
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8 space-y-16">
        {/* Interactive Visualizations */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Interactive Visualization</h2>
            <p className="text-slate-300 text-lg">
              The 3D visualization shows individual energy eigenstates (colored waves) layered in perspective with their quantum superposition (white wave at front). 
              The 2D plot below displays $\psi(x)$ (blue, top) and its probability density $|\psi(x)|^2$ (green, bottom).
            </p>
          </div>
          
          {/* 3D Visualization */}
          <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl hover:shadow-blue-500/20 transition-shadow">
            <StandingWaveSimulation wavelengths={wavelengths} setWavelengths={setWavelengths} />
          </div>

          {/* Probability Density Visualization */}
          <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl hover:shadow-green-500/20 transition-shadow">
            <ProbabilityDensityVisualization wavelengths={wavelengths} time={time} />
          </div>
        </section>

        {/* Concept Explanation */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">What is the Infinite Square Well?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gradient-to-br from-blue-900/25 to-slate-800/25 border border-blue-600/40 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-300 mb-3">The Physical Setup</h3>
              <p className="text-slate-300 leading-relaxed">
                A particle is confined in a one-dimensional box of width $L$. Inside, the potential is zero ($V=0$). 
                At the walls ($x = \pm L/2$), the potential is infinite, creating impenetrable boundaries. 
                The particle cannot escape.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/25 to-slate-800/25 border border-purple-600/40 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-300 mb-3">Classical vs Quantum</h3>
              <p className="text-slate-300 leading-relaxed">
                <span className="text-slate-200 font-semibold">Classically:</span> The particle can have any energy.
                <br/>
                <span className="text-purple-200 font-semibold">Quantum:</span> Only discrete energies are allowed—a phenomenon called <span className="text-purple-300 font-bold">quantization</span>.
              </p>
            </div>
          </div>
        </section>

        {/* Math Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">The Mathematics</h2>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-blue-300 mb-4">Energy Eigenstates</h3>
              <p className="text-slate-300 mb-6">
                For a particle confined in a box from $x = -L/2$ to $x = L/2$, the energy eigenstates are standing waves that must vanish at the walls:
              </p>
              <div className="bg-slate-950 rounded-lg p-6 border border-slate-700 mb-4 flex justify-center">
                <BlockMath math={String.raw`\psi_n(x) = \sqrt{\frac{2}{L}} \sin\left(\frac{n\pi(x + L/2)}{L}\right)`} />
              </div>
              <p className="text-slate-300 text-sm">
                where <InlineMath math={String.raw`n = 1, 2, 3, \ldots`} /> is the quantum number. Each eigenstate represents a standing wave pattern with exactly <InlineMath math="n" /> half-wavelengths fitting in the box.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-green-300 mb-4">Energy Levels</h3>
              <p className="text-slate-300 mb-6">
                Only discrete energy values are allowed. The energy of the $n$-th eigenstate grows quadratically with quantum number:
              </p>
              <div className="bg-slate-950 rounded-lg p-6 border border-slate-700 mb-4 flex justify-center">
                <BlockMath math={String.raw`E_n = \frac{n^2 \pi^2 \hbar^2}{2mL^2}`} />
              </div>
              <p className="text-slate-300 text-sm">
                The energy gap between adjacent levels increases: <InlineMath math={String.raw`\Delta E_n = E_{n+1} - E_n = \frac{\pi^2\hbar^2}{2mL^2}(2n + 1)`} />
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-700/50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-amber-300 mb-4">Probability Density</h3>
              <p className="text-slate-300 mb-6">
                The probability density tells us where the particle is most likely to be found:
              </p>
              <div className="bg-slate-950 rounded-lg p-6 border border-slate-700 flex justify-center">
                <BlockMath math={String.raw`|\psi_n(x)|^2 = \frac{2}{L} \sin^2\left(\frac{n\pi(x + L/2)}{L}\right)`} />
              </div>
            </div>
          </div>
        </section>

        {/* Key Properties */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Key Quantum Principles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-600/50 rounded-lg p-6 space-y-3 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
              <h3 className="text-lg font-semibold text-emerald-300">Quantization</h3>
              <p className="text-slate-300 text-sm">
                Not all energy values are allowed—only discrete levels corresponding to standing wave patterns that fit 
                in the box. This is fundamentally different from classical mechanics.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-600/50 rounded-lg p-6 space-y-3 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
              <h3 className="text-lg font-semibold text-cyan-300">Standing Waves</h3>
              <p className="text-slate-300 text-sm">
                Each eigenstate is a standing wave. The wave must have nodes (zero amplitude) at both walls, similar to 
                a vibrating guitar string fixed at both ends.
              </p>
            </div>

            <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 border border-violet-600/50 rounded-lg p-6 space-y-3 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all">
              <h3 className="text-lg font-semibold text-violet-300">Superposition</h3>
              <p className="text-slate-300 text-sm">
                A quantum particle can exist in a superposition—a combination of multiple eigenstates simultaneously. 
                This creates interference effects visible in the probability density.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 border border-orange-600/50 rounded-lg p-6 space-y-3 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
              <h3 className="text-lg font-semibold text-orange-300">Zero-Point Energy</h3>
              <p className="text-slate-300 text-sm">
                Even the ground state ($n=1$) has non-zero energy. The particle can never be perfectly still—this is a 
                purely quantum effect with no classical analog.
              </p>
            </div>
          </div>
        </section>

        {/* How to Use the Visualization */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">How to Use the Visualization</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gradient-to-br from-blue-900/25 to-cyan-900/25 border border-blue-600/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">3D Wave Visualization</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                The colored waves in the background represent individual energy eigenstates. Each color corresponds to a different quantum number $n$. The white wave in front is the quantum superposition—the sum of all enabled states.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-900/25 to-emerald-900/25 border border-green-600/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-300 mb-3">Probability Density Plot</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                <span className="text-blue-300 font-semibold">Top (Blue):</span> The wavefunction $\psi(x)$
                <br/>
                <span className="text-green-300 font-semibold">Bottom (Green):</span> The probability density $|\psi(x)|^2$
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/25 to-violet-900/25 border border-purple-600/40 rounded-lg p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-purple-300 mb-3">Interactive Controls</h3>
              <div className="space-y-2 text-slate-300 text-sm">
                <div><span className="font-semibold text-purple-300">Quantum Number ($n$):</span> Integer values 1–8 (higher = higher energy)</div>
                <div><span className="font-semibold text-purple-300">Amplitude:</span> Weight of each state in the superposition</div>
                <div><span className="font-semibold text-purple-300">Enabled:</span> Toggle states to visualize their contributions</div>
                <div><span className="font-semibold text-purple-300">Add/Remove:</span> Create complex multi-state superpositions</div>
              </div>
            </div>
          </div>
        </section>

        {/* Understanding Probability Density */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Understanding Probability Density</h2>
          
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-slate-800/50 to-blue-800/30 border border-blue-700/30 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-blue-300 mb-4">Why $|\psi|^2$ and not $\psi$?</h3>
              <p className="text-slate-300 leading-relaxed">
                In quantum mechanics, the wavefunction <InlineMath math="\psi(x)" /> can be negative or complex, so it doesn't directly represent 
                probabilities. The probability density <InlineMath math="|\psi(x)|^2" /> is always non-negative and tells us the likelihood of finding 
                the particle at each position through integration:
              </p>
              <div className="mt-4 p-4 bg-slate-950 rounded border border-slate-700 flex justify-center">
                <BlockMath math={String.raw`P(a \leq x \leq b) = \int_a^b |\psi(x)|^2 \, dx`} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-800/50 to-purple-800/30 border border-purple-700/30 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-purple-300 mb-4">Interference Effects</h3>
              <p className="text-slate-300 leading-relaxed">
                When you superpose multiple eigenstates, the resulting <InlineMath math="|\psi|^2" /> shows quantum interference effects. Two waves can add constructively 
                (bright regions) or destructively (dark regions). For a superposition <InlineMath math="\psi = \psi_1 + \psi_2" />:
              </p>
              <div className="mt-4 p-4 bg-slate-950 rounded border border-slate-700 flex justify-center">
                <BlockMath math={String.raw`|\psi_1 + \psi_2|^2 = |\psi_1|^2 + |\psi_2|^2 + 2\text{Re}(\psi_1^* \psi_2)`} />
              </div>
              <p className="text-slate-300 text-sm mt-4">
                The cross term <InlineMath math={String.raw`2\text{Re}(\psi_1^* \psi_2)`} /> is purely quantum—classical probabilities can't interfere!
              </p>
            </div>

            <div className="bg-gradient-to-r from-slate-800/50 to-green-800/30 border border-green-700/30 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-green-300 mb-4">Reading the Plots</h3>
              <p className="text-slate-300 leading-relaxed">
                The top (wavefunction) plot can oscillate positive and negative. The bottom (probability) plot is always 
                positive and shows the actual observable quantity: where a measurement would likely find the particle. 
                The height of the green area represents the probability density at each point.
              </p>
            </div>
          </div>
        </section>

        {/* Try This */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Interactive Experiments</h2>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-teal-900/30 to-teal-800/20 border border-teal-600/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-teal-300 mb-3">Ground State ($n=1$)</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Keep only $n=1$ enabled with amplitude 3. In the probability plot, you'll see a single peak in the center. 
                This is the simplest eigenstate—the particle strongly prefers the middle of the box where the probability density is highest.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 border border-indigo-600/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-300 mb-3">Superposition: Two Levels</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Enable both $n=1$ and $n=2$ with equal amplitudes. Watch the interference pattern in the 2D plot oscillate! 
                The total $|\\psi|^2$ is NOT just the sum of individual $|\\psi_1|^2$ and $|\\psi_2|^2$—the cross terms create the distinctive pattern.
              </p>
            </div>

            <div className="bg-gradient-to-br from-lime-900/30 to-lime-800/20 border border-lime-600/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-lime-300 mb-3">High Quantum Numbers</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Set $n=6$ or $n=7$ with high amplitude. The wavefunction oscillates rapidly with many peaks. 
                Higher quantum numbers mean higher energy and faster oscillations in the spatial domain.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-600/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-300 mb-3">Nodes in Probability</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Study $n=2$ alone: there's a node (zero probability) exactly at the center! 
                Now add $n=1$—the interference fills in that gap. This shows how superposition fundamentally alters the probability distribution.
              </p>
            </div>
          </div>
        </section>

        {/* Physics Insights */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Why This Matters</h2>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-900/25 to-cyan-900/25 border border-blue-600/50 rounded-lg p-6">
              <p className="text-slate-200 leading-relaxed">
                <span className="text-blue-300 font-bold text-lg">Quantization:</span> Why only certain energies? The wavefunction must vanish at the boundaries (infinite potential walls). This constraint forces the allowed wavelengths to satisfy <InlineMath math={String.raw`\lambda = \frac{2L}{n}`} />, creating discrete energy levels.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-900/25 to-violet-900/25 border border-purple-600/50 rounded-lg p-6">
              <p className="text-slate-200 leading-relaxed">
                <span className="text-purple-300 font-bold text-lg">Measurement Problem:</span> Before measurement, the particle can exist in a superposition. Upon measuring energy, the system "collapses" to one eigenvalue with probabilities determined by the amplitudes. The interference patterns you see encode these quantum probabilities.
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-900/25 to-orange-900/25 border border-amber-600/50 rounded-lg p-6">
              <p className="text-slate-200 leading-relaxed">
                <span className="text-amber-300 font-bold text-lg">Classical Limit:</span> For macroscopic systems with large $L$ and high $n$, energy levels become so densely packed they appear continuous—this is why we don't notice quantization in everyday objects. The quantum world only reveals itself at atomic scales.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="border-t border-slate-700 py-8 px-6 text-center">
          <p className="text-slate-400 text-sm mb-2">
            Quantum mechanics governs behavior at atomic scales through superposition, entanglement, and probability.
          </p>
          <p className="text-slate-500 text-xs">
            This visualization demonstrates the infinite square well, a fundamental model in quantum mechanics. 
            The same principles apply to electrons in atoms, quantum wells in semiconductors, and other confined systems.
          </p>
        </section>
      </div>
    </div>
  );
}
