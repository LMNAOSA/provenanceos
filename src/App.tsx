import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';
import { Experiment } from './components/Experiment';

// A generic wrapper that ties opacity and Y-translation directly to scroll position
function ScrubBlock({ 
  children, 
  offset = ["start 85%", "start 35%"], 
  className = "" 
}: { 
  children: React.ReactNode; 
  offset?: any;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);
  
  return (
    <motion.div ref={ref} style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

function NarrativeBeat({ 
  headline, 
  supporting, 
  small = false 
}: { 
  headline: React.ReactNode; 
  supporting?: React.ReactNode;
  small?: boolean;
}) {
  return (
    <div className="min-h-[100vh] flex items-center justify-center px-6 md:px-24 relative mineral-grain py-16 md:py-0">
      <div className="max-w-4xl w-full">
        <ScrubBlock offset={["start 85%", "start 45%"]}>
          <h2 className={`font-display ${small ? 'text-3xl md:text-6xl text-mineral-sec' : 'text-4xl md:text-8xl text-mineral-text'} leading-tight tracking-tight`}>
            {headline}
          </h2>
        </ScrubBlock>
        {supporting && (
          <ScrubBlock offset={["start 90%", "start 50%"]}>
            <div className={`font-sans mt-6 md:mt-12 ${small ? 'text-lg md:text-xl' : 'text-xl md:text-3xl'} text-mineral-sec`}>
              {supporting}
            </div>
          </ScrubBlock>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const logoOpacity = useTransform(scrollY, [100, 300], [1, 0.2]);
  
  // State 01 = Briefing, State 02 = Instrument
  const [appState, setAppState] = useState<'briefing' | 'instrument'>('briefing');

  return (
    <div ref={containerRef} className="bg-mineral selection:bg-neutral-800 selection:text-white min-h-screen">
      
      <AnimatePresence>
        {appState === 'briefing' && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ opacity: logoOpacity }}
            className="fixed top-6 left-6 md:top-12 md:left-12 z-50 pointer-events-none"
          >
            <img src="/Master%20Logo%20File%20Dark_light.svg" alt="Australian Provenance Project" className="h-10 md:h-18 w-auto" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {appState === 'briefing' ? (
          <motion.div
            key="briefing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
          >
            <NarrativeBeat 
              headline="KNOWLEDGE LIVES IN PEOPLE." 
              supporting="Then: The moment is gone." 
            />

            <NarrativeBeat 
              headline="Don't just capture the answer." 
              supporting="Capture the thinking." 
            />

            <div className="min-h-[100vh] flex items-center justify-center px-6 md:px-24 mineral-grain py-32 md:py-0">
              <div className="max-w-4xl w-full">
                <ScrubBlock offset={["start 85%", "start 40%"]}>
                  <h2 className="font-display text-3xl md:text-6xl text-mineral-sec mb-12 md:mb-16">What does the machine actually learn?</h2>
                </ScrubBlock>
                <div className="font-sans text-xl md:text-4xl space-y-6 md:space-y-4">
                  <ScrubBlock offset={["start 85%", "start 50%"]}>
                    <p className="text-mineral-text mb-12">
                      The machine doesn't simply accumulate answers. It accumulates relationships between knowledge, people, evidence and decisions.
                    </p>
                  </ScrubBlock>
                  
                  {['Observation', 'Interpretation', 'Reasoning', 'Confidence', 'Uncertainty', 'Evidence Request', 'Measurement', 'Reassessment', 'Provenance'].map((word, i) => (
                    <ScrubBlock key={word} offset={["start 95%", "start 75%"]}>
                      <div className="flex items-center gap-4 text-mineral-sec">
                        <span className="font-mono text-sm opacity-50">&darr;</span>
                        {word}
                      </div>
                    </ScrubBlock>
                  ))}
                </div>
              </div>
            </div>

            <NarrativeBeat 
              headline="What if knowledge could have a digital twin?" 
              supporting="A twin representing the evolving knowledge surrounding an asset. The physical thing has a history. The knowledge around it has a history too." 
              small={true}
            />

            <div className="min-h-[100vh] flex items-center justify-center px-6 md:px-24 mineral-grain py-32 md:py-0">
              <div className="max-w-4xl w-full space-y-16 md:space-y-24">
                <ScrubBlock>
                  <h2 className="font-display text-4xl md:text-7xl leading-tight">
                    Can a machine learn how people know?
                  </h2>
                </ScrubBlock>
                
                <div className="space-y-4 font-sans text-xl md:text-4xl text-mineral-sec">
                  <ScrubBlock offset={["start 90%", "start 60%"]}>
                    <p>Three people.</p>
                  </ScrubBlock>
                  <ScrubBlock offset={["start 90%", "start 60%"]}>
                    <p>One unknown.</p>
                  </ScrubBlock>
                </div>
                
                <ScrubBlock offset={["start 90%", "start 60%"]}>
                  <p className="font-display text-3xl md:text-4xl italic text-mineral-text">
                    Disagreement is data.
                  </p>
                </ScrubBlock>
              </div>
            </div>

            <div className="min-h-[100vh] flex items-center justify-center px-6 md:px-24 relative mineral-grain py-32 md:py-0">
              <div className="max-w-4xl w-full flex flex-col items-start">
                <ScrubBlock offset={["start 85%", "start 50%"]}>
                  <div className="mb-8 md:mb-12">
                    <h3 className="font-mono text-xs md:text-sm tracking-widest text-mineral-sec uppercase mb-6">Introducing</h3>
                    <img src="/ProveOS%20Logo%20File%20Dark_light.svg" alt="PROVENANCEOS™" className="h-6 md:h-12 w-auto" />
                  </div>
                  <h2 className="font-display text-3xl md:text-6xl text-mineral-sec leading-tight tracking-tight">
                    The oracle of knowledge.
                  </h2>
                </ScrubBlock>
                <ScrubBlock offset={["start 85%", "start 60%"]}>
                  <p className="font-sans mt-6 md:mt-12 text-lg md:text-xl text-mineral-sec">
                    Not an infallible source of truth, but an aspirational interface. Its authority comes from traceability—showing who knows, what they know, and what remains unknown.
                  </p>
                </ScrubBlock>
              </div>
            </div>

            <NarrativeBeat 
              headline="Andamooka is the proving ground." 
              supporting="Real people. Real knowledge. Real material. Real uncertainty. Real evidence." 
            />

            <div className="min-h-[100vh] flex items-center justify-center px-6 md:px-24 mineral-grain py-32 md:py-0">
              <div className="max-w-4xl w-full space-y-12 md:space-y-16">
                <ScrubBlock offset={["start 85%", "start 40%"]}>
                  <h2 className="font-display text-4xl md:text-7xl leading-tight">
                    We don't need to build everything. We need to prove the loop.
                  </h2>
                </ScrubBlock>
                
                <ScrubBlock offset={["start 90%", "start 60%"]}>
                  <div className="space-y-6 md:space-y-8 font-sans text-xl md:text-3xl text-mineral-sec border-l-2 border-mineral-sec pl-6">
                    <p>Mat Kathagen, Field.</p>
                    <p>Professor Nigel Spooner, Radiation physics & luminescence.</p>
                    <p>Danielle Questiaux, Geological / analytical perspective.</p>
                  </div>
                </ScrubBlock>

                <ScrubBlock offset={["start 90%", "start 70%"]}>
                  <div className="space-y-4 font-sans text-lg md:text-xl text-mineral-sec mt-12">
                    <p>One closed experiment.</p>
                    <p>Then stop. Assess. Decide.</p>
                  </div>
                </ScrubBlock>
              </div>
            </div>

            <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 md:px-24 mineral-grain py-32">
              <ScrubBlock offset={["start 90%", "start 50%"]}>
                <p className="font-display text-3xl md:text-6xl text-mineral-text mb-16 text-center">
                    So let's run the first one.
                </p>
              </ScrubBlock>
              
              <ScrubBlock offset={["start 95%", "start 65%"]}>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => setAppState('instrument'), 800);
                  }}
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-mono text-sm tracking-widest text-white uppercase bg-neutral-900 overflow-hidden hover:bg-black transition-colors"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    Enter Case 001 <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
                  </span>
                  <div className="absolute inset-0 bg-neutral-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                </button>
              </ScrubBlock>
            </div>
            
            <div className="h-64 border-t border-mineral-sec/20" />
            
            <div className="min-h-[100vh] flex items-center justify-center px-6 md:px-24 mineral-grain py-32 md:py-0 border-t border-mineral-sec/20">
              <div className="max-w-4xl w-full space-y-12 md:space-y-16">
                <ScrubBlock offset={["start 85%", "start 40%"]}>
                  <h2 className="font-display text-3xl md:text-6xl text-mineral-text">
                    What does the machine actually capture?
                  </h2>
                </ScrubBlock>
                
                <div className="flex flex-wrap gap-3 md:gap-4 font-mono text-xs md:text-sm tracking-widest text-mineral-sec">
                   {['OBSERVATION', 'INTERPRETATION', 'BASIS', 'UNCERTAINTY', 'PROBABILITY', 'EVIDENCE REQUEST', 'MEASUREMENT', 'REASSESSMENT', 'DISAGREEMENT', 'PROVENANCE'].map((word) => (
                      <ScrubBlock key={word} offset={["start 95%", "start 70%"]} className="inline-block">
                        <span className="border border-mineral-sec px-3 py-1 block">
                          {word}
                        </span>
                      </ScrubBlock>
                   ))}
                </div>

                <ScrubBlock offset={["start 90%", "start 60%"]}>
                  <p className="font-sans text-xl md:text-4xl text-mineral-text mt-8">
                    This is more than an answer. It is a record of how knowledge moved.
                  </p>
                </ScrubBlock>
              </div>
            </div>

            <div className="min-h-[100vh] flex items-center justify-center px-6 md:px-24 mineral-grain py-32 md:py-0">
              <div className="max-w-4xl w-full text-center">
                <ScrubBlock offset={["start 85%", "start 40%"]}>
                  <h2 className="font-display text-3xl md:text-6xl text-mineral-text mb-12 md:mb-16">What happens when the experiment goes underground?</h2>
                </ScrubBlock>
                <div className="flex flex-col items-center gap-4 font-mono text-xs md:text-sm tracking-widest text-mineral-sec uppercase">
                  {['Photographs', 'Observes', 'Asks', 'Records'].map((node, i) => (
                    <ScrubBlock key={node} offset={["start 95%", "start 70%"]}>
                      <div className="flex flex-col items-center gap-4">
                        {i > 0 && <div className="h-6 md:h-8 w-px bg-mineral-sec opacity-30" />}
                        <span>{node}</span>
                      </div>
                    </ScrubBlock>
                  ))}
                </div>
                <ScrubBlock offset={["start 90%", "start 60%"]}>
                  <p className="font-sans text-lg md:text-2xl text-mineral-sec mt-16 max-w-2xl mx-auto">
                    The system captures the knowledge event. The community becomes part of the machine's growing knowledge base.
                  </p>
                </ScrubBlock>
              </div>
            </div>

            <NarrativeBeat 
              headline="They aren't merely validators." 
              supporting="Professor Spooner and Danielle help establish the quality and structure of the foundational knowledge. They help answer: What should be captured? What constitutes useful evidence? What should be tested next?" 
              small={true}
            />

            <div className="min-h-[100vh] flex items-center justify-center px-6 md:px-24 mineral-grain py-32 md:py-0">
              <div className="max-w-4xl w-full text-center">
                <div className="flex flex-col items-center gap-4 font-mono text-xs md:text-sm tracking-widest text-mineral-sec uppercase">
                  {['People', 'Knowledge Events', 'Specimens', 'Evidence', 'Measurements', 'Interpretations', 'Reassessments', 'Standard', 'Provenance Network'].map((node, i) => (
                    <ScrubBlock key={node} offset={["start 95%", "start 70%"]}>
                      <div className="flex flex-col items-center gap-4">
                        {i > 0 && <div className="h-6 md:h-8 w-px bg-mineral-sec opacity-30" />}
                        <span>{node}</span>
                      </div>
                    </ScrubBlock>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-h-[100vh] flex items-center justify-center px-6 md:px-24 mineral-grain py-32 md:py-0">
              <div className="max-w-4xl w-full text-center space-y-12 md:space-y-16">
                <ScrubBlock offset={["start 85%", "start 40%"]}>
                  <h2 className="font-display text-3xl md:text-6xl text-mineral-text">
                    THE ASSET CHANGES.<br/>THE PROCESS DOESN'T.
                  </h2>
                </ScrubBlock>
                
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 font-mono text-xs md:text-sm tracking-widest text-mineral-sec">
                   {['WATCHES', 'WINE', 'FOOTWEAR', 'MINING', 'ENGINEERING', 'HEALTH', 'TRADES', 'SCIENTIFIC KNOWLEDGE', 'COMMUNITY KNOWLEDGE'].map((word) => (
                      <ScrubBlock key={word} offset={["start 95%", "start 70%"]} className="inline-block">
                        <span>{word}</span>
                      </ScrubBlock>
                   ))}
                </div>
              </div>
            </div>

            <NarrativeBeat 
              headline="The method is the potential proprietary IP." 
              supporting="A method for capturing, structuring, testing, preserving and continuously learning from human knowledge across domains." 
              small={true}
            />

            <div className="min-h-[100vh] flex items-center justify-center px-6 md:px-24 mineral-grain py-32 md:py-0">
              <div className="max-w-4xl w-full text-center">
                <div className="flex flex-col items-center gap-6 md:gap-8 font-display text-2xl md:text-5xl text-mineral-sec">
                  {['One miner.', 'Three experts.', 'One community.', 'One domain.', 'Multiple domains.'].map((node) => (
                    <ScrubBlock key={node} offset={["start 95%", "start 65%"]}>
                      <div>{node}</div>
                    </ScrubBlock>
                  ))}
                  <ScrubBlock offset={["start 90%", "start 50%"]}>
                    <div className="mt-16 text-mineral-text">
                        A continuously expanding knowledge system.
                    </div>
                  </ScrubBlock>
                </div>
              </div>
            </div>

            <div className="min-h-[100vh] flex flex-col justify-center items-center px-6 md:px-8 text-center mineral-grain pb-32">
              <div className="space-y-12 md:space-y-16 max-w-5xl">
                <div className="space-y-8">
                   <ScrubBlock offset={["start 90%", "start 50%"]}>
                     <h2 className="font-display text-3xl md:text-5xl text-mineral-text tracking-tight">FIRST, LEARN HOW ANDAMOOKA KNOWS.</h2>
                   </ScrubBlock>
                   <ScrubBlock offset={["start 90%", "start 50%"]}>
                     <h2 className="font-display text-3xl md:text-5xl text-mineral-sec tracking-tight">THEN ASK WHERE ELSE KNOWLEDGE DISAPPEARS.</h2>
                   </ScrubBlock>
                </div>
                
                <div className="space-y-4 pt-12 md:pt-16 border-t border-mineral-sec/30">
                   <ScrubBlock offset={["start 90%", "start 50%"]}>
                     <h2 className="font-display text-4xl md:text-7xl text-mineral-text tracking-tight">THE CONCLUSION CAN MOVE.</h2>
                   </ScrubBlock>
                   <ScrubBlock offset={["start 90%", "start 50%"]}>
                     <h2 className="font-display text-4xl md:text-7xl text-mineral-sec tracking-tight">THE HISTORY STAYS.</h2>
                   </ScrubBlock>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="instrument"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="min-h-screen"
          >
            <Experiment onExit={() => setAppState('briefing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
