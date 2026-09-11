import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Experiment } from './components/Experiment';

function NarrativeBeat({ 
  headline, 
  supporting, 
  small = false 
}: { 
  headline: string; 
  supporting?: string;
  small?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-8 md:px-24 snap-center relative mineral-grain">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl w-full"
      >
        <h2 className={`font-display ${small ? 'text-4xl md:text-6xl text-mineral-sec' : 'text-5xl md:text-8xl text-mineral-text'} leading-tight tracking-tight`}>
          {headline}
        </h2>
        {supporting && (
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className={`font-sans mt-8 ${small ? 'text-xl' : 'text-2xl md:text-3xl'} text-mineral-sec`}
          >
            {supporting}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

export default function App() {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className="bg-mineral selection:bg-neutral-800 selection:text-white">
      
      {/* 01 PROBLEM */}
      <NarrativeBeat 
        headline="KNOWLEDGE LIVES IN PEOPLE." 
        supporting="Then: The moment is gone." 
      />

      {/* 02 PROPOSED SOLUTION */}
      <NarrativeBeat 
        headline="Don't just capture the answer." 
        supporting="Capture the thinking." 
      />

      {/* 03 THE MACHINE */}
      <div className="min-h-screen flex items-center justify-center px-8 md:px-24 snap-center mineral-grain">
        <div className="max-w-4xl w-full">
          <h2 className="font-display text-4xl md:text-6xl text-mineral-sec mb-16">What does the machine actually learn?</h2>
          <div className="font-sans text-2xl md:text-4xl space-y-4">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-mineral-text mb-8">
              The machine doesn't simply accumulate answers. It accumulates relationships between knowledge, people, evidence and decisions.
            </motion.p>
            {['Observation', 'Interpretation', 'Reasoning', 'Confidence', 'Uncertainty', 'Evidence Request', 'Measurement', 'Reassessment', 'Provenance'].map((word, i) => (
              <motion.div
                key={word}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="flex items-center gap-4 text-mineral-sec"
              >
                <span className="font-mono text-sm opacity-50">&darr;</span>
                {word}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 04 THE DIGITAL TWIN */}
      <NarrativeBeat 
        headline="What if knowledge could have a digital twin?" 
        supporting="A twin representing the evolving knowledge surrounding an asset. The physical thing has a history. The knowledge around it has a history too." 
        small={true}
      />

      {/* 05 THE HYPOTHESIS */}
      <div className="min-h-screen flex items-center justify-center px-8 md:px-24 snap-center mineral-grain">
        <div className="max-w-4xl w-full space-y-24">
          <motion.h2 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-display text-5xl md:text-7xl leading-tight"
          >
            Can a machine learn how people know?
          </motion.h2>
          
          <div className="space-y-4 font-sans text-2xl md:text-4xl text-mineral-sec">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>Three people.</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>One unknown.</motion.p>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }}
            className="font-display text-4xl italic text-mineral-text"
          >
            Disagreement is data.
          </motion.p>
        </div>
      </div>

      {/* 06 THE VISION */}
      <NarrativeBeat 
        headline="An oracle of knowledge." 
        supporting="Not an infallible source of truth, but an aspirational interface. Its authority comes from traceability—showing who knows, what they know, and what remains unknown." 
        small={true}
      />

      {/* 07 WHY ANDAMOOKA */}
      <NarrativeBeat 
        headline="Andamooka is the proving ground." 
        supporting="Real people. Real knowledge. Real material. Real uncertainty. Real evidence." 
      />

      {/* 08 THE ASK */}
      <div className="min-h-screen flex items-center justify-center px-8 md:px-24 snap-center mineral-grain">
        <div className="max-w-4xl w-full space-y-16">
          <motion.h2 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-display text-5xl md:text-7xl leading-tight"
          >
            We don't need to build everything. We need to prove the loop.
          </motion.h2>
          
          <div className="space-y-8 font-sans text-2xl md:text-3xl text-mineral-sec border-l-2 border-mineral-sec pl-6">
            <p>Mat Kathagen, Field.</p>
            <p>Professor Nigel Spooner, Radiation physics & luminescence.</p>
            <p>Danielle Questiaux, Geological / analytical perspective.</p>
          </div>

          <div className="space-y-4 font-sans text-xl text-mineral-sec">
            <p>One closed experiment.</p>
            <p>Then stop. Assess. Decide.</p>
          </div>
        </div>
      </div>

      {/* TRANSITION TO DEMO */}
      <div className="min-h-[50vh] flex items-center justify-center px-8 md:px-24 snap-center mineral-grain">
        <motion.p 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-display text-4xl md:text-6xl text-mineral-text"
        >
            So let's run the first one.
        </motion.p>
      </div>

      {/* 09 LIVE DEMO / THE EXPERIMENT */}
      <Experiment />

      {/* 10 AFTER THE DEMO */}
      <div className="min-h-screen flex items-center justify-center px-8 md:px-24 snap-center mineral-grain">
        <div className="max-w-4xl w-full space-y-16">
          <motion.h2 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-display text-4xl md:text-6xl text-mineral-text"
          >
            What did the machine just capture?
          </motion.h2>
          
          <div className="flex flex-wrap gap-4 font-mono text-sm tracking-widest text-mineral-sec">
             {['OBSERVATION', 'INTERPRETATION', 'BASIS', 'UNCERTAINTY', 'PROBABILITY', 'EVIDENCE REQUEST', 'MEASUREMENT', 'REASSESSMENT', 'DISAGREEMENT', 'PROVENANCE'].map((word, i) => (
                <motion.span 
                   key={word}
                   initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                   className="border border-mineral-sec px-3 py-1"
                >
                  {word}
                </motion.span>
             ))}
          </div>

          <motion.p 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1 }}
            className="font-sans text-2xl md:text-4xl text-mineral-text"
          >
            This is more than an answer. It is a record of how knowledge moved.
          </motion.p>
        </div>
      </div>

      {/* 11 WHAT HAPPENS WHEN IT GOES UNDERGROUND? */}
      <div className="min-h-screen flex items-center justify-center px-8 md:px-24 snap-center mineral-grain">
        <div className="max-w-4xl w-full text-center">
          <h2 className="font-display text-4xl md:text-6xl text-mineral-text mb-16">What happens when the experiment goes underground?</h2>
          <div className="flex flex-col items-center gap-4 font-mono text-sm tracking-widest text-mineral-sec uppercase">
            {['Photographs', 'Observes', 'Asks', 'Records'].map((node, i) => (
              <motion.div
                key={node}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center gap-4"
              >
                {i > 0 && <div className="h-8 w-px bg-mineral-sec opacity-30" />}
                <span>{node}</span>
              </motion.div>
            ))}
          </div>
          <motion.p 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1 }}
            className="font-sans text-xl md:text-2xl text-mineral-sec mt-16 max-w-2xl mx-auto"
          >
            The system captures the knowledge event. The community becomes part of the machine's growing knowledge base.
          </motion.p>
        </div>
      </div>

      {/* 12 WHY SPOONER + DANIELLE MATTER */}
      <NarrativeBeat 
        headline="They aren't merely validators." 
        supporting="Professor Spooner and Danielle help establish the quality and structure of the foundational knowledge. They help answer: What should be captured? What constitutes useful evidence? What should be tested next?" 
        small={true}
      />

      {/* 13 APP + ANDAMOOKA STANDARD */}
      <div className="min-h-screen flex items-center justify-center px-8 md:px-24 snap-center mineral-grain">
        <div className="max-w-4xl w-full text-center">
          <div className="flex flex-col items-center gap-4 font-mono text-sm tracking-widest text-mineral-sec uppercase">
            {['People', 'Knowledge Events', 'Specimens', 'Evidence', 'Measurements', 'Interpretations', 'Reassessments', 'Standard', 'Provenance Network'].map((node, i) => (
              <motion.div
                key={node}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-4"
              >
                {i > 0 && <div className="h-8 w-px bg-mineral-sec opacity-30" />}
                <span>{node}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 14 THE BIGGER OPPORTUNITY */}
      <div className="min-h-screen flex items-center justify-center px-8 md:px-24 snap-center mineral-grain">
        <div className="max-w-4xl w-full text-center space-y-16">
          <motion.h2 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-display text-4xl md:text-6xl text-mineral-text"
          >
            THE ASSET CHANGES.<br/>THE PROCESS DOESN'T.
          </motion.h2>
          
          <div className="flex flex-wrap justify-center gap-8 font-mono text-sm tracking-widest text-mineral-sec">
             {['WATCHES', 'WINE', 'FOOTWEAR', 'MINING', 'ENGINEERING', 'HEALTH', 'TRADES', 'SCIENTIFIC KNOWLEDGE', 'COMMUNITY KNOWLEDGE'].map((word, i) => (
                <motion.span 
                   key={word}
                   initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.1 }}
                >
                  {word}
                </motion.span>
             ))}
          </div>
        </div>
      </div>

      {/* 15 THE PROPRIETARY IP */}
      <NarrativeBeat 
        headline="The method is the potential proprietary IP." 
        supporting="A method for capturing, structuring, testing, preserving and continuously learning from human knowledge across domains." 
        small={true}
      />

      {/* 16 THE LONG-TERM VISION */}
      <div className="min-h-screen flex items-center justify-center px-8 md:px-24 snap-center mineral-grain">
        <div className="max-w-4xl w-full text-center">
          <div className="flex flex-col items-center gap-8 font-display text-3xl md:text-5xl text-mineral-sec">
            {['One miner.', 'Three experts.', 'One community.', 'One domain.', 'Multiple domains.'].map((node, i) => (
              <motion.div
                key={node}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.4 }}
              >
                {node}
              </motion.div>
            ))}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 2.4 }}
                className="mt-16 text-mineral-text"
            >
                A continuously expanding knowledge system.
            </motion.div>
          </div>
        </div>
      </div>

      {/* 17 THE ENDING */}
      <div className="min-h-screen flex flex-col justify-center items-center px-8 text-center snap-center mineral-grain pb-32">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="space-y-16"
        >
          <div className="space-y-4">
             <h2 className="font-display text-4xl md:text-5xl text-mineral-text tracking-tight">FIRST, LEARN HOW ANDAMOOKA KNOWS.</h2>
             <motion.h2 
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.5 }}
                className="font-display text-4xl md:text-5xl text-mineral-sec tracking-tight"
             >
                THEN ASK WHERE ELSE KNOWLEDGE DISAPPEARS.
             </motion.h2>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 3 }}
            className="space-y-4 pt-16 border-t border-mineral-sec/30"
          >
             <h2 className="font-display text-5xl md:text-7xl text-mineral-text tracking-tight">THE CONCLUSION CAN MOVE.</h2>
             <h2 className="font-display text-5xl md:text-7xl text-mineral-sec tracking-tight">THE HISTORY STAYS.</h2>
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
}
