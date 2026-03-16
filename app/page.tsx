'use client'

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FreeParticleStepSimulation } from './components/FreeParticleStepSimulation';

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-b border-blue-800 text-white p-10 shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.5),transparent)]" />
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            Free Particle at a Potential Step
          </h1>
          <p className="text-lg text-blue-100">
            A quantum particle travels from left to right and encounters a sudden jump in potential at{' '}
            <InlineMath math="x = 0" />. Adjust the particle and environment parameters below to explore
            partial reflection, transmission, and evanescent decay.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-12">
        {/* Simulation */}
        <section>
          <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl hover:shadow-blue-500/20 transition-shadow">
            <FreeParticleStepSimulation />
          </div>
          <p className="mt-3 text-slate-500 text-xs text-center">
            <span className="text-blue-400 font-mono">Re(ψ)</span>
            {' '}— real part of the stationary wavefunction &ensp;|&ensp;
            <span className="text-green-400 font-mono">|ψ|²</span>
            {' '}— probability density &ensp;|&ensp;
            <span className="text-amber-400 font-mono">——</span>
            {' '}— potential V(x)
          </p>
        </section>

        {/* Physics */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">The Physics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
              <h3 className="text-blue-300 font-semibold mb-3">Setup</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                A free particle of mass <InlineMath math="m" /> and energy <InlineMath math="E" /> moves
                in one dimension. The potential is
              </p>
              <div className="my-3 flex justify-center">
                <BlockMath math={String.raw`V(x) = \begin{cases} 0 & x < 0 \\ V_0 & x \geq 0 \end{cases}`} />
              </div>
              <p className="text-slate-300 text-sm">
                The step at <InlineMath math="x=0" /> forces the wavefunction to split into an incident,
                a reflected, and a transmitted component.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
              <h3 className="text-amber-300 font-semibold mb-3">Two regimes</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-2">
                <span className="text-emerald-400 font-semibold">E &gt; V₀</span> — partial reflection and
                transmission. On the right, the wave continues with a shorter wavelength{' '}
                <InlineMath math="k_2 = \sqrt{2m(E-V_0)}/\hbar" />.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                <span className="text-amber-400 font-semibold">E &lt; V₀</span> — classically forbidden.
                Quantum mechanics allows the wave to penetrate a short distance as an{' '}
                <em>evanescent wave</em> decaying as{' '}
                <InlineMath math={String.raw`e^{-\kappa x}`} /> with{' '}
                <InlineMath math={String.raw`\kappa = \sqrt{2m(V_0-E)}/\hbar`} />.
              </p>
            </div>
          </div>
        </section>

        {/* Equations */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Key Equations</h2>

          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 space-y-4">
            <h3 className="text-blue-300 font-semibold">Stationary wavefunction (E &gt; V₀)</h3>
            <div className="flex justify-center">
              <BlockMath math={String.raw`\psi(x) = \begin{cases} e^{ik_1 x} + R\,e^{-ik_1 x} & x < 0 \\ T\,e^{ik_2 x} & x \geq 0 \end{cases}`} />
            </div>
            <p className="text-slate-400 text-sm text-center">
              with{' '}
              <InlineMath math={String.raw`k_1 = \sqrt{2mE}/\hbar`} />,{' '}
              <InlineMath math={String.raw`k_2 = \sqrt{2m(E-V_0)}/\hbar`} />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
              <h3 className="text-purple-300 font-semibold mb-3">Reflection &amp; transmission amplitudes</h3>
              <div className="flex justify-center">
                <BlockMath math={String.raw`R = \frac{k_1 - k_2}{k_1 + k_2}, \quad T = \frac{2k_1}{k_1 + k_2}`} />
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
              <h3 className="text-green-300 font-semibold mb-3">Current conservation</h3>
              <div className="flex justify-center">
                <BlockMath math={String.raw`|R|^2 + \frac{k_2}{k_1}|T|^2 = 1`} />
              </div>
              <p className="text-slate-400 text-sm mt-2 text-center">
                Probability current is conserved across the step.
              </p>
            </div>
          </div>
        </section>

        {/* Experiments */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Try it</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/30 border border-emerald-700/40 rounded-lg p-5">
              <h3 className="text-emerald-300 font-semibold mb-2">No reflection</h3>
              <p className="text-slate-400 text-sm">
                Set <InlineMath math="V_0 = 0" />. Both sides have the same wavenumber, so{' '}
                <InlineMath math="R = 0" /> and the wave passes through undisturbed.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-amber-700/40 rounded-lg p-5">
              <h3 className="text-amber-300 font-semibold mb-2">Near the barrier edge</h3>
              <p className="text-slate-400 text-sm">
                Slowly raise <InlineMath math="V_0" /> toward <InlineMath math="E" />. Watch the standing
                wave pattern on the left grow as more is reflected.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-red-700/40 rounded-lg p-5">
              <h3 className="text-red-300 font-semibold mb-2">Below the barrier</h3>
              <p className="text-slate-400 text-sm">
                Set <InlineMath math="V_0 > E" />. The transmitted wave vanishes; on the right you
                see only the evanescent decay of{' '}
                <InlineMath math={String.raw`|\psi|^2`} />.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="border-t border-slate-800 py-6 text-center">
          <p className="text-slate-500 text-xs">
            Simulation uses natural units <InlineMath math="\hbar = 1" />. The displayed wavefunction is the
            time-dependent stationary solution <InlineMath math="\psi(x)\,e^{-i\omega t}" /> with{' '}
            <InlineMath math="\omega = E/\hbar" />.
          </p>
        </section>
      </div>
    </div>
  );
}
